// GroupsView.test.tsx
// Comprehensive test file for GroupsView with 90%+ coverage

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
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import GroupsView from '../GroupsView';
import { useGroups } from '../../../hooks/useGroups';
import { groupRepository } from '../../../repositories/GroupRepository';
import { GroupDoc } from '../../../sample_structs';

jest.mock('../../../hooks/useGroups');
jest.mock('../../../repositories/GroupRepository');
jest.mock('expo-linear-gradient', () => ({ LinearGradient: ({ children }: any) => children }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn(), setOptions: jest.fn() };
jest.spyOn(Alert, 'alert');

describe('GroupsView', () => {
  const mockGroups: GroupDoc[] = [
    {
      id: 'group1', code: 'ABC123', name: 'House Group', description: 'Watch House together',
      created_by: 'user1', created_at: Date.now(), updated_at: Date.now(), member_count: 5,
      currently_watching: [{ tmdb_id: 1399, title: 'Game of Thrones', poster_path: '/poster1.jpg' }],
      finished: [{ tmdb_id: 1418, title: 'The Big Bang Theory', poster_path: '/poster2.jpg' }],
    },
    {
      id: 'group2', code: 'XYZ789', name: 'Movie Club', description: 'Weekly movie nights',
      created_by: 'user2', created_at: Date.now(), updated_at: Date.now(), member_count: 3,
      currently_watching: [], finished: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useGroups as jest.Mock).mockReturnValue({ groups: mockGroups, groupsLoading: false });
    (groupRepository.deleteGroup as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render header with title and Leave Groups button', () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.getByText('My Groups')).toBeTruthy();
      expect(screen.getByText('Leave Groups')).toBeTruthy();
    });

    it('should render Join Group and New Group buttons', () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.getByText('Join Group')).toBeTruthy();
      expect(screen.getByText('New Group')).toBeTruthy();
    });

    it('should render all groups', () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.getByText('House Group')).toBeTruthy();
      expect(screen.getByText('Movie Club')).toBeTruthy();
    });

    it('should render loading state', () => {
      (useGroups as jest.Mock).mockReturnValue({ groups: [], groupsLoading: true });
      render(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.getByText('Loading groups...')).toBeTruthy();
    });

    it('should render empty state when no groups exist', () => {
      (useGroups as jest.Mock).mockReturnValue({ groups: [], groupsLoading: false });
      render(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.queryByText('House Group')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate to JoinGroup, NewGroup, and GroupDetail', () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      
      fireEvent.press(screen.getByText('Join Group'));
      expect(mockNavigate).toHaveBeenCalledWith('JoinGroup');
      
      fireEvent.press(screen.getByText('New Group'));
      expect(mockNavigate).toHaveBeenCalledWith('NewGroup');
      
      fireEvent.press(screen.getByText('House Group'));
      expect(mockNavigate).toHaveBeenCalledWith('GroupDetail', { groupId: mockGroups[0] });
    });
  });

  describe('Remove Mode', () => {
    it('should enter/exit remove mode and show banner', () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      
      fireEvent.press(screen.getByText('Leave Groups'));
      expect(screen.getByText('Done')).toBeTruthy();
      expect(screen.getByText('Tap any group to leave it')).toBeTruthy();
      expect(screen.queryByText('Join Group')).toBeNull();
      
      fireEvent.press(screen.getByText('Done'));
      expect(screen.getByText('Leave Groups')).toBeTruthy();
      expect(screen.queryByText('Tap any group to leave it')).toBeNull();
    });

    it('should show alert when group pressed in remove mode', () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      fireEvent.press(screen.getByText('Leave Groups'));
      fireEvent.press(screen.getByText('House Group'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Leave Group',
        'Are you sure you want to leave "House Group"?',
        expect.any(Array)
      );
    });

    it('should delete group when confirmed', async () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      fireEvent.press(screen.getByText('Leave Groups'));
      fireEvent.press(screen.getByText('House Group'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const yesButton = alertCall[2].find((btn: any) => btn.text === 'Yes');
      await yesButton.onPress();
      
      expect(groupRepository.deleteGroup).toHaveBeenCalledWith('group1');
    });

    it('should not delete when cancelled', async () => {
      render(<GroupsView navigation={mockNavigation as any} />);
      fireEvent.press(screen.getByText('Leave Groups'));
      fireEvent.press(screen.getByText('House Group'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const noButton = alertCall[2].find((btn: any) => btn.text === 'No');
      noButton.onPress();
      
      expect(groupRepository.deleteGroup).not.toHaveBeenCalled();
    });

    it('should handle delete errors gracefully', async () => {
      (groupRepository.deleteGroup as jest.Mock).mockRejectedValue(new Error('Delete failed'));
      render(<GroupsView navigation={mockNavigation as any} />);
      
      fireEvent.press(screen.getByText('Leave Groups'));
      fireEvent.press(screen.getByText('House Group'));
      
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const yesButton = alertCall[2].find((btn: any) => btn.text === 'Yes');
      await yesButton.onPress();
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to leave group. Please try again.');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle groups without id/code and large numbers', () => {
      const groupWithoutId = { ...mockGroups[0], id: undefined, code: undefined };
      const manyGroups = Array.from({ length: 50 }, (_, i) => ({
        id: `group-${i}`, name: `Group ${i}`, created_by: 'user1',
        created_at: Date.now(), updated_at: Date.now(), member_count: i,
        currently_watching: [], finished: [],
      }));
      
      (useGroups as jest.Mock).mockReturnValue({ groups: [groupWithoutId], groupsLoading: false });
      render(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.getByText('House Group')).toBeTruthy();
      
      (useGroups as jest.Mock).mockReturnValue({ groups: manyGroups, groupsLoading: false });
      const { rerender } = render(<GroupsView navigation={mockNavigation as any} />);
      rerender(<GroupsView navigation={mockNavigation as any} />);
      expect(screen.getByText('Group 0')).toBeTruthy();
      expect(screen.getByText('Group 49')).toBeTruthy();
    });
  });
});