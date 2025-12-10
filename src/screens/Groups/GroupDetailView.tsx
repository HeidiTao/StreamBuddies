import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { styles } from '../../styles/groupStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { fetchTMDBDetails, getPosterUrl } from '../../utils/tmdbApi';
import { groupRepository } from '../../repositories/GroupRepository';
import { UserDoc } from '../../sample_structs';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

const streamingServiceColors: { [key: string]: string } = {
  'Netflix': '#E50914',
  'Hulu': '#1CE783',
  'HBO Max': '#B47EFF',
  'Disney+': '#113CCF',
  'Prime Video': '#00A8E1',
  'Apple TV+': '#676767ff',
  'Peacock': '#000000',
  'Paramount+': '#0064FF',
};

export default function GroupDetailView({ route, navigation }: Props) {
  const group = route.params?.groupId;
  const code = group?.code ? String(group.code).toUpperCase() : (group?.id ? String(group.id).slice(0, 6).toUpperCase() : '');

  // ALL STATE DECLARATIONS
  const [currentlyWatching, setCurrentlyWatching] = useState<any[]>([]);
  const [finished, setFinished] = useState<any[]>([]);
  const [members, setMembers] = useState<UserDoc[]>([]);
  const [sharedServices, setSharedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{
    id: string;
    user_id: string;
    user_name: string;
    text: string;
    movie_id?: number;
    movie_title?: string;
    timestamp: number;
  }>>([]);
  const [randomMemory, setRandomMemory] = useState<any>(null);

  // Fetch members and calculate shared streaming services
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!group?.id) return;
      
      try {
        const result = await groupRepository.getGroupWithMembers(group.id);
        
        if (result) {
          setMembers(result.members);
          
          // Calculate shared streaming services
          if (result.members.length > 0) {
            const allServices = new Set<string>();
            result.members.forEach(member => {
              member.streaming_services?.forEach(service => allServices.add(service as string));
            });
            
            const shared = Array.from(allServices).filter(service => {
              return result.members.every(member => 
                member.streaming_services?.includes(service as any)
              );
            });
            
            setSharedServices(shared);
          }
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupData();
  }, [group?.id]);

  // Fetch movie/show details only if group has content
  useEffect(() => {
    async function fetchMovies(items: Array<{ tmdb_id: number; title?: string; poster_path?: string }>, setter: (data: any[]) => void) {
      if (!items || items.length === 0) {
        setter([]);
        return;
      }
      
      try {
        const results = await Promise.all(
          items.map(item => fetchTMDBDetails(item.tmdb_id, 'tv').catch(() => fetchTMDBDetails(item.tmdb_id, 'movie')))
        );
        setter(results);
      } catch (e) {
        setter([]);
      }
    }
    
    if (group?.currently_watching && group.currently_watching.length > 0) {
      fetchMovies(group.currently_watching, setCurrentlyWatching);
    } else {
      setCurrentlyWatching([]);
    }
    
    if (group?.finished && group.finished.length > 0) {
      fetchMovies(group.finished, setFinished);
    } else {
      setFinished([]);
    }
  }, [group]);

  // Load comments from group
  useEffect(() => {
    if (group?.comments) {
      setComments(group.comments);
    } else {
      setComments([]);
    }
  }, [group?.comments]);

  // Calculate random memory (updates once per day)
  useEffect(() => {
    if (comments.length === 0) {
      setRandomMemory(null);
      return;
    }

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % comments.length;
    setRandomMemory(comments[index]);
  }, [comments]);

  const handleLeaveGroup = async () => {
    if (!group?.id) return;
    try {
      await groupRepository.deleteGroup(group.id);
      navigation.goBack();
    } catch (e) {
      alert('Failed to leave group.');
    }
  };

  const navigateToDiscover = () => {
    navigation.getParent()?.navigate('ExploreTab');
  };

  const handleAddComment = () => {
    setShowCommentModal(true);
    setSelectedMovie(null);
    setCommentText('');
  };

  const handleCloseModal = () => {
    Keyboard.dismiss();
    setShowCommentModal(false);
    setSelectedMovie(null);
    setCommentText('');
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    // TODO: Save comment to Firestore
    console.log('Comment:', {
      movie: selectedMovie,
      text: commentText,
      groupId: group?.id,
    });
    
    alert('Comment submitted! (Feature coming soon)');
    handleCloseModal();
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    return 'Today';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#bcbcff" />
        <Text style={{ marginTop: 10, color: '#6e7bb7' }}>Loading group...</Text>
      </View>
    );
  }

  // Rest of your JSX...

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
        {/* Header */}
        <View style={{ 
          padding: 18, 
          paddingTop: 70, 
          marginTop: -40,
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          backgroundColor: 'rgba(199,199,247,0.3)', 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12 
        }}>
          <View>
            <Text style={{ fontSize: 25, fontWeight: '600', color: '#bcbcff' }}>{group?.name ?? 'Group'}</Text>
            {code ? (
              <View style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 12, color: '#6e7bb7' }}>Group Code</Text>
                <View style={{ marginTop: 4 }}>
                  <View style={{ backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e3e3f7', alignSelf: 'flex-start' }}>
                    <Text style={{ fontWeight: '700', color: '#4b4b7a' }}>{code}</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#ffeaea', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 8, alignSelf: 'flex-end' }}
              onPress={handleLeaveGroup}
            >
              <Text style={{ color: '#e57373', fontWeight: '600' }}>Leave Group</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ backgroundColor: '#e3f6ff', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-end' }}
              onPress={navigateToDiscover}
            >
              <Text style={{ color: '#6e7bb7', fontWeight: '500' }}>Find New Media</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members Section */}
        <View style={{ marginTop: 18, marginHorizontal: 10, backgroundColor: '#f7f7ff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e3e3f7' }}>
          <Text style={{ fontWeight: '500', marginBottom: 8 }}>Members</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {members.map((member, idx) => (
              <View key={member.id} style={{ alignItems: 'center', marginRight: 12, marginBottom: 8 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(200, 190, 240, 0.6)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>
                    {member.user_name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: '#666', marginTop: 2, maxWidth: 50 }} numberOfLines={1}>
                  {member.user_name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Shared Services */}
        <View style={{ marginTop: 18, marginHorizontal: 10, backgroundColor: '#f7f7ff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e3e3f7' }}>
          <Text style={{ fontWeight: '500', marginBottom: 6 }}>Shared Services</Text>
          {sharedServices.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {sharedServices.map((service) => (
                <View 
                  key={service} 
                  style={{ 
                    backgroundColor: streamingServiceColors[service] || '#bcbcff', 
                    borderRadius: 8, 
                    paddingHorizontal: 12, 
                    paddingVertical: 4, 
                    marginRight: 8,
                    marginBottom: 6
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{service}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: '#aaa', fontStyle: 'italic' }}>
              No shared streaming services. Members can add their services in their profile.
            </Text>
          )}
        </View>

        {/* Currently Watching */}
        <View style={{ marginTop: 18, marginHorizontal: 10 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Currently Watching {'>'}</Text>
          {currentlyWatching.length > 0 ? (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {currentlyWatching.map((item) => (
                <View key={item.id} style={{ width: 90, marginRight: 8 }}>
                  <Image 
                    source={{ uri: getPosterUrl(item.poster_path) }} 
                    style={{ width: 90, height: 135, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                  <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }} numberOfLines={2}>
                    {item.name || item.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity 
              onPress={navigateToDiscover}
              style={{ 
                backgroundColor: '#f7f7ff', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1, 
                borderColor: '#e3e3f7',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="search-outline" size={20} color="#6e7bb7" style={{ marginRight: 8 }} />
              <Text style={{ color: '#6e7bb7', fontWeight: '500' }}>
                Find movies to watch with your group!
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Finished */}
        <View style={{ marginTop: 18, marginHorizontal: 10 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Finished {'>'}</Text>
          {finished.length > 0 ? (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {finished.map((item) => (
                <View key={item.id} style={{ width: 90, marginRight: 8 }}>
                  <Image 
                    source={{ uri: getPosterUrl(item.poster_path) }} 
                    style={{ width: 90, height: 135, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                  <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }} numberOfLines={2}>
                    {item.name || item.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity 
              onPress={navigateToDiscover}
              style={{ 
                backgroundColor: '#f7f7ff', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1, 
                borderColor: '#e3e3f7',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="search-outline" size={20} color="#6e7bb7" style={{ marginRight: 8 }} />
              <Text style={{ color: '#6e7bb7', fontWeight: '500' }}>
                Find movies to watch with your group!
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments (formerly Predictions) */}
        <View style={{ marginTop: 18, marginHorizontal: 10 }}>
          <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Comments {'>'}</Text>
          {comments.length > 0 ? (
            <View>
              {comments.map((comment) => (
                <View 
                  key={comment.id} 
                  style={{ 
                    backgroundColor: '#f7f7ff', 
                    borderRadius: 8, 
                    padding: 10, 
                    marginBottom: 8 
                  }}
                >
                  {comment.movie_title && (
                    <Text style={{ color: '#4b4b7a', fontWeight: '600', fontSize: 12, marginBottom: 2 }}>
                      {comment.movie_title}
                    </Text>
                  )}
                  <Text style={{ color: '#4b4b7a', fontWeight: '600' }}>
                    {comment.user_name} - {comment.text}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleAddComment}
              style={{ 
                backgroundColor: '#f7f7ff', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1, 
                borderColor: '#e3e3f7',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#6e7bb7" style={{ marginRight: 8 }} />
              <Text style={{ color: '#6e7bb7', fontWeight: '500' }}>
                Add a comment!
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Random Memory */}
        <View style={{ marginTop: 18, marginHorizontal: 10 }}>
          <Text style={{ fontWeight: '600', fontSize: 16 }}>Random Memory</Text>
          {randomMemory ? (
            <View style={{ backgroundColor: '#f7f7ff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#bcbcff' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#6e7bb7', fontWeight: '600' }}>
                  {randomMemory.user} commented:
                </Text>
                <Text style={{ color: '#bcbcff', fontSize: 12 }}>
                  {getRelativeTime(randomMemory.timestamp)}
                </Text>
              </View>
              {randomMemory.movie && (
                <Text style={{ color: '#6e7bb7', fontSize: 12, marginBottom: 4 }}>
                  on {randomMemory.movie}
                </Text>
              )}
              <Text style={{ fontStyle: 'italic', color: '#4b4b7a' }}>
                "{randomMemory.text}"
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: '#f7f7ff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#e3e3f7' }}>
              <Text style={{ color: '#aaa', textAlign: 'center', fontStyle: 'italic' }}>
                No comments have been made yet!
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={{ 
              flex: 1, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              justifyContent: 'flex-end' 
            }}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={{ 
                  backgroundColor: '#fff', 
                  borderTopLeftRadius: 20, 
                  borderTopRightRadius: 20, 
                  padding: 20,
                  maxHeight: '80%'
                }}>
                  {/* Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: '600', color: '#4b4b7a' }}>Add Comment</Text>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Ionicons name="close" size={28} color="#6e7bb7" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Select Movie */}
                    <Text style={{ fontWeight: '500', marginBottom: 8, color: '#4b4b7a' }}>
                      Select a movie/show <Text style={{ color: '#aaa' }}>(optional)</Text>
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
                              borderColor: selectedMovie?.id === item.id ? '#bcbcff' : 'transparent',
                              borderRadius: 8,
                              padding: 2,
                            }}
                          >
                            <Image 
                              source={{ uri: getPosterUrl(item.poster_path) }} 
                              style={{ width: 70, height: 105, borderRadius: 6 }}
                              resizeMode="cover"
                            />
                            <Text style={{ 
                              fontSize: 10, 
                              textAlign: 'center', 
                              marginTop: 4, 
                              maxWidth: 70,
                              fontWeight: selectedMovie?.id === item.id ? '600' : '400'
                            }} numberOfLines={2}>
                              {item.name || item.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={{ 
                        backgroundColor: '#f7f7ff', 
                        borderRadius: 8, 
                        padding: 12, 
                        marginBottom: 20,
                        borderWidth: 1,
                        borderColor: '#e3e3f7'
                      }}>
                        <Text style={{ color: '#aaa', textAlign: 'center', fontStyle: 'italic' }}>
                          No movies in "Currently Watching". Add some first!
                        </Text>
                      </View>
                    )}

                    {/* Comment Text */}
                    <Text style={{ fontWeight: '500', marginBottom: 8, color: '#4b4b7a' }}>Your comment</Text>
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

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#bcbcff',
                        borderRadius: 10,
                        paddingVertical: 14,
                        alignItems: 'center',
                        marginBottom: 20,
                      }}
                      onPress={handleSubmitComment}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Submit Comment</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}