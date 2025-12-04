// src/screens/Swipe/ExploreGridView.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import type { MediaType } from "./useExploreSwiper";
import MediaToggleBar from "./Components/MediaToggleBar";
import {
  MediaFilters,
  defaultFilters,
  GENRE_LABEL_TO_TMDB_IDS,
  STREAMING_NAME_TO_ID,
} from "./Components/FilterButton";

type Nav = NativeStackNavigationProp<RootStackParamList, "Trending">;

type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
};

const TMDB_DISCOVER_MOVIE_URL = "https://api.themoviedb.org/3/discover/movie";
const TMDB_DISCOVER_TV_URL = "https://api.themoviedb.org/3/discover/tv";
const STREAMING_PROVIDERS = "8|9|337|15|384|350|387";

const ExploreGridView: React.FC = () => {
  const navigation = useNavigation<Nav>();

  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<MediaFilters>(defaultFilters);

  const listRef = useRef<FlatList<MediaItem>>(null);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const fetchPage = async (
    type: MediaType,
    pageToLoad: number = 1,
    append: boolean = false,
    currentFilters: MediaFilters = filters
  ) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams({
      language: "en-US",
      sort_by: "popularity.desc",
      page: String(pageToLoad),
      include_adult: "false",
      watch_region: "US",
      with_watch_monetization_types: "flatrate|ads|free",
    });

    // Streaming provider filter
    if (currentFilters.streaming === "Any") {
      params.set("with_watch_providers", STREAMING_PROVIDERS);
    } else {
      const providerId = STREAMING_NAME_TO_ID[currentFilters.streaming];
      if (providerId) {
        params.set("with_watch_providers", String(providerId));
      } else {
        params.set("with_watch_providers", STREAMING_PROVIDERS);
      }
    }

    // Year / decade
    if (currentFilters.year !== "Any") {
      const y = currentFilters.year;
      if (/^\d{4}$/.test(y)) {
        if (type === "movie") {
          params.set("primary_release_year", y);
        } else {
          params.set("first_air_date_year", y);
        }
      } else {
        let start: string | null = null;
        let end: string | null = null;
        if (y === "2020s") {
          start = "2020-01-01";
          end = "2029-12-31";
        } else if (y === "2010s") {
          start = "2010-01-01";
          end = "2019-12-31";
        } else if (y === "2000s") {
          start = "2000-01-01";
          end = "2009-12-31";
        }
        if (start && end) {
          if (type === "movie") {
            params.set("primary_release_date.gte", start);
            params.set("primary_release_date.lte", end);
          } else {
            params.set("first_air_date.gte", start);
            params.set("first_air_date.lte", end);
          }
        }
      }
    }

    // Genre
    if (currentFilters.genre !== "Any") {
      const key = currentFilters.genre.toLowerCase();
      const ids = GENRE_LABEL_TO_TMDB_IDS[key];
      if (ids && ids.length > 0) {
        params.set("with_genres", ids.join(","));
      }
    }

    // Stars
    if (currentFilters.stars !== "Any") {
      let minVote = 0;
      if (currentFilters.stars === "4+ stars") minVote = 8.0;
      else if (currentFilters.stars === "3+ stars") minVote = 6.0;
      else if (currentFilters.stars === "2+ stars") minVote = 4.0;

      if (minVote > 0) {
        params.set("vote_average.gte", String(minVote));
        params.set("vote_count.gte", "50");
      }
    }

    const baseUrl =
      type === "movie" ? TMDB_DISCOVER_MOVIE_URL : TMDB_DISCOVER_TV_URL;

    const url = tmdbToken
      ? `${baseUrl}?${params.toString()}`
      : `${baseUrl}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;

    const headers: HeadersInit = tmdbToken
      ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
      : { accept: "application/json" };

    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);

      const rawResults: any[] = Array.isArray(data.results)
        ? data.results
        : [];

      const mapped: MediaItem[] = rawResults.map((item) => ({
        id: item.id,
        title: item.title ?? item.name ?? "Untitled",
        overview: item.overview ?? "",
        poster_path: item.poster_path ?? null,
        release_date: item.release_date ?? item.first_air_date,
        first_air_date: item.first_air_date,
        genre_ids: item.genre_ids ?? [],
        vote_average: item.vote_average,
      }));

      setTotalPages(
        typeof data.total_pages === "number" ? data.total_pages : null
      );

      setItems((prev) => (append ? [...prev, ...mapped] : mapped));
      setPage(pageToLoad);
    } catch (e) {
      console.error("❌ Error fetching grid titles:", e);
      if (!append) setItems([]);
    } finally {
      if (!append) setLoading(false);
      else setLoadingMore(false);
    }
  };

  // initial + media type changes
  useEffect(() => {
    fetchPage(mediaType, 1, false, filters);
  }, [mediaType]); // filters changes are handled explicitly via onChangeFilters

  const handleChangeMediaType = (mt: MediaType) => {
    if (mt === mediaType) return;
    setMediaType(mt);
    setPage(1);
    setTotalPages(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleLoadMore = () => {
    if (!loadingMore && totalPages !== null && page < totalPages) {
      fetchPage(mediaType, page + 1, true, filters);
    }
  };

  const handlePressCard = (item: MediaItem) => {
    navigation.navigate("MovieDetail", {
      id: item.id,
      title: item.title,
      mediaType,
    });
  };

  const handleRefreshPress = async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      await fetchPage(mediaType, 1, false, filters);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={styles.posterWrapper}
      onPress={() => handlePressCard(item)}
    >
      {item.poster_path ? (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w342/${item.poster_path}`,
          }}
          style={styles.posterImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Text style={styles.posterPlaceholderText}>{item.title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const dataToRender = items;

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading titles…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MediaToggleBar
        mediaType={mediaType}
        onChange={handleChangeMediaType}
        bottomLabel="Swipe"
        onBottomPress={() => navigation.goBack()}
        rightLabel={refreshing ? "Refreshing…" : "Refresh"}
        onRightPress={handleRefreshPress}
        filters={filters}
        onChangeFilters={(next) => {
          setFilters(next);
          fetchPage(mediaType, 1, false, next);
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }}
      />

      <FlatList
        ref={listRef}
        data={dataToRender}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },

  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  posterWrapper: {
    flex: 1 / 3,
    aspectRatio: 2 / 3,
    margin: 4,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  posterPlaceholderText: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
  },

  loadingMore: {
    paddingVertical: 12,
  },
});

export default ExploreGridView;
