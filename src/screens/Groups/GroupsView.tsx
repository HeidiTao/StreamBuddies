import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import React from "react";
import { GroupDoc } from "../../sample_structs";
import { useGroups } from "../../hooks/useGroups";
import { styles } from "../../styles/groupStyles";
import { Ionicons } from '@expo/vector-icons';

type GroupsViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Groups'>;

interface Props {
  navigation: GroupsViewNavigationProp;
}

const GroupsView: React.FC<Props> = ({ navigation }) => {
  const { groups, groupsLoading } = useGroups();

  // Mock member initials for demo; replace with real group member usernames if available
  const mockInitials = [
    ['A', 'B'],
    ['Q', 'C', 'M', 'S', 'W'],
    ['R', 'I', 'H'],
    ['J', 'K', 'L', 'M', 'N'],
    ['E', 'F', 'G'],
    ['P', 'O'],
    ['U', 'V', 'W', 'X', 'Y'],
  ];

  const renderGroupCircle = (name: string, color: string, onPress: () => void, memberInitials?: string[]) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.circle, { backgroundColor: color }]}> 
          {name === 'Join Group' || name === 'New Group' ? (
            <Text style={[styles.groupName, { marginTop: 0, fontSize: 54, lineHeight: 60 }]}>+</Text>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={[styles.membersRow, { flexWrap: 'wrap', justifyContent: 'center' }]}> 
                {(memberInitials || ['A', 'B']).slice(0, 5).map((initial, idx) => (
                  <View key={idx} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', margin: 2, position: 'relative' }}>
                    {/* full blue circle centered behind the purple initial circle (filled) */}
                    <View style={{ position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#d6ecff', alignSelf: 'center', zIndex: 0 }} />
                    {/* smaller purple circle on top so blue shows around it */}
                    <View style={[styles.memberCircle, { zIndex: 1, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={[styles.memberText, { fontSize: 11 }]}>{initial}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        <Text style={styles.groupName}>{name}</Text>
      </TouchableOpacity>
    );
  };

  if (groupsLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {renderGroupCircle('Join Group', '#f5d6f7', () => navigation.navigate('JoinGroup'))}
        {renderGroupCircle('New Group', '#f1e0f8', () => navigation.navigate('NewGroup'))}
        {groups.map((group, idx) => (
          <React.Fragment key={group.id}>
            {renderGroupCircle(
              group.name,
              '#dfd6ff',
              () => navigation.navigate('GroupDetail', { group }),
              mockInitials[idx % mockInitials.length]
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default GroupsView;