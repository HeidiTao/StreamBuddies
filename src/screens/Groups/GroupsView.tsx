import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React, { useState, useEffect } from "react";
import { GroupDoc, UserDoc } from "../../sample_structs";
import { useGroups } from "../../hooks/useGroups";
import { useAuth } from "../../hooks/useAuth";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { groupRepository } from '../../repositories/GroupRepository';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

type GroupsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Groups'>;

interface Props {
  navigation: GroupsViewNavigationProp;
}

const GroupsView: React.FC<Props> = ({ navigation }) => {
  const { authUser } = useAuth();
  const { groups, groupsLoading } = useGroups();
  const [removeMode, setRemoveMode] = useState(false);
  const [groupMembers, setGroupMembers] = useState<{ [groupId: string]: string[] }>({});

  // Fetch member initials for all groups
  useEffect(() => {
    const fetchAllGroupMembers = async () => {
      const membersMap: { [groupId: string]: string[] } = {};
      
      for (const group of groups) {
        if (group.id && group.member_ids) {
          const initials: string[] = [];
          
          // Fetch each member's details
          for (const memberId of group.member_ids.slice(0, 5)) { // Limit to 5 for display
            try {
              const userDoc = doc(db, 'users', memberId);
              const userSnap = await getDoc(userDoc);
              
              if (userSnap.exists()) {
                const userData = userSnap.data();
                const initial = userData.user_name?.charAt(0).toUpperCase() || '?';
                initials.push(initial);
              }
            } catch (error) {
              console.error('Error fetching user:', error);
              initials.push('?');
            }
          }
          
          membersMap[group.id] = initials;
        }
      }
      
      setGroupMembers(membersMap);
    };
    
    if (groups.length > 0) {
      fetchAllGroupMembers();
    }
  }, [groups]);

  if (!authUser) {
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
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#000' }}>My Groups</Text>
        </LinearGradient>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="people-outline" size={80} color="#C0B0D0" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#8070A0', textAlign: 'center', marginBottom: 12 }}>
            Please sign in to create groups!
          </Text>
          <Text style={{ fontSize: 14, color: '#B0A0C0', textAlign: 'center', marginBottom: 24 }}>
            Sign in to start creating groups and watching with friends
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
      </View>
    );
  }

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

  const renderGroupCircle = (name: string, onPress: () => void, memberInitials?: string[], isAction?: boolean, group?: GroupDoc) => {
    if (removeMode && isAction) {
      return null;
    }

    // Get real member initials if available
    const initials = group?.id ? (groupMembers[group.id] || ['?', '?']) : memberInitials || ['?', '?'];

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
                  {initials.slice(0, 5).map((initial, idx) => (
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
          {renderGroupCircle('Join Group', () => navigation.navigate('JoinGroup'), undefined, true)}
          {renderGroupCircle('New Group', () => navigation.navigate('NewGroup'), undefined, true)}
          
          {groups.map((group) => (
            <React.Fragment key={group.id}>
              {renderGroupCircle(
                group.name,
                () => removeMode 
                  ? handleLeaveGroup(group)
                  : navigation.navigate('GroupDetail', { groupId: group }),
                undefined,
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