// src/screens/Swipe/SwipeActionBar.tsx
// -------------------------------------------------------
// This component ONLY renders the 3 action buttons:
//   - Pass (red X)
//   - Info (grey i)
//   - Like (green ✓)
//
// It does NOT decide what the buttons do — it simply
// calls the functions passed in through props.
// -------------------------------------------------------
// src/screens/Swipe/SwipeActionBar.tsx
// Simple bottom bar with 3 buttons: Pass, Info, Like.

import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const PASS_COLOR = "#E05353";
const LIKE_COLOR = "#B5E78F";

type Props = {
  onPass: () => void;
  onInfo: () => void;
  onLike: () => void;
};

const SwipeActionBar: React.FC<Props> = ({ onPass, onInfo, onLike }) => {
  return (
    <View style={styles.actionBar}>
      {/* PASS = red X */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.pass]}
        onPress={() => {
          console.log("🔴 PASS pressed in SwipeActionBar");
          onPass();
        }}
      >
        <Text style={styles.actionIconText}>✕</Text>
      </TouchableOpacity>

      {/* INFO = middle "i" */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.info]}
        onPress={() => {
          console.log("ℹ️ INFO pressed in SwipeActionBar");
          onInfo();
        }}
      >
        <Text style={styles.actionIconText}>i</Text>
      </TouchableOpacity>

      {/* LIKE = green check */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.like]}
        onPress={() => {
          console.log("💚 LIKE pressed in SwipeActionBar");
          onLike();
        }}
      >
        <Text style={styles.actionIconText}>✓</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 999,
    justifyContent: "center",
  },
  pass: { backgroundColor: PASS_COLOR },
  info: { backgroundColor: "#444" },
  like: { backgroundColor: LIKE_COLOR },
  actionIconText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 18,
    textAlign: "center",
  },
});

export default SwipeActionBar;
