import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GroupComment } from '../GroupDetailView';

type Props = {
  comments: GroupComment[];
  onAddComment: () => void;
};

const CommentsSection: React.FC<Props> = ({ comments, onAddComment }) => {
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
          Comments
        </Text>
        <TouchableOpacity onPress={onAddComment} style={{ padding: 4 }}>
          <Ionicons name="add-circle" size={28} color="#6e7bb7" />
        </TouchableOpacity>
      </View>
      {comments.length > 0 ? (
        <View>
          {comments.map((comment, index) => (
            <View
              key={comment.id}
              style={{
                backgroundColor:
                  index % 3 === 0
                    ? '#f3e3fb'
                    : index % 3 === 1
                    ? '#e3fbe3'
                    : '#ffe3e3',
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              {comment.movie_title && (
                <Text
                  style={{
                    color: '#4b4b7a',
                    fontWeight: '600',
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  {comment.movie_title}
                </Text>
              )}
              <Text
                style={{
                  color: '#4b4b7a',
                  fontWeight: '600',
                }}
              >
                {comment.user_name} - {comment.text}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <TouchableOpacity
          onPress={onAddComment}
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
            name="chatbubble-outline"
            size={20}
            color="#6e7bb7"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{ color: '#6e7bb7', fontWeight: '500' }}
          >
            Add a comment!
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CommentsSection;
