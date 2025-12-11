// src/screens/Swipe/Components/__tests__/SwipeActionBar.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SwipeActionBar from "../Components/SwipeActionBar";

describe("SwipeActionBar", () => {
  it("calls correct handlers for pass, info, like", () => {
    const onPass = jest.fn();
    const onInfo = jest.fn();
    const onLike = jest.fn();

    const { getByText } = render(
      <SwipeActionBar onPass={onPass} onInfo={onInfo} onLike={onLike} />
    );

    // fireEvent.press(getByText(/pass/i));
    // fireEvent.press(getByText(/info/i));
    // fireEvent.press(getByText(/like/i));
    fireEvent.press(getByText("✖")); // matches PASS
    fireEvent.press(getByText("i")); // matches INFO
    fireEvent.press(getByText("✓")); // matches LIKE

    expect(onPass).toHaveBeenCalled();
    expect(onInfo).toHaveBeenCalled();
    expect(onLike).toHaveBeenCalled();
  });
});
