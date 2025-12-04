// src/screens/Swipe/__tests__/MovieDetailView.test.tsx
import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import MovieDetailView from "../MovieDetailView";

const navigateMock = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: navigateMock }),
    useRoute: () => ({
      params: {
        id: 42,
        title: "Detail Movie",
        mediaType: "movie",
      },
    }),
  };
});

describe("MovieDetailView", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    // @ts-expect-error
    global.fetch = fetchMock;

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 42,
        title: "Detail Movie",
        overview: "Some overview...",
        poster_path: "/poster.jpg",
      }),
    });
  });

  it("renders movie title from route params / fetch", async () => {
    const { getByText } = render(<MovieDetailView />);

    // initial title from params
    expect(getByText("Detail Movie")).toBeTruthy();

    // after fetch, you might show extra info
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(getByText(/Some overview.../i)).toBeTruthy();
    });
  });

  it("handles primary action (e.g., start watching)", async () => {
    const { getByText } = render(<MovieDetailView />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // adjust label / testID to match your button
    const primaryButton = getByText(/start watching/i);
    fireEvent.press(primaryButton);

    // whatever your screen does: navigate to LikeConfirmation, open link, etc.
    // Example:
    // expect(navigateMock).toHaveBeenCalledWith("LikeConfirmation", expect.anything());
  });
});
