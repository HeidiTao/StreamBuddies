// src/screens/Swipe/useExploreSwiper.ts
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import Swiper from "react-native-deck-swiper";
import {
  MediaFilters,
  GENRE_LABEL_TO_TMDB_IDS,
  STREAMING_NAME_TO_ID,
} from "./Components/FilterButton";

export type MediaType = "movie" | "tv";

export type MediaItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;

  // For filtering:
  genre_ids?: number[];
  vote_average?: number; // 0–10 TMDB score
  maturityRating?: string; // "PG-13", "TV-MA", etc.
  streamingProviders?: string[]; // ["Netflix", "Hulu", ...]
};

const TMDB_DISCOVER_MOVIE_URL = "https://api.themoviedb.org/3/discover/movie";
const TMDB_DISCOVER_TV_URL = "https://api.themoviedb.org/3/discover/tv";
const STREAMING_PROVIDERS = "8|9|337|15|384|350|387"; // Netflix, Prime, etc.

const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

const TMDB_HEADERS: HeadersInit = tmdbToken
  ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
  : { accept: "application/json" };

function detailsUrl(id: number, mediaType: MediaType): string {
  const typePath = mediaType === "tv" ? "tv" : "movie";
  const base = `https://api.themoviedb.org/3/${typePath}/${id}`;
  const params =
    "append_to_response=release_dates,content_ratings,watch/providers&language=en-US";
  if (tmdbToken) return `${base}?${params}`;
  return `${base}?${params}&api_key=${tmdbApiKey ?? ""}`;
}

type DetailExtras = {
  maturityRating?: string;
  streamingProviders?: string[];
};

