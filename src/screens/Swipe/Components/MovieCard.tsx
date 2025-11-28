// src/screens/Swipe/MovieCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = Math.min(width * 0.9, 420);
const CARD_H = CARD_W * 1.5;

type Props = {
  title: string;
  posterPath?: string | null;
};

const MovieCard: React.FC<Props> = ({ title, posterPath }) => {
  const posterUri = posterPath
    ? `https://image.tmdb.org/t/p/original/${posterPath}`
    : undefined;

  return (
    <View style={styles.card}>
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.posterFallback]} />
      )}
      <View style={styles.footer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { width: CARD_W, height: CARD_H, borderRadius: 18, overflow: "hidden", backgroundColor: "#111" },
  poster: { width: "100%", height: "100%" },
  posterFallback: { backgroundColor: "#222" },
  footer: { position: "absolute", bottom: 0, width: "100%", padding: 12, backgroundColor: "rgba(0,0,0,0.45)" },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
});

export default MovieCard;
