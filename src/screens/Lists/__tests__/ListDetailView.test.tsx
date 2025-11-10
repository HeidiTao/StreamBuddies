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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ListDetailView from '../ListDetailView';
import { useList } from '../../../hooks/useList';
import { listRepository } from '../../../repositories/ListRepository';
import { WatchlistDoc, WatchlistItemDoc, ContentDoc } from '../../../sample_structs';
import { getDocs, deleteDoc } from 'firebase/firestore';

// // Mock Firebase
// jest.mock('firebase/firestore');
jest.mock('../../../repositories/ListRepository');
jest.mock('../../../hooks/useList');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: jest.fn(),
};

// Mock route
const mockList: WatchlistDoc = {
  id: 'list123',
  name: 'My Favorites',
  owner_user_id: 'user123',
  visibility: 'private',
  description: 'My favorite shows',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-02'),
  item_count: 2,
  preview_covers: ['https://example.com/cover.jpg'],
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
    params: { list: mockList },
  }),
  useNavigation: () => mockNavigation,
}));

// Mock ListItemRowView
jest.mock('../ListItemRowView', () => {
  const { View, Text } = require('react-native');
  return ({ listItem }: any) => (
    <View testID={`list-item-${listItem.tmdb_id}`}>
      <Text>{listItem.title}</Text>
    </View>
  );
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('ListDetailView', () => {
  const mockUpdateList = jest.fn();
  const mockSaveList = jest.fn();
  const mockDelete = jest.fn();

  const mockListItems = [
    {
      tmdb_id: '550',
      id: '550',
      title: 'Fight Club',
      poster_path: '/poster1.jpg',
      added_by: 'user123',
      added_at: new Date('2024-01-01'),
      notes: 'Great movie',
    },
    {
      tmdb_id: '13',
      id: '13',
      title: 'Forrest Gump',
      poster_path: '/poster2.jpg',
      added_by: 'user123',
      added_at: new Date('2024-01-02'),
      notes: 'Classic',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useList hook
    (useList as jest.Mock).mockReturnValue({
      list: mockList,
      updateList: mockUpdateList,
      saveList: mockSaveList,
    });

    // Mock listRepository
    (listRepository.delete as jest.Mock) = mockDelete;

    // Mock Firebase getDocs
    (getDocs as jest.Mock).mockResolvedValue({
      docs: mockListItems.map(item => ({
        id: item.tmdb_id,
        data: () => ({
          added_by: item.added_by,
          added_at: item.added_at,
          notes: item.notes,
        }),
      })),
    });

    // Mock fetch for TMDB API
    global.fetch = jest.fn((url) => {
      const movieId = url.split('/')[5].split('?')[0];
      const mockMovie = mockListItems.find(item => item.tmdb_id === movieId);
      return Promise.resolve({
        json: () => Promise.resolve(mockMovie),
      });
    }) as jest.Mock;
  });

  describe('View Mode', () => {
    it('should render list details in view mode by default', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(screen.getByText('My Favorites')).toBeTruthy();
        expect(screen.getByText('My favorite shows')).toBeTruthy();
      });
    });

    it('should display Edit and Delete buttons', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(screen.getByText('Edit list')).toBeTruthy();
        expect(screen.getByText('Delete list')).toBeTruthy();
      });
    });

    it('should render list items from Firestore', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(screen.getByTestId('list-item-550')).toBeTruthy();
        expect(screen.getByTestId('list-item-13')).toBeTruthy();
      });
    });

    it('should switch to edit mode when Edit button is pressed', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByText('Save edits')).toBeTruthy();
      });
    });
  });

  describe('Edit Mode', () => {
    it('should render text inputs for name and description in edit mode', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        const inputs = screen.getAllByDisplayValue('My Favorites');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    it('should call updateList when name is changed', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('My Favorites');
        fireEvent.changeText(nameInput, 'Updated Name');
      });

      expect(mockUpdateList).toHaveBeenCalledWith({ name: 'Updated Name' });
    });

    it('should call updateList when description is changed', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        const descInput = screen.getByDisplayValue('My favorite shows');
        fireEvent.changeText(descInput, 'New description');
      });

      expect(mockUpdateList).toHaveBeenCalledWith({ description: 'New description' });
    });

    it('should save edits and exit edit mode when Save button is pressed', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        const saveButton = screen.getByText('Save edits');
        fireEvent.press(saveButton);
      });

      expect(mockSaveList).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(screen.getByText('Edit list')).toBeTruthy();
      });
    });

    it('should show trash icons for items in edit mode', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        const trashIcons = screen.getAllByTestId('edit-list-item-trash-button');
        expect(trashIcons.length).toBe(2);
      });
    });
  });

  describe('Delete Functionality', () => {
    it('should delete list and navigate back when Delete is pressed', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete list');
        fireEvent.press(deleteButton);
      });

      expect(mockDelete).toHaveBeenCalledWith('list123');
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should not delete if list has no id', async () => {
      (useList as jest.Mock).mockReturnValue({
        list: { ...mockList, id: undefined },
        updateList: mockUpdateList,
        saveList: mockSaveList,
      });

      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete list');
        fireEvent.press(deleteButton);
      });

      expect(mockDelete).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
    });
  });

  describe('Remove Items from List', () => {
    it('should remove item from list when trash icon is pressed', async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      render(<ListDetailView navigation={mockNavigation as any} />);

      // Enter edit mode
      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('list-item-550')).toBeTruthy();
      });

      // Get first trash button and press it
      const trashButtons = screen.getAllByTestId('edit-list-item-trash-button');
      fireEvent.press(trashButtons[0]);

      await waitFor(() => {
        expect(deleteDoc).toHaveBeenCalled();
      });
    });

    it('should update UI immediately when item is removed', async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      const { queryByTestId } = render(<ListDetailView navigation={mockNavigation as any} />);

      // Enter edit mode
      const editButton = screen.getByText('Edit list');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('list-item-550')).toBeTruthy();
      });

      // Remove first item
      const trashButtons = screen.getAllByTestId('edit-list-item-trash-button');
      fireEvent.press(trashButtons[0]);

      // Item should be removed from UI
      await waitFor(() => {
        expect(queryByTestId('list-item-550')).toBeNull();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch list items on mount', async () => {
      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(getDocs).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('https://api.themoviedb.org/3/movie/')
        );
      });
    });

    it('should handle empty list', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [],
      });

      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(screen.queryByTestId('list-item-550')).toBeNull();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (getDocs as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle list with undefined description', async () => {
      (useList as jest.Mock).mockReturnValue({
        list: { ...mockList, description: undefined },
        updateList: mockUpdateList,
        saveList: mockSaveList,
      });

      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(mockUpdateList).toHaveBeenCalledWith(
          expect.objectContaining({ description: '' })
        );
      });
    });

    it('should handle list with no preview covers', async () => {
      (useList as jest.Mock).mockReturnValue({
        list: { ...mockList, preview_covers: [] },
        updateList: mockUpdateList,
        saveList: mockSaveList,
      });

      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(screen.getByText('My Favorites')).toBeTruthy();
      });
    });

    it('should handle items with no notes', async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        docs: [{
          id: '550',
          data: () => ({
            added_by: 'user123',
            added_at: new Date(),
            notes: undefined,
          }),
        }],
      });

      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            tmdb_id: '550',
            title: 'Fight Club',
          }),
        })
      ) as jest.Mock;

      render(<ListDetailView navigation={mockNavigation as any} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});