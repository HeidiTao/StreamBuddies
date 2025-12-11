import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AddToListButton from "./Components/AddToListButton";
import { useAuth } from "../../hooks/useAuth";
import { useGroups } from "../../hooks/useGroups";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useWatchStats } from "../contexts/WatchStatsContext";

type Nav = NativeStackNavigationProp<RootStackParamList, "MovieDetail">;
type Route = RouteProp<RootStackParamList, "MovieDetail">;

type MovieDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  genres?: { id: number; name: string }[];
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;

  adult?: boolean;
  original_language?: string;
  spoken_languages?: { english_name: string; iso_639_1: string }[];

  vote_average?: number; // 0–10
  vote_count?: number;

  // runtime info
  runtime?: number; // movies
  episode_run_time?: number[]; // tv

  // appended for movies
  release_dates?: {
    results: {
      iso_3166_1: string;
      release_dates: {
        certification: string;
        release_date: string;
        type: number;
        note: string;
      }[];
    }[];
  };

  // appended for TV
  content_ratings?: {
    results: {
      iso_3166_1: string;
      rating: string;
    }[];
  };
};

type ProvidersResp = {
  results?: {
    [countryCode: string]: {
      flatrate?: { provider_name: string }[];
    };
  };
};

const posterUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w500/${p}` : undefined;

const formatRuntime = (minutes: number | undefined): string | null => {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const formatVoteCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const MovieDetailView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id, title, mediaType } = route.params;
  const { authUser } = useAuth();
  const { groups } = useGroups();
  const { logWatchTime } = useWatchStats();

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = tmdbToken
    ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
    : { accept: "application/json" };

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showWatchTimeModal, setShowWatchTimeModal] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  // Store movie data in a ref to ensure we always have the current values
  const movieDataRef = useRef({
    movieId: id,
    title: title,
    poster_path: movie?.poster_path || null,
  });

  // Update ref when movie data changes
  useEffect(() => {
    movieDataRef.current = {
      movieId: id,
      title: movie?.title || movie?.name || title,
      poster_path: movie?.poster_path || null,
    };
  }, [id, title, movie?.title, movie?.name, movie?.poster_path]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const typePath = mediaType === "tv" ? "tv" : "movie";
        const appendParam =
          mediaType === "movie" ? "release_dates" : "content_ratings";

        const baseDetailsUrl = `https://api.themoviedb.org/3/${typePath}/${id}`;
        const detailsUrl = tmdbToken
          ? `${baseDetailsUrl}?language=en-US&append_to_response=${appendParam}`
          : `${baseDetailsUrl}?api_key=${tmdbApiKey}&language=en-US&append_to_response=${appendParam}`;

        const detRes = await fetch(detailsUrl, { headers });
        const detJson: MovieDetails = await detRes.json();
        if (!detRes.ok) throw new Error(`Details failed: ${detRes.status}`);
        setMovie(detJson);

        const providersBase = `https://api.themoviedb.org/3/${typePath}/${id}/watch/providers`;
        const providersUrl = tmdbToken
          ? providersBase
          : `${providersBase}?api_key=${tmdbApiKey}`;

        const provRes = await fetch(providersUrl, { headers });
        const provJson: ProvidersResp = await provRes.json();
        if (!provRes.ok)
          throw new Error(`Providers failed: ${provRes.status}`);

        const regionBlock = provJson?.results?.["US"];
        const stream = regionBlock?.flatrate ?? [];
        setProviders(stream.map((p) => p.provider_name));
      } catch (e) {
        console.error(e);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, mediaType, tmdbApiKey, tmdbToken]);

  const genreList = useMemo(
    () => (movie?.genres ?? []).map((g) => g.name),
    [movie?.genres]
  );

  const thumb = posterUri(movie?.poster_path);

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
        tmdb_id: Number(currentMovie.movieId),
        title: String(currentMovie.title).trim(),
        poster_path: currentMovie.poster_path ? String(currentMovie.poster_path) : '',
        media_type: mediaType || 'movie',
      };
      
      console.log('Adding movie to group:', {
        groupId,
        movie: movieToAdd,
        timestamp: new Date().toISOString()
      });
      
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
    const runtimeMinutes = mediaType === "movie"
      ? movie?.runtime ?? 0
      : Array.isArray(movie?.episode_run_time) && movie.episode_run_time.length > 0
      ? movie.episode_run_time[0]
      : 0;
    
    if (runtimeMinutes > 0 && totalMinutes > runtimeMinutes) {
      const runtimeFormatted = formatRuntime(runtimeMinutes);
      
      Alert.alert(
        'Invalid Watch Time',
        `You cannot log more time than the ${mediaType === 'movie' ? 'movie' : 'episode'}'s length.\n\nMaximum: ${runtimeFormatted}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    logWatchTime({
      movieId: id,
      title: movie?.title || movie?.name || title,
      minutesWatched: totalMinutes,
      timestamp: new Date().toISOString(),
      genres: genreList,
      media_type: mediaType,
    });
    
    Alert.alert(
      'Watch Time Logged!',
      `You watched ${hoursNum > 0 ? `${hoursNum}h ` : ''}${minutesNum}m of ${movie?.title || movie?.name || title}`,
      [{ text: 'OK' }]
    );
    
    setHours('');
    setMinutes('');
    setShowWatchTimeModal(false);
  };

  const handleLogWholeMovie = () => {
    const runtimeMinutes = mediaType === "movie"
      ? movie?.runtime ?? 0
      : Array.isArray(movie?.episode_run_time) && movie.episode_run_time.length > 0
      ? movie.episode_run_time[0]
      : 0;

    if (runtimeMinutes === 0) {
      Alert.alert('Error', 'Runtime information not available for this title.');
      return;
    }

    logWatchTime({
      movieId: id,
      title: movie?.title || movie?.name || title,
      minutesWatched: runtimeMinutes,
      timestamp: new Date().toISOString(),
      genres: genreList,
      media_type: mediaType,
    });

    const runtimeFormatted = formatRuntime(runtimeMinutes);
    
    Alert.alert(
      'Watch Time Logged!',
      `You watched the entire ${mediaType === 'movie' ? 'movie' : 'episode'}: ${runtimeFormatted}`,
      [{ text: 'OK' }]
    );
    
    setHours('');
    setMinutes('');
    setShowWatchTimeModal(false);
  };

  if (loading || !movie) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading details…</Text>
      </View>
    );
  }

  const displayTitle = movie.title ?? movie.name ?? title;
  const displayDate = movie.release_date ?? movie.first_air_date;
  const year =
    displayDate && displayDate.length >= 4
      ? displayDate.slice(0, 4)
      : "—";

  const displayLanguage =
    movie.spoken_languages?.[0]?.english_name ??
    movie.original_language?.toUpperCase() ??
    "—";

  // Maturity rating
  let maturityRating = "NR";
  if (mediaType === "movie" && movie.release_dates?.results) {
    const us = movie.release_dates.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    const cert =
      us?.release_dates?.find((rd) => rd.certification)?.certification;
    if (cert && cert.trim().length > 0) {
      maturityRating = cert;
    }
  } else if (mediaType === "tv" && movie.content_ratings?.results) {
    const us = movie.content_ratings.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    if (us?.rating && us.rating.trim().length > 0) {
      maturityRating = us.rating;
    }
  } else if (typeof movie.adult === "boolean") {
    maturityRating = movie.adult ? "18+" : "13+";
  }

  // Rating + stars + votes
  const avg = movie.vote_average ?? 0;
  const voteCount = movie.vote_count ?? 0;
  const fullStars = Math.floor(avg / 2); // 0–5
  const ratingLine =
    movie.vote_average != null
      ? `${movie.vote_average.toFixed(1)}/10 (${voteCount.toLocaleString()} votes)`
      : "No rating";

  // Runtime (movie or tv episode)
  const runtimeMinutes =
    mediaType === "movie"
      ? movie.runtime ?? 0
      : Array.isArray(movie.episode_run_time) &&
        movie.episode_run_time.length > 0
      ? movie.episode_run_time[0]
      : 0;
  const runtimeText = formatRuntime(runtimeMinutes);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {/* Full-width gradient header with poster */}
        <LinearGradient
          colors={["#FFB3D9", "#B3D9FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Back Button */}
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("Trending");
                }
              }}
            >
              <View style={styles.backButtonCircle}>
                <Text style={styles.backButtonText}>Back</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.movieTitle}>{displayTitle}</Text>

          {/* Poster */}
          {thumb ? (
            <Image
              source={{ uri: thumb }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.poster, styles.noPoster]}>
              <Ionicons name="film-outline" size={80} color="#ccc" />
            </View>
          )}
        </LinearGradient>

        {/* Padded inner content below header */}
        <View style={styles.innerContent}>
          {/* Rating row: yellow stars */}
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < fullStars ? "star" : "star-outline"}
                  size={20}
                  color="#FFD700"
                  style={styles.starIcon}
                />
              ))}
            </View>
          </View>

          {/* Year */}
          <Text style={styles.year}>{year}</Text>

          {/* Runtime with time icon */}
          {runtimeText && (
            <View style={styles.runtimeRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.runtimeTextStyle}>{runtimeText}{mediaType === 'tv' ? ' (per episode avg)' : ''}</Text>
            </View>
          )}

          {/* Genres as chips under stars */}
          {genreList.length > 0 && (
            <View style={styles.genresContainer}>
              {genreList.map((g) => (
                <View key={g} style={styles.genreTag}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description:</Text>
            <Text style={styles.descriptionText}>{movie.overview || "—"}</Text>
          </View>

          {/* Movie Info Section */}
          <View style={styles.movieInfoContainer}>
            {/* Certification (Rating) */}
            {maturityRating && maturityRating !== 'NR' && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Rating:</Text>
                <View style={styles.certificationBadge}>
                  <Text style={styles.certificationText}>{maturityRating}</Text>
                </View>
              </View>
            )}

            {/* Vote Count */}
            {voteCount > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Votes:</Text>
                <View style={styles.voteContainer}>
                  <Ionicons name="people" size={16} color="#666" />
                  <Text style={styles.voteText}>{formatVoteCount(voteCount)}</Text>
                </View>
              </View>
            )}

            {/* Streaming Providers */}
            {providers.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Available On:</Text>
                <View style={styles.providersContainer}>
                  {providers.map((provider, index) => (
                    <Text key={index} style={styles.providerText}>
                      {provider}
                      {index < providers.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Add to Watchlist */}
          <View style={{ marginTop: 10, marginBottom: 6 }}>
            <AddToListButton itemId={id} />
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
      </ScrollView>

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setShowGroupModal(false)}
            >
              <Ionicons name="arrow-back" size={20} color="#666" />
              <Text style={styles.modalBackButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Add to Group</Text>
            <Text style={styles.modalSubtitle}>
              Select a group to add "{displayTitle}" to:
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
              {runtimeText && (
                <Text style={{ color: '#666', fontSize: 12 }}>
                  {'\n'}(Max: {runtimeText})
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

            {runtimeMinutes > 0 && (
              <TouchableOpacity
                style={styles.logWholeButton}
                onPress={handleLogWholeMovie}
              >
                <Text style={styles.logWholeButtonText}>
                  Log Whole {mediaType === 'movie' ? 'Movie' : 'Episode'} ({runtimeText})
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
    backgroundColor: "#ffffff",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  loadingText: {
    marginTop: 8,
    color: "#000000",
  },

  content: {
    paddingBottom: 32,
  },

  innerContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  headerGradient: {
    width: "100%",
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTop: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 10,
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

  poster: {
    width: 150,
    height: 225,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },

  noPoster: {
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  year: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginBottom: 12,
  },

  ratingRow: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  starIcon: {
    marginHorizontal: 2,
  },

  runtimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  runtimeTextStyle: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },

  genresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },

  genreTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },

  genreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E7D32",
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

export default MovieDetailView;