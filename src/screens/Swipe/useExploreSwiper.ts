// src/screens/Swipe/useExploreSwiper.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import Swiper from "react-native-deck-swiper";

export type MediaType = "movie" | "tv";

export type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
};

const TMDB_DISCOVER_MOVIE_URL = "https://api.themoviedb.org/3/discover/movie";
const TMDB_DISCOVER_TV_URL = "https://api.themoviedb.org/3/discover/tv";

// TMDB watch providers for major US streaming services (Netflix, Prime, Disney+, Hulu, Max, AppleTV+, Peacock)
const STREAMING_PROVIDERS = "8|9|337|15|384|350|387";

const useExploreSwiper = () => {
  const [deck, setDeck] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  // This ref is used by ExploreSwiper to call swipeLeft / swipeRight
  const swiperRef = useRef<Swiper<MediaItem>>(null);

  // Animated background values, used in ExploreSwiper
  const bgValue = useRef(new Animated.Value(0)).current;
  const upValue = useRef(new Animated.Value(0)).current;

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = tmdbToken
    ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
    : { accept: "application/json" };

  /**
   * Fetch TMDB discover results for movies or TV.
   * If append = true, append to existing deck (for future pagination).
   */
  const fetchDiscover = useCallback(
    async (media: MediaType, pageToLoad: number = 1, append: boolean = false) => {
      if (!append) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

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
        media === "movie" ? TMDB_DISCOVER_MOVIE_URL : TMDB_DISCOVER_TV_URL;

      const url = tmdbToken
        ? `${baseUrl}?${params.toString()}`
        : `${baseUrl}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;

      try {
        const res = await fetch(url, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);

        const rawResults: any[] = Array.isArray(data.results) ? data.results : [];
        const results: MediaItem[] = rawResults.map((item) => ({
          id: item.id,
          title: item.title ?? item.name ?? "Untitled",
          overview: item.overview ?? "",
          poster_path: item.poster_path ?? null,
          release_date: item.release_date ?? item.first_air_date,
        }));

        setTotalPages(
          typeof data.total_pages === "number" ? data.total_pages : null
        );

        setDeck((prev) => (append ? [...prev, ...results] : results));
        setPage(pageToLoad);
        setCurrentIndex(0);
      } catch (e) {
        console.error("❌ Error fetching discover:", e);
        if (!append) setDeck([]);
      } finally {
        if (!append) setLoading(false);
        else setIsLoadingMore(false);
      }
    },
    [tmdbApiKey, tmdbToken]
  );

  // Initial + mediaType change
  useEffect(() => {
    fetchDiscover(mediaType, 1, false);
  }, [fetchDiscover, mediaType]);

  // Called by MediaToggleBar via ExploreSwiper
  const switchMediaType = (mt: MediaType) => {
    if (mt === mediaType) return;
    setMediaType(mt);
    setPage(1);
    setTotalPages(null);
    setCurrentIndex(0);
  };

  return {
    deck,
    loading,
    currentIndex,
    setCurrentIndex,
    mediaType,
    switchMediaType,
    swiperRef,
    bgValue,
    upValue,
    isLoadingMore,
    page,
    totalPages,
    fetchDiscover, // if you want to trigger pagination from ExploreSwiper later
  };
};

export default useExploreSwiper;
