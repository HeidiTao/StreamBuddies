// src/components/AddToListButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  onPress: () => void;
  style?: ViewStyle;            // allows you to override/extend styling when used elsewhere
};

const AddToListButton: React.FC<Props> = ({ onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.text}>Add to List</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    backgroundColor: "#474d9cff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  text: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});

export default AddToListButton;
