import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { userRepository } from '../../repositories/UserRepository';
import { UserDoc } from '../../sample_structs';
import { useGroups } from '../../hooks/useGroups';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { fetchTMDBDetails, getPosterUrl } from '../../utils/tmdbApi';

const ProfileView = () => {
  const navigation = useNavigation();
  const { authUser } = useAuth();
  const { groups } = useGroups();
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        const user = await userRepository.getUser(authUser.uid);
        setUserData(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  // Fetch watch history from all groups the user is in
  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!authUser || groups.length === 0) {
        setWatchHistory([]);
        return;
      }

      try {
        // Collect all unique finished movies from all user's groups
        const finishedMoviesMap = new Map();
        
        groups.forEach(group => {
          if (group.finished && group.finished.length > 0) {
            group.finished.forEach(movie => {
              if (!finishedMoviesMap.has(movie.tmdb_id)) {
                finishedMoviesMap.set(movie.tmdb_id, movie);
              }
            });
          }
        });

        // Fetch details for all unique movies
        const finishedMovies = Array.from(finishedMoviesMap.values());
        
        if (finishedMovies.length > 0) {
          const movieDetails = await Promise.all(
            finishedMovies.slice(0, 10).map(async (movie) => {
              try {
                // Try fetching as TV show first, then movie
                const details = await fetchTMDBDetails(movie.tmdb_id, 'tv')
                  .catch(() => fetchTMDBDetails(movie.tmdb_id, 'movie'));
                return details;
              } catch (error) {
                console.error('Error fetching movie details:', error);
                return null;
              }
            })
          );

          setWatchHistory(movieDetails.filter(movie => movie !== null));
        }
      } catch (error) {
        console.error('Error fetching watch history:', error);
      }
    };

    fetchWatchHistory();
  }, [authUser, groups]);

  const lists = [
    // Empty for now - will show "No lists have been made"
  ];

  if (!authUser) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#E8D5F0', '#D5E8F8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >
          <Text style={styles.headerTitle}>Profile</Text>
        </LinearGradient>
        <View style={styles.centerContent}>
          <Ionicons name="person-outline" size={80} color="#C0B0D0" style={{ marginBottom: 20 }} />
          <Text style={styles.notSignedInText}>Please sign in to view your profile</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => {
              // Navigate to sign-in screen
              console.log('Navigate to sign in');
            }}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#bcbcff" style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#E8D5F0', '#D5E8F8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              // Navigate to edit profile screen
              console.log('Navigate to edit profile');
            }}
          >
            <Ionicons name="create-outline" size={24} color="#6e7bb7" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.profile_pic ? (
              <Image source={{ uri: userData.profile_pic }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData?.user_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData?.user_name || 'User'}</Text>
          <Text style={styles.phoneNumber}>{userData?.phone_number || 'No phone number'}</Text>
        </View>

        {/* Watch Stats Button */}
        <TouchableOpacity
          style={styles.watchStatsButton}
          onPress={() => (navigation as any).navigate('WatchStats')}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
          <Text style={styles.watchStatsButtonText}>View Watch Stats</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Streaming Services */}
        {userData?.streaming_services && userData.streaming_services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Streaming Services</Text>
            <View style={styles.servicesContainer}>
              {userData.streaming_services.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Watch History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          {watchHistory.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {watchHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <Image 
                    source={{ uri: getPosterUrl(item.poster_path) }} 
                    style={styles.historyPoster} 
                  />
                  <Text style={styles.historyTitle} numberOfLines={2}>
                    {item.name || item.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No watch history yet</Text>
            </View>
          )}
        </View>

        {/* Lists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lists</Text>
          {lists.length > 0 ? (
            <View>
              {lists.map((list: any) => (
                <View key={list.id} style={styles.listItem}>
                  <Text style={styles.listName}>{list.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateCardText}>No lists have been made</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  // Navigate to lists page
                  console.log('Navigate to lists page');
                }}
              >
                <Text style={styles.emptyStateButtonText}>Create a List</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Groups</Text>
          {groups.length > 0 ? (
            <View>
              {groups.slice(0, 3).map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupItem}
                  onPress={() => {
                    (navigation as any).navigate('GroupsTab');
                  }}
                >
                  <View style={styles.groupIcon}>
                    <Ionicons name="people" size={20} color="#bcbcff" />
                  </View>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
              {groups.length > 3 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={() => {
                    (navigation as any).navigate('GroupsTab');
                  }}
                >
                  <Text style={styles.seeMoreText}>See all {groups.length} groups</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateCardText}>No groups yet</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  (navigation as any).navigate('GroupsTab');
                }}
              >
                <Text style={styles.emptyStateButtonText}>Join or Create a Group</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            // Sign out logic
            console.log('Sign out');
          }}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6e7bb7',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notSignedInText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#C8BEF0',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bcbcff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#666',
  },
  watchStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  watchStatsButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  historyItem: {
    width: 100,
    marginRight: 12,
  },
  historyPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  historyTitle: {
    fontSize: 12,
    color: '#000',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyStateCard: {
    backgroundColor: '#f7f7ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e3e3f7',
  },
  emptyStateCardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#bcbcff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  listItem: {
    backgroundColor: '#f7f7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3e3f7',
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b4b7a',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e3e3f7',
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3e3f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4b4b7a',
  },
  seeMoreButton: {
    alignItems: 'center',
    padding: 12,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6e7bb7',
  },
  signOutButton: {
    marginHorizontal: 20,
    backgroundColor: '#ffeaea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e57373',
  },
});

export default ProfileView;