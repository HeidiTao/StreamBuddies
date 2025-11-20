// src/screens/ExploreView.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import ExploreSwiper from "./Swipe/ExploreSwiper";

const ExploreView: React.FC = () => {
  return (
    <View style={styles.container}>
      <ExploreSwiper />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff" },
});

export default ExploreView;
