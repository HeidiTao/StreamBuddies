import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  gradientHeader: {
    marginTop: 0,
  },

  headerContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 8,
    color: "#8B7BC4",
    fontSize: 14,
  },

  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },

  gridRow: {
    justifyContent: "space-between",
  },

  posterContainer: {
    flex: 1 / 3,
    margin: 4,
  },

  posterWrapper: {
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#D5CEEB",
    marginBottom: 6,
  },

  posterImage: {
    width: "100%",
    height: "100%",
  },

  posterPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    backgroundColor: "#D5CEEB",
  },

  posterPlaceholderText: {
    fontSize: 10,
    textAlign: "center",
    color: "#8B7BC4",
  },

  titleText: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 2,
  },

  loadingMore: {
    paddingVertical: 12,
  },
});

export default styles;