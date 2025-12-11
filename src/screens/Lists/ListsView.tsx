import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React, { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { WatchlistDoc, WatchlistItemDoc } from "../../sample_structs";
import { useLists } from "../../hooks/useLists";
import ListRowView from "./ListRowView";
import { guestListStyles, listStyles } from "../../styles/listStyles";
import { useAuth } from "../../hooks/useAuth";
import { listRepository } from "../../repositories/ListRepository";

type ListsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lists'>

interface Props {
  navigation: ListsViewNavigationProp;
}

const ListsView: React.FC<Props> = ({ navigation }) => {
  const { authUser } = useAuth();
  const { lists, listLoading } = useLists();
  const [removeMode, setRemoveMode] = useState(false);

  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
  };

  const handleDeleteList = async (list: WatchlistDoc) => {
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${list.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (list.id) {
                await listRepository.delete(list.id);
              }
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'Failed to delete list. Please try again.');
            }
          }
        }
      ]
    );
  };

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
    <View style={{ flex: 1, backgroundColor: '#F5F0F8' }}>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={listStyles.listsTitle}>My Watchlists</Text>
          {authUser && lists.length > 0 && (
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: removeMode ? '#B8E6B8' : 'rgba(100, 100, 200, 0.8)',
              }}
              onPress={toggleRemoveMode}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: removeMode ? '#2D5F2D' : '#fff' 
              }}>
                {removeMode ? 'Done' : 'Delete Lists'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {removeMode && (
        <View style={{
          backgroundColor: '#FFE5E5',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#FFCCCC',
        }}>
          <Text style={{
            fontSize: 14,
            color: '#D32F2F',
            textAlign: 'center',
            fontWeight: '600',
          }}>
            Tap any list to delete it
          </Text>
        </View>
      )}

      {!authUser ? (
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
      ) : (
        <ScrollView>
          <View style={listStyles.listsContainer}>
            {!removeMode && (
              <View>
                <ListRowView 
                  key={'new list'}
                  list={newListPlaceholder}
                  isLastList={lists.length==0}
                  onPress={() => navigation.navigate('NewList')}
                />
              </View>
            )}
            
            <View>
              {lists.map((list, index) => (
                <ListRowView
                  key={list.id}
                  list={list}
                  isLastList={index == lists.length - 1}
                  onPress={() => removeMode 
                    ? handleDeleteList(list)
                    : navigation.navigate('ListDetail', { list: list })
                  }
                  showDeleteIcon={removeMode}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ListsView;