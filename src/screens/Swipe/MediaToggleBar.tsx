// src/screens/Swipe/MediaToggleBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { MediaType } from "./useExploreSwiper";

type Props = {
  mediaType: MediaType;
  onChange: (media: MediaType) => void;
};

const MediaToggleBar: React.FC<Props> = ({ mediaType, onChange }) => {
  return (
    <View style={styles.toggleBar}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          mediaType === "movie" && styles.toggleButtonActive,
        ]}
        onPress={() => onChange("movie")}
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
        onPress={() => onChange("tv")}
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
  );
};

const styles = StyleSheet.create({
  toggleBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
    justifyContent: "center",
    backgroundColor: "#ffffffff",
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
});

export default MediaToggleBar;
