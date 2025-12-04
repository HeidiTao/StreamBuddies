// src/screens/Swipe/Components/RefreshButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  label?: string;
};

const RefreshButton: React.FC<Props> = ({
  onPress,
  loading = false,
  style,
  label = "Refresh",
}) => {
  return (
    <TouchableOpacity
      onPress={loading ? undefined : onPress}
      activeOpacity={0.8}
      style={[styles.button, style, loading && styles.buttonDisabled]}
    >
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator size="small" color="#1565A4" />
          <Text style={styles.text}>Refreshing…</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Ionicons name="refresh" size={18} color="#1565A4" />
          <Text style={styles.text}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-end",
    backgroundColor: "#CFEAFD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    margin: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    color: "#1565A4",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default RefreshButton;
