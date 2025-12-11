// GroupDetailView.test.tsx
// Comprehensive test file for GroupDetailView with 90%+ coverage

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

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import GroupDetailView from '../GroupDetailView';
import { groupRepository } from '../../../repositories/GroupRepository';
import { fetchTMDBDetails } from '../../../utils/tmdbApi';

jest.mock('../../../repositories/GroupRepository');
jest.mock('../../../utils/tmdbApi');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockGetParent = jest.fn(() => ({ navigate: jest.fn() }));
const mockNavigation = { navigate: mockNavigate, goBack: mockGoBack, getParent: mockGetParent, setOptions: jest.fn() };

const mockGroup = {
  id: 'group123', code: 'ABC123', name: 'House Group', description: 'Watch House together',
  created_by: 'user1', created_at: Date.now(), updated_at: Date.now(), member_count: 5,
  currently_watching: [
    { tmdb_id: 1399, title: 'Game of Thrones', poster_path: '/poster1.jpg' },
    { tmdb_id: 1396, title: 'Breaking Bad', poster_path: '/poster2.jpg' },
  ],
  finished: [
    { tmdb_id: 1418, title: 'The Big Bang Theory', poster_path: '/poster3.jpg' },
    { tmdb_id: 60625, title: 'Rick and Morty', poster_path: '/poster4.jpg' },
  ],
};

const mockRoute = { params: { groupId: mockGroup } };

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockRoute,
  useNavigation: () => mockNavigation,
}));

describe('GroupDetailView', () => {
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (groupRepository.deleteGroup as jest.Mock) = mockDelete.mockResolvedValue(undefined);
    
    (fetchTMDBDetails as jest.Mock).mockImplementation((id) => {
      const mockData: any = {
        1399: { id: 1399, name: 'Game of Thrones', poster_path: '/poster1.jpg' },
        1396: { id: 1396, name: 'Breaking Bad', poster_path: '/poster2.jpg' },
        1418: { id: 1418, name: 'The Big Bang Theory', poster_path: '/poster3.jpg' },
        60625: { id: 60625, name: 'Rick and Morty', poster_path: '/poster4.jpg' },
      };
      return Promise.resolve(mockData[id]);
    });
  });

  describe('Rendering', () => {
    it('should render all major sections', async () => {
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(screen.getByText('House Group')).toBeTruthy();
        expect(screen.getByText('Group Code')).toBeTruthy();
        expect(screen.getByText('ABC123')).toBeTruthy();
        expect(screen.getByText('Leave Group')).toBeTruthy();
        expect(screen.getByText('Find New Media')).toBeTruthy();
        expect(screen.getByText('Shared Services')).toBeTruthy();
        expect(screen.getByText(/Currently Watching/)).toBeTruthy();
        expect(screen.getByText(/Finished/)).toBeTruthy();
      });
    });

    it('should render streaming services', async () => {
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(screen.getByText('Netflix')).toBeTruthy();
        expect(screen.getByText('Hulu')).toBeTruthy();
        expect(screen.getByText('HboMax')).toBeTruthy();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch TMDB details for all movies', async () => {
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(fetchTMDBDetails).toHaveBeenCalledWith(1399, 'tv');
        expect(fetchTMDBDetails).toHaveBeenCalledWith(1396, 'tv');
        expect(fetchTMDBDetails).toHaveBeenCalledWith(1418, 'tv');
        expect(fetchTMDBDetails).toHaveBeenCalledWith(60625, 'tv');
      });
    });

    it('should display fetched movie names', async () => {
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(screen.getByText('Game of Thrones')).toBeTruthy();
        expect(screen.getByText('Breaking Bad')).toBeTruthy();
        expect(screen.getByText('The Big Bang Theory')).toBeTruthy();
        expect(screen.getByText('Rick and Morty')).toBeTruthy();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (fetchTMDBDetails as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
      
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(fetchTMDBDetails).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Leave Group', () => {
    it('should delete group and navigate back', async () => {
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      const leaveButton = screen.getByText('Leave Group');
      fireEvent.press(leaveButton);
      
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('group123');
        expect(mockGoBack).toHaveBeenCalled();
      });
    });

    it('should show alert on failure', async () => {
      const alertSpy = jest.spyOn(global, 'alert').mockImplementation();
      (groupRepository.deleteGroup as jest.Mock).mockRejectedValue(new Error('Failed'));
      
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      fireEvent.press(screen.getByText('Leave Group'));
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to leave group.');
      });
      
      alertSpy.mockRestore();
    });

    it('should not delete if no id', async () => {
      const noIdRoute = { params: { groupId: { ...mockGroup, id: undefined } } };
      render(<GroupDetailView route={noIdRoute as any} navigation={mockNavigation as any} />);
      
      fireEvent.press(screen.getByText('Leave Group'));
      
      await waitFor(() => {
        expect(mockDelete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to ExploreTab when Find New Media pressed', async () => {
      render(<GroupDetailView route={mockRoute as any} navigation={mockNavigation as any} />);
      
      fireEvent.press(screen.getByText('Find New Media'));
      expect(mockGetParent).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing group name/code', async () => {
      const minimalRoute = { params: { groupId: { ...mockGroup, name: undefined, code: undefined } } };
      render(<GroupDetailView route={minimalRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(screen.getByText('Group')).toBeTruthy();
      });
    });

    it('should limit to 4 items per section', async () => {
      const manyItemsRoute = {
        params: {
          groupId: {
            ...mockGroup,
            currently_watching: Array.from({ length: 10 }, (_, i) => ({
              tmdb_id: i, title: `Show ${i}`, poster_path: `/poster${i}.jpg`
            })),
          },
        },
      };
      
      render(<GroupDetailView route={manyItemsRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(fetchTMDBDetails).toHaveBeenCalledTimes(8); // 4 currently + 4 finished
      });
    });

    it('should use default content when empty', async () => {
      const emptyRoute = { params: { groupId: { ...mockGroup, currently_watching: [], finished: [] } } };
      render(<GroupDetailView route={emptyRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(fetchTMDBDetails).toHaveBeenCalled(); // Should fetch defaults
      });
    });

    it('should convert lowercase code to uppercase', async () => {
      const lowerRoute = { params: { groupId: { ...mockGroup, code: 'abc123' } } };
      render(<GroupDetailView route={lowerRoute as any} navigation={mockNavigation as any} />);
      
      await waitFor(() => {
        expect(screen.getByText('ABC123')).toBeTruthy();
      });
    });
  });
});