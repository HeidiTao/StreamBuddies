import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react-native";
import ExploreSwiper from "../ExploreSwiper";
import { useNavigation } from "@react-navigation/native";

// Ensure we take the api_key branch (or set token if you prefer)
process.env.EXPO_PUBLIC_TMDB_API_KEY = "TEST_KEY";
process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = "";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Grab mock navigation
const mockNavigate = (useNavigation() as any).navigate as jest.Mock;

const discoverPayload = (results: any[]) => ({
  page: 1,
  results,
  total_pages: 1,
  total_results: results.length,
});

describe("ExploreSwiper - swiping behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a movie after loading", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => discoverPayload([
        { id: 100, title: "Alpha", poster_path: "/a.jpg", overview: "" },
      ]),
    });

    render(<ExploreSwiper />);

    expect(screen.getByText(/Loading Explore/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeTruthy();
    });
  });

  it("swipe right triggers 'liked' flow (no navigation)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => discoverPayload([
        { id: 101, title: "Right Movie", poster_path: null, overview: "" },
      ]),
    });

    render(<ExploreSwiper />);

    await waitFor(() => screen.getByText("Right Movie"));

    // Simulate right swipe
    fireEvent.press(screen.getByTestId("btn-swipe-right"));

    // No navigation expected on right swipe
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("swipe left triggers 'passed' flow (no navigation)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => discoverPayload([
        { id: 102, title: "Left Movie", poster_path: null, overview: "" },
      ]),
    });

    render(<ExploreSwiper />);

    await waitFor(() => screen.getByText("Left Movie"));

    // Simulate left swipe
    fireEvent.press(screen.getByTestId("btn-swipe-left"));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("swipe up navigates to MovieDetail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => discoverPayload([
        { id: 103, title: "Up Movie", poster_path: null, overview: "" },
      ]),
    });

    render(<ExploreSwiper />);

    await waitFor(() => screen.getByText("Up Movie"));

    // Simulate swipe up (onSwipedTop)
    fireEvent.press(screen.getByTestId("btn-swipe-top"));

    expect(mockNavigate).toHaveBeenCalledWith("MovieDetail", {
      movieId: 103,
      title: "Up Movie",
    });
  });

  it("tapping the card navigates to MovieDetail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => discoverPayload([
        { id: 104, title: "Tap Movie", poster_path: "/t.jpg", overview: "" },
      ]),
    });

    render(<ExploreSwiper />);

    await waitFor(() => screen.getByText("Tap Movie"));

    fireEvent.press(screen.getByTestId("btn-tap-card"));

    expect(mockNavigate).toHaveBeenCalledWith("MovieDetail", {
      movieId: 104,
      title: "Tap Movie",
    });
  });

  // Optional: assert yellow overlay becomes visible during "up" swiping
  // Requires you to add testID="explore-bg-up" to the yellow overlay view in ExploreSwiper.
  it("shows yellow overlay while swiping up (optional assertion)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => discoverPayload([
        { id: 105, title: "Overlay Movie", poster_path: null, overview: "" },
      ]),
    });

    render(<ExploreSwiper />);

    await waitFor(() => screen.getByText("Overlay Movie"));

    // Start 'onSwiping' upward (our mock fires this on btn-swipe-top)
    fireEvent.press(screen.getByTestId("btn-swipe-top"));

    // If you exposed the overlay testID:
    // const overlay = screen.getByTestId("explore-bg-up");
    // expect(overlay).toBeTruthy();

    // We still verify navigation happened (primary behavior)
    expect(mockNavigate).toHaveBeenCalledWith("MovieDetail", {
      movieId: 105,
      title: "Overlay Movie",
    });
  });
});
