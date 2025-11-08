import { ScrollView, View, Text, Image } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useEffect, useState } from "react";
import React from "react";
import { ContentDoc, WatchlistItemDoc } from "../../sample_structs";
import { listDetailStyles } from "../../styles/listStyles";
import ListItemRowView from "./ListItemRowView";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";

type ListDetailViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListDetail'>

type ListDetailViewRouteProp = RouteProp<RootStackParamList, 'ListDetail'>;

const ListView: React.FC = () => {
  const route = useRoute<ListDetailViewRouteProp>();
  const { list } = route.params;
  const [listItems, setListItems] = useState<(ContentDoc&WatchlistItemDoc)[]>([]);
  const tmdb_api_key = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const fetchContentDetails = async () => {
    try {
      if (!list.id) {
        console.error('List ID is undefined');
        return;
      }
      const itemsCollection = collection(db, 'watchLists', list.id, 'items');
      const itemsSnapshot = await getDocs(itemsCollection);

      const watchlistItems = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as WatchlistItemDoc)
      }));

      const requests = watchlistItems.map(async (item) => {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${item.tmdb_id}?api_key=${tmdb_api_key}`
        );
        const tmdbData = await res.json();
        return {
          ...tmdbData,
          tmdb_id: item.tmdb_id,
          added_by: item.added_by,
          added_at: item.added_at,
          notes: item.notes,
        }
      })
      const results = await Promise.all(requests);
      setListItems(results);
    } catch (err) {
      console.error('Error fetching list contents: ', err);
    }
  }

  useEffect(() => {
    fetchContentDetails();
  }, [list])

  return (
    <ScrollView>
      <View style={listDetailStyles.listDataContainer}>
        <View style={listDetailStyles.listDataLeftSection}>
          <Text style={listDetailStyles.listTitle}> {list.name} </Text>
          <Text style={listDetailStyles.listDesc}> {list.description} </Text>
        </View>

        <Image source={{uri: list.preview_covers[0]}} style={listDetailStyles.listThumbnail}/>
      </View>

      {/* TODO: add delete and edit buttons */}
      <View>
      {listItems.map((item) => (
        <ListItemRowView
          key={item.tmdb_id}
          listItem={item}
        />
      ))}
      </View>
    </ScrollView>
  );
};

export default ListView;