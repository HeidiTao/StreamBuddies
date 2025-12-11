import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPosterUrl } from '../../../utils/tmdbApi';

type Props = {
  currentlyWatching: any[];
  onNavigateToDiscover: () => void;
};

const CurrentlyWatchingSection: React.FC<Props> = ({
  currentlyWatching,
  onNavigateToDiscover,
}) => {
  return (
    <View style={{ marginTop: 18, marginHorizontal: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontWeight: '600', fontSize: 16 }}>
          Currently Watching
        </Text>
        <TouchableOpacity
          onPress={onNavigateToDiscover}
          style={{ padding: 4 }}
        >
          <Ionicons name="add-circle" size={28} color="#6e7bb7" />
        </TouchableOpacity>
      </View>
      {currentlyWatching.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {currentlyWatching.map((item) => (
            <View key={item.id} style={{ width: 90, marginRight: 8 }}>
              <Image
                source={{ uri: getPosterUrl(item.poster_path) }}
                style={{ width: 90, height: 135, borderRadius: 8 }}
                resizeMode="cover"
              />
              <Text
                style={{
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {item.name || item.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity
          onPress={onNavigateToDiscover}
          style={{
            backgroundColor: '#f7f7ff',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#e3e3f7',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color="#6e7bb7"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{ color: '#6e7bb7', fontWeight: '500' }}
          >
            Find movies to watch with your group!
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CurrentlyWatchingSection;
