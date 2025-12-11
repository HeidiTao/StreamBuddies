import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWatchStats } from '../contexts/WatchStatsContext';
import { useAuth } from '../../hooks/useAuth';
import { useGroups } from '../../hooks/useGroups';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { movieDetailsStyles } from '../../styles/searchStyles';

// Components
import MovieHeader from './Components/MovieHeader';
import MovieContent from './Components/MovieContent';
import GroupSelectionModal from './Components/GroupSelectionModal';
import WatchTimeModal from './Components/WatchTimeModal';

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

export interface StreamingProvider {
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
      <MovieHeader
        title={title}
        poster_path={poster_path}
        onBack={() => navigation.goBack()}
      />

      {/* Content */}
      <View style={movieDetailsStyles.content}>
        <MovieContent
          year={year}
          runtime={runtime}
          media_type={media_type}
          genres={genres}
          overview={overview}
          certification={certification}
          vote_count={vote_count}
          streaming_providers={streaming_providers}
          movieId={movieId}
          renderStars={renderStars}
          showAddToGroupButton={!!(authUser && groups.length > 0)}
          onPressAddToGroup={() => setShowGroupModal(true)}
          onPressLogWatchTime={() => setShowWatchTimeModal(true)}
        />
      </View>

      {/* Group Selection Modal */}
      <GroupSelectionModal
        visible={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title={title}
        groups={groups}
        onSelectGroup={handleAddToGroup}
      />

      {/* Watch Time Modal */}
      <WatchTimeModal
        visible={showWatchTimeModal}
        onClose={() => {
          setShowWatchTimeModal(false);
        }}
        runtime={runtime}
        media_type={media_type}
        hours={hours}
        minutes={minutes}
        setHours={setHours}
        setMinutes={setMinutes}
        formatRuntime={formatRuntime}
        onLogWatchTime={handleLogWatchTime}
        onLogWholeMovie={handleLogWholeMovie}
      />
    </ScrollView>
  );
};

export default MovieDetailSearchView;
