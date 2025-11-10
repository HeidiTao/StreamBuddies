import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5d6f7',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#735a7b',
    textAlign: 'center',
    marginTop: 8,
  },
  memberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dfd6ff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  memberText: {
    fontSize: 12,
    color: '#735a7b',
    fontWeight: '500',
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  }
});