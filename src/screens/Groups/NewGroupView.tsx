import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { groupRepository } from '../../repositories/GroupRepository';
import { GroupDoc, UserDoc } from '../../sample_structs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

type NewGroupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewGroup'>;

interface Props {
  navigation: NewGroupNavigationProp;
}

export default function NewGroupView({ navigation }: Props) {
  const { authUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserDoc[]>([]);
  const [searchResults, setSearchResults] = useState<UserDoc[]>([]);
  const [searching, setSearching] = useState(false);

  // Search for users as they type
  useEffect(() => {
    const searchUsers = async () => {
      if (!search.trim() || search.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const usersRef = collection(db, 'users');
        
        // Search by username (case-insensitive partial match)
        // Note: Firestore doesn't support case-insensitive queries natively,
        // so we'll fetch and filter client-side for better UX
        const q = query(usersRef);
        const snapshot = await getDocs(q);
        
        const searchLower = search.toLowerCase();
        const results: UserDoc[] = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          const user: UserDoc = {
            id: doc.id,
            user_name: userData.user_name,
            phone_number: userData.phone_number,
            birthday: userData.birthday,
            join_date: userData.join_date?.toDate(),
            streaming_services: userData.streaming_services,
            profile_pic: userData.profile_pic,
            created_at: userData.created_at?.toDate(),
            updated_at: userData.updated_at?.toDate(),
          };
          
          // Filter: username contains search term, not already selected, and not current user
          if (
            user.user_name?.toLowerCase().includes(searchLower) &&
            !selected.find(s => s.id === user.id) &&
            user.id !== authUser?.uid
          ) {
            results.push(user);
          }
        });
        
        // Limit to 10 results
        setSearchResults(results.slice(0, 10));
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [search, selected, authUser]);

  const addMember = (user: UserDoc) => {
    if (selected.length >= 10) {
      alert('Maximum 10 members');
      return;
    }
    setSelected([...selected, user]);
    setSearch(''); // Clear search after adding
  };

  const removeMember = (userId: string) => {
    setSelected(selected.filter(m => m.id !== userId));
  };

  const handleCreate = async () => {
    try {
      if (!authUser) {
        alert('Please sign in to create a group');
        return;
      }
      
      if (!groupName.trim()) {
        alert('Please enter a group name');
        return;
      }
      
      // Create array of member IDs (current user + selected users)
      const memberIds = [authUser.uid, ...selected.map(u => u.id!)];
      
      const newGroup: Omit<GroupDoc, 'id'> = {
        name: groupName,
        description,
        created_by: authUser.uid,
        member_ids: memberIds,
        created_at: Date.now(),
        updated_at: Date.now(),
        member_count: memberIds.length,
      };
      
      const created = await groupRepository.createGroup(authUser.uid, newGroup);
      console.log('Group created:', created);
      navigation.navigate('GroupDetail', { groupId: created });
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ backgroundColor: '#e3f6ff', borderRadius: 10, padding: 6, marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#6e7bb7" />
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: '600' }}>Create new group</Text>
      </View>

      {/* Group Name */}
      <Text style={{ fontWeight: '500', marginBottom: 4 }}>Group name</Text>
      <TextInput 
        style={{ 
          borderWidth: 1, 
          borderColor: '#e3e3f7', 
          borderRadius: 8, 
          padding: 10, 
          marginBottom: 14, 
          fontSize: 16 
        }} 
        value={groupName} 
        onChangeText={setGroupName} 
      />

      {/* Description */}
      <Text style={{ fontWeight: '500', marginBottom: 4 }}>
        Description <Text style={{ color: '#aaa' }}>(optional)</Text>
      </Text>
      <TextInput 
        style={{ 
          borderWidth: 1, 
          borderColor: '#e3e3f7', 
          borderRadius: 8, 
          padding: 10, 
          minHeight: 60, 
          marginBottom: 14, 
          fontSize: 16 
        }} 
        value={description} 
        onChangeText={setDescription} 
        multiline 
      />

      {/* Members */}
      <Text style={{ fontWeight: '500', marginBottom: 4 }}>
        Add members <Text style={{ color: '#aaa' }}>(optional, up to 10)</Text>
      </Text>
      <TextInput 
        style={{ 
          borderWidth: 1, 
          borderColor: '#e3e3f7', 
          borderRadius: 8, 
          padding: 10, 
          marginBottom: 8, 
          fontSize: 16 
        }} 
        value={search} 
        onChangeText={setSearch} 
        placeholder="Search by username..." 
        placeholderTextColor="#bbb" 
      />

      {/* Search Results */}
      {searching && (
        <View style={{ padding: 12, alignItems: 'center' }}>
          <Text style={{ color: '#aaa' }}>Searching...</Text>
        </View>
      )}

      {!searching && search.trim().length > 0 && searchResults.length === 0 && (
        <View style={{ padding: 12, alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: '#aaa' }}>No users found</Text>
        </View>
      )}

      {searchResults.length > 0 && (
        <View style={{ 
          backgroundColor: '#fff', 
          borderWidth: 1, 
          borderColor: '#e3e3f7', 
          borderRadius: 8, 
          padding: 8, 
          marginBottom: 14,
          maxHeight: 200 
        }}>
          <ScrollView>
            {searchResults.map((user) => (
              <TouchableOpacity 
                key={user.id} 
                onPress={() => addMember(user)} 
                style={{ 
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0'
                }}
              >
                <Text style={{ color: '#333', fontWeight: '500' }}>{user.user_name}</Text>
                {user.phone_number && (
                  <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                    {user.phone_number}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Members */}
      {selected.length > 0 && (
        <>
          <Text style={{ fontWeight: '500', marginBottom: 8 }}>
            Selected ({selected.length}/10)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
            {selected.map((member) => (
              <View key={member.id} style={{ alignItems: 'center', marginRight: 18, marginBottom: 18 }}>
                <View style={{ position: 'relative' }}>
                  <View style={{ 
                    width: 54, 
                    height: 54, 
                    borderRadius: 27, 
                    backgroundColor: '#f5d6f7', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Text style={{ fontSize: 20, fontWeight: '600', color: '#bcbcff' }}>
                      {member.user_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeMember(member.id!)} 
                    style={{ 
                      position: 'absolute', 
                      top: -8, 
                      right: -8, 
                      backgroundColor: '#fff', 
                      borderRadius: 10, 
                      borderWidth: 1, 
                      borderColor: '#e3e3f7', 
                      padding: 2 
                    }}
                  >
                    <Ionicons name="close" size={16} color="#bcbcff" />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 4, maxWidth: 70 }} numberOfLines={1}>
                  {member.user_name}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Create Button */}
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#e3fbe3', 
          borderRadius: 10, 
          paddingVertical: 12, 
          alignItems: 'center', 
          marginTop: 10 
        }} 
        onPress={handleCreate}
      >
        <Text style={{ color: '#4b8b4b', fontWeight: '600', fontSize: 18 }}>Create →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}