import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { GroupDoc } from "../../sample_structs";
import { styles } from "../../styles/groupStyles";

interface Props {
  group: GroupDoc;
  onPress: () => void;
}

const GroupRowView: React.FC<Props> = ({ group, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.circle, { backgroundColor: '#dfd6ff' }]}>
        <View>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.name !== 'Create New Group' && (
            <View style={styles.membersRow}>
              <View style={styles.memberCircle}>
                <Text style={styles.memberText}>S</Text>
              </View>
              <View style={styles.memberCircle}>
                <Text style={styles.memberText}>M</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.groupName}>{group.name}</Text>
    </TouchableOpacity>
  );
};

export default GroupRowView;