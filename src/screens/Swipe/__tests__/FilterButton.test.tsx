// src/screens/Swipe/__tests__/FilterButton.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FilterButton, { MediaFilters } from "../Components/FilterButton";

// mock icons so Jest doesn't try to load expo-font
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const MockIcon = (props: any) => null;
  return { Ionicons: MockIcon };
});

const defaultFilters: MediaFilters = {
  genre: "Any",
  year: "Any",
  maturity: "Any",
  stars: "Any",
  streaming: "Any",
};

describe("FilterButton", () => {
  it("opens modal when Filter button is pressed", () => {
    const onChangeFilters = jest.fn();

    const { getByText, queryByText } = render(
      <FilterButton value={defaultFilters} onChangeFilters={onChangeFilters} />
    );

    // modal title should not be visible initially
    expect(queryByText("Filter titles")).toBeNull();

    fireEvent.press(getByText("Filter"));

    // after pressing, modal content should be visible
    expect(getByText("Filter titles")).toBeTruthy();
    expect(getByText("Genre")).toBeTruthy();
    expect(getByText("Release year")).toBeTruthy();
    expect(getByText("Maturity rating")).toBeTruthy();
  });

  it("clears filters and calls onChangeFilters with 'Any' for all", () => {
    const onChangeFilters = jest.fn();

    const { getByText } = render(
      <FilterButton value={defaultFilters} onChangeFilters={onChangeFilters} />
    );

    fireEvent.press(getByText("Filter"));

    // tap a chip so state is not all default anymore (e.g., year 2022)
    const yearChip = getByText("2022");
    fireEvent.press(yearChip);

    // now Clear
    fireEvent.press(getByText("Clear"));

    expect(onChangeFilters).toHaveBeenCalled();
    const lastCall = onChangeFilters.mock.calls[onChangeFilters.mock.calls.length - 1][0];

    expect(lastCall).toEqual({
      genre: "Any",
      year: "Any",
      maturity: "Any",
      stars: "Any",
      streaming: "Any",
    });
  });

  it("applies year filter and calls onChangeFilters with updated filters", () => {
    const onChangeFilters = jest.fn();

    const { getByText } = render(
      <FilterButton value={defaultFilters} onChangeFilters={onChangeFilters} />
    );

    fireEvent.press(getByText("Filter"));

    // Filter by 2022 year
    const yearChip = getByText("2022");
    fireEvent.press(yearChip);

    // Apply filters
    fireEvent.press(getByText("Apply filters"));

    expect(onChangeFilters).toHaveBeenCalled();
    const lastCall = onChangeFilters.mock.calls[onChangeFilters.mock.calls.length - 1][0];

    expect(lastCall).toEqual({
      ...defaultFilters,
      year: "2022",
    });
  });
});
