import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLists } from '../useLists';
import { listRepository } from '../../repositories/ListRepository';
import { WatchlistDoc } from '../../sample_structs';

jest.mock('../../repositories/ListRepository', () => ({
    listRepository: {
        subscribe: jest.fn(),
    },
}));

describe('useLists hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts with empty lists and loading=true', () => {
        // Mock subscribe to never call the callback
        (listRepository.subscribe as jest.Mock).mockReturnValue(() => {});

        const { result } = renderHook(() => useLists());

        expect(result.current.lists).toEqual([]);
        expect(result.current.listLoading).toBe(true);
    });

    it('updates lists and sets loading=false when subscribe callback is called', async () => {
        const fakeLists: WatchlistDoc[] = [
            { id: '1', name: 'List 1', owner_user_id: '123', visibility: 'private', description: '', group_id: '0', created_at: 0, updated_at: 0, item_count: 0, preview_covers: [], items: [] },
            { id: '2', name: 'List 2', owner_user_id: '456', visibility: 'shared', description: '', group_id: '0', created_at: 0, updated_at: 0, item_count: 0, preview_covers: [], items: [] },
        ];

        const unsubscribe = jest.fn();

        // Mock subscribe to immediately call callback with fakeLists
        (listRepository.subscribe as jest.Mock).mockImplementation((callback) => {
            callback(fakeLists);
            return unsubscribe;
        });

        const { result } = renderHook(() => useLists());

        // wait for state updates
        await waitFor(() => {
            expect(result.current.listLoading).toBe(false);
        });

        expect(result.current.lists).toEqual(fakeLists);
        expect(listRepository.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls unsubscribe on unmount', () => {
        const unsubscribe = jest.fn();
        (listRepository.subscribe as jest.Mock).mockReturnValue(unsubscribe);

        const { unmount } = renderHook(() => useLists());

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
