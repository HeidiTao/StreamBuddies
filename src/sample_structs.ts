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
  user_name: string;
  email?: string;
  phone_number?: string;
  birthday?: TimestampMs;
  join_date: TimestampMs;
  streaming_services?: StreamingServiceKey[];
  friends?: ID[];                    // userIds of friends
  photo_url?: string;
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

export interface GroupDoc {
  name: string;
  description?: string;
  created_by: ID;                    // userId
  created_at: TimestampMs;
  updated_at: TimestampMs;
  member_count?: number;             // enforce <= 10 via server
}

export interface GroupMemberDoc {
  role: GroupRole;                   // "owner" | "admin" | "member"
  joined_at: TimestampMs;
}
