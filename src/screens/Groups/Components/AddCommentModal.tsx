import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPosterUrl } from '../../../utils/tmdbApi';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentlyWatching: any[];
  selectedMovie: any;
  setSelectedMovie: (movie: any) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  onSubmitComment: () => void;
};

const AddCommentModal: React.FC<Props> = ({
  visible,
  onClose,
  currentlyWatching,
  selectedMovie,
  setSelectedMovie,
  commentText,
  setCommentText,
  onSubmitComment,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end',
            }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 20,
                  maxHeight: '80%',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: '#4b4b7a',
                    }}
                  >
                    Add Comment
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={28} color="#6e7bb7" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text
                    style={{
                      fontWeight: '500',
                      marginBottom: 8,
                      color: '#4b4b7a',
                    }}
                  >
                    Select a movie/show{' '}
                    <Text style={{ color: '#aaa' }}>(optional)</Text>
                  </Text>
                  {currentlyWatching.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginBottom: 20 }}
                    >
                      {currentlyWatching.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => setSelectedMovie(item)}
                          style={{
                            marginRight: 10,
                            borderWidth: 2,
                            borderColor:
                              selectedMovie?.id === item.id
                                ? '#bcbcff'
                                : 'transparent',
                            borderRadius: 8,
                            padding: 2,
                          }}
                        >
                          <Image
                            source={{ uri: getPosterUrl(item.poster_path) }}
                            style={{
                              width: 70,
                              height: 105,
                              borderRadius: 6,
                            }}
                            resizeMode="cover"
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              textAlign: 'center',
                              marginTop: 4,
                              maxWidth: 70,
                              fontWeight:
                                selectedMovie?.id === item.id
                                  ? '600'
                                  : '400',
                            }}
                            numberOfLines={2}
                          >
                            {item.name || item.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View
                      style={{
                        backgroundColor: '#f7f7ff',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20,
                        borderWidth: 1,
                        borderColor: '#e3e3f7',
                      }}
                    >
                      <Text
                        style={{
                          color: '#aaa',
                          textAlign: 'center',
                          fontStyle: 'italic',
                        }}
                      >
                        No movies in "Currently Watching". Add some first!
                      </Text>
                    </View>
                  )}

                  <Text
                    style={{
                      fontWeight: '500',
                      marginBottom: 8,
                      color: '#4b4b7a',
                    }}
                  >
                    Your comment
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#e3e3f7',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      minHeight: 100,
                      textAlignVertical: 'top',
                      marginBottom: 20,
                    }}
                    placeholder="What do you think will happen? Share your thoughts..."
                    placeholderTextColor="#bbb"
                    multiline
                    value={commentText}
                    onChangeText={setCommentText}
                  />

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#bcbcff',
                      borderRadius: 10,
                      paddingVertical: 14,
                      alignItems: 'center',
                      marginBottom: 20,
                    }}
                    onPress={onSubmitComment}
                  >
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: 16,
                      }}
                    >
                      Submit Comment
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddCommentModal;
