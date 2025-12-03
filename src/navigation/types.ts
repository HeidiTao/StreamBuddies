// src/navigation/types.ts

export interface Group {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  created_by?: string;
  created_at?: number;
  updated_at?: number;
  member_count?: number;
  currently_watching?: Array<{ tmdb_id: number; title?: string; poster_path?: string }>;
  finished?: Array<{ tmdb_id: number; title?: string; poster_path?: string }>;
  [key: string]: any; // Allow additional properties
}

export type RootStackParamList = {
  // Explore Stack
  Explore: undefined;
  Trending: undefined;
  MovieDetail: { movieId: string }; // adjust params as needed
  LikeConfirmation: undefined;
  
  // Search Stack
  Search: undefined;
  ServiceResults: {
    serviceName: string;
    serviceColor: string;
    providerId: string;
  };
  MovieDetailSearch: {
    movieId: number;
    title: string;
    poster_path: string | null;
    overview: string;
    release_date?: string;
    genres?: string[];
    rating?: number;
    runtime?: number;
    media_type?: 'movie' | 'tv';
  };
  
  // Lists Stack
  Lists: undefined;
  ListDetail: { listId: string }; // adjust params as needed
  NewList: undefined;
  
  // Groups Stack
  Groups: undefined;
  GroupDetail: { groupId: Group }; // Changed from string to Group object
  JoinGroup: undefined;
  NewGroup: undefined;
  
  // Profile Stack
  Profile: undefined;
  EditProfile: undefined;
  WatchStats: undefined;
};

// For TypeScript navigation support
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}