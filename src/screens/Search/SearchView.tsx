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
import { searchStyles } from '../../styles/searchStyles';

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
    <View style={searchStyles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#E8D5F0', '#D5E8F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={searchStyles.gradientHeader}
      >
        {/* Search Bar */}
        <View style={searchStyles.searchContainer}>
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={searchStyles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content Area */}
      <ScrollView 
        style={searchStyles.content}
        contentContainerStyle={searchStyles.contentContainer}
      >
        {/* Streaming Service Buttons */}
        {searchResults.length === 0 && !loading && (
          <>
            {streamingServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  searchStyles.serviceButton,
                  { backgroundColor: service.color },
                ]}
                onPress={() => handleServicePress(service)}
              >
                <Text style={searchStyles.serviceText}>{service.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={searchStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <View style={searchStyles.resultsContainer}>
            <Text style={searchStyles.resultsTitle}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Popular on this service'}
            </Text>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={`${result.media_type}-${result.id}`}
                style={searchStyles.resultItem}
                onPress={() => handleResultPress(result)}
              >
                {result.poster_path ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w200${result.poster_path}`,
                    }}
                    style={searchStyles.resultPoster}
                  />
                ) : (
                  <View style={[styles.resultPoster, styles.noPoster]}>
                    <Ionicons name="film-outline" size={40} color="#ccc" />
                  </View>
                )}
                <View style={searchStyles.resultInfo}>
                  <Text style={searchStyles.resultTitle} numberOfLines={2}>
                    {result.title}
                  </Text>
                  <Text style={searchStyles.resultType}>
                    {result.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    {result.release_date && ` • ${result.release_date.split('-')[0]}`}
                  </Text>
                  <Text style={searchStyles.resultOverview} numberOfLines={3}>
                    {result.overview}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Results */}
        {!loading && searchQuery && searchResults.length === 0 && (
          <View style={searchStyles.noResultsContainer}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={searchStyles.noResultsText}>No results found</Text>
            <Text style={searchStyles.noResultsSubtext}>
              Try a different search term
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
export default SearchScreen;