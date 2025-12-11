import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  groupName: string;
  code: string;
  onLeaveGroup: () => void;
  onFindNewMedia: () => void;
};

const GroupHeader: React.FC<Props> = ({
  groupName,
  code,
  onLeaveGroup,
  onFindNewMedia,
}) => {
  return (
    <View
      style={{
        padding: 18,
        paddingTop: 70,
        marginTop: -40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(199,199,247,0.3)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    >
      <View>
        <Text
          style={{ fontSize: 25, fontWeight: '600', color: '#bcbcff' }}
        >
          {groupName}
        </Text>
        {code ? (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 12, color: '#6e7bb7' }}>Group Code</Text>
            <View style={{ marginTop: 4 }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e3e3f7',
                  alignSelf: 'flex-start',
                }}
              >
                <Text
                  style={{ fontWeight: '700', color: '#4b4b7a' }}
                >
                  {code}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#ffeaea',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 16,
            marginBottom: 8,
            alignSelf: 'flex-end',
          }}
          onPress={onLeaveGroup}
        >
          <Text style={{ color: '#e57373', fontWeight: '600' }}>
            Leave Group
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#e3f6ff',
            borderRadius: 12,
            paddingVertical: 6,
            paddingHorizontal: 14,
            alignSelf: 'flex-end',
          }}
          onPress={onFindNewMedia}
        >
          <Text style={{ color: '#6e7bb7', fontWeight: '500' }}>
            Find New Media
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GroupHeader;
