// src/screens/Swipe/Components/FilterButton.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./FilterButton.styles";

// ---- shared filter model ----
export type MediaFilters = {
  genre: string;
  year: string;
  maturity: string;
  stars: string;
  streaming: string;
};

export const defaultFilters: MediaFilters = {
  genre: "Any",
  year: "Any",
  maturity: "Any",
  stars: "Any",
  streaming: "Any",
};

// TMDB genre ID → name (common genres)
export const TMDB_GENRE_ID_TO_NAME: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// label (lowercase) → TMDB IDs
export const GENRE_LABEL_TO_TMDB_IDS: Record<string, number[]> =
  Object.entries(TMDB_GENRE_ID_TO_NAME).reduce(
    (acc, [idStr, name]) => {
      const id = Number(idStr);
      const key = name.toLowerCase();
      acc[key] = acc[key] ? [...acc[key], id] : [id];
      return acc;
    },
    {} as Record<string, number[]>
  );

// Streaming providers (names → TMDB provider IDs)
// These IDs should align with STREAMING_PROVIDERS in your fetch code.
export const STREAMING_NAME_TO_ID: Record<string, number> = {
  Netflix: 8,
  "Amazon Prime Video": 9,
  "Disney+": 337,
  Hulu: 15,
  Max: 384, // HBO Max / Max
  "Apple TV+": 350,
  "Paramount+": 387,
};

const GENRE_OPTIONS: string[] = [
  "Any",
  ...Object.values(TMDB_GENRE_ID_TO_NAME).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  ),
];

const YEARS = [
  "Any",
  "2025",
  "2024",
  "2023",
  "2022",
  "2020s",
  "2010s",
  "2000s",
];

const MATURITY_RATINGS = [
  "Any",
  "G",
  "PG",
  "PG-13",
  "R",
  "NC-17",
  "TV-PG",
  "TV-14",
  "TV-MA",
];

const STAR_BUCKETS = ["Any", "4+ stars", "3+ stars", "2+ stars"];

const STREAMING_OPTIONS = ["Any", ...Object.keys(STREAMING_NAME_TO_ID)];

type Props = {
  value: MediaFilters;
  onChange: (filters: MediaFilters) => void;
};

const FilterButton: React.FC<Props> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);

  // local UI state mirrors parent filters
  const [genre, setGenre] = useState<string>(value.genre);
  const [year, setYear] = useState<string>(value.year);
  const [maturity, setMaturity] = useState<string>(value.maturity);
  const [stars, setStars] = useState<string>(value.stars);
  const [streaming, setStreaming] = useState<string>(value.streaming);

  // keep local state in sync if parent resets filters
  useEffect(() => {
    setGenre(value.genre);
    setYear(value.year);
    setMaturity(value.maturity);
    setStars(value.stars);
    setStreaming(value.streaming);
  }, [value]);

  const applyFilters = () => {
    onChange({ genre, year, maturity, stars, streaming });
    setVisible(false);
  };

  const handleClear = () => {
    setGenre("Any");
    setYear("Any");
    setMaturity("Any");
    setStars("Any");
    setStreaming("Any");
    onChange(defaultFilters);
  };

  const anyFilterActive =
    genre !== "Any" ||
    year !== "Any" ||
    maturity !== "Any" ||
    stars !== "Any" ||
    streaming !== "Any";

  return (
    <>
      <TouchableOpacity
        style={[styles.button, anyFilterActive && styles.buttonActive]}
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
                {GENRE_OPTIONS.map((g) => {
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

              {/* Maturity rating */}
              <Text style={styles.sectionTitle}>Maturity rating</Text>
              <View style={styles.chipRow}>
                {MATURITY_RATINGS.map((r) => {
                  const active = maturity === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setMaturity(r)}
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

              {/* Star rating */}
              <Text style={styles.sectionTitle}>Star rating</Text>
              <View style={styles.chipRow}>
                {STAR_BUCKETS.map((b) => {
                  const active = stars === b;
                  return (
                    <TouchableOpacity
                      key={b}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setStars(b)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {b}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Streaming service */}
              <Text style={styles.sectionTitle}>Streaming service</Text>
              <View style={styles.chipRow}>
                {STREAMING_OPTIONS.map((s) => {
                  const active = streaming === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setStreaming(s)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {s}
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

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
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

export default FilterButton;
