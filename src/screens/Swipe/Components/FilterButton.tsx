// src/screens/Swipe/Components/FilterButton.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type FilterState = {
  genre?: string;
  year?: string;
  rating?: string;
};

type Props = {
  onFiltersChange?: (filters: FilterState) => void;
};

const GENRES = [
  "Any",
  "Action",
  "Comedy",
  "Drama",
  "Romance",
  "Horror",
  "Animation",
  "Sci-Fi",
];

const YEARS = ["Any", "2025", "2024", "2023", "2022", "2020s", "2010s", "2000s"];

const RATINGS = ["Any", "G", "PG", "PG-13", "R", "NC-17", "TV-Y", "TV-PG", "TV-14", "TV-MA"];

const FilterButton: React.FC<Props> = ({ onFiltersChange }) => {
  const [visible, setVisible] = useState(false);
  const [genre, setGenre] = useState<string | undefined>("Any");
  const [year, setYear] = useState<string | undefined>("Any");
  const [rating, setRating] = useState<string | undefined>("Any");

  const handleApply = () => {
    const filters: FilterState = {
      genre: genre === "Any" ? undefined : genre,
      year: year === "Any" ? undefined : year,
      rating: rating === "Any" ? undefined : rating,
    };
    onFiltersChange?.(filters);
    setVisible(false);
  };

  const handleClear = () => {
    setGenre("Any");
    setYear("Any");
    setRating("Any");
    onFiltersChange?.({});
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="options-outline" size={18} color="#1c1c1c" />
        <Text style={styles.buttonText}>Filter</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalRoot}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter titles</Text>

            <ScrollView>
              {/* Genre */}
              <Text style={styles.sectionTitle}>Genre</Text>
              <View style={styles.chipRow}>
                {GENRES.map((g) => {
                  const active = genre === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setGenre(g)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Year */}
              <Text style={styles.sectionTitle}>Release year</Text>
              <View style={styles.chipRow}>
                {YEARS.map((y) => {
                  const active = year === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setYear(y)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Rating */}
              <Text style={styles.sectionTitle}>Maturity rating</Text>
              <View style={styles.chipRow}>
                {RATINGS.map((r) => {
                  const active = rating === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setRating(r)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyText}>Apply filters</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeX}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeXText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1c1c",
  },

  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f7f7f7",
  },
  chipActive: {
    backgroundColor: "#CFEAFD",
    borderColor: "#CFEAFD",
  },
  chipText: {
    fontSize: 13,
    color: "#333",
  },
  chipTextActive: {
    fontWeight: "700",
    color: "#000",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#eac4d5",
  },
  applyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  closeX: {
    position: "absolute",
    top: 8,
    right: 10,
  },
  closeXText: {
    fontSize: 18,
  },
});

export default FilterButton;
