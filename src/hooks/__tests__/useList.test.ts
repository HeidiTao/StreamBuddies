import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useList } from '../useList';
import { listRepository } from '../../repositories/ListRepository';
import { WatchlistDoc } from '../../sample_structs';

jest.mock("../../repositories/ListRepository", () => ({
    listRepository: {
        add: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("useList hook", () => {
    const defaultList: WatchlistDoc = {
        name: '',
        owner_user_id: '0',
        visibility: 'private',
        description: '',
        group_id: '0',
        created_at: expect.any(Number),
        updated_at: expect.any(Number),
        item_count: 0,
        preview_covers: [],
        items: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("initializes with default list if no initialList is provided", () => {
        const { result } = renderHook(() => useList());
        expect(result.current.list).toEqual(expect.objectContaining(defaultList));
    });

    it("initializes with provided initialList", () => {
        const initialList: WatchlistDoc = {
            id: "123",
            name: "My List",
            owner_user_id: "999",
            visibility: "shared",
            description: "desc",
            group_id: "1",
            created_at: 1,
            updated_at: 2,
            item_count: 0,
            preview_covers: [],
            items: [],
        };
        const { result } = renderHook(() => useList(initialList));
        expect(result.current.list).toEqual(initialList);
    });

    it("updates list state correctly with updateList", () => {
        const { result } = renderHook(() => useList());
        act(() => {
            result.current.updateList({ name: "New Name", visibility: "shared" });
        });
        expect(result.current.list.name).toBe("New Name");
        expect(result.current.list.visibility).toBe("shared");
    });

    it("calls listRepository.add when saving a new list (no id)", async () => {
        (listRepository.add as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useList());

        await act(async () => {
            await result.current.saveList();
        });

        expect(listRepository.add).toHaveBeenCalledWith(result.current.list);
        expect(listRepository.update).not.toHaveBeenCalled();
    });

    it("calls listRepository.update when saving an existing list (has id)", async () => {
        const initialList: WatchlistDoc = {
            id: "abc",
            name: "My List",
            owner_user_id: "0",
            visibility: "private",
            description: "",
            group_id: "0",
            created_at: 0,
            updated_at: 0,
            item_count: 0,
            preview_covers: [],
            items: [],
        };
        (listRepository.update as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useList(initialList));

        await act(async () => {
            await result.current.saveList();
        });

        expect(listRepository.update).toHaveBeenCalledWith(result.current.list);
        expect(listRepository.add).not.toHaveBeenCalled();
    });

    it("calls listRepository.delete when deleting a list with id", async () => {
        const initialList: WatchlistDoc = {
            id: "abc",
            name: "My List",
            owner_user_id: "0",
            visibility: "private",
            description: "",
            group_id: "0",
            created_at: 0,
            updated_at: 0,
            item_count: 0,
            preview_covers: [],
            items: [],
        };
        (listRepository.delete as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useList(initialList));

        await act(async () => {
            await result.current.deleteList();
        });

        expect(listRepository.delete).toHaveBeenCalledWith("abc");
    });

    it("does not call listRepository.delete if list has no id", async () => {
        const { result } = renderHook(() => useList());

        await act(async () => {
            await result.current.deleteList();
        });

        expect(listRepository.delete).not.toHaveBeenCalled();
    });
});
