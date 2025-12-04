// src/screens/Swipe/__tests__/ExploreGridView.test.tsx
import React from "react";
import {
  render,
  waitFor,
  fireEvent,
} from "@testing-library/react-native";
import ExploreGridView from "../ExploreGridView";

// mock navigation
const navigateMock = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: navigateMock, goBack: jest.fn() }),
  };
});

// mock MediaToggleBar to expose filter/refresh triggers
jest.mock("../Components/MediaToggleBar", () => {
  return ({
    onRightPress,
    rightLabel,
    onChangeFilters,
    filters,
  }: any) => (
    <>
      <button
        testID="grid-refresh"
        onClick={() => onRightPress && onRightPress()}
      >
        {rightLabel || "Refresh"}
      </button>
      <button
        testID="grid-filters-2022"
        onClick={() =>
          onChangeFilters &&
          onChangeFilters({
            ...filters,
            year: "2022",
          })
        }
      >
        Filter2022
      </button>
    </>
  );
});

describe("ExploreGridView screen", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.fn();
    // @ts-expect-error
    global.fetch = fetchMock;
    process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = "FAKE_TOKEN";
    process.env.EXPO_PUBLIC_TMDB_API_KEY = "FAKE_API_KEY";
  });

  const mockDiscoverResponse = (results: any[], totalPages = 2) => ({
    ok: true,
    status: 200,
    json: async () => ({
      results,
      total_pages: totalPages,
    }),
  });

  it("shows loading then renders grid items", async () => {
    fetchMock.mockResolvedValueOnce(
      mockDiscoverResponse([
        {
          id: 1,
          title: "Grid Movie",
          overview: "",
          poster_path: null,
          release_date: "2022-01-01",
        },
      ])
    );

    const { getByText } = render(<ExploreGridView />);

    expect(getByText("Loading titles…")).toBeTruthy();

    await waitFor(() => {
      expect(getByText("Grid Movie")).toBeTruthy();
    });
  });

  it("refresh button triggers another fetch", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockDiscoverResponse([{ id: 1, title: "First" }])
      )
      .mockResolvedValueOnce(
        mockDiscoverResponse([{ id: 2, title: "Second" }])
      );

    const { getByTestId, getByText } = render(<ExploreGridView />);

    await waitFor(() => {
      expect(getByText("First")).toBeTruthy();
    });

    fireEvent.click(getByTestId("grid-refresh"));

    await waitFor(() => {
      expect(getByText("Second")).toBeTruthy();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("filter change triggers fetch with year filter", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("primary_release_year=2022")) {
        return mockDiscoverResponse([{ id: 3, title: "2022 Movie" }]);
      }
      return mockDiscoverResponse([{ id: 99, title: "Other Movie" }]);
    });

    const { getByTestId, getByText } = render(<ExploreGridView />);

    await waitFor(() => {
      expect(getByText("Other Movie")).toBeTruthy();
    });

    fireEvent.click(getByTestId("grid-filters-2022"));

    await waitFor(() => {
      expect(getByText("2022 Movie")).toBeTruthy();
    });
  });
});
