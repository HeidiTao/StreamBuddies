// src/screens/Swipe/ExploreGridView.tsx

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";

import { useAuth } from "../../hooks/useAuth";
import { useUserProfile } from "../../hooks/useUserProfile";
import NotLoggedInGate from "./Components/NotLoggedInGate";

import MediaToggleBar from "./Components/MediaToggleBar";
import {
  MediaFilters,
  GENRE_LABEL_TO_TMDB_IDS,
  STREAMING_NAME_TO_ID,
} from "./Components/FilterButton";
import type { MediaType } from "./useExploreSwiper";
import { userServicesToProviderIds } from "./streamerProviderUtils";
import styles from "../../styles/SwipeStyles/exploreGridStyles";

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
const STREAMING_PROVIDERS = "8|9|337|15|384|350|387"; // default aggregate

const ExploreGridView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { authUser } = useAuth();
  const { profile } = useUserProfile(authUser?.uid);

  const userStreamingServices = profile?.streaming_services ?? null;

  // ✅ memoize provider IDs so the reference is stable
  const userProviderIds = useMemo(
    () => userServicesToProviderIds(userStreamingServices),
    [userStreamingServices]
  );

  // allow user to continue as guest
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState<MediaFilters>({
    genre: "Any",
    year: "Any",
    stars: "Any",
    maturity: "Any",
    streaming: "Any",
  });

  const listRef = useRef<FlatList<MediaItem>>(null);

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const buildDiscoverUrl = useCallback(
    (type: MediaType, pageToLoad: number, activeFilters: MediaFilters) => {
      const params = new URLSearchParams({
        language: "en-US",
        sort_by: "popularity.desc",
        page: String(pageToLoad),
        include_adult: "false",
        watch_region: "US",
        with_watch_monetization_types: "flatrate|ads|free",
      });

      const hasUserProviders = userProviderIds.length > 0;

      // 🔹 Streaming provider logic with user services
      if (activeFilters.streaming === "Any") {
        if (hasUserProviders) {
          params.set("with_watch_providers", userProviderIds.join("|"));
        } else {
          params.set("with_watch_providers", STREAMING_PROVIDERS);
        }
      } else {
        const selectedId = STREAMING_NAME_TO_ID[activeFilters.streaming];

        if (selectedId) {
          if (!hasUserProviders || userProviderIds.includes(selectedId)) {
            params.set("with_watch_providers", String(selectedId));
          } else {
            // picked a provider they don't have → no results
            params.set("with_watch_providers", "-1");
          }
        } else {
          // unknown label; safe fallback
          params.set(
            "with_watch_providers",
            hasUserProviders ? userProviderIds.join("|") : STREAMING_PROVIDERS
          );
        }
      }

      // 🔹 Year / decade
      if (activeFilters.year !== "Any") {
        const y = activeFilters.year;
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

      // 🔹 Genre
      if (activeFilters.genre !== "Any") {
        const key = activeFilters.genre.toLowerCase();
        const ids = GENRE_LABEL_TO_TMDB_IDS[key];
        if (ids && ids.length > 0) {
          params.set("with_genres", ids.join(","));
        }
      }

      // 🔹 Stars (vote buckets)
      if (activeFilters.stars !== "Any") {
        let minVote = 0;
        if (activeFilters.stars === "4+ stars") minVote = 8.0;
        else if (activeFilters.stars === "3+ stars") minVote = 6.0;
        else if (activeFilters.stars === "2+ stars") minVote = 4.0;

        if (minVote > 0) {
          params.set("vote_average.gte", String(minVote));
          params.set("vote_count.gte", "50");
        }
      }

      const baseUrl =
        type === "movie" ? TMDB_DISCOVER_MOVIE_URL : TMDB_DISCOVER_TV_URL;

      if (tmdbToken) return `${baseUrl}?${params.toString()}`;
      return `${baseUrl}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;
    },
    [tmdbApiKey, tmdbToken, userProviderIds] // ✅ userProviderIds is memoized now
  );

  const fetchPage = useCallback(
    async (
      type: MediaType,
      pageToLoad: number = 1,
      append: boolean = false
    ) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const url = buildDiscoverUrl(type, pageToLoad, filters);

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
    [buildDiscoverUrl, filters, tmdbToken]
  );

  useEffect(() => {
    fetchPage(mediaType, 1, false);
  }, [fetchPage, mediaType, filters]);

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

  const handleRefreshPress = async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);

      let nextPage = page + 1;
      if (totalPages && nextPage > totalPages) {
        nextPage = 1;
      }

      await fetchPage(mediaType, nextPage, false);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.posterContainer}>
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
      <Text style={styles.titleText} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );

  const exploreEnabled = !!authUser || continueAsGuest;

  if (!exploreEnabled) {
    return (
      <NotLoggedInGate
        onContinueGuest={() => setContinueAsGuest(true)}
        onLogin={() => {
          navigation.getParent()?.navigate("ProfileTab" as never);
        }}
      />
    );
  }

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B7BC4" />
        <Text style={styles.loadingText}>Loading titles…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e8d6f0", "#d5e8f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <MediaToggleBar
            mediaType={mediaType}
            onChange={handleChangeMediaType}
            bottomLabel="Swipe"
            onBottomPress={() => navigation.goBack()}
            rightLabel={refreshing ? "Refreshing…" : "Refresh"}
            onRightPress={handleRefreshPress}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </View>
      </LinearGradient>

      <FlatList
        ref={listRef}
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
              <ActivityIndicator size="small" color="#8B7BC4" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default ExploreGridView;
