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

import { useAuth } from "../../hooks/useAuth";
import { useUserProfile } from "../../hooks/useUserProfile";

import MovieCard from "./Components/MovieCard";
import MediaToggleBar from "./Components/MediaToggleBar";
import SwipeActionBar from "./Components/SwipeActionBar";
import useExploreSwiper, {
  MediaType,
  MediaItem,
} from "./useExploreSwiper";
import NotLoggedInGate from "./Components/NotLoggedInGate";
import type { MediaFilters } from "./Components/FilterButton";
import styles from "../../styles/SwipeStyles/exploreSwipeStyles";

type Nav = NativeStackNavigationProp<RootStackParamList, "Explore">;

const YELLOW = "#ffca28";

const ExploreSwiper: React.FC = () => {
  const { authUser } = useAuth();
  const navigation = useNavigation<Nav>();

  // 🔹 profile & streaming services (for filtering)
  const { profile } = useUserProfile(authUser?.uid);
  const userStreamingServices = profile?.streaming_services ?? null;

  // let user continue as guest once they've seen the gate
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  // global filters
  const [filters, setFilters] = useState<MediaFilters>({
    genre: "Any",
    year: "Any",
    stars: "Any",
    maturity: "Any",
    streaming: "Any",
  });

  // custom hook with user-specific streaming filter
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
    refreshDeck, // still available if you want it
    loadNextDeckPage,
  } = useExploreSwiper(filters, userStreamingServices);

  const [refreshing, setRefreshing] = useState(false);
  const [deckVersion, setDeckVersion] = useState(0);

  const exploreEnabled = !!authUser || continueAsGuest;

  const bgColor = bgValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["#d32f2f", "rgba(245, 245, 245, 0.3)", "#2e7d32"],
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

  const handleRefreshPress = async () => {
    if (refreshing || isLoadingMore) return;
    try {
      setRefreshing(true);

      await loadNextDeckPage();

      setCurrentIndex(0);
      setDeckVersion((v) => v + 1);
      resetBg();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSwipedAll = async () => {
    await handleRefreshPress();
  };

  // 🔒 auth gate (after all hooks)
  if (!exploreEnabled) {
    return (
      <NotLoggedInGate
        onContinueGuest={() => setContinueAsGuest(true)}
        onLogin={() => {
          // switch to Profile tab; ProfileStack will show LogIn for guests
          navigation.getParent()?.navigate("ProfileTab" as never);
        }}
      />
    );
  }

  if (loading && !deck.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B7BC4" />
        <Text style={styles.loadingText}>Loading Explore…</Text>
      </View>
    );
  }

  const noCards = deck.length === 0;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Yellow overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: YELLOW, opacity: upOpacity },
        ]}
      />

      {/* Gradient header */}
      <LinearGradient
        colors={["#e8d6f0", "#d5e8f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
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
          <View style={styles.centerInner}>
            <Text style={styles.emptyText}>
              No titles match these filters right now.
              {"\n"}
              Try adjusting filters or tapping Refresh.
            </Text>
          </View>
        ) : (
          <Swiper
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
              handleRefreshPress();
            }}
            verticalSwipe={true}
            onTapCard={(i) => navigateToDetail(deck[i])}
            onSwipedAborted={resetBg}
            onSwipedAll={handleSwipedAll}
          />
        )}
      </View>

      <SwipeActionBar
        onPass={handlePassPress}
        onInfo={handleInfoPress}
        onLike={handleLikePress}
      />

      {isLoadingMore && (
        <View className="loadingMore" style={styles.loadingMore}>
          <ActivityIndicator size="small" color="#8B7BC4" />
          <Text style={styles.loadingMoreText}>Loading more…</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default ExploreSwiper;
