// src/screens/Swipe/ExploreSwiper.tsx
import React from "react";
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

import MovieCard from "./MovieCard";
import MediaToggleBar from "./MediaToggleBar";
import SwipeActionBar from "./SwipeActionBar";
import useExploreSwiper, { MediaType, MediaItem } from "./useExploreSwiper";

type Nav = NativeStackNavigationProp<RootStackParamList, "Explore">;

const YELLOW = "#ffca28";

const ExploreSwiper: React.FC = () => {
  const navigation = useNavigation<Nav>();

  // Custom hook: data + swipe state
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
  } = useExploreSwiper();

  // derived animated colors
  const bgColor = bgValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["#d32f2f", "#000000", "#2e7d32"],
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

  // bottom buttons
  const handlePassPress = () => {
    swiperRef.current?.swipeLeft();
    setCurrentIndex((i) => Math.min(i + 1, deck.length - 1));
  };

  const handleLikePress = () => {
    swiperRef.current?.swipeRight();
    setCurrentIndex((i) => Math.min(i + 1, deck.length - 1));
  };

  const handleInfoPress = () => {
    const m = deck[currentIndex];
    navigateToDetail(m);
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

      <View style={styles.content}>
        {/* top toggle bar (modular component) */}
        <MediaToggleBar
          mediaType={mediaType}
          onChange={(mt: MediaType) => switchMediaType(mt)}
        />

        {/* middle swiper area (same layout as your working version) */}
        <View style={styles.swiperWrap}>
          <Swiper
            ref={swiperRef}
            cards={deck}
            cardStyle={styles.card} // shorter cards
            renderCard={(m) =>
              m ? (
                <MovieCard title={m.title} posterPath={m.poster_path} />
              ) : (
                <View style={styles.centerInner}>
                  <Text style={styles.emptyText}>No more titles.</Text>
                </View>
              )
            }
            backgroundColor="transparent"
            stackSize={3}
            cardVerticalMargin={16}
            animateCardOpacity
            onSwiping={handleSwiping}
            onSwiped={(i) => {
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
            onSwipedTop={(i) => navigateToDetail(deck[i])}
            verticalSwipe={true}
            disableBottomSwipe={true} // ⬅️ prevents swiping down over buttons
            onTapCard={(i) => navigateToDetail(deck[i])}
          />
        </View>

        {/* bottom buttons (modular component) */}
        <SwipeActionBar
          onPass={handlePassPress}
          onInfo={handleInfoPress}
          onLike={handleLikePress}
        />
      </View>

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
    backgroundColor: "#ffffffff",
  },

  swiperWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // shorter cards
  card: {
    height: "100%", // tweak 55–70% to taste
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
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
