// src/screens/Swipe/ExploreSwiper.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from "react-native";
import Swiper from "react-native-deck-swiper";
import MovieCard from "./MovieCard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
};

type Nav = NativeStackNavigationProp<RootStackParamList, "Explore">;
type MediaType = "movie" | "tv";

const TMDB_DISCOVER_MOVIE_URL = "https://api.themoviedb.org/3/discover/movie";
const TMDB_DISCOVER_TV_URL = "https://api.themoviedb.org/3/discover/tv";

const GREEN = "#2e7d32";
const RED = "#d32f2f";
const YELLOW = "#ffca28";
const NEUTRAL = "#000";

// button colors requested
const PASS_COLOR = "#E05353";
const LIKE_COLOR = "#B5E78F";

// TMDB watch providers for major US streaming services (Netflix, Prime, Disney+, Hulu, Max, AppleTV+, Peacock)
const STREAMING_PROVIDERS = "8|9|337|15|384|350|387";

const ExploreSwiper: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // movie vs show toggle
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  const swiperRef = useRef<Swiper<MediaItem>>(null);

  // Animated background: -1 (left/red), 0 (neutral), +1 (right/green)
  const bgValue = useRef(new Animated.Value(0)).current;
  const bgColor = bgValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [RED, NEUTRAL, GREEN],
  });

  // separate value for up swipe highlight (yellow)
  const upValue = useRef(new Animated.Value(0)).current;
  const upOpacity = upValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = tmdbToken
    ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
    : { accept: "application/json" };

  /**
   * Fetch TMDB discover results for movies or TV.
   * Filters to US streaming availability via watch providers.
   * If append = true, results are appended to the existing list.
   */
  const getDiscover = useCallback(
    async (media: MediaType, pageToLoad: number = 1, append: boolean = false) => {
      if (!append) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams({
        language: "en-US",
        sort_by: "popularity.desc",
        page: String(pageToLoad),
        include_adult: "false",
        watch_region: "US",
        with_watch_monetization_types: "flatrate|ads|free",
        with_watch_providers: STREAMING_PROVIDERS,
      });

      const baseUrl = media === "movie" ? TMDB_DISCOVER_MOVIE_URL : TMDB_DISCOVER_TV_URL;

      const url = tmdbToken
        ? `${baseUrl}?${params.toString()}`
        : `${baseUrl}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;

      try {
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);

        const rawResults: any[] = Array.isArray(data.results) ? data.results : [];

        const results: MediaItem[] = rawResults.map((item) => ({
          id: item.id,
          // movies use "title", TV uses "name"
          title: item.title ?? item.name ?? "Untitled",
          overview: item.overview ?? "",
          poster_path: item.poster_path ?? null,
          release_date: item.release_date ?? item.first_air_date,
        }));

        // track totalPages so we don't request past the end
        setTotalPages(typeof data.total_pages === "number" ? data.total_pages : null);

        setItems((prev) => (append ? [...prev, ...results] : results));

        if (!append) {
          setCurrentIndex(0);
          setPage(pageToLoad);
        } else {
          setPage(pageToLoad);
        }
      } catch (err) {
        console.error("❌ Error fetching discover:", err);
        if (!append) {
          setItems([]);
        }
      } finally {
        if (!append) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [tmdbApiKey, tmdbToken]
  );

  // initial load
  useEffect(() => {
    getDiscover("movie", 1, false);
  }, [getDiscover]);

  const deck = useMemo(() => items, [items]);

  const handleSwiping = (x: number, y: number) => {
    // Normalize direction for smooth transitions
    const horizontal = Math.max(-1, Math.min(1, x / 200));
    bgValue.setValue(horizontal);

    if (y < -80) {
      Animated.timing(upValue, { toValue: 1, duration: 100, useNativeDriver: false }).start();
    } else {
      Animated.timing(upValue, { toValue: 0, duration: 100, useNativeDriver: false }).start();
    }
  };

  const resetBg = () => {
    Animated.parallel([
      Animated.timing(bgValue, { toValue: 0, duration: 150, useNativeDriver: false }),
      Animated.timing(upValue, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  const handleSwitchMediaType = (media: MediaType) => {
    if (media === mediaType) return;
    setMediaType(media);
    setPage(1);
    setTotalPages(null);
    setCurrentIndex(0);
    // load first page for the new type
    getDiscover(media, 1, false);
  };

  if (loading && !items.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading Explore…</Text>
      </View>
    );
  }

  if (!deck.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No titles found. Try again later.</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Yellow overlay for upward swipe */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: YELLOW, opacity: upOpacity }]}
      />

      {/* Top toggle bar: Movies / Shows */}
      <View style={styles.toggleBar}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mediaType === "movie" && styles.toggleButtonActive,
          ]}
          onPress={() => handleSwitchMediaType("movie")}
        >
          <Text
            style={[
              styles.toggleText,
              mediaType === "movie" && styles.toggleTextActive,
            ]}
          >
            Movies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            mediaType === "tv" && styles.toggleButtonActive,
          ]}
          onPress={() => handleSwitchMediaType("tv")}
        >
          <Text
            style={[
              styles.toggleText,
              mediaType === "tv" && styles.toggleTextActive,
            ]}
          >
            Shows
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.swiperWrap}>
        <Swiper
          ref={swiperRef}
          cards={deck}
          renderCard={(m) => {
            // Safeguard against undefined cards
            if (!m) {
              return (
                <View style={styles.centerInner}>
                  <Text style={styles.emptyText}>No more titles right now.</Text>
                </View>
              );
            }

            return <MovieCard title={m.title} posterPath={m.poster_path} />;
          }}
          backgroundColor="transparent"
          stackSize={3}
          cardVerticalMargin={24}
          animateCardOpacity
          onSwiping={(x, y) => handleSwiping(x, y)}
          onSwiped={(i, type) => {
            const nextIndex = i + 1;
            setCurrentIndex(nextIndex);
            resetBg();

            // When we're near the end of the current deck, fetch the next page
            const NEAR_END_THRESHOLD = 5;
            const isNearEnd = deck.length - nextIndex <= NEAR_END_THRESHOLD;

            if (
              isNearEnd &&
              !isLoadingMore &&
              totalPages !== null &&
              page < totalPages
            ) {
              getDiscover(mediaType, page + 1, true);
            }
          }}
          onSwipedRight={(i) => {
            const liked = deck[i];
            if (liked) console.log("👍 Liked:", liked.title);
          }}
          onSwipedLeft={(i) => {
            const passed = deck[i];
            if (passed) console.log("👎 Passed:", passed.title);
          }}
          onSwipedTop={(i) => {
            const m = deck[i];
            if (m) {
              console.log("⬆️ Swiped up for info:", m.title);
              navigation.navigate("MovieDetail", {
                id: m.id,
                title: m.title,
                mediaType,
              });
            }
          }}
          verticalSwipe={true}
          onTapCard={(i) => {
            const m = deck[i];
            if (m)
              navigation.navigate("MovieDetail", {
                id: m.id,
                title: m.title,
                mediaType,
              });
          }}
        />
      </View>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.pass]}
          onPress={() => {
            swiperRef.current?.swipeLeft();
            setCurrentIndex((x) => Math.min(x + 1, deck.length - 1));
          }}
        >
          {/* Red X */}
          <Text style={styles.actionIconText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.info]}
          onPress={() => {
            const m = deck[currentIndex];
            if (!m) return;
            navigation.navigate("MovieDetail", {
              id: m.id,
              title: m.title,
              mediaType,
            });
          }}
        >
          {/* Info "i" */}
          <Text style={styles.actionIconText}>i</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.like]}
          onPress={() => {
            swiperRef.current?.swipeRight();
            setCurrentIndex((x) => Math.min(x + 1, deck.length - 1));
          }}
        >
          {/* Checkmark */}
          <Text style={styles.actionIconText}>✓</Text>
        </TouchableOpacity>
      </View>

      {isLoadingMore && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingMoreText}>Loading more titles…</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  swiperWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 96, // reserve space so cards don't overlap the bottom buttons
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },

  // inner center for inside cards/swiper content (no full-screen background)
  centerInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: { marginTop: 8, color: "#ccc" },
  emptyText: { color: "#ccc", textAlign: "center", paddingHorizontal: 24 },

  // top toggle buttons
  toggleBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  toggleButtonActive: {
    backgroundColor: "#222",
    borderColor: "#fff",
  },
  toggleText: {
    color: "#aaa",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "#fff",
  },

  actionBar: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#000",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 999,
    justifyContent: "center",
  },
  pass: { backgroundColor: PASS_COLOR },
  info: { backgroundColor: "#444" },
  like: { backgroundColor: LIKE_COLOR },
  actionIconText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
  },

  loadingMore: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  loadingMoreText: {
    marginLeft: 8,
    color: "#ccc",
    fontSize: 12,
  },
});

export default ExploreSwiper;
