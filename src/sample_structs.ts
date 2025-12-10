export type WatchStats = {
  moviesWatched: number;
  showsWatched: number;
  epsWatched: number;
  categories: Record<string, number>; 
  // maps category name → number of movies
};

// ids & primitives
export type ID = string;
export type TimestampMs = number; // store Firestore Timestamp as ms on client if desired

// enums/unions
export type ContentType = "movie" | "show";
export type WatchlistVisibility = "private" | "shared";
export type GroupRole = "owner" | "admin" | "member";
export type StreamingServiceKey =
  | "netflix"
  | "hulu"
  | "prime"
  | "disney"
  | "max"
  | "apple_tv"
  | "peacock"
  | "paramount";

// ---------- Genres ----------
export interface GenreDoc {
  name: string;
  tmdb_genre_id: number;
  created_at?: TimestampMs;
  updated_at?: TimestampMs;
}

// ---------- Content (movie/show) ----------
export interface ContentDoc {
  title: string;
  overview: string;
  type: ContentType;                 // "movie" | "show"
  genres: ID[];                      // refs to /genres/{genreId}
  language: string;                  // e.g., "en"
  release_date: TimestampMs;         // or Firestore Timestamp
  release_year?: number;             // denorm for filters/sorts
  // cover_image_url?: string;
  poster_path?: number;
  tmdb_id?: number;                  // optional future integration
  created_at?: TimestampMs;
  updated_at?: TimestampMs;
}

// ---------- Users ----------

export interface UserDoc {
  id: string;
  user_name: string;
  // email?: string;
  phone_number: string;
  birthday?: TimestampMs;
  join_date?: TimestampMs;
  streaming_services: StreamingServiceKey[];  // if none, just put empty array []
  friends?: ID[];                    // userIds of friends
  profile_pic?: string;
  created_at?: TimestampMs;
  updated_at?: TimestampMs;
}

// ---------- Watch history (per user) ----------

export interface HistoryEntryDoc {
  content_id: ID;                    // /content/{id}
  watched_at: TimestampMs;
  // denorm for fast UI
  content_title?: string;
  content_type?: ContentType;
  cover_image_url?: string;
}

// ---------- Watchlists (per user, optionally shared to a group) ----------

export interface WatchlistDoc {
  id?: string;
  name: string;
  owner_user_id: ID;
  visibility: WatchlistVisibility;   // "private" | "shared"
  description?: string;
  group_id?: ID;                     // /groups/{groupId} if shared
  created_at: TimestampMs;
  updated_at: TimestampMs;
  item_count: number;               // denorm
  preview_covers: string[];         // denorm
  items: WatchlistItemDoc[];
}

export interface WatchlistItemDoc {
  tmdb_id: ID; // content_id: ID;                    // /content/{id}
  added_at: TimestampMs;
  added_by: ID;
  notes: string;
  // denorm for fast list rendering
  // content_title?: string;
  // cover_image_url?: string;
  // content_type?: ContentType;
}

// ---------- Groups ----------

// In sample_structs.ts
export interface GroupDoc {
  id?: string;
  name: string;
  description?: string;
  created_by: string;
  member_ids: string[];
  code?: string;
  member_count?: number;
  currently_watching?: Array<{ tmdb_id: number; title: string; poster_path: string }>;
  finished?: Array<{ tmdb_id: number; title: string; poster_path: string }>;
  comments?: Array<{
    id: string;
    user_id: string;
    user_name: string;
    text: string;
    movie_id?: number;
    movie_title?: string;
    timestamp: number;
  }>;
  created_at?: number;
  updated_at?: number;
}

export interface GroupMemberDoc {
  role: GroupRole;                   // "owner" | "admin" | "member"
  joined_at: TimestampMs;
}
