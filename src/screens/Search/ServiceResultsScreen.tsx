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
import { serviceResultStyles } from '../../styles/searchStyles';

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
        certification: certification,
        vote_count: voteCount,
        streaming_providers: streamingProviders,
      });
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  return (
    <View style={serviceResultStyles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#E8D5F0', '#D5E8F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={serviceResultStyles.gradientHeader}
      >
        <View style={serviceResultStyles.headerContent}>
          <TouchableOpacity
            style={serviceResultStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={serviceResultStyles.headerTitle}>{serviceName}</Text>
        </View>
      </LinearGradient>

      {/* Results */}
      <ScrollView
        style={serviceResultStyles.content}
        contentContainerStyle={serviceResultStyles.contentContainer}
      >
        {loading ? (
          <View style={serviceResultStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <View style={serviceResultStyles.resultsContainer}>
            <Text style={serviceResultStyles.resultsTitle}>Popular on {serviceName}</Text>
            {results.map((result) => (
              <TouchableOpacity
                key={`${result.media_type}-${result.id}`}
                style={serviceResultStyles.resultItem}
                onPress={() => handleResultPress(result)}
              >
                {result.poster_path ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w200${result.poster_path}`,
                    }}
                    style={serviceResultStyles.resultPoster}
                  />
                ) : (
                  <View style={[styles.resultPoster, styles.noPoster]}>
                    <Ionicons name="film-outline" size={40} color="#ccc" />
                  </View>
                )}
                <View style={serviceResultStyles.resultInfo}>
                  <Text style={serviceResultStyles.resultTitle} numberOfLines={2}>
                    {result.title}
                  </Text>
                  <Text style={serviceResultStyles.resultType}>
                    {result.media_type === 'movie' ? 'Movie' : 'TV Show'}
                    {result.release_date && ` • ${result.release_date.split('-')[0]}`}
                  </Text>
                  <Text style={serviceResultStyles.resultOverview} numberOfLines={3}>
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


export default ServiceResultsScreen;