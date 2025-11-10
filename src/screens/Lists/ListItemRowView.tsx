import React from "react";
import { ContentDoc, WatchlistItemDoc } from "../../sample_structs";
import { View, Text, Image } from "react-native";
import { listDetailStyles } from "../../styles/listStyles";
// import LinearGradient from "react-native-linear-gradient";
import { LinearGradient } from "expo-linear-gradient";

interface ListItemRowViewProps {
  listItem: ContentDoc & WatchlistItemDoc;
  // onPress: () => void; // can later link to show detail?
}

const ListItemRowView: React.FC<ListItemRowViewProps> = ({ listItem }) => {
  return (
    <View style={listDetailStyles.listItemContainer}>
    <View style={listDetailStyles.listItemRowContainer}>
      <Image 
        source={{uri: `https://image.tmdb.org/t/p/original/${listItem.poster_path}`}} 
        style = {listDetailStyles.listItemThumbnail}/>
      {/* <Text key={listItem.tmdb_id}> {listItem.tmdb_id} </Text> */}
      <View>
        <View>
          <Text style={listDetailStyles.listItemTitle}> {listItem.title} </Text>
          <Text style={listDetailStyles.listItemOverview}> {listItem.overview} </Text>
        </View>
      </View>
    </View>
      {/* To add later: added_by user */}
      <Text style={listDetailStyles.listItemNote}> {listItem.notes} </Text>
      <LinearGradient
        colors={['#f4fbf7', '#9cd3af', '#72c58f', '#9cd3af', '#f4fbf7']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{x: 0.93, y: 0.75}}
        end={{x: 0.07, y: 0.25}}
        style={listDetailStyles.separator}
      />
    </View>
  )

}

export default ListItemRowView;