// src/screens/Swipe/ExploreSwiper.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Swiper from "react-native-deck-swiper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

import MovieCard from "./Components/MovieCard";
import MediaToggleBar from "./Components/MediaToggleBar";
import SwipeActionBar from "./Components/SwipeActionBar";
import useExploreSwiper, {
  MediaType,
  MediaItem,
} from "./useExploreSwiper";
import type { MediaFilters } from "./Components/FilterButton";

type Nav = NativeStackNavigationProp<RootStackParamList, "Explore">;

const YELLOW = "#ffca28";

const ExploreSwiper: React.FC = () => {
  const navigation = useNavigation<Nav>();

  /**
   * Global filters for the Explore swiper.
   * - These are passed into `useExploreSwiper(filters)` so the hook
   *   can fetch the right TMDB results (genre/year/stars/maturity/streaming).
   * - They are also passed into MediaToggleBar → FilterButton so the
   *   filter UI stays in sync with the data.
   */
  const [filters, setFilters] = useState<MediaFilters>({
    genre: "Any",
    year: "Any",
    stars: "Any",
    maturity: "Any",
    streaming: "Any",
  });

  /**
   * Custom hook that:
   *   - Fetches & stores the current deck of titles (`deck`)
   *   - Tracks loading states
   *   - Knows the active mediaType ("movie" | "tv")
   *   - Exposes helpers like `refreshDeck` and `loadNextDeckPage`
   *   - Provides animated values for the background color
   */
  const {
    deck,
    loading,
    isLoadingMore,
    currentIndex,
    setCurrentIndex,
    mediaType,
    switchMediaType,
    swiperRef,
    bgValue,
    upValue,
    refreshDeck,       // currently unused here, but still exposed
    loadNextDeckPage,  // used to get the next TMDB page
  } = useExploreSwiper(filters);

  /**
   * Local state that drives the label / disabled state
   * of the Refresh button (e.g., "Refreshing…").
   */
  const [refreshing, setRefreshing] = useState(false);

  /**
   * deckVersion is used as a React `key` for the Swiper component.
   * When we increment this, React unmounts/remounts Swiper, which
   * resets its internal index back to 0. This is how we get Swiper
   * to "start at the top" of a newly loaded deck.
   */
  const [deckVersion, setDeckVersion] = useState(0);

  /**
   * Background color transitions:
   * - bgValue ∈ [-1, 0, 1]
   *   - -1 = strong left swipe (red)
   *   -  0 = neutral (transparent/very light to not interfere with gradient)
   *   -  1 = strong right swipe (green)
   */
  const bgColor = bgValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["#d32f2f", "rgba(245, 245, 245, 0.3)", "#2e7d32"],
  });

  /**
   * Yellow overlay opacity:
   * - upValue goes 0 → 1 when user swipes upwards enough
   * - We fade in a yellow overlay to communicate an "up swipe" action
   *   (e.g., see details).
   */
  const upOpacity = upValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  /**
   * Handle card being dragged:
   *  - x movement controls bgValue (left/right color)
   *  - y movement controls upValue (yellow overlay when swiping up)
   */
  const handleSwiping = (x: number, y: number) => {
    // Normalize horizontal swipe distance into [-1, 1]
    const horizontal = Math.max(-1, Math.min(1, x / 200));
    bgValue.setValue(horizontal);

    // If user drags card upwards beyond threshold, show yellow overlay
    if (y < -80) {
      Animated.timing(upValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(upValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  };

  /**
   * Reset both background and yellow-overlay animations
   * back to the neutral state.
   */
  const resetBg = () => {
    Animated.parallel([
      Animated.timing(bgValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(upValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  /**
   * Navigate to the Movie/TV detail view for a given card.
   */
  const navigateToDetail = (m: MediaItem | undefined) => {
    if (!m) return;
    navigation.navigate("MovieDetail", {
      id: m.id,
      title: m.title,
      mediaType,
    });
  };

  /**
   * Navigate to the "Like Confirmation" screen after a right swipe.
   */
  const navigateToLikeConfirmation = (m: MediaItem | undefined) => {
    if (!m) return;
    navigation.navigate("LikeConfirmation", {
      movie: m,
    });
  };

  /**
   * Bottom action bar: "Pass" button handler
   * → programmatically swipes the card left.
   */
  const handlePassPress = () => {
    swiperRef.current?.swipeLeft();
  };

  /**
   * Bottom action bar: "Like" button handler
   * → programmatically swipes the card right.
   */
  const handleLikePress = () => {
    swiperRef.current?.swipeRight();
  };

  /**
   * Bottom action bar: "Info" button handler
   * → opens details for the currently focused card.
   */
  const handleInfoPress = () => {
    const m = deck[currentIndex];
    navigateToDetail(m);
  };

  /**
   * 🔁 Refresh behavior:
   * - Instead of reloading the same page, we ask the hook
   *   to `loadNextDeckPage()` from TMDB, so the user sees
   *   brand-new titles.
   * - This works whether there are cards left in the deck
   *   OR we've swiped all the way to the end.
   * - After loading:
   *   - Reset the external currentIndex
   *   - Bump `deckVersion` so Swiper fully remounts
   *   - Reset the background animations to neutral
   */
  const handleRefreshPress = async () => {
    if (refreshing || isLoadingMore) return;
    try {
      setRefreshing(true);

      // Fetch the next page of results from TMDB via the hook
      await loadNextDeckPage();

      // Reset state so Swiper starts at the first card of the new deck
      setCurrentIndex(0);
      setDeckVersion((v) => v + 1);
      resetBg();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * When the user has swiped the *last* card in the deck:
   * - We automatically call the same refresh logic that
   *   loads the next page from TMDB and remounts the swiper.
   */
  const handleSwipedAll = async () => {
    await handleRefreshPress();
  };

  /**
   * Initial "global loading" state:
   * - Only shown when we're still waiting for the first deck to load.
   */
  if (loading && !deck.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B7BC4" />
        <Text style={styles.loadingText}>Loading Explore…</Text>
      </View>
    );
  }

  /**
   * Even if deck is empty (e.g., filters too strict), we still render:
   * - the MediaToggleBar (so user can change filters / mediaType)
   * - the bottom SwipeActionBar
   * - an empty-state message instead of the Swiper.
   */
  const noCards = deck.length === 0;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Yellow overlay for upward swipe (sits on top of bgColor) */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: YELLOW, opacity: upOpacity },
        ]}
      />

      {/* Gradient Header matching Groups page - extends to top */}
      <LinearGradient
        colors={["#e8d6f0", "#d5e8f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          {/* Top bar: Movies/Shows toggle, Filter button, Trending button, Refresh button */}
          <MediaToggleBar
            mediaType={mediaType}
            onChange={(mt: MediaType) => switchMediaType(mt)}
            bottomLabel="Trending"
            onBottomPress={() => navigation.navigate("Trending")}
            rightLabel={refreshing ? "Refreshing…" : "Refresh"}
            onRightPress={handleRefreshPress}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </View>
      </LinearGradient>

      <View style={styles.swiperWrap}>
        {noCards ? (
          // Empty state when no titles are in the current deck
          <View style={styles.centerInner}>
            <Text style={styles.emptyText}>
              No titles match these filters right now.
              {"\n"}
              Try adjusting filters or tapping Refresh.
            </Text>
          </View>
        ) : (
          <Swiper
            // Changing key forces Swiper to unmount/remount when we load a new page,
            // which resets its internal index and starts from the first card.
            key={deckVersion}
            ref={swiperRef}
            cards={deck}
            cardStyle={styles.card}
            renderCard={(m) =>
              m ? (
                <MovieCard
                  key={m.id}
                  title={m.title}
                  posterPath={m.poster_path}
                />
              ) : (
                <View style={styles.centerInner}>
                  <Text style={styles.emptyText}>No more titles.</Text>
                </View>
              )
            }
            backgroundColor="transparent"
            stackSize={3}
            cardVerticalMargin={8}
            animateCardOpacity
            onSwiping={handleSwiping}
            onSwiped={(i) => {
              // Track the *external* index whenever Swiper swipes to next card
              setCurrentIndex(i + 1);
              resetBg();
            }}
            onSwipedRight={(i) => {
              const liked = deck[i];
              if (liked) {
                console.log("👍 Liked:", liked.title);
                navigateToLikeConfirmation(liked);
              }
            }}
            onSwipedLeft={(i) => {
              const passed = deck[i];
              if (passed) {
                console.log("👎 Passed:", passed.title);
              }
            }}
            onSwipedTop={(i) => {
              const card = deck[i];
              navigateToDetail(card);
            }}
            onSwipedBottom={() => {
              // Optional behavior: swipe-down triggers loading the next set of titles
              handleRefreshPress();
            }}
            verticalSwipe={true}
            onTapCard={(i) => navigateToDetail(deck[i])}
            onSwipedAborted={resetBg}
            onSwipedAll={handleSwipedAll}
          />
        )}
      </View>

      {/* Bottom action bar: Pass / Info / Like buttons */}
      <SwipeActionBar
        onPass={handlePassPress}
        onInfo={handleInfoPress}
        onLike={handleLikePress}
      />

      {/* Small loading pill while we're fetching the next page in the background */}
      {isLoadingMore && (
        <View className="loadingMore" style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#8B7BC4" />
          <Text style={styles.loadingMoreText}>Loading more…</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  gradientHeader: {
    marginTop: 0,
  },

  headerContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },

  content: {
    flex: 1,
    backgroundColor: "transparent",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  centerInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  swiperWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    height: "100%",
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
  },

  loadingText: { 
    marginTop: 8, 
    color: "#8B7BC4",
    fontSize: 14,
  },
  emptyText: {
    color: "#8B7BC4",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
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
    backgroundColor: "rgba(213, 206, 235, 0.95)",
  },
  loadingMoreText: {
    marginLeft: 8,
    color: "#8B7BC4",
    fontSize: 12,
  },
});

export default ExploreSwiper;