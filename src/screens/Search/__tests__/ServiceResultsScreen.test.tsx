// Mocks must come first
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  onSnapshot: jest.fn((colRef, callback) => {
    const fakeSnapshot = {
      forEach: (fn: any) => [],
    };
    callback(fakeSnapshot);
    return jest.fn();
  }),
  Timestamp: {
    fromDate: (date: Date) => date,
  },
}));

// Set API key before import
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test-api-key';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ServiceResultsScreen from '../ServiceResultsScreen';

// Mock dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock fetch
global.fetch = jest.fn();

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  params: {
    serviceName: 'Netflix',
    serviceColor: '#FFB3BA',
    providerId: '8',
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

const mockServiceResults = {
  results: [
    {
      id: 550,
      title: 'Fight Club',
      overview: 'A ticking-time-bomb insomniac...',
      poster_path: '/poster1.jpg',
      release_date: '1999-10-15',
    },
    {
      id: 551,
      title: 'The Matrix',
      overview: 'Set in the 22nd century...',
      poster_path: '/poster2.jpg',
      release_date: '1999-03-31',
    },
  ],
};

const mockMovieDetails = {
  id: 550,
  title: 'Fight Club',
  genres: [{ id: 18, name: 'Drama' }],
  vote_average: 8.4,
  runtime: 139,
};

describe('ServiceResultsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockServiceResults,
    });
  });

  describe('Rendering', () => {
    it('should render service name in header', async () => {
      render(<ServiceResultsScreen />);
      const serviceName = await screen.findByText('Netflix');
      expect(serviceName).toBeTruthy();
    });

    it('should render results title', async () => {
      render(<ServiceResultsScreen />);
      const title = await screen.findByText('Popular on Netflix');
      expect(title).toBeTruthy();
    });

    it('should fetch and display results on mount', async () => {
      render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      const movie1 = await screen.findByText('Fight Club');
      const movie2 = await screen.findByText('The Matrix');
      
      expect(movie1).toBeTruthy();
      expect(movie2).toBeTruthy();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch results with correct provider ID', async () => {
      render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchUrl).toContain('with_watch_providers=8');
      });
    });

    it('should handle fetch error gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));
      
      render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      expect(screen.queryByText('Fight Club')).toBeNull();
    });

    it('should handle empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });
      
      render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', async () => {
      const { UNSAFE_getAllByType } = render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        const touchables = UNSAFE_getAllByType('TouchableOpacity');
        expect(touchables.length).toBeGreaterThan(0);
      });
      
      const touchables = UNSAFE_getAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]);
      
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should navigate to MovieDetailSearch when result is pressed', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockServiceResults,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMovieDetails,
        });

      render(<ServiceResultsScreen />);
      
      const movieItem = await screen.findByText('Fight Club');
      fireEvent.press(movieItem);
      
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('MovieDetailSearch', {
          movieId: 550,
          title: 'Fight Club',
          poster_path: '/poster1.jpg',
          overview: expect.any(String),
          release_date: '1999-10-15',
          genres: ['Drama'],
          rating: 8.4,
          runtime: 139,
          media_type: 'movie',
        });
      });
    });
  });

  describe('Result Display', () => {
    it('should display movie type and year', async () => {
      render(<ServiceResultsScreen />);
      
      await screen.findByText('Fight Club');
      
      const typeAndYear = await screen.findByText(/Movie.*1999/);
      expect(typeAndYear).toBeTruthy();
    });

    it('should display movie overview', async () => {
      render(<ServiceResultsScreen />);
      
      const overview = await screen.findByText(/ticking-time-bomb insomniac/);
      expect(overview).toBeTruthy();
    });

    it('should handle missing poster', async () => {
      const resultsWithoutPoster = {
        results: [{
          ...mockServiceResults.results[0],
          poster_path: null,
        }],
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => resultsWithoutPoster,
      });

      render(<ServiceResultsScreen />);
      
      await screen.findByText('Fight Club');
    });
  });

  describe('Different Services', () => {
    it('should work with Hulu service', async () => {
      const huluRoute = {
        params: {
          serviceName: 'Hulu',
          serviceColor: '#BAFFC9',
          providerId: '15',
        },
      };
      
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue(huluRoute);
      
      render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchUrl).toContain('with_watch_providers=15');
      });
    });

    it('should work with HboMax service', async () => {
      const hboRoute = {
        params: {
          serviceName: 'HboMax',
          serviceColor: '#D4BAFF',
          providerId: '384',
        },
      };
      
      jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue(hboRoute);
      
      render(<ServiceResultsScreen />);
      
      await waitFor(() => {
        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchUrl).toContain('with_watch_providers=384');
      });
    });
  });
});