import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

import MovieCard from "./Components/MovieCard";
import type { FilterState } from "./Components/FilterButton";
import MediaToggleBar from "./Components/MediaToggleBar";
import SwipeActionBar from "./Components/SwipeActionBar";
import useExploreSwiper, { MediaType, MediaItem } from "./useExploreSwiper";

type Nav = NativeStackNavigationProp<RootStackParamList, "Explore">;
const YELLOW = "#ffca28";

const ExploreSwiper: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({});
  const navigation = useNavigation<Nav>();

  const {
    deck,
    loading,
    currentIndex,
    setCurrentIndex,
    mediaType,
    switchMediaType,
    swiperRef,
    bgValue,
    upValue,
    isLoadingMore,
    refreshDeck, // () => Promise<void>
  } = useExploreSwiper();

  // Local state for the Refresh button only
  const [refreshing, setRefreshing] = useState(false);

  // 🔑 Used to force-remount Swiper when we refresh the deck
  const [deckVersion, setDeckVersion] = useState(0);

  const bgColor = bgValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["#d32f2f", "#ffffff", "#2e7d32"], // NEUTRAL = white
  });

  const upOpacity = upValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const handleSwiping = (x: number, y: number) => {
    const horizontal = Math.max(-1, Math.min(1, x / 200));
    bgValue.setValue(horizontal);

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

  const navigateToDetail = (m: MediaItem | undefined) => {
    if (!m) return;
    navigation.navigate("MovieDetail", {
      id: m.id,
      title: m.title,
      mediaType,
    });
  };

  const navigateToLikeConfirmation = (m: MediaItem | undefined) => {
    if (!m) return;
    navigation.navigate("LikeConfirmation", {
      movie: m,
    });
  };

  const handlePassPress = () => {
    swiperRef.current?.swipeLeft();
  };

  const handleLikePress = () => {
    swiperRef.current?.swipeRight();
  };

  const handleInfoPress = () => {
    const m = deck[currentIndex];
    navigateToDetail(m);
  };

  // 🔁 Refresh: single, fast call to refreshDeck()
  const handleRefreshPress = async () => {
    if (refreshing) return; // guard double-taps
    try {
      setRefreshing(true);
      await refreshDeck();
      // reset our index and force Swiper to remount so its internal index resets too
      setCurrentIndex(0);
      setDeckVersion((v) => v + 1);
      resetBg();
    } finally {
      setRefreshing(false);
    }
  };

  // 🔁 Auto-refill when you swipe the last card
  const handleSwipedAll = async () => {
    if (refreshing || isLoadingMore) return;
    await handleRefreshPress();
  };

  if (loading && !deck.length) {
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
        <Text style={styles.emptyText}>No titles found.</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* yellow overlay for upward swipe */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: YELLOW, opacity: upOpacity },
        ]}
      />

      <MediaToggleBar
        mediaType={mediaType}
        onChange={(mt: MediaType) => switchMediaType(mt)}
        bottomLabel="🔥 Trending"
        onBottomPress={() => navigation.navigate("Trending")}
        rightLabel={refreshing ? "Refreshing…" : "Refresh"}
        onRightPress={handleRefreshPress}
        onFiltersChange={setFilters}
      />

      <View style={styles.swiperWrap}>
        <Swiper
          key={deckVersion} // 👈 force a fresh Swiper when the deck refreshes
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
            // optional: make swipe-down also trigger refresh
            handleRefreshPress();
          }}
          verticalSwipe={true}
          onTapCard={(i) => navigateToDetail(deck[i])}
          onSwipedAborted={() => {
            resetBg();
          }}
          // 👇 Auto-refresh when the last card is swiped
          onSwipedAll={handleSwipedAll}
        />
      </View>

      <SwipeActionBar
        onPass={handlePassPress}
        onInfo={handleInfoPress}
        onLike={handleLikePress}
      />

      {isLoadingMore && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingMoreText}>Loading more…</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    flex: 1,
    backgroundColor: "transparent",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffffff",
  },
  centerInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

  loadingText: { marginTop: 8, color: "#ccc" },
  emptyText: { color: "#ccc", textAlign: "center", paddingHorizontal: 24 },

  loadingMore: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  loadingMoreText: {
    marginLeft: 8,
    color: "#ccc",
    fontSize: 12,
  },
});

export default ExploreSwiper;
