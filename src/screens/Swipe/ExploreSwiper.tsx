// src/screens/Swipe/ExploreSwiper.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from "react-native";
import Swiper from "react-native-deck-swiper";
import MovieCard from "./MovieCard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
};

type Nav = NativeStackNavigationProp<RootStackParamList, "Explore">;

const TMDB_DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie";
const GREEN = "#2e7d32";
const RED = "#d32f2f";
const YELLOW = "#ffca28";
const NEUTRAL = "#000";

const ExploreSwiper: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<Swiper<Movie>>(null);

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

  const getDiscoverMovies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      language: "en-US",
      sort_by: "popularity.desc",
      page: "1",
      include_adult: "false",
    });

    const url = tmdbToken
      ? `${TMDB_DISCOVER_URL}?${params.toString()}`
      : `${TMDB_DISCOVER_URL}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;

    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);
      const results: Movie[] = Array.isArray(data.results) ? data.results : [];
      setMovies(results);
      setCurrentIndex(0);
    } catch (err) {
      console.error("❌ Error fetching discover movies:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [tmdbApiKey, tmdbToken]);

  useEffect(() => {
    getDiscoverMovies();
  }, [getDiscoverMovies]);

  const deck = useMemo(() => movies, [movies]);

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

  if (loading) {
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
        <Text style={styles.emptyText}>No movies found. Check your TMDB key/token.</Text>
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

      <View style={styles.swiperWrap}>
        <Swiper
          ref={swiperRef}
          cards={deck}
          renderCard={(m) => <MovieCard title={m.title} posterPath={m.poster_path} />}
          backgroundColor="transparent"
          stackSize={3}
          animateCardOpacity
          onSwiping={(x, y) => handleSwiping(x, y)}
          onSwiped={(i, type) => {
            setCurrentIndex(i + 1);
            resetBg();
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
              navigation.navigate("MovieDetail", { movieId: m.id, title: m.title });
            }
          }}
          verticalSwipe={true}
          onTapCard={(i) => {
            const m = deck[i];
            if (m) navigation.navigate("MovieDetail", { movieId: m.id, title: m.title });
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
          <Text style={styles.actionText}>Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.info]}
          onPress={() => {
            const m = deck[currentIndex];
            if (!m) return;
            navigation.navigate("MovieDetail", { movieId: m.id, title: m.title });
          }}
        >
          <Text style={styles.actionText}>More info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.like]}
          onPress={() => {
            swiperRef.current?.swipeRight();
            setCurrentIndex((x) => Math.min(x + 1, deck.length - 1));
          }}
        >
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  swiperWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  loadingText: { marginTop: 8, color: "#ccc" },
  emptyText: { color: "#ccc", textAlign: "center", paddingHorizontal: 24 },

  actionBar: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#000",
  },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12 },
  pass: { backgroundColor: RED },
  info: { backgroundColor: "#444" },
  like: { backgroundColor: GREEN },
  actionText: { color: "white", fontWeight: "700" },
});

export default ExploreSwiper;
