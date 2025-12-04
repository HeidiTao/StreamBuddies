import { Platform, StyleSheet } from "react-native";
import { colors } from "./styles";

export const logInStyles = StyleSheet.create({
  container: {
    marginTop: 70,
    marginHorizontal: 15,
    padding: 10,
    flexDirection: 'column',
    alignContent: 'center',
    flex: 1, // so that the keyboard dismiss thing could work 
    // alignItems: 'center', // nope 
  },
  instructionText: {
    fontSize: 16,
    marginVertical: 10,
  },
  inputBlock: {
    fontSize: 14,
    margin: 5,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.grey,
    borderRadius: 10,
  },
  disabledInput: {
    fontSize: 14,
    margin: 5,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.gray,
    borderRadius: 10,
  },
  button: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.mint_green,
    // alignSelf: 'flex-end',
    marginVertical: 10,
    
    shadowColor: "#000",
    shadowOffset: { width: 0.1, height: 0.1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  buttonText: {
    fontSize: 16, 
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.sky_blue,
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
  disabledButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.grey,
    alignSelf: 'flex-end',
    marginVertical: 10,
  }
})

export const profileStyles = StyleSheet.create({
  container: {
    marginTop: 70,
    margin: 10, 
    padding: 10,
  },
  topSectionContainer: {
    flexDirection: 'row',
    textAlign: 'left', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  basicInfoContainer: {
    alignItems: 'flex-start',
    flex: 1,
    paddingLeft: 15,
    textAlign: 'left',
  },
  title: {
    fontSize: 30,
    // marginBottom: 30,
  },
  contentText: {
    fontSize: 15, 
    fontWeight: '600',
    marginTop: 15,
  },
  profilePic: { 
    width: 90, 
    height: 90, 
    borderRadius: 60,
    margin: 10,
  },
  logOutButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.light_violet,
    alignSelf: 'flex-end',
  },
  logOutButtonText: {
    fontSize: 16, 
    textAlign: 'center',
  },
  acknowledgement: {
    fontSize: 12,
    margin: 10,
  },
  tmdbLogo: {
    width: 70, 
    height: 30, 
  },
})

export const profileStatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, // Adjust this value to move content up or down
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  viewAll: {
    color: '#007AFF',
    fontSize: 14,
  },
  watchTimeSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  watchTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4E4FF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  watchTimeIconContainer: {
    marginRight: 12,
  },
  watchTimeInfo: {
    flex: 1,
  },
  watchTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  watchTimeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  watchTimeSubtext: {
    fontSize: 11,
    color: '#999',
  },
  watchTimeProgressContainer: {
    marginLeft: 8,
  },
  circularProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitleWithPadding: {
    paddingHorizontal: 16,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  posterItem: {
    marginRight: 12,
  },
  posterImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: '31%',
    marginHorizontal: '1%',
    marginBottom: 12,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  watchStatsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#E8E3F5',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  watchStatsText: {
    fontSize: 16,
    fontWeight: '500',
  },
})

export const newProfileStyles = StyleSheet.create({
  container: {
    marginTop: 70,
    margin: 15,
    padding: 15,
  },
  title: {
    fontSize: 30,
    marginBottom: 30,
  },
  label: {
    fontSize: 15, 
    fontWeight: '600',
    marginTop: 15,
  },
  shortInput: {
    fontSize: 14,
    margin: 5,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.grey,
    borderRadius: 10,
    // boxShadow: colors.grey,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  longInput: {
    fontSize: 14,    
    margin: 5,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.grey,
    borderRadius: 10,
    height: 120,
  },
  saveButton: {
    marginVertical: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.mint_green,
    // alignItems: 'flex-end',
    alignSelf: 'flex-end',
    textAlign: 'center',
    minWidth: 70,
  },
  saveButtonText: {
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#e01313ff',
    paddingHorizontal: 10,
  },
  optionsWrapper: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    // alignItems: 'center',
  },
  // optionsColumn: {
  //   flexDirection: 'column',
  //   justifyContent: 'space-between',
  // },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
    width: '45%',
  },
  checkBox: {
    // color: colors.light_violet,
  },
  checkBoxText: {
    margin: 5,
  }
})