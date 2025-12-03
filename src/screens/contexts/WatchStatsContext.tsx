// src/contexts/WatchStatsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WatchEntry {
  movieId: number;
  title: string;
  minutesWatched: number;
  timestamp: string;
  genres?: string[];
  media_type?: 'movie' | 'tv';
}

interface WatchStats {
  totalMinutesWatched: number;
  totalShowsWatched: number;
  totalEpisodesWatched: number;
  categoryBreakdown: { [category: string]: number };
  watchHistory: WatchEntry[];
}

interface WatchStatsContextType {
  stats: WatchStats;
  logWatchTime: (entry: WatchEntry) => void;
  getStatsByPeriod: (period: 'total' | 'year' | 'month' | 'day') => WatchStats;
}

const WatchStatsContext = createContext<WatchStatsContextType | undefined>(undefined);

export const WatchStatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState<WatchEntry[]>([]);

  const logWatchTime = (entry: WatchEntry) => {
    setWatchHistory((prev) => [...prev, entry]);
    
    // TODO: Save to Firebase/backend here
    console.log('Saving watch entry to backend:', entry);
  };

  const calculateStats = (entries: WatchEntry[]): WatchStats => {
    let totalMinutesWatched = 0;
    const uniqueShows = new Set<number>();
    let totalEpisodesWatched = 0;
    const categoryBreakdown: { [category: string]: number } = {};

    entries.forEach((entry) => {
      totalMinutesWatched += entry.minutesWatched;
      uniqueShows.add(entry.movieId);
      
      // Count episodes (for TV shows, assume each watch session is an episode)
      if (entry.media_type === 'tv') {
        totalEpisodesWatched += 1;
      }

      // Update category breakdown
      if (entry.genres) {
        entry.genres.forEach((genre) => {
          categoryBreakdown[genre] = (categoryBreakdown[genre] || 0) + 1;
        });
      }
    });

    return {
      totalMinutesWatched,
      totalShowsWatched: uniqueShows.size,
      totalEpisodesWatched,
      categoryBreakdown,
      watchHistory: entries,
    };
  };

  const getStatsByPeriod = (period: 'total' | 'year' | 'month' | 'day'): WatchStats => {
    if (period === 'total') {
      return calculateStats(watchHistory);
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(0);
    }

    const filteredEntries = watchHistory.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate;
    });

    return calculateStats(filteredEntries);
  };

  const stats = calculateStats(watchHistory);

  return (
    <WatchStatsContext.Provider value={{ stats, logWatchTime, getStatsByPeriod }}>
      {children}
    </WatchStatsContext.Provider>
  );
};

export const useWatchStats = () => {
  const context = useContext(WatchStatsContext);
  if (context === undefined) {
    throw new Error('useWatchStats must be used within a WatchStatsProvider');
  }
  return context;
};