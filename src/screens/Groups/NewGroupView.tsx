import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { groupRepository } from '../../repositories/GroupRepository';
import { GroupDoc } from '../../sample_structs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

const mockMembers = [
  { id: 'A', name: 'User name 1' },
  { id: 'B', name: 'User name 2' },
  { id: 'C', name: 'User name 3' },
  { id: 'D', name: 'User name 4' },
  { id: 'E', name: 'User name 5' },
  { id: 'F', name: 'User name 6' },
];

type NewGroupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewGroup'>;

interface Props {
  navigation: NewGroupNavigationProp;
}

export default function NewGroupView({ navigation }: Props) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(mockMembers);
  // Hardcoded suggestions for autocomplete while typing (demo)
  const potentialMembers = [
    { id: 'G1', name: 'alice' },
    { id: 'G2', name: 'ben' },
    { id: 'G3', name: 'carla' },
    { id: 'G4', name: 'dan' },
    { id: 'G5', name: 'ella' },
    { id: 'G6', name: 'frank' },
    { id: 'G7', name: 'gina' },
    { id: 'G8', name: 'hank' },
    { id: 'G9', name: 'ivy' },
    { id: 'G10', name: 'joe' },
  ];

  const filteredSuggestions = search.trim()
    ? potentialMembers.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()) && !selected.find(s => s.name === p.name))
    : [];

  const removeMember = (id: string) => setSelected(selected.filter(m => m.id !== id));

  const handleCreate = async () => {
    try {
      if (!groupName.trim()) {
        alert('Please enter a group name');
        return;
      }
      
      const newGroup: GroupDoc = {
        name: groupName,
        description,
        created_by: 'demo-user', // Replace with actual user id if available
        created_at: Date.now(),
        updated_at: Date.now(),
        member_count: selected.length,
      };
      
  const created = await groupRepository.createGroup(newGroup);
  console.log('Group created:', created); // Debug log
  // Navigate to the group detail so the user can immediately see the generated group code
  // Fixed: Changed from { group: created } to { groupId: created }
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: '#e3f6ff', borderRadius: 10, padding: 6, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#6e7bb7" />
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: '600' }}>Create new group</Text>
      </View>
      {/* Group Name */}
      <Text style={{ fontWeight: '500', marginBottom: 4 }}>Group name</Text>
      <TextInput style={{ borderWidth: 1, borderColor: '#e3e3f7', borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 16 }} value={groupName} onChangeText={setGroupName} />
      {/* Description */}
      <Text style={{ fontWeight: '500', marginBottom: 4 }}>Description <Text style={{ color: '#aaa' }}>(optional)</Text></Text>
      <TextInput style={{ borderWidth: 1, borderColor: '#e3e3f7', borderRadius: 8, padding: 10, minHeight: 60, marginBottom: 14, fontSize: 16 }} value={description} onChangeText={setDescription} multiline />
      {/* Members */}
      <Text style={{ fontWeight: '500', marginBottom: 4 }}>Select up to 10 members</Text>
      <TextInput style={{ borderWidth: 1, borderColor: '#e3e3f7', borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 16, color: '#aaa' }} value={search} onChangeText={setSearch} placeholder="Start typing to search ..." placeholderTextColor="#bbb" />
      {/* Suggestions dropdown (hardcoded names) */}
      {filteredSuggestions.length > 0 && (
        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3e3f7', borderRadius: 8, padding: 8, marginBottom: 14 }}>
          {filteredSuggestions.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => {
              // add to selected if not already and limit to 10
              if (selected.find(s => s.name === p.name)) return;
              if (selected.length >= 10) { alert('Maximum 10 members'); return; }
              setSelected([...selected, { id: p.id, name: p.name }]);
              setSearch('');
            }} style={{ paddingVertical: 8 }}>
              <Text style={{ color: '#333' }}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Selected Members */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {selected.map((member, idx) => (
          <View key={member.id} style={{ alignItems: 'center', marginRight: 18, marginBottom: 18 }}>
            <View style={{ position: 'relative' }}>
              <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#f5d6f7', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '600', color: '#bcbcff' }}>{member.id}</Text>
              </View>
              <TouchableOpacity onPress={() => removeMember(member.id)} style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e3e3f7', padding: 2 }}>
                <Ionicons name="close" size={16} color="#bcbcff" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{member.name}</Text>
          </View>
        ))}
      </View>
      {/* Create Button */}
      <TouchableOpacity style={{ backgroundColor: '#e3fbe3', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 }} onPress={handleCreate}>
        <Text style={{ color: '#4b8b4b', fontWeight: '600', fontSize: 18 }}>Create →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}