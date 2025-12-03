import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchStats } from '../contexts/WatchStatsContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { stats } = useWatchStats();

  // Format minutes to hours and minutes
  const formatWatchTime = (minutes: number) => {
    if (minutes === 0) return { hours: 0, mins: 0, display: '0m' };
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return { hours, mins, display: `${hours}h ${mins}m` };
    } else if (hours > 0) {
      return { hours, mins, display: `${hours}h` };
    } else {
      return { hours, mins, display: `${mins}m` };
    }
  };

  const watchTime = formatWatchTime(stats.totalMinutesWatched);

  // Sample data - replace with your actual data
  const historyItems = [
    { id: 1, image: 'https://via.placeholder.com/100x150' },
    { id: 2, image: 'https://via.placeholder.com/100x150' },
    { id: 3, image: 'https://via.placeholder.com/100x150' },
  ];

  const myLists = [
    { id: 1, image: 'https://via.placeholder.com/100x150' },
    { id: 2, image: 'https://via.placeholder.com/100x150' },
    { id: 3, image: 'https://via.placeholder.com/100x150' },
    { id: 4, image: 'https://via.placeholder.com/100x150' },
    { id: 5, image: 'https://via.placeholder.com/100x150' },
    { id: 6, image: 'https://via.placeholder.com/100x150' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#999" />
          </View>
        </View>
        <Text style={styles.userName}>Isabelle Aris</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Watch Time Counter */}
      <View style={styles.watchTimeSection}>
        <View style={styles.watchTimeCard}>
          <View style={styles.watchTimeIconContainer}>
            <Ionicons name="play-circle" size={32} color="#007AFF" />
          </View>
          <View style={styles.watchTimeInfo}>
            <Text style={styles.watchTimeLabel}>Total Watch Time</Text>
            <Text style={styles.watchTimeValue}>{watchTime.display}</Text>
            <Text style={styles.watchTimeSubtext}>
              {stats.totalShowsWatched} {stats.totalShowsWatched === 1 ? 'show' : 'shows'} watched
            </Text>
          </View>
          <View style={styles.watchTimeProgressContainer}>
            <View style={styles.circularProgress}>
              <Text style={styles.progressNumber}>{stats.totalMinutesWatched}</Text>
              <Text style={styles.progressLabel}>mins</Text>
            </View>
          </View>
        </View>
      </View>

      {/* History Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {historyItems.map((item) => (
            <View key={item.id} style={styles.posterItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.posterImage}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* My Lists Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.sectionTitleWithPadding]}>My Lists</Text>
        <View style={styles.gridContainer}>
          {myLists.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.gridImage}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Watch Stats Button */}
      <TouchableOpacity
        style={styles.watchStatsButton}
        onPress={() => navigation.navigate('WatchStats' as never)}
      >
        <Text style={styles.watchStatsText}>My Watch Stats</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, // Adjust this value to move content up or down
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  viewAll: {
    color: '#007AFF',
    fontSize: 14,
  },
  watchTimeSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  watchTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4E4FF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  watchTimeIconContainer: {
    marginRight: 12,
  },
  watchTimeInfo: {
    flex: 1,
  },
  watchTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  watchTimeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
  },
  watchTimeSubtext: {
    fontSize: 11,
    color: '#999',
  },
  watchTimeProgressContainer: {
    marginLeft: 8,
  },
  circularProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitleWithPadding: {
    paddingHorizontal: 16,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  posterItem: {
    marginRight: 12,
  },
  posterImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: '31%',
    marginHorizontal: '1%',
    marginBottom: 12,
  },
  gridImage: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  watchStatsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#E8E3F5',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  watchStatsText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;