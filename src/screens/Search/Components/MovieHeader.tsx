import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { movieDetailsStyles } from '../../../styles/searchStyles';

type Props = {
  title: string;
  poster_path: string | null | undefined;
  onBack: () => void;
};

const MovieHeader: React.FC<Props> = ({ title, poster_path, onBack }) => {
  return (
    <LinearGradient
      colors={['#FFB3D9', '#B3D9FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={movieDetailsStyles.headerGradient}
    >
      {/* Back Button */}
      <View style={movieDetailsStyles.headerTop}>
        <TouchableOpacity
          style={movieDetailsStyles.backButton}
          onPress={onBack}
        >
          <View style={movieDetailsStyles.backButtonCircle}>
            <Text style={movieDetailsStyles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={movieDetailsStyles.movieTitle}>{title}</Text>

      {/* Poster */}
      <View style={movieDetailsStyles.posterContainer}>
        {poster_path ? (
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${poster_path}`,
            }}
            style={movieDetailsStyles.posterImage}
          />
        ) : (
          <View
            style={[
              movieDetailsStyles.posterImage,
              movieDetailsStyles.noPoster,
            ]}
          >
            <Ionicons name="film-outline" size={80} color="#ccc" />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default MovieHeader;
