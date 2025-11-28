// src/screens/Swipe/ExploreGridView.tsx
import React, { useCallback, useEffect, useState } from "react";
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
import MediaToggleBar from "./Components/MediaToggleBar";   // 👈 use shared toggle bar

type Nav = NativeStackNavigationProp<RootStackParamList, "Trending">;

type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
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

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = tmdbToken
    ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
    : { accept: "application/json" };

  const fetchPage = useCallback(
    async (type: MediaType, pageToLoad: number = 1, append: boolean = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        language: "en-US",
        sort_by: "popularity.desc",
        page: String(pageToLoad),
        include_adult: "false",
        watch_region: "US",
        with_watch_monetization_types: "flatrate|ads|free",
        with_watch_providers: STREAMING_PROVIDERS,
      });

      const baseUrl =
        type === "movie" ? TMDB_DISCOVER_MOVIE_URL : TMDB_DISCOVER_TV_URL;

      const url = tmdbToken
        ? `${baseUrl}?${params.toString()}`
        : `${baseUrl}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;

      try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);

        const rawResults: any[] = Array.isArray(data.results) ? data.results : [];

        const mapped: MediaItem[] = rawResults.map((item) => ({
          id: item.id,
          title: item.title ?? item.name ?? "Untitled",
          overview: item.overview ?? "",
          poster_path: item.poster_path ?? null,
          release_date: item.release_date ?? item.first_air_date,
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
    },
    [tmdbApiKey, tmdbToken]
  );

  useEffect(() => {
    fetchPage(mediaType, 1, false);
  }, [fetchPage, mediaType]);

  const handleChangeMediaType = (mt: MediaType) => {
    if (mt === mediaType) return;
    setMediaType(mt);
    setPage(1);
    setTotalPages(null);
  };

  const handleLoadMore = () => {
    if (!loadingMore && totalPages !== null && page < totalPages) {
      fetchPage(mediaType, page + 1, true);
    }
  };

  const handlePressCard = (item: MediaItem) => {
    navigation.navigate("MovieDetail", {
      id: item.id,
      title: item.title,
      mediaType,
    });
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
      {/* Reuse MediaToggleBar with a "Swipe" button */}
      <MediaToggleBar
        mediaType={mediaType}
        onChange={handleChangeMediaType}
        bottomLabel="Swipe"
        onBottomPress={() => navigation.goBack()} // 👈 back to swiper
      />

      {/* Grid of posters */}
      <FlatList
        data={items}
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

  // --- Grid --- //
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
