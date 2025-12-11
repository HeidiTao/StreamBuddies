import { Platform, StyleSheet } from "react-native";
import { colors } from "./styles";

export const listStyles = StyleSheet.create({
  listsContainer: {
    // marginTop: 75,
    flex: 1, 
    backgroundColor: colors.off_white,
    // flexDirection: 'row', 
    // justifyContent: 'space-between', 
    // alignItems: 'center' 
  },
  listsTitle: {
    fontSize: 28,
    fontWeight: '700',
    // marginLeft: 15,
    // margin: 10,
  },
  listRowContainer: {
    // backgroundColor: colors.off_white,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start', 
    justifyContent: 'flex-start',// 'space-between', 
    padding: 30,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 2,
    //   },
    //   android: {
    //       elevation: 2,
    //   },
    // })
  },
  listRowLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 20,
  },
  listRowTextContainer: {
    flex: 1,
    padding: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.sky_blue,
    marginBottom: 5,
  },
  listDesc: {
    fontSize: 12,
    color: colors.sky_blue,
    marginLeft: 4,
  },
  listDivider: {
    height: 1.5,
    // marginVertical: 8,      // spacing between items
    // borderRadius: 1,      // makes it look smoother
  },

})

export const guestListStyles = StyleSheet.create({
  guestWrapper: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40, 
    backgroundColor: colors.off_white 
  },
  mainText: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#8070A0', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  subText: { 
    fontSize: 14, 
    color: '#B0A0C0', 
    textAlign: 'center',
    marginBottom: 24 
  }
})

export const listDetailStyles = StyleSheet.create({
  detailsContainer: {
    backgroundColor: 'rgba(255, 248, 251, 1)',
  },
  listDataContainer: {
    flexDirection: 'row',
    textAlign: 'left',
    alignItems: 'center', 
    justifyContent: 'flex-start',
    marginTop: 60,
    padding: 15,
  },
  listDataLeftSection: {
    alignItems: 'flex-start',
    flex: 1,
    // width: 40,
    paddingLeft: 10,
    textAlign: 'left',
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listDesc: {
    fontSize: 14,
    color: colors.sky_blue,
    padding: 5,
  },
  listThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 20,
  },

  listItemContainer: {
    padding: 10,
    // borderBottomColor: colors.light_violet,
    // borderBottomWidth: 1,
  },
  listItemRowContainer: {
    flexDirection: 'row',
    flex: 1,
    padding: 10,
    width: '60%',
  },
  listItemThumbnail: {
    width: 100,
    height: 150,
    borderRadius: 5,
    marginHorizontal: 15, 
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listItemOverview: {
    fontSize: 12,
    paddingLeft: 5,
  },
  listItemNote: {
    backgroundColor: colors.light_violet,
    marginHorizontal: 15,
    paddingVertical: 5,
    paddingLeft: 10,
    borderRadius: 20,
  },
  separator: { 
    flex: 1,
    marginTop: 20,
    // width: '80%',
    alignItems: 'center', 
    height: 1,
  },

  parallelButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  parallelButton: {
    margin: 5,
    marginHorizontal: 25,
    backgroundColor: colors.sky_blue,
    padding: 10,
    paddingHorizontal: 35,
    borderRadius: 10,
  },

  editListTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 5,
    borderBottomColor: colors.gray,
    borderBottomWidth: 1,
  },

  editListDesc: {
    fontSize: 14,
    // color: colors.sky_blue,
    // margin: 5,
    padding: 5,
    // height: 50,
    backgroundColor: '#dcd1c8d3',
    borderRadius: 2,
  },
  editListItemRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editListItemTrashButton: {
    // justifyContent: 'center',
    margin: 5,
    marginRight: -15,
  }

})

export const newListStyles = StyleSheet.create({
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
    textAlignVertical: 'top',
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
  }
})