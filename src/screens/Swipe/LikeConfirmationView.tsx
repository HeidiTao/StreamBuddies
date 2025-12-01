import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";
import AddToListButton from "./Components/AddToListButton";
import type { MediaItem } from "./useExploreSwiper"; // purely for typing

type Nav = NativeStackNavigationProp<RootStackParamList, "LikeConfirmation">;
type Route = RouteProp<RootStackParamList, "LikeConfirmation">;

type ProviderInfo = {
  name: string;
  logoPath?: string | null;
};

type ProvidersResp = {
  results?: {
    [countryCode: string]: {
      flatrate?: { provider_name: string; logo_path?: string | null }[];
    };
  };
};

const providersUrl = (id: number, key?: string) =>
  key
    ? `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${key}`
    : `https://api.themoviedb.org/3/movie/${id}/watch/providers`;

const posterUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w500/${p}` : undefined;

const logoUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w92${p}` : undefined;

// Map provider names to a reasonable "start watching" URL.
const getProviderLink = (providerName: string, title: string) => {
  const q = encodeURIComponent(title);
  const normalized = providerName.toLowerCase();

  if (normalized.includes("netflix")) {
    return `https://www.netflix.com/search?q=${q}`;
  }
  if (normalized.includes("prime") || normalized.includes("amazon")) {
    return `https://www.amazon.com/s?k=${q}&i=instant-video`;
  }
  if (normalized.includes("hulu")) {
    return `https://www.hulu.com/search?q=${q}`;
  }
  if (normalized.includes("disney")) {
    return `https://www.disneyplus.com/search/${q}`;
  }
  if (normalized.includes("max")) {
    return `https://play.max.com/search?q=${q}`;
  }
  if (normalized.includes("apple")) {
    return `https://tv.apple.com/us/search/${q}`;
  }

  // Fallback: generic web search with provider + title
  return `https://www.google.com/search?q=${encodeURIComponent(
    `${providerName} ${title}`
  )}`;
};

const LikeConfirmationView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { movie } = route.params as { movie: MediaItem };

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [showProvidersModal, setShowProvidersModal] = useState(false);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = useMemo(
    () =>
      tmdbToken
        ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
        : { accept: "application/json" },
    [tmdbToken]
  );

  useEffect(() => {
    navigation.setOptions({
      title: "Nice pick! 🎬",
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  // Load streaming providers
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingProviders(true);
        const resp = await fetch(
          providersUrl(movie.id, tmdbToken ? undefined : tmdbApiKey),
          { headers }
        );
        const json: ProvidersResp = await resp.json();
        if (!resp.ok) throw new Error(`Providers failed: ${resp.status}`);

        const regionBlock = json?.results?.["US"];
        const stream = regionBlock?.flatrate ?? [];

        // Filter out "with ads" variants
        const filtered = stream.filter(
          (p) => !p.provider_name.toLowerCase().includes("with ads")
        );

        if (mounted) {
          setProviders(
            filtered.map((p) => ({
              name: p.provider_name,
              logoPath: p.logo_path ?? null,
            }))
          );
        }
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
    if (!hasStreaming) {
      Alert.alert("No streaming info", "We couldn't find streaming providers.");
      return;
    }
    setShowProvidersModal(true);
  };

  const handleProviderPress = async (provider: ProviderInfo) => {
    const url = getProviderLink(provider.name, movie.title);
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        "Unable to open",
        "We couldn't open this provider right now."
      );
      return;
    }
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
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
          {/* Keep swiping → go back to Explore */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Keep swiping</Text>
          </TouchableOpacity>

          {/* Shared Add to List button (Firestore handled inside component) */}
          <AddToListButton
            itemId={movie.id}
            style={{ marginTop: 12, alignSelf: "stretch" }}
          />

          {/* Start watching → show providers modal */}
          {loadingProviders ? (
            <View style={[styles.button, styles.disabledButton]}>
              <ActivityIndicator color="#000" />
            </View>
          ) : hasStreaming ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={handleStartWatching}
            >
              <Text style={styles.buttonText}>Start watching</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.button, styles.disabledButton]}>
              <Text style={styles.buttonText}>No streaming info</Text>
            </View>
          )}
        </View>
      </View>

      {/* Providers Modal */}
      <Modal
        visible={showProvidersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProvidersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Where to watch</Text>
            <Text style={styles.modalSubtitle}>
              Tap a service to open it and start watching.
            </Text>

            <View style={styles.providersRow}>
              {providers.map((provider) => {
                const logo = logoUri(provider.logoPath);
                const initials = provider.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase();

                return (
                  <TouchableOpacity
                    key={provider.name}
                    style={styles.providerChip}
                    onPress={() => handleProviderPress(provider)}
                  >
                    {logo ? (
                      <Image
                        source={{ uri: logo }}
                        style={styles.providerLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.providerIconFallback}>
                        <Text style={styles.providerIconText}>{initials}</Text>
                      </View>
                    )}
                    <Text style={styles.providerName} numberOfLines={1}>
                      {provider.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowProvidersModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // 40% saturation green via HSL
  container: { flex: 1, backgroundColor: "hsl(90, 40%, 75%)" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#2E7D32",
    fontSize: 18,
    marginBottom: 4,
    fontWeight: "600",
  },
  movieTitle: {
    color: "#1B1B1B",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
  },
  poster: {
    width: 240,
    height: 360,
    borderRadius: 16,
    marginBottom: 32,
    backgroundColor: "#E0F2D2",
  },
  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  posterFallbackText: {
    color: "#2E7D32",
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
    backgroundColor: "#FFFFFF", // white buttons
  },
  secondaryButton: {
    // Keep swiping – white by default
  },
  startButton: {
    // Start watching – white by default
  },
  disabledButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  buttonText: {
    color: "#000000", // black text
    fontWeight: "700",
    fontSize: 16,
  },

  // Providers modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1B1B1B",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  providersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  providerChip: {
    width: 90,
    alignItems: "center",
  },
  providerLogo: {
    width: 60,
    height: 40,
    marginBottom: 6,
  },
  providerIconFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "hsl(90, 40%, 75%)",
    marginBottom: 6,
  },
  providerIconText: {
    fontWeight: "800",
    color: "#2E7D32",
    fontSize: 14,
  },
  providerName: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#2E7D32",
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default LikeConfirmationView;
