import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { styles } from '../../styles/groupStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { fetchTMDBDetails } from '../../utils/tmdbApi';
import { groupRepository } from '../../repositories/GroupRepository';
import { UserDoc, GroupDoc } from '../../sample_structs';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc, arrayUnion, onSnapshot, arrayRemove } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useWatchStats } from '../contexts/WatchStatsContext';

// Components
import GroupHeader from './Components/GroupHeader';
import MembersSection from './Components/MembersSection';
import SharedServicesSection from './Components/SharedServicesSection';
import CurrentlyWatchingSection from './Components/CurrentlyWatchingSection';
import FinishedSection from './Components/FinishedSection';
import CommentsSection from './Components/CommentsSection';
import RandomMemorySection from './Components/RandomMemorySection';
import MoveToFinishedModal from './Components/MoveToFinishedModal';
import AddCommentModal from './Components/AddCommentModal';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

export interface GroupMovie {
  tmdb_id: number;
  title: string;
  poster_path: string;
  media_type?: 'movie' | 'tv';
}

export type GroupComment = {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  movie_id?: number;
  movie_title?: string;
  timestamp: number;
};

export default function GroupDetailView({ route, navigation }: Props) {
  const initialGroup = route.params?.groupId;
  const { authUser } = useAuth();
  const { logWatchTime } = useWatchStats();

  const [group, setGroup] = useState<GroupDoc | null>(initialGroup);
  const code =
    group?.code
      ? String(group.code).toUpperCase()
      : group?.id
      ? String(group.id).slice(0, 6).toUpperCase()
      : '';

  const [currentlyWatching, setCurrentlyWatching] = useState<any[]>([]);
  const [finished, setFinished] = useState<any[]>([]);
  const [members, setMembers] = useState<UserDoc[]>([]);
  const [sharedServices, setSharedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<GroupComment[]>([]);
  const [randomMemory, setRandomMemory] = useState<GroupComment | null>(null);

  // Subscribe to real-time group updates
  useEffect(() => {
    if (!initialGroup?.id) return;

    const groupRef = doc(db, 'groups', initialGroup.id);
    const unsubscribe = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroup({
          id: docSnap.id,
          name: data.name,
          description: data.description,
          created_by: data.created_by,
          member_ids: data.member_ids,
          member_count: data.member_count,
          code: data.code,
          currently_watching: data.currently_watching,
          finished: data.finished,
          comments: data.comments,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    });

    return () => unsubscribe();
  }, [initialGroup?.id]);

  // Fetch members and calculate shared streaming services
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!group?.id) return;

      try {
        const result = await groupRepository.getGroupWithMembers(group.id);

        if (result) {
          setMembers(result.members);

          // Calculate shared streaming services
          if (result.members.length > 0) {
            const allServices = new Set<string>();
            result.members.forEach((member) => {
              member.streaming_services?.forEach((service) =>
                allServices.add(service as string)
              );
            });

            const shared = Array.from(allServices).filter((service) => {
              return result.members.every((member) =>
                member.streaming_services?.includes(service as any)
              );
            });

            setSharedServices(shared);
          }
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [group?.id]);

  // Fetch movie/show details
  useEffect(() => {
    async function fetchMovies(items: GroupMovie[], setter: (data: any[]) => void) {
      if (!items || items.length === 0) {
        setter([]);
        return;
      }

      try {
        const results = await Promise.all(
          items.map(async (item) => {
            try {
              const mediaType = item.media_type || 'movie';
              console.log(`Fetching ${item.title} as ${mediaType} with ID ${item.tmdb_id}`);

              let result;
              if (item.media_type) {
                result = await fetchTMDBDetails(item.tmdb_id, mediaType);
              } else {
                result = await fetchTMDBDetails(item.tmdb_id, 'movie').catch(() =>
                  fetchTMDBDetails(item.tmdb_id, 'tv')
                );
              }

              return result;
            } catch (err) {
              console.error(`Failed to fetch details for ${item.title}:`, err);
              return {
                id: item.tmdb_id,
                title: item.title,
                poster_path: item.poster_path,
                overview: '',
              };
            }
          })
        );
        setter(results);
      } catch (e) {
        console.error('Error fetching movies:', e);
        setter([]);
      }
    }

    if (group?.currently_watching && group.currently_watching.length > 0) {
      fetchMovies(group.currently_watching as GroupMovie[], setCurrentlyWatching);
    } else {
      setCurrentlyWatching([]);
    }

    if (group?.finished && group.finished.length > 0) {
      fetchMovies(group.finished as GroupMovie[], setFinished);
    } else {
      setFinished([]);
    }
  }, [group?.currently_watching, group?.finished]);

  // Load comments from group
  useEffect(() => {
    if (group?.comments) {
      setComments(group.comments as GroupComment[]);
    } else {
      setComments([]);
    }
  }, [group?.comments]);

  // Calculate random memory (updates once per day)
  useEffect(() => {
    if (comments.length === 0) {
      setRandomMemory(null);
      return;
    }

    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    const index = seed % comments.length;
    setRandomMemory(comments[index]);
  }, [comments]);

  const handleLeaveGroup = async () => {
    if (!group?.id) return;
    try {
      await groupRepository.deleteGroup(group.id);
      navigation.goBack();
    } catch (e) {
      alert('Failed to leave group.');
    }
  };

  const navigateToDiscover = () => {
    navigation.getParent()?.navigate('ExploreTab');
  };

  const handleAddComment = () => {
    setShowCommentModal(true);
    setSelectedMovie(null);
    setCommentText('');
  };

  const handleOpenFinishedModal = () => {
    if (!group?.currently_watching || group.currently_watching.length === 0) {
      alert('No movies in Currently Watching. Add some first!');
      return;
    }
    setShowFinishedModal(true);
  };

  const handleMoveToFinished = async (movie: GroupMovie) => {
    if (!group?.id) return;

    try {
      const groupRef = doc(db, 'groups', group.id);

      const mediaType = movie.media_type || 'movie';

      let movieDetails;
      try {
        movieDetails = await fetchTMDBDetails(movie.tmdb_id, mediaType);
      } catch (err) {
        console.error('Error fetching movie details:', err);
      }

      await updateDoc(groupRef, {
        currently_watching: arrayRemove(movie),
        finished: arrayUnion(movie),
      });

      if (movieDetails) {
        let runtime = 0;

        if (movieDetails.runtime) {
          runtime = movieDetails.runtime;
        } else if (
          movieDetails.episode_run_time &&
          movieDetails.episode_run_time.length > 0
        ) {
          runtime = Math.round(
            movieDetails.episode_run_time.reduce(
              (a: number, b: number) => a + b,
              0
            ) / movieDetails.episode_run_time.length
          );
        }

        const genres = movieDetails.genres?.map((g: any) => g.name) || [];

        if (runtime > 0) {
          logWatchTime({
            movieId: movie.tmdb_id,
            title: movieDetails.name || movieDetails.title || movie.title,
            minutesWatched: runtime,
            timestamp: new Date().toISOString(),
            genres: genres,
            media_type: mediaType,
          });
        }
      }

      setShowFinishedModal(false);
    } catch (error) {
      console.error('Error moving to finished:', error);
      alert('Failed to move movie. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowCommentModal(false);
    setSelectedMovie(null);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!authUser || !group?.id) {
      alert('Error: User not authenticated or group not found');
      return;
    }

    try {
      const groupRef = doc(db, 'groups', group.id);

      const currentUser = members.find((m) => m.id === authUser.uid);
      const userName = currentUser?.user_name || 'Anonymous';

      const newComment: GroupComment = {
        id: `${Date.now()}_${authUser.uid}`,
        user_id: authUser.uid,
        user_name: userName,
        text: commentText.trim(),
        movie_id: selectedMovie?.id,
        movie_title: selectedMovie
          ? selectedMovie.name || selectedMovie.title
          : undefined,
        timestamp: Date.now(),
      };

      await updateDoc(groupRef, {
        comments: arrayUnion(newComment),
      });

      handleCloseModal();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#bcbcff" />
        <Text style={{ marginTop: 10, color: '#6e7bb7' }}>Loading group...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}
      >
        <GroupHeader
          groupName={group?.name ?? 'Group'}
          code={code}
          onLeaveGroup={handleLeaveGroup}
          onFindNewMedia={navigateToDiscover}
        />

        <MembersSection members={members} />

        <SharedServicesSection sharedServices={sharedServices} />

        <CurrentlyWatchingSection
          currentlyWatching={currentlyWatching}
          onNavigateToDiscover={navigateToDiscover}
        />

        <FinishedSection
          finished={finished}
          onOpenFinishedModal={handleOpenFinishedModal}
        />

        <CommentsSection
          comments={comments}
          onAddComment={handleAddComment}
        />

        <RandomMemorySection randomMemory={randomMemory} />

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Move to Finished Modal */}
      <MoveToFinishedModal
        visible={showFinishedModal}
        onClose={() => setShowFinishedModal(false)}
        groupCurrentlyWatching={group?.currently_watching as GroupMovie[]}
        currentlyWatchingDetails={currentlyWatching}
        onMoveToFinished={handleMoveToFinished}
      />

      {/* Add Comment Modal */}
      <AddCommentModal
        visible={showCommentModal}
        onClose={handleCloseModal}
        currentlyWatching={currentlyWatching}
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
        commentText={commentText}
        setCommentText={setCommentText}
        onSubmitComment={handleSubmitComment}
      />
    </>
  );
}
