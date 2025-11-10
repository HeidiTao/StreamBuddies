// Mocks must come first
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  onSnapshot: jest.fn((colRef, callback) => {
    // Immediately call callback with fake snapshot
    const fakeSnapshot = {
      forEach: (fn: any) => [], // no docs
    };
    callback(fakeSnapshot);
    return jest.fn(); // unsubscribe
  }),
  Timestamp: {
    fromDate: (date: Date) => date,
  },
}));

jest.mock('../../../../config/firebase', () => ({
  firebaseApp: {},
  db: {},
}));

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ListsView from '../ListsView';
import { useNavigation } from '@react-navigation/native';

// Env variables
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'TEST_KEY';
process.env.EXPO_PUBLIC_TMDB_READ_TOKEN = '';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

beforeEach(() => {
  jest.clearAllMocks();
});

const mockNavigate = (useNavigation() as any).navigate as jest.Mock;

describe('ListsView', () => {
  it('renders the lists view', () => {
    render(<ListsView />);
    expect(screen.getByText('New List')).toBeTruthy();

    // Optional: check Timestamp mock
    const { Timestamp } = require('firebase/firestore');
    const date = new Date();
    expect(Timestamp.fromDate(date)).toBe(date);
  });
});

// Mock the useLists hook
jest.mock('../../../hooks/useLists');

// Mock the ListRowView component
jest.mock('../ListRowView', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ list, onPress }: any) => (
    <TouchableOpacity testID={`list-row-${list.id || 'new'}`} onPress={onPress}>
      <Text>{list.name}</Text>
    </TouchableOpacity>
  );
});

describe('ListsView', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  const mockLists: WatchlistDoc[] = [
    {
      id: '1',
      name: 'My Favorites',
      owner_user_id: 'user123',
      visibility: 'private',
      description: 'Shows I love',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-02'),
      item_count: 5,
      preview_covers: ['https://example.com/cover1.jpg'],
    },
    {
      id: '2',
      name: 'Watch Later',
      owner_user_id: 'user123',
      visibility: 'shared',
      description: 'To watch with friends',
      created_at: new Date('2024-01-03'),
      updated_at: new Date('2024-01-04'),
      item_count: 3,
      preview_covers: ['https://example.com/cover2.jpg'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: [],
        listLoading: true,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      // When loading, only the "New List" placeholder should be visible
      const newListButton = screen.getByTestId('list-row-new');
      expect(newListButton).toBeTruthy();
    });

    it('should render the "New List" button', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: [],
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      const newListButton = screen.getByTestId('list-row-new');
      expect(newListButton).toBeTruthy();
      expect(screen.getByText('New List')).toBeTruthy();
    });

    it('should render all watchlists', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: mockLists,
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      expect(screen.getByText('My Favorites')).toBeTruthy();
      expect(screen.getByText('Watch Later')).toBeTruthy();
    });

    it('should render empty state when no lists exist', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: [],
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      // Only "New List" button should be visible
      const newListButton = screen.getByTestId('list-row-new');
      expect(newListButton).toBeTruthy();
      
      // No other lists should be present
      expect(screen.queryByText('My Favorites')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate to NewList screen when "New List" is pressed', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: [],
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      const newListButton = screen.getByTestId('list-row-new');
      fireEvent.press(newListButton);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('NewList');
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to ListDetail screen with correct list when a list is pressed', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: mockLists,
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      const firstList = screen.getByTestId('list-row-1');
      fireEvent.press(firstList);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ListDetail', {
        list: mockLists[0],
      });
    });

    it('should handle multiple list presses correctly', () => {
      (useLists as jest.Mock).mockReturnValue({
        lists: mockLists,
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      const firstList = screen.getByTestId('list-row-1');
      const secondList = screen.getByTestId('list-row-2');
      
      fireEvent.press(firstList);
      fireEvent.press(secondList);
      
      expect(mockNavigation.navigate).toHaveBeenCalledTimes(2);
      expect(mockNavigation.navigate).toHaveBeenNthCalledWith(1, 'ListDetail', {
        list: mockLists[0],
      });
      expect(mockNavigation.navigate).toHaveBeenNthCalledWith(2, 'ListDetail', {
        list: mockLists[1],
      });
    });
  });

  describe('Data Integration', () => {
    it('should display updated lists when useLists hook returns new data', () => {
      const { rerender } = render(<ListsView navigation={mockNavigation as any} />);
      
      // Initially no lists
      (useLists as jest.Mock).mockReturnValue({
        lists: [],
        listLoading: false,
      });
      
      rerender(<ListsView navigation={mockNavigation as any} />);
      expect(screen.queryByText('My Favorites')).toBeNull();
      
      // Update with lists
      (useLists as jest.Mock).mockReturnValue({
        lists: mockLists,
        listLoading: false,
      });
      
      rerender(<ListsView navigation={mockNavigation as any} />);
      expect(screen.getByText('My Favorites')).toBeTruthy();
      expect(screen.getByText('Watch Later')).toBeTruthy();
    });

    it('should handle lists with missing optional fields', () => {
      const minimalList: WatchlistDoc = {
        id: '3',
        name: 'Minimal List',
        owner_user_id: 'user123',
        visibility: 'private',
        created_at: new Date(),
        updated_at: new Date(),
        item_count: 0,
        preview_covers: [],
      };

      (useLists as jest.Mock).mockReturnValue({
        lists: [minimalList],
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      expect(screen.getByText('Minimal List')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty preview_covers array', () => {
      const listWithoutCovers: WatchlistDoc = {
        ...mockLists[0],
        preview_covers: [],
      };

      (useLists as jest.Mock).mockReturnValue({
        lists: [listWithoutCovers],
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      expect(screen.getByText('My Favorites')).toBeTruthy();
    });

    it('should handle a large number of lists', () => {
      const manyLists = Array.from({ length: 50 }, (_, i) => ({
        id: `list-${i}`,
        name: `List ${i}`,
        owner_user_id: 'user123',
        visibility: 'private' as const,
        created_at: new Date(),
        updated_at: new Date(),
        item_count: i,
        preview_covers: [`https://example.com/cover${i}.jpg`],
      }));

      (useLists as jest.Mock).mockReturnValue({
        lists: manyLists,
        listLoading: false,
      });

      render(<ListsView navigation={mockNavigation as any} />);
      
      // Verify first and last lists are rendered
      expect(screen.getByText('List 0')).toBeTruthy();
      expect(screen.getByText('List 49')).toBeTruthy();
    });
  });
});