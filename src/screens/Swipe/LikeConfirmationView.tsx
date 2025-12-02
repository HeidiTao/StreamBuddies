// src/screens/Swipe/LikeConfirmationView.tsx
import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../../navigation/types";

import AddToListButton from "./Components/AddToListButton";
import StartWatchingButton from "./Components/StartWatchingButton";
import type { MediaItem } from "./useExploreSwiper";

type Nav = NativeStackNavigationProp<RootStackParamList, "LikeConfirmation">;
type Route = RouteProp<RootStackParamList, "LikeConfirmation">;

const posterUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w500/${p}` : undefined;

const LikeConfirmationView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { movie } = route.params as { movie: MediaItem };

  useEffect(() => {
    navigation.setOptions({
      title: "Nice pick! 🎬",
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  const thumb = useMemo(() => posterUri(movie.poster_path), [movie.poster_path]);

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
          {/* Add to Watchlist ABOVE Keep Swiping, intrinsic width */}
          <AddToListButton
            itemId={movie.id}
            style={{ marginBottom: 16 }}
          />

          {/* Keep swiping → go back to Explore */}
          <TouchableOpacity
            style={[styles.fullWidthButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.fullWidthButtonText}>Keep swiping</Text>
          </TouchableOpacity>

          {/* Start watching → its own component */}
          <StartWatchingButton movieId={movie.id} title={movie.title} />
        </View>
      </View>
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

  // Shared white button style for full-width actions
  fullWidthButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  fullWidthButtonText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default LikeConfirmationView;
