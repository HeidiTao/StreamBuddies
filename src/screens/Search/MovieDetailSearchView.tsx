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
          style={styles.star}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FFB3D9', '#B3D9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Back Button */}
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.movieTitle}>{title}</Text>

        {/* Poster */}
        <View style={styles.posterContainer}>
          {poster_path ? (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${poster_path}`,
              }}
              style={styles.posterImage}
            />
          ) : (
            <View style={[styles.posterImage, styles.noPoster]}>
              <Ionicons name="film-outline" size={80} color="#ccc" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Star Rating */}
        <View style={styles.ratingContainer}>
          {renderStars()}
        </View>

        {/* Year */}
        <Text style={styles.year}>{year}</Text>

        {/* Runtime */}
        {runtime > 0 && (
          <View style={styles.runtimeContainer}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.runtimeText}>
              {formatRuntime(runtime)} {media_type === 'tv' ? '(per episode avg)' : ''}
            </Text>
          </View>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <View style={styles.genresContainer}>
            {genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description:</Text>
          <Text style={styles.descriptionText}>{overview}</Text>
        </View>

        {/* Movie Info Section */}
        <View style={styles.movieInfoContainer}>
          {/* Certification (Rating) */}
          {certification && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Rating:</Text>
              <View style={styles.certificationBadge}>
                <Text style={styles.certificationText}>{certification}</Text>
              </View>
            </View>
          )}

          {/* Vote Count */}
          {vote_count !== undefined && vote_count > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Votes:</Text>
              <View style={styles.voteContainer}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={styles.voteText}>{formatVoteCount(vote_count)}</Text>
              </View>
            </View>
          )}

          {/* Streaming Providers */}
          {streaming_providers.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Available On:</Text>
              <View style={styles.providersContainer}>
                {streaming_providers.map((provider, index) => (
                  <Text key={provider.provider_id} style={styles.providerText}>
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
            style={styles.addToGroupButton}
            onPress={() => setShowGroupModal(true)}
          >
            <Ionicons name="people-outline" size={24} color="#fff" />
            <Text style={styles.addToGroupText}>Add to Group</Text>
          </TouchableOpacity>
        )}

        {/* Log Watch Time Button */}
        <TouchableOpacity
          style={styles.logWatchTimeButton}
          onPress={() => setShowWatchTimeModal(true)}
        >
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.logWatchTimeText}>Log Watch Time</Text>
        </TouchableOpacity>
      </View>

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setShowGroupModal(false)}
            >
              <Ionicons name="arrow-back" size={20} color="#666" />
              <Text style={styles.modalBackButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add to Group</Text>
            <Text style={styles.modalSubtitle}>
              Select a group to add "{title}" to:
            </Text>

            <ScrollView style={styles.groupList}>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupItem}
                  onPress={() => handleAddToGroup(group.id!)}
                >
                  <View style={styles.groupIconContainer}>
                    <Ionicons name="people" size={24} color="#bcbcff" />
                  </View>
                  <Text style={styles.groupName}>{group.name}</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Watch Time</Text>
            <Text style={styles.modalSubtitle}>
              How long did you watch?
              {runtime > 0 && (
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {'\n'}(Max: {formatRuntime(runtime)})
                </Text>
              )}
            </Text>

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={hours}
                  onChangeText={setHours}
                  maxLength={3}
                />
                <Text style={styles.timeLabel}>hours</Text>
              </View>

              <View style={styles.timeInputGroup}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={minutes}
                  onChangeText={setMinutes}
                  maxLength={2}
                />
                <Text style={styles.timeLabel}>minutes</Text>
              </View>
            </View>

            {/* Log Whole Movie Button */}
            {runtime > 0 && (
              <TouchableOpacity
                style={styles.logWholeButton}
                onPress={handleLogWholeMovie}
              >
                <Text style={styles.logWholeButtonText}>
                  Log Whole {media_type === 'movie' ? 'Movie' : 'Episode'} ({formatRuntime(runtime)})
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setHours('');
                  setMinutes('');
                  setShowWatchTimeModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleLogWatchTime}
              >
                <Text style={styles.submitButtonText}>Log Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTop: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  posterContainer: {
    alignItems: 'center',
  },
  posterImage: {
    width: 150,
    height: 225,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  noPoster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 2,
  },
  year: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 12,
  },
  runtimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  runtimeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  genresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
  },
  movieInfoContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  certificationBadge: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  certificationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  providersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  providerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addToGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bcbcff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addToGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  logWatchTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logWatchTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  modalBackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  groupList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7f7ff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3e3f7',
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3e3f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4b4b7a',
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 80,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  logWholeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logWholeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MovieDetailSearchView;