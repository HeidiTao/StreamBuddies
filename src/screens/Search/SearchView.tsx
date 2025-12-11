import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface StreamingService {
  id: string;
  name: string;
  color: string;
  providerId: string;
}

interface SearchResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  media_type?: 'movie' | 'tv';
}

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const streamingServices: StreamingService[] = [
    { id: '1', name: 'Netflix', color: '#FFB3BA', providerId: '8' },
    { id: '2', name: 'Hulu', color: '#BAFFC9', providerId: '15' },
    { id: '3', name: 'Max', color: '#D4BAFF', providerId: '1899' },
    { id: '4', name: 'Apple TV+', color: '#E0E0E0', providerId: '350' },
  ];

  const searchMoviesAndTV = async (query: string) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        query: query,
        language: 'en-US',
        page: '1',
        include_adult: 'false',
      });

      // Use multi-search endpoint to search both movies and TV shows
      const url = tmdbToken
        ? `https://api.themoviedb.org/3/search/multi?${params.toString()}`
        : `https://api.themoviedb.org/3/search/multi?${params.toString()}&api_key=${tmdbApiKey ?? ''}`;

      const headers: HeadersInit = tmdbToken
        ? { accept: 'application/json', Authorization: `Bearer ${tmdbToken}` }
        : { accept: 'application/json' };

      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);

      const rawResults: any[] = Array.isArray(data.results) ? data.results : [];
      
      // Filter to only movies and TV shows
      const results: SearchResult[] = rawResults
        .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => ({
          id: item.id,
          title: item.title ?? item.name ?? 'Untitled',
          overview: item.overview ?? '',
          poster_path: item.poster_path ?? null,
          release_date: item.release_date ?? item.first_air_date,
          media_type: item.media_type,
        }));

      setSearchResults(results);
    } catch (error) {
      console.error('❌ Error searching TMDB:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = () => {
    searchMoviesAndTV(searchQuery);
  };

  // also allow search to happen while users type
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      searchMoviesAndTV(searchQuery);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery])


  const handleServicePress = (service: StreamingService) => {
    (navigation as any).navigate('ServiceResults', {
      serviceName: service.name,
      serviceColor: service.color,
      providerId: service.providerId,
    });
  };

  const handleResultPress = async (result: SearchResult) => {
    // Fetch additional details to get genres, rating, runtime, certification, and streaming providers
    try {
      const mediaType = result.media_type === 'tv' ? 'tv' : 'movie';
      const url = tmdbToken
        ? `https://api.themoviedb.org/3/${mediaType}/${result.id}?language=en-US&append_to_response=release_dates,content_ratings,watch/providers`
        : `https://api.themoviedb.org/3/${mediaType}/${result.id}?language=en-US&append_to_response=release_dates,content_ratings,watch/providers&api_key=${tmdbApiKey ?? ''}`;

      const headers: HeadersInit = tmdbToken
        ? { accept: 'application/json', Authorization: `Bearer ${tmdbToken}` }
        : { accept: 'application/json' };

      const res = await fetch(url, { headers });
      const data = await res.json();

      const genres = data.genres ? data.genres.map((g: any) => g.name) : [];
      const rating = data.vote_average || 0;
      const voteCount = data.vote_count || 0;
      
      // Get certification (rating like PG-13, R, etc.)
      let certification = '';
      if (mediaType === 'movie' && data.release_dates?.results) {
        const usRelease = data.release_dates.results.find((r: any) => r.iso_3166_1 === 'US');
        if (usRelease?.release_dates?.[0]?.certification) {
          certification = usRelease.release_dates[0].certification;
        }
      } else if (mediaType === 'tv' && data.content_ratings?.results) {
        const usRating = data.content_ratings.results.find((r: any) => r.iso_3166_1 === 'US');
        if (usRating?.rating) {
          certification = usRating.rating;
        }
      }
      
      // Get streaming providers for US
      const streamingProviders: any[] = [];
      if (data['watch/providers']?.results?.US?.flatrate) {
        streamingProviders.push(
          ...data['watch/providers'].results.US.flatrate.map((p: any) => ({
            provider_id: p.provider_id,
            provider_name: p.provider_name,
            logo_path: p.logo_path,
          }))
        );
      }
      
      // For movies: use runtime directly
      // For TV shows: use episode_run_time average or first value
      let runtime = 0;
      if (mediaType === 'movie') {
        runtime = data.runtime || 0;
      } else if (mediaType === 'tv' && data.episode_run_time && data.episode_run_time.length > 0) {
        // For TV shows, get average episode runtime
        const episodeRunTimes = data.episode_run_time;
        runtime = Math.round(
          episodeRunTimes.reduce((a: number, b: number) => a + b, 0) / episodeRunTimes.length
        );
      }

      // Navigate to detail screen
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
        certification: certification,
        vote_count: voteCount,
        streaming_providers: streamingProviders,
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Streaming Service Buttons */}
        {searchResults.length === 0 && !loading && (
          <>
            {streamingServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceButton,
                  { backgroundColor: service.color },
                ]}
                onPress={() => handleServicePress(service)}
              >
                <Text style={styles.serviceText}>{service.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Popular on this service'}
            </Text>
            {searchResults.map((result) => (
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

        {/* No Results */}
        {!loading && searchQuery && searchResults.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try a different search term
            </Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  serviceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default SearchScreen;