import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props<T> = {
  cards: T[];
  renderCard: (item: T | undefined) => React.ReactNode;
  onSwiping?: (x: number, y?: number) => void;
  onSwiped?: (index: number, type?: string) => void;
  onSwipedLeft?: (index: number) => void;
  onSwipedRight?: (index: number) => void;
  onSwipedTop?: (index: number) => void;
  onTapCard?: (index: number) => void;
};

export default function Swiper<T = any>(props: Props<T>) {
  const first = props.cards?.[0];

  return (
    <View testID="mock-swiper">
      <View testID="mock-card">{props.renderCard(first)}</View>

      {/* Simulated swipe/tap controls */}
      <TouchableOpacity
        testID="btn-swipe-left"
        onPress={() => {
          props.onSwipedLeft?.(0);
          props.onSwiped?.(0, "left");
        }}
      >
        <Text>mock-left</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="btn-swipe-right"
        onPress={() => {
          props.onSwipedRight?.(0);
          props.onSwiped?.(0, "right");
        }}
      >
        <Text>mock-right</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="btn-swipe-top"
        onPress={() => {
          props.onSwipedTop?.(0);
          props.onSwiped?.(0, "top");
        }}
      >
        <Text>mock-top</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="btn-tap-card"
        onPress={() => props.onTapCard?.(0)}
      >
        <Text>mock-tap</Text>
      </TouchableOpacity>
    </View>
  );
}
