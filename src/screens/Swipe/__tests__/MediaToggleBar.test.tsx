// src/screens/Swipe/Components/__tests__/MediaToggleBar.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MediaToggleBar from "../Components/MediaToggleBar";

// Mock FilterButton so we don't bring its complexity in here
jest.mock("../FilterButton", () => {
  return ({ onFiltered }: any) => (
    <button
      testID="fake-filter-button"
      onClick={() => onFiltered && onFiltered([{ id: 99, title: "Filtered" }])}
    >
      Filter
    </button>
  );
});

describe("MediaToggleBar", () => {
  it("calls onChange when toggling between Movies and Shows", () => {
    const onChange = jest.fn();

    const { getByText } = render(
      <MediaToggleBar
        mediaType="movie"
        onChange={onChange}
        bottomLabel="Trending"
        onBottomPress={jest.fn()}
        rightLabel="Refresh"
        onRightPress={jest.fn()}
      />
    );

    fireEvent.press(getByText("Shows"));
    expect(onChange).toHaveBeenCalledWith("tv");

    fireEvent.press(getByText("Movies"));
    expect(onChange).toHaveBeenCalledWith("movie");
  });

  it("renders filter button and wires onFilterResults", () => {
    const onFilterResults = jest.fn();

    const { getByTestId } = render(
      <MediaToggleBar
        mediaType="movie"
        onChange={jest.fn()}
        filterDeck={[{ id: 1 }]}
        onFilterResults={onFilterResults}
      />
    );

    fireEvent.click(getByTestId("fake-filter-button"));
    expect(onFilterResults).toHaveBeenCalledWith([{ id: 99, title: "Filtered" }]);
  });
});
