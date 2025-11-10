import { ScrollView, View, Text, Image, TouchableOpacity, TextInput} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useEffect, useState } from "react";
import React from "react";
import { ContentDoc, WatchlistDoc, WatchlistItemDoc } from "../../sample_structs";
import { listDetailStyles } from "../../styles/listStyles";
import ListItemRowView from "./ListItemRowView";
import { db } from "../../../config/firebase";
import { collection, deleteDoc, getDocs, doc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { GradientBackground } from "../../styles/gradientBackground";
import { useList } from "../../hooks/useList";
import { listRepository } from "../../repositories/ListRepository";
import { Ionicons } from "@expo/vector-icons";

type ListDetailViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListDetail'>

type ListDetailViewRouteProp = RouteProp<RootStackParamList, 'ListDetail'>;

interface Props {
  navigation: ListDetailViewNavigationProp;
}

const ListView: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<ListDetailViewRouteProp>();
  const { list: hookList, updateList, saveList } = useList();
  const { list } = route.params;
  const [listItems, setListItems] = useState<(ContentDoc&WatchlistItemDoc)[]>([]);
  const tmdb_api_key = process.env.EXPO_PUBLIC_TMDB_API_KEY;
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    updateList({
      ...list,
      description: list.description || '', // default to empty string
    }); // initialize hook state with route param
  }, [list]);

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
          `https://api.themoviedb.org/3/movie/${item.id}?api_key=${tmdb_api_key}`
        );
        const tmdbData = await res.json();
        return {
          ...tmdbData,
          tmdb_id: item.id,
          added_by: item.added_by,
          added_at: item.added_at,
          notes: item.notes || "no notes added",
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

  const handleSaveEdits = async () => {
    await saveList();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    console.log("trying to delete list", list);
    if (list.id) {
      listRepository.delete(list.id);
      navigation.goBack();
    }
  };

  const handleRemoveFromList = async (item_tmdb_id : string) => {
    const itemRef = doc(db, `watchLists/${hookList.id}/items/${item_tmdb_id}`);
    console.log('Deleting item at path:', `watchLists/${hookList.id}/items/${item_tmdb_id}`);
    // update local UI first
    setListItems(prevItems => prevItems.filter(item => item.tmdb_id !== item_tmdb_id));
    // remove from firebase
    await deleteDoc(itemRef);
    
  }

  return (
    <ScrollView>
    <GradientBackground>
      {isEditing ? (
        <>        
        <View style={listDetailStyles.listDataContainer}>
          <View style={listDetailStyles.listDataLeftSection}>
            <TextInput value={hookList.name}
              onChangeText={(text) => updateList({ name: text })}
              style={listDetailStyles.editListTitle} />
            <TextInput multiline value={hookList.description}
              onChangeText={(text) => updateList({ description: text })}
              style={listDetailStyles.editListDesc}/>
          </View>

          <Image source={{uri: hookList.preview_covers[0]}} style={listDetailStyles.listThumbnail}/>
        </View>

        {/* save edit and delete buttons */}
        <View style={listDetailStyles.parallelButtonWrapper}>
          <TouchableOpacity onPress={() => handleSaveEdits()}
            style={listDetailStyles.parallelButton}>
            <Text>Save edits</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete()}
            style={listDetailStyles.parallelButton}>
            <Text>Delete list</Text>
          </TouchableOpacity>
        </View>
        
        {/* list item contents */}
        <View>
        {listItems.map((item) => (
          <View style={listDetailStyles.editListItemRowWrapper}>
          <TouchableOpacity onPress={() => handleRemoveFromList(item.tmdb_id)}
            style={listDetailStyles.editListItemTrashButton}>
            <Ionicons name='trash-outline' size={20} color='#eb8080ff'/>
          </TouchableOpacity>
          <ListItemRowView
            key={item.tmdb_id}
            listItem={item}
          />
          </View>
        ))}
        </View>

        </>

      ) : (// {/* TODO: loading state */}
        <>
        {/* list meta data */}
        <View style={listDetailStyles.listDataContainer}>
          <View style={listDetailStyles.listDataLeftSection}>
            <Text style={listDetailStyles.listTitle}> {hookList.name} </Text>
            <Text style={listDetailStyles.listDesc}> {hookList.description} </Text>
          </View>

          <Image source={{uri: hookList.preview_covers[0]}} style={listDetailStyles.listThumbnail}/>
        </View>

        {/* edit and delete buttons */}
        <View style={listDetailStyles.parallelButtonWrapper}>
          <TouchableOpacity onPress={() => setIsEditing(true)}
            style={listDetailStyles.parallelButton}>
            <Text>Edit list</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete()}
            style={listDetailStyles.parallelButton}>
            <Text>Delete list</Text>
          </TouchableOpacity>
        </View>

        {/* list item contents */}
        <View>
        {listItems.map((item) => (
          <ListItemRowView
            key={item.tmdb_id}
            listItem={item}
          />
        ))}
        </View>
        </>
      )}
    </GradientBackground>
    </ScrollView>
  );
};

export default ListView;