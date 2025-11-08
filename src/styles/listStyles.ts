import { Platform, StyleSheet } from "react-native";
import { colors } from "./styles";

export const listStyles = StyleSheet.create({
  
  listRowContainer: {
    // backgroundColor: colors.off_white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'flex-start',// 'space-between', 
    padding: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
          elevation: 2,
      },
    })
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
  },
  listDesc: {
    fontSize: 12,
    color: colors.sky_blue,
    marginLeft: 4,
  }

})


export const listDetailStyles = StyleSheet.create({
  listDataContainer: {
    flexDirection: 'row',
    textAlign: 'left',
    alignItems: 'center', 
    justifyContent: 'flex-start',
    marginTop: 15,
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
  }
})

export const newListStyles = StyleSheet.create({
  container: {
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