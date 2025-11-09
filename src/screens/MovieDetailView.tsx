// src/screens/MovieDetailView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList, "MovieDetail">;
type Route = RouteProp<RootStackParamList, "MovieDetail">;

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  genres?: { id: number; name: string }[];
  release_date?: string;
  poster_path?: string | null;
};

type ProvidersResp = {
  results?: {
    [countryCode: string]: {
      flatrate?: { provider_name: string }[];
    };
  };
};

const detailsUrl = (id: number, key?: string) =>
  key
    ? `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&language=en-US`
    : `https://api.themoviedb.org/3/movie/${id}?language=en-US`;

const providersUrl = (id: number, key?: string) =>
  key
    ? `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${key}`
    : `https://api.themoviedb.org/3/movie/${id}/watch/providers`;

const posterUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w500/${p}` : undefined;

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
};

const MovieDetailView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { movieId, title } = route.params;

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = tmdbToken
    ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
    : { accept: "application/json" };

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: title ?? "Details",
      headerBackTitleVisible: false,
    });
  }, [navigation, title]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Movie details
        const detRes = await fetch(detailsUrl(movieId, tmdbToken ? undefined : tmdbApiKey), { headers });
        const detJson: MovieDetails = await detRes.json();
        if (!detRes.ok) throw new Error(`Details failed: ${detRes.status}`);
        setMovie(detJson);

        // Streaming providers (US only)
        const provRes = await fetch(providersUrl(movieId, tmdbToken ? undefined : tmdbApiKey), { headers });
        const provJson: ProvidersResp = await provRes.json();
        if (!provRes.ok) throw new Error(`Providers failed: ${provRes.status}`);

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
  }, [movieId, tmdbApiKey, tmdbToken]);

  const genreList = useMemo(() => (movie?.genres ?? []).map((g) => g.name).join(", "), [movie?.genres]);
  const thumb = posterUri(movie?.poster_path);

  if (loading || !movie) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading details…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Centered larger poster */}
        {thumb && (
          <Image source={{ uri: thumb }} style={styles.poster} resizeMode="cover" />
        )}

        <Text style={styles.title}>{movie.title}</Text>

        {/* Section: Release Date */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Release Date</Text>
          </View>
          <Text style={styles.value}>{formatDate(movie.release_date)}</Text>
        </View>

        {/* Section: Description */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Description</Text>
          </View>
          <Text style={styles.value}>{movie.overview || "—"}</Text>
        </View>

        {/* Section: Genres */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Genres</Text>
          </View>
          <Text style={styles.value}>{genreList || "—"}</Text>
        </View>

        {/* Section: Streaming Services (US) */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Streaming Services (US)</Text>
          </View>
          <Text style={styles.value}>
            {providers.length ? providers.join(", ") : "Not currently available to stream (flatrate) in US"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  loadingText: { marginTop: 8, color: "#ccc" },

  content: { padding: 16, paddingBottom: 32, alignItems: "center" },

  poster: {
    width: 220,
    height: 320,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: "#222",
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },

  section: { width: "100%", marginTop: 14 },
  bubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1f1f1f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 6,
  },
  bubbleText: { color: "#ddd", fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  value: { color: "#fff", fontSize: 16, lineHeight: 22, textAlign: "left" },
});

export default MovieDetailView;
