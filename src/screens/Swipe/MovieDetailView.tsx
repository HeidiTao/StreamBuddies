import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import AddToListButton from "./Components/AddToListButton";

type Nav = NativeStackNavigationProp<RootStackParamList, "MovieDetail">;
type Route = RouteProp<RootStackParamList, "MovieDetail">;

type MovieDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  genres?: { id: number; name: string }[];
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;

  // extra TMDB fields we now use
  adult?: boolean;
  original_language?: string;
  spoken_languages?: { english_name: string; iso_639_1: string }[];
  vote_average?: number; // 0–10
  vote_count?: number;

  // appended for movies
  release_dates?: {
    results: {
      iso_3166_1: string;
      release_dates: {
        certification: string;
        release_date: string;
        type: number;
        note: string;
      }[];
    }[];
  };

  // appended for TV
  content_ratings?: {
    results: {
      iso_3166_1: string;
      rating: string;
    }[];
  };
};

type ProvidersResp = {
  results?: {
    [countryCode: string]: {
      flatrate?: { provider_name: string }[];
    };
  };
};

const posterUri = (p?: string | null) =>
  p ? `https://image.tmdb.org/t/p/w500/${p}` : undefined;

const MovieDetailView: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id, title, mediaType } = route.params;

  const tmdbToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
  const tmdbApiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const headers: HeadersInit = tmdbToken
    ? { accept: "application/json", Authorization: `Bearer ${tmdbToken}` }
    : { accept: "application/json" };

  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: title ?? "Details",
      headerBackTitleVisible: false,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Trending");
            }
          }}
          style={{ paddingHorizontal: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#000000ff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // === DETAILS (with maturity rating info appended) ===
        const typePath = mediaType === "tv" ? "tv" : "movie";
        const appendParam =
          mediaType === "movie" ? "release_dates" : "content_ratings";

        const baseDetailsUrl = `https://api.themoviedb.org/3/${typePath}/${id}`;
        const detailsUrl = tmdbToken
          ? `${baseDetailsUrl}?language=en-US&append_to_response=${appendParam}`
          : `${baseDetailsUrl}?api_key=${tmdbApiKey}&language=en-US&append_to_response=${appendParam}`;

        const detRes = await fetch(detailsUrl, { headers });
        const detJson: MovieDetails = await detRes.json();
        if (!detRes.ok) throw new Error(`Details failed: ${detRes.status}`);
        setMovie(detJson);

        // === STREAMING PROVIDERS (US only) ===
        const providersBase = `https://api.themoviedb.org/3/${typePath}/${id}/watch/providers`;
        const providersUrl = tmdbToken
          ? providersBase
          : `${providersBase}?api_key=${tmdbApiKey}`;

        const provRes = await fetch(providersUrl, { headers });
        const provJson: ProvidersResp = await provRes.json();
        if (!provRes.ok)
          throw new Error(`Providers failed: ${provRes.status}`);

        const regionBlock = provJson?.results?.["US"];
        const stream = regionBlock?.flatrate ?? [];
        setProviders(stream.map((p) => p.provider_name));
      } catch (e) {
        console.error(e);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, mediaType, tmdbApiKey, tmdbToken]);

  const genreList = useMemo(
    () => (movie?.genres ?? []).map((g) => g.name).join(", "),
    [movie?.genres]
  );

  const thumb = posterUri(movie?.poster_path);

  if (loading || !movie) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading details…</Text>
      </View>
    );
  }

  const displayTitle = movie.title ?? movie.name ?? title;
  const displayDate = movie.release_date ?? movie.first_air_date;
  const year =
    displayDate && displayDate.length >= 4
      ? displayDate.slice(0, 4)
      : "—";

  const displayLanguage =
    movie.spoken_languages?.[0]?.english_name ??
    movie.original_language?.toUpperCase() ??
    "—";

  // === Maturity rating from TMDB ===
  let maturityRating = "NR";

  if (mediaType === "movie" && movie.release_dates?.results) {
    const us = movie.release_dates.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    const cert =
      us?.release_dates?.find((rd) => rd.certification)?.certification;
    if (cert && cert.trim().length > 0) {
      maturityRating = cert;
    }
  } else if (mediaType === "tv" && movie.content_ratings?.results) {
    const us = movie.content_ratings.results.find(
      (r) => r.iso_3166_1 === "US"
    );
    if (us?.rating && us.rating.trim().length > 0) {
      maturityRating = us.rating;
    }
  } else if (typeof movie.adult === "boolean") {
    // fallback if no explicit rating but adult flag exists
    maturityRating = movie.adult ? "18+" : "13+";
  }

  // === Rating / stars + vote count ===
  const avg = movie.vote_average ?? 0;
  const starsOutOfFive = Math.round(avg / 2); // 0–5
  const starString =
    "★★★★★".slice(0, starsOutOfFive) +
    "☆☆☆☆☆".slice(starsOutOfFive);

  const votes = movie.vote_count ?? 0;
  const formattedVotes = votes.toLocaleString();

  const ratingText =
    movie.vote_average != null
      ? `${starString}  (${movie.vote_average.toFixed(1)}/10, ${formattedVotes} votes)`
      : "No rating";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {thumb && (
          <Image
            source={{ uri: thumb }}
            style={styles.poster}
            resizeMode="cover"
          />
        )}

        <Text style={styles.title}>{displayTitle}</Text>

        {/* Meta line under title: maturity • year • star rating */}
        <Text style={styles.metaLine}>
          {maturityRating} • {year}
        </Text>
        <Text style={styles.metaLine}>{ratingText}</Text>

        {/* Add to Watchlist button */}
        <View style={{ marginTop: 10, marginBottom: 6 }}>
          <AddToListButton itemId={id} />
        </View>

        {/* Section: Genres */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Genres</Text>
          </View>
          <Text style={styles.value}>{genreList || "—"}</Text>
        </View>

        {/* Section: Original Language */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Original Language</Text>
          </View>
          <Text style={styles.value}>{displayLanguage}</Text>
        </View>

        {/* Section: Description */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Description</Text>
          </View>
          <Text style={styles.value}>{movie.overview || "—"}</Text>
        </View>

        {/* Section: Streaming Services (US) */}
        <View style={styles.section}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Streaming Services (US)</Text>
          </View>
          <Text style={styles.value}>
            {providers.length
              ? providers.join(", ")
              : "Not currently available to stream (flatrate) in US"}
          </Text>
        </View>
      </ScrollView>
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
    color: "#000000",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
    alignItems: "center",
  },

  poster: {
    width: 220,
    height: 320,
    borderRadius: 14,
    marginBottom: 18,
    backgroundColor: "#ffffff",
  },

  title: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },

  metaLine: {
    fontSize: 13,
    color: "#555555",
    textAlign: "center",
    marginBottom: 4,
  },

  section: {
    width: "100%",
    marginTop: 14,
  },

  bubble: {
    alignSelf: "flex-start",
    backgroundColor: "#CFEAFD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 6,
  },

  bubbleText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  value: {
    color: "#000000",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "left",
  },
});

export default MovieDetailView;
