import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";
import { Timestamp } from "firebase/firestore";

import { WatchlistDoc, WatchlistItemDoc } from "../../sample_structs";
import { useLists } from "../../hooks/useLists";
import ListRowView from "./ListRowView";

type ListsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lists'>

interface Props {
  navigation: ListsViewNavigationProp;
}

const ListsView: React.FC<Props> = ({ navigation }) => {
  const { lists, listLoading } = useLists();

  const newListPlaceholder : WatchlistDoc = {
    name: 'New List',
    owner_user_id: '0',
    visibility: 'private',
    created_at: Timestamp.fromDate(new Date()),
    updated_at: Timestamp.fromDate(new Date()),
    item_count: 0,
    preview_covers: ['https://static.vecteezy.com/system/resources/thumbnails/000/363/962/small/1_-_1_-_Plus.jpg'],
  }

  return (
    <ScrollView>
      <View>
        <ListRowView 
          key={'new list'}
          list={newListPlaceholder}
          onPress={() => navigation.navigate('NewList')}
        />
      </View>
      <View>
        {lists.map((list) => (
          <ListRowView
            key={list.id}
            list={list}
            onPress={() => navigation.navigate('ListDetail', { list: list })}
          />
          
        ))}
      </View>
    </ScrollView>
  );


};

export default ListsView;
