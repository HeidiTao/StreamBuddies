import React, { useState } from 'react';
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

interface WatchedByUser {
  id: string;
  initials: string;
  name: string;
  color: string;
}

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
};

const MovieDetailSearchView = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { logWatchTime } = useWatchStats();
  
  const [showWatchTimeModal, setShowWatchTimeModal] = useState(false);
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
  } = route.params || {};

  // Sample watched by users - you can fetch this from your backend
  const watchedByUsers: WatchedByUser[] = [
    { id: '1', initials: 'IA', name: 'username1', color: '#FFB3D9' },
    { id: '2', initials: 'JA', name: 'username2', color: '#D4BAFF' },
    { id: '3', initials: 'AS', name: 'user3', color: '#BAFFC9' },
    { id: '4', initials: 'BZ', name: 'buddy4', color: '#FFE4B3' },
  ];

  const year = release_date ? release_date.split('-')[0] : 'N/A';
  
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
    <View style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FFB3D9', '#B3D9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>

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
      <ScrollView style={styles.content}>
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

        {/* Share Icon */}
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color="#666" />
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description:</Text>
          <Text style={styles.descriptionText}>{overview}</Text>
        </View>

        {/* Watched By Section */}
        <View style={styles.watchedByContainer}>
          <Text style={styles.watchedByTitle}>Watched By:</Text>
          <View style={styles.avatarsContainer}>
            {watchedByUsers.map((user) => (
              <View key={user.id} style={styles.avatarWrapper}>
                <View style={[styles.avatar, { backgroundColor: user.color }]}>
                  <Text style={styles.avatarInitials}>{user.initials}</Text>
                </View>
                <Text style={styles.avatarName}>{user.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Log Watch Time Button */}
        <TouchableOpacity
          style={styles.logWatchTimeButton}
          onPress={() => setShowWatchTimeModal(true)}
        >
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.logWatchTimeText}>Log Watch Time</Text>
        </TouchableOpacity>

        {/* Add some bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

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
    </View>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
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
    marginTop: 10,
    marginBottom: 20,
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
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 16,
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
  shareButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
  },
  watchedByContainer: {
    marginBottom: 24,
  },
  watchedByTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  avatarName: {
    fontSize: 12,
    color: '#666',
  },
  logWatchTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
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