import React from "react";
import { WatchlistDoc } from "../../sample_structs";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { listStyles } from "../../styles/listStyles";
import { ListDivider } from "../../styles/listDivider";

interface ListRowViewProps {
  list: WatchlistDoc;
  isLastList: boolean;
  onPress: () => void;
}

const ListRowView: React.FC<ListRowViewProps> = ({ list, isLastList, onPress }) => {

  return (
    <View>
    <TouchableOpacity style={listStyles.listRowContainer} onPress={onPress}>
      {/* <Image source={{uri: list.preview_covers[0]}} style={listStyles.listThumbnail}/> */}
      {/* <Image
        source={
          list.preview_covers.length != 0
            ? { uri: list.preview_covers[0] }
            : require("../../../assets/default_list_cover.png")
        }
        style={listStyles.listThumbnail}
      /> */}

      <Image
        source={
          list.preview_covers.length != 0
            ? { uri: list.preview_covers[0] }//{ uri: `https://image.tmdb.org/t/p/original/${list.items.poster_path}` }
            : require("../../../assets/default_list_cover.png")
        }
        style={listStyles.listThumbnail}
      />


      <View style={listStyles.listRowTextContainer}>
        <Text style={listStyles.listTitle}> {list.name} </Text>
        <Text style={listStyles.listDesc}> {list.description} </Text>
      </View>

      

      {/* TODO(maybe): swipe to delete list? */}
    </TouchableOpacity>


    {!isLastList && <ListDivider/>}
    </View>  

  )

}

export default ListRowView;