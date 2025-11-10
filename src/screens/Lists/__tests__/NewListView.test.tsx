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
import NewListView from '../NewListView';
import { useList } from '../../../hooks/useList';
import { createSaveHandler } from '../../../utils/listFormHelpers';
import { WatchlistDoc } from '../../../sample_structs';

// Mock the hooks and utilities
jest.mock('../../../hooks/useList');
jest.mock('../../../utils/listFormHelpers');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('NewListView', () => {
  const mockUpdateList = jest.fn();
  const mockSaveList = jest.fn();
  const mockHandleSave = jest.fn();

  const mockEmptyList: Partial<WatchlistDoc> = {
    name: '',
    description: '',
    visibility: 'private',
    owner_user_id: '',
    item_count: 0,
    preview_covers: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useList hook with empty initial state
    (useList as jest.Mock).mockReturnValue({
      list: mockEmptyList,
      updateList: mockUpdateList,
      saveList: mockSaveList,
    });

    // Mock createSaveHandler
    (createSaveHandler as jest.Mock).mockReturnValue(mockHandleSave);
  });

  describe('Rendering', () => {
    it('should render the form title', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByText('Create new list')).toBeTruthy();
    });

    it('should render name input with label', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByText('List name')).toBeTruthy();
      expect(screen.getByDisplayValue('')).toBeTruthy();
    });

    it('should render description input with label', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByText('Description')).toBeTruthy();
    });

    it('should render Save button', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByText('Save')).toBeTruthy();
    });

    it('should render all form elements', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByText('Create new list')).toBeTruthy();
      expect(screen.getByText('List name')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
      expect(screen.getByText('Save')).toBeTruthy();
    });
  });

  describe('Form Inputs', () => {
    it('should update list name when text is entered', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const nameInput = screen.getAllByDisplayValue('')[0]; // First empty input is name
      fireEvent.changeText(nameInput, 'My New List');

      expect(mockUpdateList).toHaveBeenCalledWith({ name: 'My New List' });
    });

    it('should update description when text is entered', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const descInput = screen.getAllByDisplayValue('')[1]; // Second empty input is description
      fireEvent.changeText(descInput, 'This is my new watchlist');

      expect(mockUpdateList).toHaveBeenCalledWith({ 
        description: 'This is my new watchlist' 
      });
    });

    it('should display updated values from hook state', () => {
      (useList as jest.Mock).mockReturnValue({
        list: {
          name: 'Updated Name',
          description: 'Updated Description',
        },
        updateList: mockUpdateList,
        saveList: mockSaveList,
      });

      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByDisplayValue('Updated Name')).toBeTruthy();
      expect(screen.getByDisplayValue('Updated Description')).toBeTruthy();
    });

    it('should handle multiple text changes', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const nameInput = screen.getAllByDisplayValue('')[0];
      
      fireEvent.changeText(nameInput, 'First');
      fireEvent.changeText(nameInput, 'Second');
      fireEvent.changeText(nameInput, 'Final Name');

      expect(mockUpdateList).toHaveBeenCalledTimes(3);
      expect(mockUpdateList).toHaveBeenLastCalledWith({ name: 'Final Name' });
    });
  });

  describe('Save Functionality', () => {
    it('should call createSaveHandler with correct parameters', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(createSaveHandler).toHaveBeenCalledWith(
        mockEmptyList,
        mockSaveList,
        mockNavigation
      );
    });

    it('should call handleSave when Save button is pressed', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);

      expect(mockHandleSave).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple save attempts', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const saveButton = screen.getByText('Save');
      
      fireEvent.press(saveButton);
      fireEvent.press(saveButton);
      fireEvent.press(saveButton);

      expect(mockHandleSave).toHaveBeenCalledTimes(3);
    });
  });

  describe('User Flow', () => {
    it('should allow entering name, description, and saving', async () => {
      render(<NewListView navigation={mockNavigation as any} />);

      // Enter name
      const nameInput = screen.getAllByDisplayValue('')[0];
      fireEvent.changeText(nameInput, 'Weekend Movies');

      // Enter description
      const descInput = screen.getAllByDisplayValue('')[1];
      fireEvent.changeText(descInput, 'Movies to watch this weekend');

      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);

      expect(mockUpdateList).toHaveBeenCalledWith({ name: 'Weekend Movies' });
      expect(mockUpdateList).toHaveBeenCalledWith({ 
        description: 'Movies to watch this weekend' 
      });
      expect(mockHandleSave).toHaveBeenCalled();
    });

    it('should allow saving with only name (no description)', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const nameInput = screen.getAllByDisplayValue('')[0];
      fireEvent.changeText(nameInput, 'Quick List');

      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);

      expect(mockUpdateList).toHaveBeenCalledWith({ name: 'Quick List' });
      expect(mockHandleSave).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form submission', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);

      expect(mockHandleSave).toHaveBeenCalled();
      expect(createSaveHandler).toHaveBeenCalledWith(
        mockEmptyList,
        mockSaveList,
        mockNavigation
      );
    });

    it('should handle very long list names', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const longName = 'A'.repeat(200);
      const nameInput = screen.getAllByDisplayValue('')[0];
      fireEvent.changeText(nameInput, longName);

      expect(mockUpdateList).toHaveBeenCalledWith({ name: longName });
    });

    it('should handle very long descriptions', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const longDesc = 'This is a very long description. '.repeat(50);
      const descInput = screen.getAllByDisplayValue('')[1];
      fireEvent.changeText(descInput, longDesc);

      expect(mockUpdateList).toHaveBeenCalledWith({ description: longDesc });
    });

    it('should handle special characters in inputs', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const nameInput = screen.getAllByDisplayValue('')[0];
      const specialName = "Mom's & Dad's Movies! 🎬 #favorites";
      fireEvent.changeText(nameInput, specialName);

      expect(mockUpdateList).toHaveBeenCalledWith({ name: specialName });
    });

    it('should handle clearing input fields', () => {
      (useList as jest.Mock).mockReturnValue({
        list: {
          name: 'Existing Name',
          description: 'Existing Description',
        },
        updateList: mockUpdateList,
        saveList: mockSaveList,
      });

      render(<NewListView navigation={mockNavigation as any} />);

      const nameInput = screen.getByDisplayValue('Existing Name');
      fireEvent.changeText(nameInput, '');

      expect(mockUpdateList).toHaveBeenCalledWith({ name: '' });
    });
  });

  describe('Hook Integration', () => {
    it('should use the useList hook', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(useList).toHaveBeenCalled();
    });

    it('should pass navigation to createSaveHandler', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(createSaveHandler).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        mockNavigation
      );
    });

    it('should re-render when list state changes', () => {
      const { rerender } = render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.queryByDisplayValue('Updated List')).toBeNull();

      // Update mock to return new list data
      (useList as jest.Mock).mockReturnValue({
        list: {
          name: 'Updated List',
          description: 'New description',
        },
        updateList: mockUpdateList,
        saveList: mockSaveList,
      });

      rerender(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByDisplayValue('Updated List')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for inputs', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      expect(screen.getByText('List name')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
    });

    it('should have accessible save button text', () => {
      render(<NewListView navigation={mockNavigation as any} />);

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeTruthy();
    });
  });
});