async function fetchExtrasForItem(
  id: number,
  mediaType: MediaType
): Promise<DetailExtras> {
  try {
    const res = await fetch(detailsUrl(id, mediaType), {
      headers: TMDB_HEADERS,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`details failed: ${res.status}`);

    let maturity: string | undefined;

    if (mediaType === "movie") {
      const rdBlock = json.release_dates?.results ?? [];
      const us = rdBlock.find((r: any) => r.iso_3166_1 === "US");
      const cert = us?.release_dates?.[0]?.certification;
      if (cert) maturity = cert;
    } else {
      const crBlock = json.content_ratings?.results ?? [];
      const us = crBlock.find((r: any) => r.iso_3166_1 === "US");
      const rating = us?.rating;
      if (rating) maturity = rating;
    }

    const regionBlock = json["watch/providers"]?.results?.["US"];
    const flatrate = regionBlock?.flatrate ?? [];
    const providerNames = flatrate
      .map((p: any) => p.provider_name)
      .filter(Boolean);

    return { maturityRating: maturity, streamingProviders: providerNames };
  } catch (e) {
    console.warn("extras fetch failed for", id, e);
    return {};
  }
}

function discoverUrl(
  mediaType: MediaType,
  page: number,
  filters: MediaFilters
): string {
  const params = new URLSearchParams({
    language: "en-US",
    sort_by: "popularity.desc",
    page: String(page),
    include_adult: "false",
    watch_region: "US",
    with_watch_monetization_types: "flatrate|ads|free",
  });

  // Streaming provider
  if (filters.streaming === "Any") {
    params.set("with_watch_providers", STREAMING_PROVIDERS);
  } else {
    const providerId = STREAMING_NAME_TO_ID[filters.streaming];
    if (providerId) {
      params.set("with_watch_providers", String(providerId));
    } else {
      params.set("with_watch_providers", STREAMING_PROVIDERS);
    }
  }

  // Year / decade
  if (filters.year !== "Any") {
    const y = filters.year;
    if (/^\d{4}$/.test(y)) {
      if (mediaType === "movie") {
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
        if (mediaType === "movie") {
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
  if (filters.genre !== "Any") {
    const key = filters.genre.toLowerCase();
    const ids = GENRE_LABEL_TO_TMDB_IDS[key];
    if (ids && ids.length > 0) {
      params.set("with_genres", ids.join(","));
    }
  }

  // Stars (score buckets)
  if (filters.stars !== "Any") {
    let minVote = 0;
    if (filters.stars === "4+ stars") minVote = 8.0;
    else if (filters.stars === "3+ stars") minVote = 6.0;
    else if (filters.stars === "2+ stars") minVote = 4.0;

    if (minVote > 0) {
      params.set("vote_average.gte", String(minVote));
      params.set("vote_count.gte", "50");
    }
  }

  const baseUrl =
    mediaType === "movie" ? TMDB_DISCOVER_MOVIE_URL : TMDB_DISCOVER_TV_URL;

  if (tmdbToken) return `${baseUrl}?${params.toString()}`;
  return `${baseUrl}?${params.toString()}&api_key=${tmdbApiKey ?? ""}`;
}

type UseExploreSwiperReturn = {
  deck: MediaItem[];
  loading: boolean;
  isLoadingMore: boolean;

  currentIndex: number;
  setCurrentIndex: (i: number) => void;

  mediaType: MediaType;
  switchMediaType: (t: MediaType) => void;

  swiperRef: React.RefObject<Swiper<MediaItem>>;
  bgValue: Animated.Value;
  upValue: Animated.Value;

  refreshDeck: () => Promise<void>;
  loadNextDeckPage: () => Promise<void>;
};

export default function useExploreSwiper(
  filters: MediaFilters
): UseExploreSwiperReturn {
  const [deck, setDeck] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const swiperRef = useRef<Swiper<MediaItem>>(null);
  const bgValue = useRef(new Animated.Value(0)).current;
  const upValue = useRef(new Animated.Value(0)).current;

  type FetchMode = "initial" | "refresh" | "next";

  const fetchPage = async (
    type: MediaType,
    pageToLoad: number,
    mode: FetchMode
  ) => {
    const url = discoverUrl(type, pageToLoad, filters);

    try {
      if (mode === "next") setIsLoadingMore(true);
      else setLoading(true);

      const res = await fetch(url, { headers: TMDB_HEADERS });
      const data = await res.json();
      if (!res.ok) throw new Error(`TMDB discover failed: ${res.status}`);

      const rawResults: any[] = Array.isArray(data.results)
        ? data.results
        : [];

      const mappedBasic: MediaItem[] = rawResults.map((item) => ({
        id: item.id,
        title: item.title ?? item.name ?? "Untitled",
        overview: item.overview ?? "",
        poster_path: item.poster_path ?? null,
        release_date: item.release_date ?? item.first_air_date,
        first_air_date: item.first_air_date,
        genre_ids: item.genre_ids ?? [],
        vote_average: item.vote_average,
      }));

      const mappedWithExtras: MediaItem[] = await Promise.all(
        mappedBasic.map(async (m) => {
          const extras = await fetchExtrasForItem(m.id, type);
          return { ...m, ...extras };
        })
      );

      // Client-side maturity filter (uses extras)
      let finalDeck = mappedWithExtras;
      if (filters.maturity !== "Any") {
        const wanted = filters.maturity.toUpperCase();
        finalDeck = finalDeck.filter((m) => {
          if (!m.maturityRating) return false;
          return m.maturityRating.toUpperCase().includes(wanted);
        });
      }

      setDeck(finalDeck);
      setPage(pageToLoad);
      setTotalPages(
        typeof data.total_pages === "number" ? data.total_pages : null
      );
      setCurrentIndex(0);
    } catch (e) {
      console.error("❌ Error fetching swiper deck:", e);
      setDeck([]);
    } finally {
      if (mode === "next") setIsLoadingMore(false);
      else setLoading(false);
    }
  };

  const refreshDeck = async () => {
    await fetchPage(mediaType, 1, "refresh");
  };

  const loadNextDeckPage = async () => {
    const nextPage =
      totalPages && page < totalPages ? page + 1 : 1;
    await fetchPage(mediaType, nextPage, "next");
  };

  const switchMediaType = (t: MediaType) => {
    if (t === mediaType) return;
    setMediaType(t);
  };

  useEffect(() => {
    fetchPage(mediaType, 1, "initial");
    // filters is included so new filters trigger a fresh fetch
  }, [mediaType, filters]);

  return {
    deck,
    loading,
    isLoadingMore,

    currentIndex,
    setCurrentIndex,

    mediaType,
    switchMediaType,

    swiperRef,
    bgValue,
    upValue,

    refreshDeck,
    loadNextDeckPage,
  };
}
