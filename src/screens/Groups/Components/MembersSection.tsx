import React from 'react';
import { View, Text } from 'react-native';
import { UserDoc } from '../../../sample_structs';

type Props = {
  members: UserDoc[];
};

const MembersSection: React.FC<Props> = ({ members }) => {
  return (
    <View
      style={{
        marginTop: 18,
        marginHorizontal: 10,
        backgroundColor: '#f7f7ff',
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e3e3f7',
      }}
    >
      <Text style={{ fontWeight: '500', marginBottom: 8 }}>Members</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {members.map((member) => (
          <View
            key={member.id}
            style={{
              alignItems: 'center',
              marginRight: 12,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(200, 190, 240, 0.6)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: '#fff',
                  fontWeight: '600',
                }}
              >
                {member.user_name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                color: '#666',
                marginTop: 2,
                maxWidth: 50,
              }}
              numberOfLines={1}
            >
              {member.user_name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MembersSection;
