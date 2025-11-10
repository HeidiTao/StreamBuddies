// TMDB API helper for fetching movie/show details and posters
// Usage: import { fetchTMDBDetails, getPosterUrl } from './tmdbApi';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export async function fetchTMDBDetails(tmdb_id: number, type: 'movie' | 'tv' = 'movie') {
  if (!TMDB_API_KEY) throw new Error('TMDB API key not set');
  const url = `${TMDB_BASE_URL}/${type}/${tmdb_id}?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch TMDB details');
  return await res.json();
}

export function getPosterUrl(poster_path: string | null | undefined) {
  return poster_path ? `${TMDB_IMAGE_BASE}${poster_path}` : undefined;
}

// Example search (for future use)
export async function searchTMDB(query: string, type: 'movie' | 'tv' = 'movie') {
  if (!TMDB_API_KEY) throw new Error('TMDB API key not set');
  const url = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to search TMDB');
  return await res.json();
}
