// src/screens/Swipe/Components/NotLoggedInGate.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  onContinueGuest: () => void;
  onLogin: () => void;
};

const NotLoggedInGate: React.FC<Props> = ({ onContinueGuest, onLogin }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        You aren't logged in. Your watchlists and likes won't be saved.
      </Text>

      {/* Continue without logging in */}
      <TouchableOpacity
        style={[styles.cardButton, styles.secondaryButton]}
        onPress={onContinueGuest}
      >
        <Text style={styles.cardButtonText}>Continue without logging in</Text>
      </TouchableOpacity>

      {/* Log in */}
      <TouchableOpacity
        style={[styles.cardButton, styles.primaryButton]}
        onPress={onLogin}
      >
        <Text style={[styles.cardButtonText, styles.primaryButtonText]}>
          Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotLoggedInGate;

const MINT = "#B8E0D2";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 24,
    fontWeight: "500",
    lineHeight: 22,
  },

  /* Shared card-style button */
  cardButton: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,

    // soft shadow
    shadowColor: MINT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 3,

    alignItems: "center",
    justifyContent: "center",
  },

  cardButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  /* Continue button — mint haze */
  secondaryButton: {
    borderWidth: 1,
    borderColor: MINT,
    backgroundColor: "#f9f9f9",
  },

  /* Login button — full mint */
  primaryButton: {
    backgroundColor: MINT,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
