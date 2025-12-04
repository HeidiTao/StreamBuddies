import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React, { useState } from "react";
import { GroupDoc } from "../../sample_structs";
import { useGroups } from "../../hooks/useGroups";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { groupRepository } from '../../repositories/GroupRepository';

type GroupsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Groups'>;

interface Props {
  navigation: GroupsViewNavigationProp;
}

const GroupsView: React.FC<Props> = ({ navigation }) => {
  const { groups, groupsLoading } = useGroups();
  const [removeMode, setRemoveMode] = useState(false);

  const handleLeaveGroup = async (group: GroupDoc) => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${group.name}"?`,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              if (group.id) {
                await groupRepository.deleteGroup(group.id);
              }
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave group. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleRemoveMode = () => {
    setRemoveMode(!removeMode);
  };

  // Mock member initials for demo
  const mockInitials = [
    ['G', 'M', 'Q', 'S', 'W'],
    ['R', 'I', 'H'],
    ['J', 'K', 'L', 'M', 'N'],
    ['E', 'F', 'G'],
    ['P', 'O'],
    ['U', 'V', 'W', 'X', 'Y'],
    ['A', 'B', 'C', 'D'],
  ];

  const renderGroupCircle = (name: string, onPress: () => void, memberInitials?: string[], isAction?: boolean, group?: GroupDoc) => {
    // In remove mode, only show regular groups (not Join/New Group buttons)
    if (removeMode && isAction) {
      return null;
    }

    return (
      <View style={{ alignItems: 'center', marginBottom: 30, width: '45%' }}>
        <TouchableOpacity onPress={onPress}>
          <View style={{ position: 'relative' }}>
            <View style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: isAction ? 'rgba(220, 200, 240, 0.3)' : 'rgba(200, 190, 240, 0.4)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              {isAction ? (
                <Text style={{ fontSize: 60, color: '#C0B0D0', fontWeight: '300' }}>+</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 15 }}>
                  {(memberInitials || ['A', 'B']).slice(0, 5).map((initial, idx) => (
                    <View
                      key={idx}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: 'rgba(200, 190, 240, 0.6)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 3,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>
                        {initial}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            {/* Small X Badge in top-right corner */}
            {removeMode && !isAction && (
              <View style={{
                position: 'absolute',
                top: 0,
                right: 10,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#FF6B6B',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 5,
              }}>
                <Ionicons name="close" size={18} color="#fff" />
              </View>
            )}
          </View>
          
          <Text style={{
            fontSize: 14,
            color: isAction ? '#B0A0C0' : '#8070A0',
            textAlign: 'center',
            fontWeight: '500',
          }}>
            {name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (groupsLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F0F8' }}>
      {/* Gradient Header */}
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
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#000' }}>My Groups</Text>
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
              {removeMode ? 'Done' : 'Leave Groups'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Remove Mode Banner */}
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
            Tap any group to leave it
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 30,
        }}
      >
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
          {/* Join Group */}
          {renderGroupCircle('Join Group', () => navigation.navigate('JoinGroup'), undefined, true)}
          
          {/* New Group */}
          {renderGroupCircle('New Group', () => navigation.navigate('NewGroup'), undefined, true)}
          
          {/* Existing Groups */}
          {groups.map((group, idx) => (
            <React.Fragment key={group.id}>
              {renderGroupCircle(
                group.name,
                () => removeMode 
                  ? handleLeaveGroup(group)
                  : navigation.navigate('GroupDetail', { groupId: group }),
                mockInitials[idx % mockInitials.length],
                false,
                group
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupsView;