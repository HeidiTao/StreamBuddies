import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPosterUrl } from '../../../utils/tmdbApi';
import type { GroupMovie } from '../GroupDetailView';

type Props = {
  visible: boolean;
  onClose: () => void;
  groupCurrentlyWatching?: GroupMovie[];
  currentlyWatchingDetails: any[];
  onMoveToFinished: (movie: GroupMovie) => void;
};

const MoveToFinishedModal: React.FC<Props> = ({
  visible,
  onClose,
  groupCurrentlyWatching,
  currentlyWatchingDetails,
  onMoveToFinished,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            width: '85%',
            maxHeight: '70%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#4b4b7a',
              }}
            >
              Mark as Finished
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6e7bb7" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Select a movie/show from Currently Watching to mark as
            finished:
          </Text>

          <ScrollView>
            {groupCurrentlyWatching && groupCurrentlyWatching.length > 0 ? (
              groupCurrentlyWatching.map((movie) => {
                const displayItem = currentlyWatchingDetails.find(
                  (item) => item.id === movie.tmdb_id
                );
                const displayTitle =
                  displayItem?.name ||
                  displayItem?.title ||
                  movie.title;

                return (
                  <TouchableOpacity
                    key={movie.tmdb_id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: '#f7f7ff',
                      borderRadius: 12,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#e3e3f7',
                    }}
                    onPress={() => onMoveToFinished(movie)}
                  >
                    <Image
                      source={{ uri: getPosterUrl(movie.poster_path) }}
                      style={{
                        width: 50,
                        height: 75,
                        borderRadius: 6,
                        marginRight: 12,
                      }}
                      resizeMode="cover"
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: '500',
                        color: '#4b4b7a',
                      }}
                    >
                      {displayTitle}
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4CAF50"
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text
                  style={{
                    color: '#aaa',
                    fontStyle: 'italic',
                  }}
                >
                  No movies in Currently Watching
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default MoveToFinishedModal;
