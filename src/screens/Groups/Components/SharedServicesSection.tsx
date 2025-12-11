import React from 'react';
import { View, Text } from 'react-native';

const streamingServiceColors: { [key: string]: string } = {
  Netflix: '#E50914',
  Hulu: '#1CE783',
  'HBO Max': '#B47EFF',
  'Disney+': '#113CCF',
  'Prime Video': '#00A8E1',
  'Apple TV+': '#676767ff',
  Peacock: '#000000',
  'Paramount+': '#0064FF',
};

type Props = {
  sharedServices: string[];
};

const SharedServicesSection: React.FC<Props> = ({ sharedServices }) => {
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
      <Text style={{ fontWeight: '500', marginBottom: 6 }}>
        Shared Services
      </Text>
      {sharedServices.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {sharedServices.map((service) => (
            <View
              key={service}
              style={{
                backgroundColor:
                  streamingServiceColors[service] || '#bcbcff',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginRight: 8,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {service}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: '#aaa', fontStyle: 'italic' }}>
          No shared streaming services. Members can add their services in
          their profile.
        </Text>
      )}
    </View>
  );
};

export default SharedServicesSection;
