import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

interface SearchResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  media_type?: 'movie' | 'tv';
}

type RouteParams = {
  serviceName: string;
  serviceColor: string;
  providerId: string;
};

const ServiceResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { serviceName, serviceColor, providerId } = route.params;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    searchByProvider();
  }, []);

  const searchByProvider = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: '1',
        include_adult: 'false',
        watch_region: 'US',
        with_watch_monetization_types: 'flatrate|ads|free',
        with_watch_providers: providerId,
      });

      const url = tmdbToken
        ? `https://api.themoviedb.org/3/discover/movie?${params.toString()}`
        : `https://api.themoviedb.org/3/discover/movie?${params.toString()}&api_key=${tmdbApiKey ?? ''}`;

      const headers: HeadersInit = tmdbToken
        ? { accept: 'application/json', Authorization: `Bearer ${tmdbToken}` }
        : { accept: 'application/json' };

      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!res.ok) throw new Error(`TMDB discover failed: ${res.status}`);

      const rawResults: any[] = Array.isArray(data.results) ? data.results : [];
      const searchResults: SearchResult[] = rawResults.map((item) => ({
        id: item.id,
        title: item.title ?? item.name ?? 'Untitled',
        overview: item.overview ?? '',
        poster_path: item.poster_path ?? null,
        release_date: item.release_date ?? item.first_air_date,
        media_type: 'movie',
      }));

      setResults(searchResults);
    } catch (error) {
      console.error('❌ Error fetching by provider:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = async (result: SearchResult) => {
    try {
      const mediaType = result.media_type === 'tv' ? 'tv' : 'movie';
      const url = tmdbToken
        ? `https://api.themoviedb.org/3/${mediaType}/${result.id}?language=en-US`
        : `https://api.themoviedb.org/3/${mediaType}/${result.id}?language=en-US&api_key=${tmdbApiKey ?? ''}`;

      const headers: HeadersInit = tmdbToken
        ? { accept: 'application/json', Authorization: `Bearer ${tmdbToken}` }
        : { accept: 'application/json' };

      const res = await fetch(url, { headers });
      const data = await res.json();

      const genres = data.genres ? data.genres.map((g: any) => g.name) : [];
      const rating = data.vote_average || 0;

      let runtime = 0;
      if (mediaType === 'movie') {
        runtime = data.runtime || 0;
      } else if (mediaType === 'tv' && data.episode_run_time && data.episode_run_time.length > 0) {
        const episodeRunTimes = data.episode_run_time;
        runtime = Math.round(
          episodeRunTimes.reduce((a: number, b: number) => a + b, 0) / episodeRunTimes.length
        );
      }

      (navigation as any).navigate('MovieDetailSearch', {
        movieId: result.id,
        title: result.title,
        poster_path: result.poster_path,
        overview: result.overview,
        release_date: result.release_date,
        genres: genres,
        rating: rating,
        runtime: runtime,
        media_type: mediaType,
      });
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#E8D5F0', '#D5E8F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{serviceName}</Text>
        </View>
      </LinearGradient>

      {/* Results */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Popular on {serviceName}</Text>
            {results.map((result) => (
              <TouchableOpacity
                key={`${result.media_type}-${result.id}`}
                style={styles.resultItem}
                onPress={() => handleResultPress(result)}
              >
                {result.poster_path ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w200${result.poster_path}`,
                    }}
                    style={styles.resultPoster}
                  />
                ) : (
                  <View style={[styles.resultPoster, styles.noPoster]}>
                    <Ionicons name="film-outline" size={40} color="#ccc" />
                  </View>
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {result.title}
                  </Text>
                  <Text style={styles.resultType}>
                    {result.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    {result.release_date && ` • ${result.release_date.split('-')[0]}`}
                  </Text>
                  <Text style={styles.resultOverview} numberOfLines={3}>
                    {result.overview}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultPoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  noPoster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  resultType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  resultOverview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default ServiceResultsScreen;