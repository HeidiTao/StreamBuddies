import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { movieDetailsStyles } from '../../../styles/searchStyles';

type Group = {
  id?: string;
  name: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  groups: Group[];
  onSelectGroup: (groupId: string) => void;
};

const GroupSelectionModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  groups,
  onSelectGroup,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={movieDetailsStyles.modalOverlay}>
        <View style={movieDetailsStyles.modalContent}>
          {/* Back Button */}
          <TouchableOpacity
            style={movieDetailsStyles.modalBackButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={movieDetailsStyles.modalBackButtonText}>
              Back
            </Text>
          </TouchableOpacity>

          <Text style={movieDetailsStyles.modalTitle}>Add to Group</Text>
          <Text style={movieDetailsStyles.modalSubtitle}>
            Select a group to add "{title}" to:
          </Text>

          <ScrollView style={movieDetailsStyles.groupList}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={movieDetailsStyles.groupItem}
                onPress={() => group.id && onSelectGroup(group.id)}
              >
                <View style={movieDetailsStyles.groupIconContainer}>
                  <Ionicons name="people" size={24} color="#bcbcff" />
                </View>
                <Text style={movieDetailsStyles.groupName}>
                  {group.name}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default GroupSelectionModal;
