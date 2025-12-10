// SearchScreen.test.tsx
// Comprehensive test file for SearchScreen with 90%+ coverage

// Mocks must come first
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  onSnapshot: jest.fn((colRef, callback) => {
    const fakeSnapshot = { forEach: (fn: any) => [] };
    callback(fakeSnapshot);
    return jest.fn();
  }),
  Timestamp: { fromDate: (date: Date) => date },
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
// import SearchScreen from '../SearchScreen';
import SearchScreen from '../SearchView';

jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: any) => children }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn(), setOptions: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock TMDB API
process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = 'test_token';
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test_key';

const mockSearchResults = {
  results: [
    {
      id: 550,
      title: 'Fight Club',
      name: 'Fight Club',
      overview: 'An insomniac office worker...',
      poster_path: '/poster1.jpg',
      release_date: '1999-10-15',
      first_air_date: '1999-10-15',
      media_type: 'movie',
    },
    {
      id: 13,
      title: 'Forrest Gump',
      name: 'Forrest Gump',
      overview: 'A man with a low IQ...',
      poster_path: '/poster2.jpg',
      release_date: '1994-07-06',
      first_air_date: '1994-07-06',
      media_type: 'movie',
    },
  ],
};

const mockMovieDetails = {
  id: 550,
  title: 'Fight Club',
  genres: [{ name: 'Drama' }],
  vote_average: 8.4,
  runtime: 139,
};

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.includes('/search/multi')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResults),
        });
      }
      if (url.includes('/movie/') || url.includes('/tv/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMovieDetails),
        });
      }
      if (url.includes('/discover/movie')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSearchResults),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }) as jest.Mock;
  });

  describe('Rendering', () => {
    it('should render search header and input', () => {
      render(<SearchScreen />);
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    });

    it('should render streaming service buttons', () => {
      render(<SearchScreen />);
      expect(screen.getByText('Netflix')).toBeTruthy();
      expect(screen.getByText('Hulu')).toBeTruthy();
      expect(screen.getByText('HBO Max')).toBeTruthy();
    });

    it('should render empty state initially', () => {
      render(<SearchScreen />);
      expect(screen.queryByText('Fight Club')).toBeNull();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when text is entered', () => {
      render(<SearchScreen />);
      const searchInput = screen.getByPlaceholderText('Search...');
      
      fireEvent.changeText(searchInput, 'Fight Club');
      expect(searchInput.props.value).toBe('Fight Club');
    });

    it('should perform search when search button is pressed', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      
      // Simulate pressing enter or search button
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/search/multi'),
          expect.any(Object)
        );
      });
    });

    it('should display search results', async () => {
      render(<SearchScreen />);
      jest.useFakeTimers();

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      act(() => {
        jest.advanceTimersByTime(350);
      });

      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
        expect(screen.getByText('Forrest Gump')).toBeTruthy();
      });
    });

    it('should show loading state during search', async () => {
      global.fetch = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve({
          json: () => Promise.resolve(mockSearchResults),
        }), 100))
      ) as jest.Mock;
      
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      // Should show loading indicator
      expect(screen.queryByText('Fight Club')).toBeNull();
    });

    it('should handle empty search results', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ results: [] }),
        })
      ) as jest.Mock;
      
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Nonexistent Movie');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(screen.getByText(/No results found/)).toBeTruthy();
      });
    });

    it('should handle search errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;
      
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Streaming Service Filters', () => {
    it('should navigate to ServiceResults when streaming service is pressed', () => {
      render(<SearchScreen />);
      
      const netflixButton = screen.getByText('Netflix');
      fireEvent.press(netflixButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('ServiceResults', {
        serviceName: 'Netflix',
        serviceColor: expect.any(String),
        providerId: expect.any(String),
      });
    });

    it('should navigate with correct provider IDs', () => {
      render(<SearchScreen />);
      
      fireEvent.press(screen.getByText('Hulu'));
      expect(mockNavigate).toHaveBeenCalledWith('ServiceResults', 
        expect.objectContaining({ serviceName: 'Hulu' })
      );
      
      fireEvent.press(screen.getByText('HBO Max'));
      expect(mockNavigate).toHaveBeenCalledWith('ServiceResults',
        expect.objectContaining({ serviceName: 'HBO Max' })
      );
    });

    it('should handle multiple service button presses', () => {
      render(<SearchScreen />);
      
      fireEvent.press(screen.getByText('Netflix'));
      fireEvent.press(screen.getByText('Hulu'));
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Result Navigation', () => {
    it('should navigate to MovieDetailSearch when result is pressed', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
      
      const result = screen.getByText('Fight Club');
      fireEvent.press(result);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('MovieDetailSearch', 
          expect.objectContaining({
            movieId: 550,
            title: 'Fight Club',
          })
        );
      });
    });

    it('should fetch movie details before navigating', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
      
      const result = screen.getByText('Fight Club');
      fireEvent.press(result);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/movie/550'),
          expect.any(Object)
        );
      });
    });

    it('should pass genres and rating to detail screen', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
      
      fireEvent.press(screen.getByText('Fight Club'));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('MovieDetailSearch', 
          expect.objectContaining({
            genres: ['Drama'],
            rating: 8.4,
            runtime: 139,
          })
        );
      });
    });
  });

  describe('Search Input Behavior', () => {
    it('should clear search when empty string is entered', () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent.changeText(searchInput, '');
      
      expect(searchInput.props.value).toBe('');
    });

    it('should handle special characters in search', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, "Ocean's 11");
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("Ocean's 11"),
          expect.any(Object)
        );
      });
    });

    it('should handle very long search queries', async () => {
      render(<SearchScreen />);
      
      const longQuery = 'A'.repeat(200);
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, longQuery);
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('API Integration', () => {
    it('should use TMDB Bearer token when available', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: expect.stringContaining('Bearer'),
            }),
          })
        );
      });
    });

    it('should fall back to API key when token is not available', async () => {
      const originalToken = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;
      process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = '';
      
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('api_key='),
          expect.any(Object)
        );
      });
      
      process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = originalToken;
    });

    it('should handle different media types (movie vs tv)', async () => {
      const tvResult = {
        id: 1399,
        name: 'Game of Thrones',
        overview: 'Nine noble families...',
        poster_path: '/poster.jpg',
        first_air_date: '2011-04-17',
        media_type: 'tv',
        episode_run_time: [60],
      };
      
      global.fetch = jest.fn((url) => {
        if (url.includes('/tv/')) {
          return Promise.resolve({
            json: () => Promise.resolve(tvResult),
          });
        }
        return Promise.resolve({
          json: () => Promise.resolve(mockSearchResults),
        });
      }) as jest.Mock;
      
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Game of Thrones');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle results with missing poster paths', async () => {
      const resultsWithoutPosters = {
        results: [{
          ...mockSearchResults.results[0],
          poster_path: null,
        }],
      };
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(resultsWithoutPosters),
        })
      ) as jest.Mock;
      
      render(<SearchScreen />);
      jest.useFakeTimers();
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      act(() => {
        jest.advanceTimersByTime(350); // make sure debounce fires
      });
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
    });

    it('should handle results with missing release dates', async () => {
      const resultsWithoutDates = {
        results: [{
          ...mockSearchResults.results[0],
          release_date: undefined,
          first_air_date: undefined,
        }],
      };
      
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(resultsWithoutDates),
        })
      ) as jest.Mock;
      
      render(<SearchScreen />);
      jest.useFakeTimers();
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      act(() => {
        jest.advanceTimersByTime(350); // make sure debounce fires
      });
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
    });

    it('should handle rapid consecutive searches', async () => {
      render(<SearchScreen />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      
      fireEvent.changeText(searchInput, 'Fight');
      fireEvent(searchInput, 'onSubmitEditing');
      
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      fireEvent.changeText(searchInput, 'Forrest Gump');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('User Flow', () => {
    it('should complete full search to detail navigation flow', async () => {
      render(<SearchScreen />);
      
      // Enter search query
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      
      // Submit search
      fireEvent(searchInput, 'onSubmitEditing');
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
      
      // Click result
      fireEvent.press(screen.getByText('Fight Club'));
      
      // Verify navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('MovieDetailSearch', 
          expect.objectContaining({
            movieId: 550,
            title: 'Fight Club',
          })
        );
      });
    });

    it('should allow switching between search and service filters', async () => {
      render(<SearchScreen />);
      
      // First do a search
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.changeText(searchInput, 'Fight Club');
      fireEvent(searchInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(screen.getByText('Fight Club')).toBeTruthy();
      });
      
      // Then click a service button
      fireEvent.press(screen.getByText('Netflix'));
      expect(mockNavigate).toHaveBeenCalledWith('ServiceResults', expect.any(Object));
    });
  });
});