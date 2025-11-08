import React from "react";
import { WatchlistDoc } from "../../sample_structs";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { listStyles } from "../../styles/listStyles";

interface ListRowViewProps {
  list: WatchlistDoc;
  onPress: () => void;
}

const ListRowView: React.FC<ListRowViewProps> = ({ list, onPress }) => {

  return (
    <TouchableOpacity style={listStyles.listRowContainer} onPress={onPress}>
      <Image source={{uri: list.preview_covers[0]}} style={listStyles.listThumbnail}/>

      <View style={listStyles.listRowTextContainer}>
        <Text style={listStyles.listTitle}> {list.name} </Text>
        <Text style={listStyles.listDesc}> {list.description} </Text>
      </View>

      {/* TODO(maybe): swipe to delete list? */}
    </TouchableOpacity>
  )

}

export default ListRowView;