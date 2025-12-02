// src/screens/Swipe/Components/StartWatchingButton.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
  Linking,
} from "react-native";

type ProviderInfo = {
  name: string;
  logoPath?: string | null;
};

type ProvidersResp = {
  results?: {
    [countryCode: string]: {
      link?: string;
      flatrate?: { provider_name: string; logo_path?: string | null }[];
    };
  };
};

type Props = {
  movieId: number;
  title: string;
};

const providersUrl = (id: number, key?: string) =>
  key
    ? `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${key}`
    : `https://api.themoviedb.org/3/movie/${id}/watch/providers`;

const logoUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w154${p}` : undefined; // slightly larger image

// Provider-specific search URLs that are more likely to deep-link into the app
const getProviderSearchLink = (providerName: string, title: string) => {
  const q = encodeURIComponent(title);
  const normalized = providerName.toLowerCase();

  if (normalized.includes("netflix")) {
    // Often opens the Netflix app's search screen on mobile
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

  // Generic fallback: let the browser/app ecosystem figure it out
  return `https://www.google.com/search?q=${encodeURIComponent(
    `${providerName} ${title}`
  )}`;
};

const StartWatchingButton: React.FC<Props> = ({ movieId, title }) => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = useMemo(
    () =>
      tmdbToken
        ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
        : { accept: "application/json" },
    [tmdbToken]
  );

  // Fetch providers (we *won't* use the TMDB watchLink anymore)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(
          providersUrl(movieId, tmdbToken ? undefined : tmdbApiKey),
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
        if (mounted) {
          setProviders([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [movieId, tmdbApiKey, tmdbToken, headers]);

  const hasStreaming = providers.length > 0;

  const handleMainPress = () => {
    if (!hasStreaming) {
      Alert.alert("No streaming info", "We couldn't find streaming providers.");
      return;
    }
    setShowModal(true);
  };

  const handleProviderPress = async (provider: ProviderInfo) => {
    // Always prefer a provider-specific search URL over the TMDB link
    const url = getProviderSearchLink(provider.name, title);
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

  if (loading) {
    return (
      <View style={[styles.button, styles.disabledButton]}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  if (!hasStreaming) {
    return (
      <View style={[styles.button, styles.disabledButton]}>
        <Text style={styles.buttonText}>No streaming info</Text>
      </View>
    );
  }

  return (
    <>
      {/* Main Start Watching button */}
      <TouchableOpacity style={styles.button} onPress={handleMainPress}>
        <Text style={styles.buttonText}>Start watching</Text>
      </TouchableOpacity>

      {/* Providers Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="modalOverlay" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Where to watch</Text>
            <Text style={styles.modalSubtitle}>
              Tap a service to open the title.
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
                    <Text
                      style={styles.providerName}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {provider.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Button styling: white with black text
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  buttonText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 16,
  },

  // Modal styles
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
    gap: 16,
    marginBottom: 16,
    justifyContent: "center",
  },
  providerChip: {
    width: 110, // wider so text has more space
    alignItems: "center",
  },
  providerLogo: {
    width: 72,
    height: 48,
    marginBottom: 6,
  },
  providerIconFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "hsl(90, 40%, 75%)",
    marginBottom: 6,
  },
  providerIconText: {
    fontWeight: "800",
    color: "#2E7D32",
    fontSize: 16,
  },
  providerName: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
    minHeight: 32, // gives room for 2 lines without crowding
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

export default StartWatchingButton;
