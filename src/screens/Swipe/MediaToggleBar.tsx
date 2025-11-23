// src/screens/Swipe/MediaToggleBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { MediaType } from "./useExploreSwiper";

type Props = {
  mediaType: MediaType;
  onChange: (media: MediaType) => void;
  onTrending: () => void;
};

const MediaToggleBar: React.FC<Props> = ({
  mediaType,
  onChange,
  onTrending,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* --- Movies / Shows row --- */}
      <View style={styles.toggleBar}>
        
        {/* MOVIES BUTTON */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mediaType === "movie" && styles.movieActive,   // 👈 your green color
          ]}
          onPress={() => onChange("movie")}
        >
          <Text
            style={[
              styles.toggleText,
              mediaType === "movie" && styles.toggleTextActiveDark, // dark text
            ]}
          >
            Movies
          </Text>
        </TouchableOpacity>

        {/* SHOWS BUTTON */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mediaType === "tv" && styles.showsActive,     // 👈 new shows color
          ]}
          onPress={() => onChange("tv")}
        >
          <Text
            style={[
              styles.toggleText,
              mediaType === "tv" && styles.toggleTextActiveDark, // dark text
            ]}
          >
            Shows
          </Text>
        </TouchableOpacity>

      </View>

      {/* --- Trending button beneath --- */}
      <TouchableOpacity style={styles.trendingButton} onPress={onTrending}>
        <Text style={styles.trendingText}>🔥 Trending</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#fff",
    paddingBottom: 10,
  },

  toggleBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
    justifyContent: "center",
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },

  // 🎨 Movies active = your green tone
  movieActive: {
    backgroundColor: "#d6eadf",
    borderColor: "#d6eadf",
  },

  // 🎨 Shows active = complementary lavender (change if you want)
  showsActive: {
    backgroundColor: "#d6eadf",
    borderColor: "#d6eadf",
  },

  toggleText: {
    color: "#aaa",
    fontWeight: "600",
    fontSize: 14,
  },

  toggleTextActiveDark: {
    color: "#000",
    fontWeight: "700",
  },

  trendingButton: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#eac4d5",
    alignItems: "center",
    alignSelf: "center",
    width: "50%",
  },

  trendingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
});

export default MediaToggleBar;
