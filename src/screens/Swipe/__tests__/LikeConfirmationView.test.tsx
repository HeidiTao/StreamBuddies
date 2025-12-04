// src/screens/Swipe/__tests__/LikeConfirmationView.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LikeConfirmationView from "../LikeConfirmationView";

const navigateMock = jest.fn();
const goBackMock = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: navigateMock, goBack: goBackMock }),
    useRoute: () => ({
      params: {
        movie: { id: 1, title: "Liked Movie" },
      },
    }),
  };
});

describe("LikeConfirmationView", () => {
  it("renders liked movie title", () => {
    const { getByText } = render(<LikeConfirmationView />);
    expect(getByText("Liked Movie")).toBeTruthy();
  });

  it("handles add to watchlist and keep swiping actions", () => {
    const { getByText } = render(<LikeConfirmationView />);

    // Adjust button labels / testID to match your UI
    fireEvent.press(getByText(/add to watchlist/i));
    // if it navigates, or calls some function, assert that here

    fireEvent.press(getByText(/keep swiping/i));
    // often this will goBack() or navigate("Explore")
    expect(goBackMock).toHaveBeenCalled();
  });
});
