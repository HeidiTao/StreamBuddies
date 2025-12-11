import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";
import { Timestamp } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { WatchlistDoc, WatchlistItemDoc } from "../../sample_structs";
import { useLists } from "../../hooks/useLists";
import ListRowView from "./ListRowView";
import { guestListStyles, listStyles } from "../../styles/listStyles";
import { useAuth } from "../../hooks/useAuth";

type ListsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lists'>

interface Props {
  navigation: ListsViewNavigationProp;
}

const ListsView: React.FC<Props> = ({ navigation }) => {
  const { authUser } = useAuth();
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
    <View style={{ flex: 1 }}>
      <LinearGradient
            colors={['#E8D5F0', '#D5E8F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingTop: 60,
              paddingBottom: 20,
              paddingHorizontal: 20,
            }}
          >
      <Text style={listStyles.listsTitle}>My Watchlists</Text>
      </LinearGradient>
      

      {!authUser ? (<>
      {/* guest mode display */}
        {/* <View style={{ flex: 1, backgroundColor: '#F5F0F8' }}> */}
     
        <View style={guestListStyles.guestWrapper}>
          <Ionicons name="list-outline" size={80} color="#C0B0D0" style={{ marginBottom: 20 }} />
          <Text style={guestListStyles.mainText}>
            Please sign in to create watchlists!
          </Text>
          <Text style={guestListStyles.subText}>
            Sign in to start creating private and shared watchlists to save your favorite shows!
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#C8BEF0',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 25,
            }}
            onPress={() => {
              navigation.getParent()?.navigate('ProfileTab');
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Sign In</Text>
          </TouchableOpacity>
        </View>
        {/* </View> */}
      </>) : (<> 
      <ScrollView>
      <View style={listStyles.listsContainer}>

      <View>
        <ListRowView 
          key={'new list'}
          list={newListPlaceholder}
          isLastList={lists.length==0}
          onPress={() => navigation.navigate('NewList')}
        />
      </View>
      
      <View>
        {lists.map((list, index) => (
          <ListRowView
            key={list.id}
            list={list}
            isLastList={index == lists.length - 1}
            onPress={() => navigation.navigate('ListDetail', { list: list })}
          />
        ))}
      </View>
      </View>
      </ScrollView>
      </>)}
    </View>
  );


};

export default ListsView;
