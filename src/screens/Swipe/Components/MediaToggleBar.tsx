// src/screens/Swipe/Components/MediaToggleBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MediaType } from "../useExploreSwiper";
import FilterButton, { MediaFilters } from "./FilterButton";

type Props = {
  mediaType: MediaType;
  onChange: (media: MediaType) => void;

  bottomLabel?: string;
  onBottomPress?: () => void;

  rightLabel?: string;
  onRightPress?: () => void;

  filters: MediaFilters;
  onFiltersChange: (filters: MediaFilters) => void;
};

const MediaToggleBar: React.FC<Props> = ({
  mediaType,
  onChange,
  bottomLabel,
  onBottomPress,
  rightLabel,
  onRightPress,
  filters,
  onFiltersChange,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* TOP: Movies / Shows toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              mediaType === "movie" && styles.active,
            ]}
            onPress={() => onChange("movie")}
          >
            <Text
              style={[
                styles.toggleText,
                mediaType === "movie" && styles.activeText,
              ]}
            >
              Movies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              mediaType === "tv" && styles.active,
            ]}
            onPress={() => onChange("tv")}
          >
            <Text
              style={[
                styles.toggleText,
                mediaType === "tv" && styles.activeText,
              ]}
            >
              Shows
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTTOM: Filter | center | Refresh */}
      <View style={styles.bottomRow}>
        <View style={styles.leftFilterContainer}>
          <FilterButton value={filters} onChange={onFiltersChange} />
        </View>

        {bottomLabel && onBottomPress && (
          <TouchableOpacity
            style={styles.bottomMainButton}
            onPress={onBottomPress}
          >
            <Text style={styles.bottomMainText}>{bottomLabel}</Text>
          </TouchableOpacity>
        )}

        {rightLabel && onRightPress && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRightPress}
          >
            <Ionicons
              name="refresh"
              size={18}
              color="#8B7BC4"
              style={{ marginRight: 4 }}
            />
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
    paddingTop: 10,
  },
  
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 0,
    justifyContent: "center",
    marginBottom: 12,
  },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 25,
    padding: 4,
  },

  toggleButton: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
  },

  active: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8B7BC4",
    opacity: 0.6,
  },

  activeText: {
    color: "#8B7BC4",
    fontWeight: "700",
    opacity: 1,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 4,
  },

  leftFilterContainer: {
    position: "absolute",
    left: 16,
  },

  bottomMainButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  bottomMainText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8B7BC4",
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    position: "absolute",
    right: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  refreshText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8B7BC4",
  },
});

export default MediaToggleBar;