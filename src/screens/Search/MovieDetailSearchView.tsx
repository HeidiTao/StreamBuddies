import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWatchStats } from '../contexts/WatchStatsContext';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { groupRepository } from '../../repositories/GroupRepository';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { movieDetailsStyles } from '../../styles/searchStyles';

type RouteParams = {
  movieId: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  genres?: string[];
  rating?: number;
  runtime?: number; // in minutes
  media_type?: 'movie' | 'tv';
  certification?: string; // PG-13, R, etc.
  vote_count?: number;
  streaming_providers?: StreamingProvider[];
};

interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

const MovieDetailSearchView = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { logWatchTime } = useWatchStats();
  const { authUser } = useAuth();
  const { groups } = useGroups();
  
  const [showWatchTimeModal, setShowWatchTimeModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  
  const {
    movieId,
    title = 'Untitled',
    poster_path,
    overview = 'No description available.',
    release_date,
    genres = [],
    rating = 0,
    runtime = 0,
    media_type = 'movie',
    certification,
    vote_count,
    streaming_providers = [],
  } = route.params || {};

  const year = release_date ? release_date.split('-')[0] : 'N/A';
  
  const formatVoteCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  const formatRuntime = (minutes: number) => {
    if (!minutes || minutes === 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };
  
  // Store movie data in a ref to ensure we always have the current values
  const movieDataRef = useRef({
    movieId,
    title,
    poster_path,
  });

  // Update ref when route params change
  useEffect(() => {
    movieDataRef.current = {
      movieId,
      title,
      poster_path,
    };
  }, [movieId, title, poster_path]);

  const handleAddToGroup = async (groupId: string) => {
    if (!groupId) return;
    
    // Use ref to get the most current movie data
    const currentMovie = movieDataRef.current;
    
    // Validate that we have the required data
    if (!currentMovie.movieId || !currentMovie.title) {
      console.error('Invalid movie data:', currentMovie);
      Alert.alert('Error', 'Movie information is incomplete. Please try again.');
      return;
    }
    
    try {
      const groupRef = doc(db, 'groups', groupId);
      
      // Create the movie object to add with proper typing AND media_type
      const movieToAdd = {
        tmdb_id: Number(currentMovie.movieId), // Ensure it's a number
        title: String(currentMovie.title).trim(), // Ensure it's a clean string
        poster_path: currentMovie.poster_path ? String(currentMovie.poster_path) : '',
        media_type: media_type || 'movie', // Store media type so group knows how to fetch it
      };
      
      console.log('Adding movie to group:', {
        groupId,
        movie: movieToAdd,
        timestamp: new Date().toISOString()
      }); // Debug log
      
      // Add to currently_watching array using arrayUnion to avoid duplicates
      await updateDoc(groupRef, {
        currently_watching: arrayUnion(movieToAdd)
      });
      
      Alert.alert(
        'Added to Group!',
        `"${currentMovie.title}" has been added to your group's Currently Watching list.`,
        [{ text: 'OK' }]
      );
      
      setShowGroupModal(false);
    } catch (error) {
      console.error('Error adding to group:', error);
      Alert.alert('Error', 'Failed to add to group. Please try again.');
    }
  };
  
  const handleLogWatchTime = () => {
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    
    if (hoursNum === 0 && minutesNum === 0) {
      Alert.alert('Invalid Input', 'Please enter at least some watch time.');
      return;
    }
    
    const totalMinutes = (hoursNum * 60) + minutesNum;
    
    // Validate against runtime if available
    if (runtime > 0 && totalMinutes > runtime) {
      const runtimeHours = Math.floor(runtime / 60);
      const runtimeMins = runtime % 60;
      const runtimeDisplay = runtimeHours > 0 
        ? `${runtimeHours}h ${runtimeMins}m` 
        : `${runtimeMins}m`;
      
      Alert.alert(
        'Invalid Watch Time',
        `You cannot log more time than the ${media_type === 'movie' ? 'movie' : 'episode'}'s length.\n\nMaximum: ${runtimeDisplay}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Log to watch stats context
    logWatchTime({
      movieId: movieId,
      title: title,
      minutesWatched: totalMinutes,
      timestamp: new Date().toISOString(),
      genres: genres,
      media_type: media_type,
    });
    
    Alert.alert(
      'Watch Time Logged!',
      `You watched ${hoursNum > 0 ? `${hoursNum}h ` : ''}${minutesNum}m of ${title}`,
      [{ text: 'OK' }]
    );
    
    // Reset and close modal
    setHours('');
    setMinutes('');
    setShowWatchTimeModal(false);
  };

  const handleLogWholeMovie = () => {
    if (runtime === 0) {
      Alert.alert('Error', 'Runtime information not available for this title.');
      return;
    }

    // Log the entire runtime
    logWatchTime({
      movieId: movieId,
      title: title,
      minutesWatched: runtime,
      timestamp: new Date().toISOString(),
      genres: genres,
      media_type: media_type,
    });

    const runtimeFormatted = formatRuntime(runtime);
    
    Alert.alert(
      'Watch Time Logged!',
      `You watched the entire ${media_type === 'movie' ? 'movie' : 'episode'}: ${runtimeFormatted}`,
      [{ text: 'OK' }]
    );
    
    // Reset and close modal
    setHours('');
    setMinutes('');
    setShowWatchTimeModal(false);
  };
  
  // Create star rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating / 2); // Convert 10-point scale to 5 stars
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < fullStars ? 'star' : 'star-outline'}
          size={20}
          color="#FFD700"
          style={movieDetailsStyles.star}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={movieDetailsStyles.container} bounces={false}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FFB3D9', '#B3D9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={movieDetailsStyles.headerGradient}
      >
        {/* Back Button */}
        <View style={movieDetailsStyles.headerTop}>
          <TouchableOpacity 
            style={movieDetailsStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={movieDetailsStyles.backButtonCircle}>
              <Text style={movieDetailsStyles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={movieDetailsStyles.movieTitle}>{title}</Text>

        {/* Poster */}
        <View style={movieDetailsStyles.posterContainer}>
          {poster_path ? (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${poster_path}`,
              }}
              style={movieDetailsStyles.posterImage}
            />
          ) : (
            <View style={[movieDetailsStyles.posterImage, movieDetailsStyles.noPoster]}>
              <Ionicons name="film-outline" size={80} color="#ccc" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={movieDetailsStyles.content}>
        {/* Star Rating */}
        <View style={movieDetailsStyles.ratingContainer}>
          {renderStars()}
        </View>

        {/* Year */}
        <Text style={movieDetailsStyles.year}>{year}</Text>

        {/* Runtime */}
        {runtime > 0 && (
          <View style={movieDetailsStyles.runtimeContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={movieDetailsStyles.runtimeText}>
              {formatRuntime(runtime)} {media_type === 'tv' ? '(per episode avg)' : ''}
            </Text>
          </View>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <View style={movieDetailsStyles.genresContainer}>
            {genres.map((genre, index) => (
              <View key={index} style={movieDetailsStyles.genreTag}>
                <Text style={movieDetailsStyles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <View style={movieDetailsStyles.descriptionContainer}>
          <Text style={movieDetailsStyles.descriptionTitle}>Description:</Text>
          <Text style={movieDetailsStyles.descriptionText}>{overview}</Text>
        </View>

        {/* Movie Info Section */}
        <View style={movieDetailsStyles.movieInfoContainer}>
          {/* Certification (Rating) */}
          {certification && (
            <View style={movieDetailsStyles.infoSection}>
              <Text style={movieDetailsStyles.infoLabel}>Rating:</Text>
              <View style={movieDetailsStyles.certificationBadge}>
                <Text style={movieDetailsStyles.certificationText}>{certification}</Text>
              </View>
            </View>
          )}

          {/* Vote Count */}
          {vote_count !== undefined && vote_count > 0 && (
            <View style={movieDetailsStyles.infoSection}>
              <Text style={movieDetailsStyles.infoLabel}>Votes:</Text>
              <View style={movieDetailsStyles.voteContainer}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={movieDetailsStyles.voteText}>{formatVoteCount(vote_count)}</Text>
              </View>
            </View>
          )}

          {/* Streaming Providers */}
          {streaming_providers.length > 0 && (
            <View style={movieDetailsStyles.infoSection}>
              <Text style={movieDetailsStyles.infoLabel}>Available On:</Text>
              <View style={movieDetailsStyles.providersContainer}>
                {streaming_providers.map((provider, index) => (
                  <Text key={provider.provider_id} style={movieDetailsStyles.providerText}>
                    {provider.provider_name}
                    {index < streaming_providers.length - 1 ? ', ' : ''}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Add to Group Button */}
        {authUser && groups.length > 0 && (
          <TouchableOpacity
            style={movieDetailsStyles.addToGroupButton}
            onPress={() => setShowGroupModal(true)}
          >
            <Ionicons name="people-outline" size={24} color="#fff" />
            <Text style={movieDetailsStyles.addToGroupText}>Add to Group</Text>
          </TouchableOpacity>
        )}

        {/* Log Watch Time Button */}
        <TouchableOpacity
          style={movieDetailsStyles.logWatchTimeButton}
          onPress={() => setShowWatchTimeModal(true)}
        >
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={movieDetailsStyles.logWatchTimeText}>Log Watch Time</Text>
        </TouchableOpacity>
      </View>

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={movieDetailsStyles.modalOverlay}>
          <View style={movieDetailsStyles.modalContent}>
            {/* Back Button */}
            <TouchableOpacity
              style={movieDetailsStyles.modalBackButton}
              onPress={() => setShowGroupModal(false)}
            >
              <Ionicons name="arrow-back" size={20} color="#666" />
              <Text style={movieDetailsStyles.modalBackButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={movieDetailsStyles.modalTitle}>Add to Group</Text>
            <Text style={movieDetailsStyles.modalSubtitle}>
              Select a group to add "{title}" to:
            </Text>

            <ScrollView style={movieDetailsStyles.groupList}>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={movieDetailsStyles.groupItem}
                  onPress={() => handleAddToGroup(group.id!)}
                >
                  <View style={movieDetailsStyles.groupIconContainer}>
                    <Ionicons name="people" size={24} color="#bcbcff" />
                  </View>
                  <Text style={movieDetailsStyles.groupName}>{group.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Watch Time Modal */}
      <Modal
        visible={showWatchTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWatchTimeModal(false)}
      >
        <View style={movieDetailsStyles.modalOverlay}>
          <View style={movieDetailsStyles.modalContent}>
            <Text style={movieDetailsStyles.modalTitle}>Log Watch Time</Text>
            <Text style={movieDetailsStyles.modalSubtitle}>
              How long did you watch?
              {runtime > 0 && (
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {'\n'}(Max: {formatRuntime(runtime)})
                </Text>
              )}
            </Text>

            <View style={movieDetailsStyles.timeInputContainer}>
              <View style={movieDetailsStyles.timeInputGroup}>
                <TextInput
                  style={movieDetailsStyles.timeInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={hours}
                  onChangeText={setHours}
                  maxLength={3}
                />
                <Text style={movieDetailsStyles.timeLabel}>hours</Text>
              </View>

              <View style={movieDetailsStyles.timeInputGroup}>
                <TextInput
                  style={movieDetailsStyles.timeInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={minutes}
                  onChangeText={setMinutes}
                  maxLength={2}
                />
                <Text style={movieDetailsStyles.timeLabel}>minutes</Text>
              </View>
            </View>

            {/* Log Whole Movie Button */}
            {runtime > 0 && (
              <TouchableOpacity
                style={movieDetailsStyles.logWholeButton}
                onPress={handleLogWholeMovie}
              >
                <Text style={movieDetailsStyles.logWholeButtonText}>
                  Log Whole {media_type === 'movie' ? 'Movie' : 'Episode'} ({formatRuntime(runtime)})
                </Text>
              </TouchableOpacity>
            )}

            <View style={movieDetailsStyles.modalButtons}>
              <TouchableOpacity
                style={[movieDetailsStyles.modalButton, movieDetailsStyles.cancelButton]}
                onPress={() => {
                  setHours('');
                  setMinutes('');
                  setShowWatchTimeModal(false);
                }}
              >
                <Text style={movieDetailsStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[movieDetailsStyles.modalButton, movieDetailsStyles.submitButton]}
                onPress={handleLogWatchTime}
              >
                <Text style={movieDetailsStyles.submitButtonText}>Log Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default MovieDetailSearchView;