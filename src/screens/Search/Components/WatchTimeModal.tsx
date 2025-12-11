import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { movieDetailsStyles } from '../../../styles/searchStyles';

type Props = {
  visible: boolean;
  onClose: () => void;
  runtime: number;
  media_type: 'movie' | 'tv';
  hours: string;
  minutes: string;
  setHours: (value: string) => void;
  setMinutes: (value: string) => void;
  formatRuntime: (minutes: number) => string | null;
  onLogWatchTime: () => void;
  onLogWholeMovie: () => void;
};

const WatchTimeModal: React.FC<Props> = ({
  visible,
  onClose,
  runtime,
  media_type,
  hours,
  minutes,
  setHours,
  setMinutes,
  formatRuntime,
  onLogWatchTime,
  onLogWholeMovie,
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
          <Text style={movieDetailsStyles.modalTitle}>Log Watch Time</Text>
          <Text style={movieDetailsStyles.modalSubtitle}>
            How long did you watch?
            {runtime > 0 && (
              <Text style={{ color: '#666', fontSize: 12 }}>
                {'\n'}(Max: {formatRuntime(runtime)})
              </Text>
            )}
          </Text>

          <View style={movieDetailsStyles.timeInputContainer}>
            <View style={movieDetailsStyles.timeInputGroup}>
              <TextInput
                style={movieDetailsStyles.timeInput}
                placeholder="0"
                keyboardType="number-pad"
                value={hours}
                onChangeText={setHours}
                maxLength={3}
              />
              <Text style={movieDetailsStyles.timeLabel}>hours</Text>
            </View>

            <View style={movieDetailsStyles.timeInputGroup}>
              <TextInput
                style={movieDetailsStyles.timeInput}
                placeholder="0"
                keyboardType="number-pad"
                value={minutes}
                onChangeText={setMinutes}
                maxLength={2}
              />
              <Text style={movieDetailsStyles.timeLabel}>minutes</Text>
            </View>
          </View>

          {/* Log Whole Movie Button */}
          {runtime > 0 && (
            <TouchableOpacity
              style={movieDetailsStyles.logWholeButton}
              onPress={onLogWholeMovie}
            >
              <Text style={movieDetailsStyles.logWholeButtonText}>
                Log Whole {media_type === 'movie' ? 'Movie' : 'Episode'} (
                {formatRuntime(runtime)})
              </Text>
            </TouchableOpacity>
          )}

          <View style={movieDetailsStyles.modalButtons}>
            <TouchableOpacity
              style={[
                movieDetailsStyles.modalButton,
                movieDetailsStyles.cancelButton,
              ]}
              onPress={() => {
                setHours('');
                setMinutes('');
                onClose();
              }}
            >
              <Text style={movieDetailsStyles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                movieDetailsStyles.modalButton,
                movieDetailsStyles.submitButton,
              ]}
              onPress={onLogWatchTime}
            >
              <Text style={movieDetailsStyles.submitButtonText}>
                Log Time
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WatchTimeModal;
