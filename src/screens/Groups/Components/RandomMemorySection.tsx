import React from 'react';
import { View, Text } from 'react-native';
import type { GroupComment } from '../GroupDetailView';

type Props = {
  randomMemory: GroupComment | null;
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

const RandomMemorySection: React.FC<Props> = ({ randomMemory }) => {
  return (
    <View style={{ marginTop: 18, marginHorizontal: 10 }}>
      <Text style={{ fontWeight: '600', fontSize: 16 }}>
        Random Memory
      </Text>
      {randomMemory ? (
        <View
          style={{
            backgroundColor: '#f7f7ff',
            borderRadius: 12,
            padding: 12,
            marginTop: 8,
            borderWidth: 1,
            borderColor: '#bcbcff',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <Text style={{ color: '#6e7bb7', fontWeight: '600' }}>
              {randomMemory.user_name} commented:
            </Text>
            <Text
              style={{ color: '#bcbcff', fontSize: 12 }}
            >
              {getRelativeTime(randomMemory.timestamp)}
            </Text>
          </View>
          {randomMemory.movie_title && (
            <Text
              style={{
                color: '#6e7bb7',
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              on {randomMemory.movie_title}
            </Text>
          )}
          <Text
            style={{
              fontStyle: 'italic',
              color: '#4b4b7a',
            }}
          >
            "{randomMemory.text}"
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#f7f7ff',
            borderRadius: 12,
            padding: 12,
            marginTop: 8,
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
            No comments have been made yet!
          </Text>
        </View>
      )}
    </View>
  );
};

export default RandomMemorySection;
