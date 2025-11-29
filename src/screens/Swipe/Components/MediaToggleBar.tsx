// src/screens/Swipe/Components/MediaToggleBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MediaType } from "../useExploreSwiper";

type Props = {
  mediaType: MediaType;
  onChange: (media: MediaType) => void;

  bottomLabel?: string;        // "Trending" or "Swipe"
  onBottomPress?: () => void;

  rightLabel?: string;         // usually "Refresh"
  onRightPress?: () => void;
};

const MediaToggleBar: React.FC<Props> = ({
  mediaType,
  onChange,
  bottomLabel,
  onBottomPress,
  rightLabel,
  onRightPress,
}) => {
  return (
    <View style={styles.wrapper}>

      {/* MOVIES / SHOWS TOGGLE */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, mediaType === "movie" && styles.active]}
          onPress={() => onChange("movie")}
        >
          <Text style={[styles.toggleText, mediaType === "movie" && styles.activeText]}>
            Movies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, mediaType === "tv" && styles.active]}
          onPress={() => onChange("tv")}
        >
          <Text style={[styles.toggleText, mediaType === "tv" && styles.activeText]}>
            Shows
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM BAR → Center = Swipe/Trending | Right = Refresh */}
      <View style={styles.bottomRow}>

        {/* CENTER — SWIPE/TRENDING BUTTON */}
        {bottomLabel && onBottomPress && (
          <TouchableOpacity style={styles.bottomMainButton} onPress={onBottomPress}>
            <Text style={styles.bottomMainText}>{bottomLabel}</Text>
          </TouchableOpacity>
        )}

        {/* RIGHT — REFRESH */}
        {rightLabel && onRightPress && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRightPress}>
            <Ionicons name="refresh" size={18} color="#1c1c1c" style={{ marginRight: 5 }} />
            <Text style={styles.refreshText}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#fff",
    paddingBottom: 10,
  },

  // === TOP ROW === //
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    justifyContent: "center",
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    backgroundColor: "#000",
  },

  active: {
    backgroundColor: "#d6eadf",
    borderColor: "#d6eadf",
  },

  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#aaa",
  },

  activeText: {
    color: "#000",
    fontWeight: "700",
  },

  // === BOTTOM ROW === //
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",     // keeps main button centered
    marginTop: 6,
    paddingHorizontal: 16,
  },

  // Center main button (Trending/Swipe)
  bottomMainButton: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    backgroundColor: "#eac4d5",
    borderRadius: 12,
    alignSelf: "center",
  },

  bottomMainText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },

  // Right-side refresh button
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CFEAFD",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    position: "absolute",
    right: 16,
  },

  refreshText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1c1c1c",
  },
});

export default MediaToggleBar;
