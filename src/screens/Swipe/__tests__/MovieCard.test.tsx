import React from "react";
import { render, screen } from "@testing-library/react-native";
import MovieCard from "../MovieCard";

describe("MovieCard (unit)", () => {
  it("renders the title text", () => {
    render(<MovieCard title="My Movie" posterPath={null} />);
    expect(screen.getByText("My Movie")).toBeTruthy();
  });

  it("renders an image when posterPath is provided", () => {
    const { getByRole } = render(<MovieCard title="Poster Test" posterPath="/poster.jpg" />);
    const img = getByRole("image", { hidden: true }) || getByRole("image");
    expect(img).toBeTruthy();
  });
});
