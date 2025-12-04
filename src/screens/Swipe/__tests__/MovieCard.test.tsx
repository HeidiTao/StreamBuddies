// src/screens/Swipe/__tests__/MovieCard.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MovieCard from "../Components/MovieCard";

describe("MovieCard (unit)", () => {
  it("renders the title text", () => {
    const { getByTestId } = render(
      <MovieCard title="My Movie" posterPath={null} />
    );
    const title = getByTestId("movie-card-title");
    expect(title.props.children).toBe("My Movie");
  });

  it("renders a placeholder with 'No poster' when posterPath is null", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <MovieCard title="No Poster Movie" posterPath={null} />
    );

    // Should show placeholder view + 'No poster' text
    expect(getByTestId("movie-poster-placeholder")).toBeTruthy();
    expect(getByText("No poster")).toBeTruthy();

    // No Image should be rendered
    expect(queryByTestId("movie-poster-image")).toBeNull();
  });

  it("renders an image when posterPath is provided with correct TMDB URL", () => {
    const { getByTestId, queryByText } = render(
      <MovieCard title="Poster Test" posterPath="/poster.jpg" />
    );

    const img = getByTestId("movie-poster-image");
    expect(img).toBeTruthy();

    // Make sure the source URI is correctly constructed
    expect(img.props.source).toEqual({
      uri: "https://image.tmdb.org/t/p/w500//poster.jpg",
    });

    // In this mode, we should NOT see the 'No poster' text
    expect(queryByText("No poster")).toBeNull();
  });

  it("shows a loading placeholder before image load and hides it after onLoadEnd", () => {
    const { getByTestId, queryByTestId } = render(
      <MovieCard title="Loading Test" posterPath="/loading.jpg" />
    );

    // Initially, imageLoaded = false, so placeholder should be visible
    expect(getByTestId("movie-poster-placeholder")).toBeTruthy();

    const img = getByTestId("movie-poster-image");

    // Fire the loadEnd event to simulate image finishing
    fireEvent(img, "loadEnd");

    // After loadEnd, placeholder should disappear
    expect(queryByTestId("movie-poster-placeholder")).toBeNull();
  });
});
