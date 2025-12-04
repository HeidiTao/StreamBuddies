// src/screens/Swipe/Components/FilterButton.styles.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  buttonActive: {
    backgroundColor: "#CFEAFD",
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#1c1c1c",
  },

  modalRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f7f7f7",
  },
  chipActive: {
    backgroundColor: "#eac4d5",
    borderColor: "#eac4d5",
  },
  chipText: {
    fontSize: 13,
    color: "#333",
  },
  chipTextActive: {
    fontWeight: "700",
    color: "#000",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
  },
  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#eac4d5",
  },
  applyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  closeX: {
    position: "absolute",
    top: 8,
    right: 10,
  },
  closeXText: {
    fontSize: 18,
  },
});

export default styles;
