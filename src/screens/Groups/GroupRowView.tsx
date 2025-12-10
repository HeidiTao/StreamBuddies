import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { GroupDoc } from "../../sample_structs";
import { styles } from "../../styles/groupStyles";
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Props {
  group: GroupDoc;
  onPress: () => void;
}

const GroupRowView: React.FC<Props> = ({ group, onPress }) => {
  const [memberInitials, setMemberInitials] = useState<string[]>([]);

  useEffect(() => {
    const fetchMemberInitials = async () => {
      if (!group.member_ids || group.member_ids.length === 0) {
        setMemberInitials(['?', '?']);
        return;
      }

      const initials: string[] = [];
      
      // Fetch first 2 members for display
      for (const memberId of group.member_ids.slice(0, 2)) {
        try {
          const userDoc = doc(db, 'users', memberId);
          const userSnap = await getDoc(userDoc);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const initial = userData.user_name?.charAt(0).toUpperCase() || '?';
            initials.push(initial);
          } else {
            initials.push('?');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          initials.push('?');
        }
      }
      
      setMemberInitials(initials);
    };

    fetchMemberInitials();
  }, [group.member_ids]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.circle, { backgroundColor: '#dfd6ff' }]}>
        <View>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.name !== 'Create New Group' && (
            <View style={styles.membersRow}>
              {memberInitials.map((initial, idx) => (
                <View key={idx} style={styles.memberCircle}>
                  <Text style={styles.memberText}>{initial}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <Text style={styles.groupName}>{group.name}</Text>
    </TouchableOpacity>
  );
};

export default GroupRowView;