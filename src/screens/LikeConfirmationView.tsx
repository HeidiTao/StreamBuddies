// src/screens/LikeConfirmationView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import AddToWatchlistModal from "../components/AddToWatchlistModal";

type Nav = NativeStackNavigationProp<RootStackParamList, "LikeConfirmation">;
type Route = RouteProp<RootStackParamList, "LikeConfirmation">;

type ProvidersResp = {
  results?: {
    [countryCode: string]: {
      flatrate?: { provider_name: string }[];
    };
  };
};

const providersUrl = (id: number, key?: string) =>
  key
    ? `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${key}`
    : `https://api.themoviedb.org/3/movie/${id}/watch/providers`;

const posterUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w500/${p}` : undefined;

const LikeConfirmationView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { movie } = route.params;

  const [providers, setProviders] = useState<string[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = useMemo(
    () =>
      tmdbToken ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` } : { accept: "application/json" },
    [tmdbToken]
  );

  useEffect(() => {
    navigation.setOptions({
      title: "Nice pick! 🎬",
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingProviders(true);
        const resp = await fetch(providersUrl(movie.id, tmdbToken ? undefined : tmdbApiKey), { headers });
        const json: ProvidersResp = await resp.json();
        if (!resp.ok) throw new Error(`Providers failed: ${resp.status}`);

        const regionBlock = json?.results?.["US"];
        const stream = regionBlock?.flatrate ?? [];
        if (mounted) setProviders(stream.map((p) => p.provider_name));
      } catch (err) {
        console.error("Failed to load providers", err);
        if (mounted) setProviders([]);
      } finally {
        if (mounted) setLoadingProviders(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [movie.id, tmdbApiKey, tmdbToken, headers]);

  const hasStreaming = providers.length > 0;
  const thumb = useMemo(() => posterUri(movie.poster_path), [movie.poster_path]);

  const handleStartWatching = () => {
    if (!hasStreaming) return;
    const message = `Available on: ${providers.join(", ")}`;
    Alert.alert("Start watching", message);
  };

  return (
    <View style={styles.container}>
      <AddToWatchlistModal
        movieId={movie.id}
        visible={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
      />

      <View style={styles.content}>
        <Text style={styles.title}>You liked</Text>
        <Text style={styles.movieTitle}>{movie.title}</Text>

        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Text style={styles.posterFallbackText}>No poster</Text>
          </View>
        )}

        <View style={styles.buttonStack}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => setShowWatchlistModal(true)}>
            <Text style={styles.buttonText}>Add to watchlist</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Keep swiping</Text>
          </TouchableOpacity>

          {loadingProviders ? (
            <View style={[styles.button, styles.disabledButton]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            hasStreaming && (
              <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStartWatching}>
                <Text style={styles.buttonText}>Start watching</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1b5e20" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: { color: "#b9f6ca", fontSize: 18, marginBottom: 4 },
  movieTitle: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 24, textAlign: "center" },
  poster: {
    width: 240,
    height: 360,
    borderRadius: 16,
    marginBottom: 32,
    backgroundColor: "#164e17",
  },
  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  posterFallbackText: {
    color: "#9ccc65",
    fontWeight: "700",
  },
  buttonStack: {
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: { backgroundColor: "#2e7d32" },
  secondaryButton: { backgroundColor: "#388e3c" },
  startButton: { backgroundColor: "#00c853" },
  disabledButton: { backgroundColor: "rgba(255,255,255,0.25)" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default LikeConfirmationView;
