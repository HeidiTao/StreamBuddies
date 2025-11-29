// src/screens/Swipe/Components/MovieCard.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";

type Props = {
  title: string;
  posterPath: string | null;
};

const MovieCard: React.FC<Props> = ({ title, posterPath }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const posterUri = posterPath
    ? { uri: `https://image.tmdb.org/t/p/w500/${posterPath}` }
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.posterWrapper}>
        {/* Poster image (hidden until loaded) */}
        {posterUri ? (
          <>
            {!imageLoaded && (
              <View style={styles.posterPlaceholder}>
                <ActivityIndicator />
              </View>
            )}
            <Image
              source={posterUri}
              style={styles.posterImage}
              resizeMode="cover"
              onLoadEnd={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterPlaceholderText}>No poster</Text>
          </View>
        )}
      </View>

      {/* Title – always correct for the current movie */}
      <View style={styles.titleBar}>
        <Text
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  posterWrapper: {
    flex: 1,
    backgroundColor: "#e0e0e0",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  posterPlaceholderText: {
    color: "#555",
    fontSize: 12,
  },
  titleBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
});

export default MovieCard;
