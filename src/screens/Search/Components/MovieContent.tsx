import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { movieDetailsStyles } from '../../../styles/searchStyles';
import AddToListButton from './AddToListButton';
import type { StreamingProvider } from '../MovieDetailSearchView';

type Props = {
  year: string;
  runtime: number;
  media_type: 'movie' | 'tv';
  genres: string[];
  overview: string;
  certification?: string;
  vote_count?: number;
  streaming_providers: StreamingProvider[];
  movieId: number;
  renderStars: () => React.ReactNode;
  showAddToGroupButton: boolean;
  onPressAddToGroup: () => void;
  onPressLogWatchTime: () => void;
};

const MovieContent: React.FC<Props> = ({
  year,
  runtime,
  media_type,
  genres,
  overview,
  certification,
  vote_count,
  streaming_providers,
  movieId,
  renderStars,
  showAddToGroupButton,
  onPressAddToGroup,
  onPressLogWatchTime,
}) => {
  const formatVoteCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes || minutes === 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <>
      {/* Star Rating */}
      <View style={movieDetailsStyles.ratingContainer}>
        {renderStars()}
      </View>

      {/* Year */}
      <Text style={movieDetailsStyles.year}>{year}</Text>

      {/* Runtime */}
      {runtime > 0 && (
        <View style={movieDetailsStyles.runtimeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={movieDetailsStyles.runtimeText}>
            {formatRuntime(runtime)}{' '}
            {media_type === 'tv' ? '(per episode avg)' : ''}
          </Text>
        </View>
      )}

      {/* Genres */}
      {genres.length > 0 && (
        <View style={movieDetailsStyles.genresContainer}>
          {genres.map((genre, index) => (
            <View key={index} style={movieDetailsStyles.genreTag}>
              <Text style={movieDetailsStyles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      <View style={movieDetailsStyles.descriptionContainer}>
        <Text style={movieDetailsStyles.descriptionTitle}>Description:</Text>
        <Text style={movieDetailsStyles.descriptionText}>{overview}</Text>
      </View>

      {/* Movie Info Section */}
      <View style={movieDetailsStyles.movieInfoContainer}>
        {/* Certification (Rating) */}
        {certification && (
          <View style={movieDetailsStyles.infoSection}>
            <Text style={movieDetailsStyles.infoLabel}>Rating:</Text>
            <View style={movieDetailsStyles.certificationBadge}>
              <Text style={movieDetailsStyles.certificationText}>
                {certification}
              </Text>
            </View>
          </View>
        )}

        {/* Vote Count */}
        {vote_count !== undefined && vote_count > 0 && (
          <View style={movieDetailsStyles.infoSection}>
            <Text style={movieDetailsStyles.infoLabel}>Votes:</Text>
            <View style={movieDetailsStyles.voteContainer}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={movieDetailsStyles.voteText}>
                {formatVoteCount(vote_count)}
              </Text>
            </View>
          </View>
        )}

        {/* Streaming Providers */}
        {streaming_providers.length > 0 && (
          <View style={movieDetailsStyles.infoSection}>
            <Text style={movieDetailsStyles.infoLabel}>Available On:</Text>
            <View style={movieDetailsStyles.providersContainer}>
              {streaming_providers.map((provider, index) => (
                <Text
                  key={provider.provider_id}
                  style={movieDetailsStyles.providerText}
                >
                  {provider.provider_name}
                  {index < streaming_providers.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={{ marginTop: 10, marginBottom: 6 }}>
        <AddToListButton itemId={movieId} />
      </View>

      {/* Add to Group Button */}
      {showAddToGroupButton && (
        <TouchableOpacity
          style={movieDetailsStyles.addToGroupButton}
          onPress={onPressAddToGroup}
        >
          <Ionicons name="people-outline" size={24} color="#fff" />
          <Text style={movieDetailsStyles.addToGroupText}>
            Add to Group
          </Text>
        </TouchableOpacity>
      )}

      {/* Log Watch Time Button */}
      <TouchableOpacity
        style={movieDetailsStyles.logWatchTimeButton}
        onPress={onPressLogWatchTime}
      >
        <Ionicons name="time-outline" size={24} color="#fff" />
        <Text style={movieDetailsStyles.logWatchTimeText}>
          Log Watch Time
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default MovieContent;
