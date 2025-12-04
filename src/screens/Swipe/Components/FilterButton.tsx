// src/screens/Swipe/Components/FilterButton.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  deck: any[];                    // works with both swiper + grid items
  onFiltered: (results: any[]) => void;
};

// TMDB genre ID → name (common genres)
const TMDB_GENRE_ID_TO_NAME: Record<number, string> = {
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
const GENRE_LABEL_TO_TMDB_IDS: Record<string, number[]> = Object.entries(
  TMDB_GENRE_ID_TO_NAME
).reduce((acc, [idStr, name]) => {
  const id = Number(idStr);
  const key = name.toLowerCase();
  acc[key] = acc[key] ? [...acc[key], id] : [id];
  return acc;
}, {} as Record<string, number[]>);

// alias for sci-fi
GENRE_LABEL_TO_TMDB_IDS["sci-fi"] =
  GENRE_LABEL_TO_TMDB_IDS["science fiction"] || [878];

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

// === helper accessors ===
function getDateString(m: any): string {
  return (
    m.release_date ||
    m.releaseDate ||
    m.first_air_date ||
    m.firstAirDate ||
    ""
  );
}

function getVoteAverage(m: any): number | undefined {
  if (typeof m.vote_average === "number") return m.vote_average;
  if (typeof m.voteAverage === "number") return m.voteAverage;
  return undefined;
}

function getMaturityRating(m: any): string | undefined {
  return (
    m.maturityRating ||
    m.certification ||
    m.us_rating ||
    m.usRating ||
    m.rating
  );
}

function getGenreIds(m: any): number[] {
  if (Array.isArray(m.genre_ids)) return m.genre_ids;
  if (Array.isArray(m.genreIds)) return m.genreIds;
  return [];
}

function getGenreNameArrays(m: any): string[] {
  const names: string[] = [];

  if (Array.isArray(m.genres)) {
    m.genres.forEach((g: any) => {
      if (g?.name) names.push(g.name);
    });
  }

  if (Array.isArray(m.genre_names)) {
    m.genre_names.forEach((g: string) => {
      if (g) names.push(g);
    });
  }
  if (Array.isArray(m.genreNames)) {
    m.genreNames.forEach((g: string) => {
      if (g) names.push(g);
    });
  }

  if (typeof m.genre === "string") {
    m.genre
      .split(",")
      .map((s: string) => s.trim())
      .forEach((g: string) => {
        if (g) names.push(g);
      });
  }

  return names;
}

function getStreamingProviders(m: any): string[] {
  if (Array.isArray(m.streamingProviders)) return m.streamingProviders;
  if (Array.isArray(m.providers)) return m.providers;
  return [];
}

// genre match: ID-based first, then text
function matchesGenre(media: any, genreLabel: string): boolean {
  if (genreLabel === "Any") return true;

  const labelLower = genreLabel.toLowerCase();
  const mappedIds = GENRE_LABEL_TO_TMDB_IDS[labelLower] || [];

  const genreIds = getGenreIds(media);
  if (mappedIds.length > 0 && genreIds.length > 0) {
    const hasIdMatch = genreIds.some((id) => mappedIds.includes(id));
    if (hasIdMatch) return true;
  }

  const names = getGenreNameArrays(media);
  if (names.length === 0) return false;

  const needle = labelLower;
  return names.some((n) => n.toLowerCase().includes(needle));
}

const FilterButton: React.FC<Props> = ({ deck, onFiltered }) => {
  const [visible, setVisible] = useState(false);
  const [genre, setGenre] = useState<string>("Any");
  const [year, setYear] = useState<string>("Any");
  const [maturity, setMaturity] = useState<string>("Any");
  const [stars, setStars] = useState<string>("Any");
  const [streaming, setStreaming] = useState<string>("Any");

  // dynamic genre list
  const availableGenres = useMemo(() => {
    const namesSet = new Set<string>();

    deck.forEach((m: any) => {
      getGenreNameArrays(m).forEach((name) => namesSet.add(name));
      getGenreIds(m).forEach((id) => {
        const name = TMDB_GENRE_ID_TO_NAME[id];
        if (name) namesSet.add(name);
      });
    });

    const arr = Array.from(namesSet).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    return ["Any", ...arr];
  }, [deck]);

  // dynamic streaming services
  const availableStreaming = useMemo(() => {
    const set = new Set<string>();
    deck.forEach((m: any) => {
      getStreamingProviders(m).forEach((name) => set.add(name));
    });
    const arr = Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
    return ["Any", ...arr];
  }, [deck]);

  const applyFilters = () => {
    let results = [...deck];

    const hasAnyGenreInfo = deck.some(
      (m: any) =>
        getGenreIds(m).length > 0 || getGenreNameArrays(m).length > 0
    );
    const hasAnyMaturityInfo = deck.some((m: any) =>
      Boolean(getMaturityRating(m))
    );
    const hasAnyScoreInfo = deck.some(
      (m: any) => typeof getVoteAverage(m) === "number"
    );
    const hasAnyStreamingInfo = deck.some(
      (m: any) => getStreamingProviders(m).length > 0
    );

    // genre
    if (genre !== "Any" && hasAnyGenreInfo) {
      results = results.filter((m) => matchesGenre(m, genre));
    }

    // year / decade
    if (year !== "Any") {
      results = results.filter((m: any) => {
        const dateStr = getDateString(m);
        if (!dateStr) return false;
        const y = parseInt(dateStr.slice(0, 4), 10);
        if (isNaN(y)) return false;

        if (/^\d{4}$/.test(year)) {
          return y === parseInt(year, 10);
        }
        if (year === "2020s") return y >= 2020 && y <= 2029;
        if (year === "2010s") return y >= 2010 && y <= 2019;
        if (year === "2000s") return y >= 2000 && y <= 2009;
        return true;
      });
    }

    // maturity
    if (maturity !== "Any" && hasAnyMaturityInfo) {
      const wanted = maturity.toUpperCase();
      results = results.filter((m: any) => {
        const raw = getMaturityRating(m);
        if (!raw) return false;
        const mediaRating = String(raw).toUpperCase();
        return mediaRating.includes(wanted);
      });
    }

    // star rating
    if (stars !== "Any" && hasAnyScoreInfo) {
      let minVoteAverage = 0;
      if (stars === "4+ stars") minVoteAverage = 8.0;
      if (stars === "3+ stars") minVoteAverage = 6.0;
      if (stars === "2+ stars") minVoteAverage = 4.0;

      results = results.filter((m: any) => {
        const v = getVoteAverage(m);
        if (typeof v !== "number") return false;
        return v >= minVoteAverage;
      });
    }

    // streaming service
    if (streaming !== "Any" && hasAnyStreamingInfo) {
      results = results.filter((m: any) =>
        getStreamingProviders(m).includes(streaming)
      );
    }

    onFiltered(results);
    setVisible(false);
  };

  const handleClear = () => {
    setGenre("Any");
    setYear("Any");
    setMaturity("Any");
    setStars("Any");
    setStreaming("Any");
    onFiltered(deck);
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
                {availableGenres.map((g) => {
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
                {availableStreaming.map((s) => {
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

              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
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
  buttonActive: {
    backgroundColor: "#CFEAFD",
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
    backgroundColor: "#eac4d5",
    borderColor: "#eac4d5",
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
