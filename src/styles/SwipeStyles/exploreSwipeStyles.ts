import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flex: 1,
  },

  gradientHeader: {
    marginTop: 0,
  },

  headerContent: {
    paddingTop: 0,
    paddingBottom: 10,
  },

  content: {
    flex: 1,
    backgroundColor: "transparent",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7e7ffff",
  },

  centerInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  swiperWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    height: "100%",
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
  },

  loadingText: {
    marginTop: 8,
    color: "#8B7BC4",
    fontSize: 14,
  },

  emptyText: {
    color: "#8B7BC4",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },

  loadingMore: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(213, 206, 235, 0.95)",
  },

  loadingMoreText: {
    marginLeft: 8,
    color: "#8B7BC4",
    fontSize: 12,
  },
});

export default styles;
