import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { styles } from '../../styles/groupStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { fetchTMDBDetails, getPosterUrl } from '../../utils/tmdbApi';
import { groupRepository } from '../../repositories/GroupRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

const streamingServices = [
  { name: 'Netflix', color: '#ff5a5f' },
  { name: 'Hulu', color: '#b5e7b0' },
  { name: 'HboMax', color: '#c7c7f7' },
];

// Default content if group doesn't have any yet
const defaultCurrentlyWatching = [
  { tmdb_id: 1399, title: 'Game of Thrones', poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg' },
  { tmdb_id: 1396, title: 'Breaking Bad', poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg' },
  { tmdb_id: 60735, title: 'The Flash', poster_path: '/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg' },
  { tmdb_id: 1668, title: 'Friends', poster_path: '/f496cm9enuEsZkSPzCwnTESEK5s.jpg' },
];

const defaultFinished = [
  { tmdb_id: 1418, title: 'The Big Bang Theory', poster_path: '/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg' },
  { tmdb_id: 60625, title: 'Rick and Morty', poster_path: '/8kOWDBK6XlPUzckuHDo3wwVRFwt.jpg' },
  { tmdb_id: 4614, title: 'Friends', poster_path: '/f496cm9enuEsZkSPzCwnTESEK5s.jpg' },
  { tmdb_id: 79744, title: 'Wednesday', poster_path: '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg' },
];

const predictions = [
  { id: 2, user: 'Isabelle', text: 'I think Jess is gonna get with Winston', color: '#e3fbe3' },
  { id: 1, user: 'Jovanni', text: 'Is Paul gonna take over?', color: '#f3e3fb' },
];

export default function GroupDetailView({ route, navigation }: Props) {
  const group = route.params?.groupId;

  const code = group?.code ? String(group.code).toUpperCase() : (group?.id ? String(group.id).slice(0, 6).toUpperCase() : '');

  // Use group's content or fall back to defaults, always showing exactly 4
  const currentlyWatchingIds = group?.currently_watching?.slice(0, 4).map(item => item.tmdb_id) || defaultCurrentlyWatching.map(item => item.tmdb_id);
  const finishedIds = group?.finished?.slice(0, 4).map(item => item.tmdb_id) || defaultFinished.map(item => item.tmdb_id);

  const [currentlyWatching, setCurrentlyWatching] = useState<any[]>([]);
  const [finished, setFinished] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMovies(ids: number[], setter: (data: any[]) => void, type: 'movie' | 'tv') {
      try {
        const results = await Promise.all(ids.map(id => fetchTMDBDetails(id, type)));
        setter(results);
      } catch (e) {
        setter([]);
      }
    }
    // For demo, try as 'tv' first, fallback to 'movie' if needed
    fetchMovies(currentlyWatchingIds, setCurrentlyWatching, 'tv');
    fetchMovies(finishedIds, setFinished, 'tv');
  }, [group]);

  const handleLeaveGroup = async () => {
    if (!group?.id) return;
    try {
      await groupRepository.deleteGroup(group.id);
      navigation.goBack();
    } catch (e) {
      alert('Failed to leave group.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ padding: 18, paddingTop: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(199,199,247,0.3)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '600', color: '#bcbcff' }}>{group?.name ?? 'Group'}</Text>
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
            onPress={() => navigation.getParent()?.navigate('ExploreTab')}
          >
            <Text style={{ color: '#6e7bb7', fontWeight: '500' }}>Find New Media</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Currently Watching */}
      <View style={{ marginTop: 18, marginHorizontal: 10 }}>
        <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Currently Watching {'>'}</Text>
        <View style={{ flexDirection: 'row', paddingHorizontal: 4 }}>
          {currentlyWatching.length > 0 ? currentlyWatching.map((item) => (
            <View key={item.id} style={{ width: 90, marginRight: 8 }}>
              <Image 
                source={{ uri: getPosterUrl(item.poster_path) }} 
                style={{ width: 90, height: 135, borderRadius: 8 }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>{item.name || item.title}</Text>
            </View>
          )) : <Text>No data</Text>}
        </View>
      </View>
      {/* Shared Services */}
      <View style={{ marginTop: 18, marginHorizontal: 10, backgroundColor: '#f7f7ff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e3e3f7' }}>
        <Text style={{ fontWeight: '500', marginBottom: 6 }}>Shared Services</Text>
        <View style={{ flexDirection: 'row' }}>
          {streamingServices.map((s, idx) => (
            <View key={s.name} style={{ backgroundColor: s.color, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 }}>
              <Text style={{ color: '#444', fontWeight: '600' }}>{s.name}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Finished */}
      <View style={{ marginTop: 18, marginHorizontal: 10 }}>
        <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Finished {'>'}</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {finished.length > 0 ? finished.map((item) => (
            <View key={item.id} style={{ width: 90, marginRight: 8 }}>
              <Image 
                source={{ uri: getPosterUrl(item.poster_path) }} 
                style={{ width: 90, height: 135, borderRadius: 8 }}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>{item.name || item.title}</Text>
            </View>
          )) : <Text>No data</Text>}
        </ScrollView>
      </View>
      {/* Predictions */}
      <View style={{ marginTop: 18, marginHorizontal: 10 }}>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>Predictions {'>'}</Text>
        <View style={{ marginTop: 8 }}>
          <View style={{ backgroundColor: '#e3fbe3', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <Text style={{ color: '#4b8b4b', fontWeight: '600' }}>2. Isabelle - I think Jess is gonna get with Winston</Text>
          </View>
          <View style={{ backgroundColor: '#f3e3fb', borderRadius: 8, padding: 10 }}>
            <Text style={{ color: '#7b4b8b', fontWeight: '600' }}>1. Jovanni - Is Paul gonna take over?</Text>
          </View>
        </View>
      </View>
      {/* Random Memory */}
      <View style={{ marginTop: 18, marginHorizontal: 10 }}>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>Random Memory</Text>
        <View style={{ backgroundColor: '#f7f7ff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#bcbcff' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#6e7bb7', fontWeight: '600' }}>Arini predicted:</Text>
            <Text style={{ color: '#bcbcff', fontSize: 12 }}>4 months ago</Text>
          </View>
          <Text style={{ fontStyle: 'italic', marginBottom: 8 }}>
            "The sequel will be terrible"
          </Text>
          <View style={{ backgroundColor: '#e3fbe3', borderRadius: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2 }}>
            <Text style={{ color: '#4b8b4b', fontWeight: '600' }}>Correct!</Text>
          </View>
        </View>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}