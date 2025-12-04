// src/screens/Swipe/__tests__/useExploreSwiper.test.tsx
import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import useExploreSwiper from "../useExploreSwiper";
import {
  MediaFilters,
  STREAMING_NAME_TO_ID,
} from "../Components/FilterButton";

// 👇 Add this mock so vector icons don't blow up in Jest
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const MockIcon = (props: any) => null;
  return { Ionicons: MockIcon };
});

// helper to build filters
const createFilters = (overrides: Partial<MediaFilters> = {}): MediaFilters => ({
  genre: "Any",
  year: "Any",
  maturity: "Any",
  stars: "Any",
  streaming: "Any",
  ...overrides,
});

// we'll store the latest hook value here
let lastHookValue: ReturnType<typeof useExploreSwiper> | null = null;

function HookWrapper({ filters }: { filters: MediaFilters }) {
  const value = useExploreSwiper(filters);
  lastHookValue = value;
  // nothing visible needed; tests just read lastHookValue
  return null;
}

// mock deck-swiper so the hook can create refs without actually rendering a swiper
jest.mock("react-native-deck-swiper", () => {
  return jest.fn(() => null);
});

describe("useExploreSwiper (via wrapper component)", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    lastHookValue = null;

    process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = "FAKE_TOKEN";
    process.env.EXPO_PUBLIC_TMDB_API_KEY = "FAKE_API_KEY";

    fetchMock = jest.fn();
    // @ts-expect-error assigning to global
    global.fetch = fetchMock;
  });

  const mockDiscoverResponse = (items: any[], totalPages = 2) => ({
    ok: true,
    status: 200,
    json: async () => ({
      results: items,
      total_pages: totalPages,
    }),
  });

  const mockMovieDetailsResponse = (maturity: string) => ({
    ok: true,
    status: 200,
    json: async () => ({
      release_dates: {
        results: [
          {
            iso_3166_1: "US",
            release_dates: [{ certification: maturity }],
          },
        ],
      },
      "watch/providers": {
        results: {
          US: { flatrate: [{ provider_name: "Netflix" }] },
        },
      },
    }),
  });

  it("loads initial movie deck with default filters", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        return mockDiscoverResponse([
          {
            id: 1,
            title: "Test Movie",
            overview: "",
            poster_path: "/x.jpg",
            release_date: "2022-01-01",
            genre_ids: [28],
            vote_average: 7.5,
          },
        ]);
      }
      if (url.includes("/movie/1")) {
        return mockMovieDetailsResponse("PG-13");
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters();
    render(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(lastHookValue!.deck).toHaveLength(1);
    expect(lastHookValue!.deck[0].title).toBe("Test Movie");
    expect(lastHookValue!.deck[0].maturityRating).toBe("PG-13");
    expect(lastHookValue!.mediaType).toBe("movie");
  });

  it("builds discover URL with streaming, year, stars filters", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        const netflixId = STREAMING_NAME_TO_ID["Netflix"];
        expect(url).toContain(`with_watch_providers=${netflixId}`);
        expect(url).toContain("primary_release_year=2022");
        expect(url).toContain("vote_average.gte=8");
        return mockDiscoverResponse([
          {
            id: 2,
            title: "Filtered Movie",
            overview: "",
            poster_path: "/y.jpg",
            release_date: "2022-05-01",
            genre_ids: [28],
            vote_average: 8.1,
          },
        ]);
      }
      if (url.includes("/movie/2")) {
        return mockMovieDetailsResponse("PG-13");
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters({
      streaming: "Netflix",
      year: "2022",
      stars: "4+ stars",
    });

    render(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
    });

    expect(lastHookValue!.deck).toHaveLength(1);
    expect(lastHookValue!.deck[0].title).toBe("Filtered Movie");
  });

  it("filters by maturity rating client-side", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        return mockDiscoverResponse([
          {
            id: 3,
            title: "PG Movie",
            overview: "",
            poster_path: null,
            release_date: "2020-01-01",
            genre_ids: [],
            vote_average: 6.5,
          },
          {
            id: 4,
            title: "R Movie",
            overview: "",
            poster_path: null,
            release_date: "2020-01-01",
            genre_ids: [],
            vote_average: 7.0,
          },
        ]);
      }
      if (url.includes("/movie/3")) return mockMovieDetailsResponse("PG");
      if (url.includes("/movie/4")) return mockMovieDetailsResponse("R");
      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters({ maturity: "PG" });

    render(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
    });

    expect(lastHookValue!.deck).toHaveLength(1);
    expect(lastHookValue!.deck[0].title).toBe("PG Movie");
  });

  it("loads next page when loadNextDeckPage is called", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        const page = Number((url.match(/page=(\d+)/) || [])[1] || "1");
        if (page === 1) {
          return mockDiscoverResponse([{ id: 10, title: "Page 1 Movie" }], 2);
        }
        return mockDiscoverResponse([{ id: 11, title: "Page 2 Movie" }], 2);
      }
      if (url.includes("/movie/10")) return mockMovieDetailsResponse("PG-13");
      if (url.includes("/movie/11")) return mockMovieDetailsResponse("PG-13");
      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters();
    render(<HookWrapper filters={filters} />);

    // wait for initial load
    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
    });

    expect(lastHookValue!.deck[0].title).toBe("Page 1 Movie");

    await act(async () => {
      await lastHookValue!.loadNextDeckPage();
    });

    await waitFor(() => {
      expect(lastHookValue!.deck[0].title).toBe("Page 2 Movie");
    });
  });

  it("switches media type to tv", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        return mockDiscoverResponse([{ id: 20, title: "Movie" }], 1);
      }
      if (url.includes("/movie/20")) return mockMovieDetailsResponse("PG-13");

      if (url.includes("/discover/tv")) {
        return mockDiscoverResponse([{ id: 30, name: "TV Show" }], 1);
      }
      if (url.includes("/tv/30")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            content_ratings: {
              results: [{ iso_3166_1: "US", rating: "TV-MA" }],
            },
            "watch/providers": {
              results: { US: { flatrate: [{ provider_name: "Netflix" }] } },
            },
          }),
        };
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters();
    const { rerender } = render(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
      expect(lastHookValue!.mediaType).toBe("movie");
    });

    await act(() => {
      lastHookValue!.switchMediaType("tv");
    });

    // re-render with same filters so effect re-runs
    rerender(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue!.mediaType).toBe("tv");
      expect(lastHookValue!.deck[0].title).toBe("TV Show");
    });
  });

  // -------------------------
  // Extra tests for more branch coverage
  // -------------------------

  it("uses fallback streaming list and applies genre filter in discover URL", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        // streaming fallback: unknown name → default providers
        expect(url).toContain(
          "with_watch_providers=8%7C9%7C337%7C15%7C384%7C350%7C387"
        ); // encoded "8|9|337|15|384|350|387"

        // genre filter should be applied (e.g. Action -> includes 28)
        expect(url).toMatch(/with_genres=.*28/);

        return mockDiscoverResponse([
          {
            id: 100,
            title: "Genre Movie",
            overview: "",
            poster_path: null,
            release_date: "2020-01-01",
            genre_ids: [28],
            vote_average: 7.0,
          },
        ]);
      }

      if (url.includes("/movie/100")) {
        return mockMovieDetailsResponse("PG-13");
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters({
      streaming: "UnknownStreamingName",
      genre: "Action",
    });

    render(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
    });

    expect(lastHookValue!.deck).toHaveLength(1);
    expect(lastHookValue!.deck[0].title).toBe("Genre Movie");
  });

  it("builds correct date range for TV shows in a decade (2010s)", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        // initial movie discover – we don't care about date params here
        return mockDiscoverResponse(
          [
            {
              id: 201,
              title: "Movie Placeholder",
              overview: "",
              poster_path: null,
            },
          ],
          1
        );
      }

      if (url.includes("/movie/201")) {
        return mockMovieDetailsResponse("PG-13");
      }

      if (url.includes("/discover/tv")) {
        // decade filter should produce first_air_date.gte / lte
        expect(url).toContain("first_air_date.gte=2010-01-01");
        expect(url).toContain("first_air_date.lte=2019-12-31");

        return mockDiscoverResponse(
          [
            {
              id: 200,
              name: "Decade Show",
              overview: "",
              poster_path: null,
              first_air_date: "2015-05-05",
              genre_ids: [],
              vote_average: 7.0,
            },
          ],
          1
        );
      }

      if (url.includes("/tv/200")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            content_ratings: {
              results: [{ iso_3166_1: "US", rating: "TV-14" }],
            },
            "watch/providers": {
              results: { US: { flatrate: [] } },
            },
          }),
        };
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters({ year: "2010s" });
    const { rerender } = render(<HookWrapper filters={filters} />);

    // Wait for initial movie load
    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
      expect(lastHookValue!.mediaType).toBe("movie");
    });

    await act(() => {
      lastHookValue!.switchMediaType("tv");
    });

    rerender(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue!.mediaType).toBe("tv");
      expect(lastHookValue!.deck).toHaveLength(1);
      expect(lastHookValue!.deck[0].title).toBe("Decade Show");
    });
  });

  it("handles discover error and maturity filter skips items without rating", async () => {
    // First: simulate a discover error
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        return {
          ok: false,
          status: 500,
          json: async () => ({}),
        };
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const filters = createFilters({ maturity: "PG-13" });
    render(<HookWrapper filters={filters} />);

    await waitFor(() => {
      expect(lastHookValue).not.toBeNull();
      expect(lastHookValue!.loading).toBe(false);
      // after error, deck should be cleared
      expect(lastHookValue!.deck).toEqual([]);
    });

    // Now: successful discover with two items, but only one gets a maturity rating
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/discover/movie")) {
        return mockDiscoverResponse([
          {
            id: 300,
            title: "Rated Movie",
            overview: "",
            poster_path: null,
          },
          {
            id: 301,
            title: "Unrated Movie",
            overview: "",
            poster_path: null,
          },
        ]);
      }

      if (url.includes("/movie/300")) {
        // has maturity
        return mockMovieDetailsResponse("PG-13");
      }

      if (url.includes("/movie/301")) {
        // details error → extras catch, no maturityRating
        return {
          ok: false,
          status: 500,
          json: async () => ({}),
        };
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    await act(async () => {
      await lastHookValue!.refreshDeck();
    });

    await waitFor(() => {
      // maturity filter should keep only the rated item
      expect(lastHookValue!.deck).toHaveLength(1);
      expect(lastHookValue!.deck[0].title).toBe("Rated Movie");
    });
  });
});
