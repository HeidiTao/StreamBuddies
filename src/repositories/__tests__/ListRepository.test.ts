import { WatchlistVisibility } from '../../sample_structs';
import { listRepository } from '../ListRepository';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore';

jest.mock("../../../config/firebase", () => ({
    db: "mocked-db",
}));

jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    onSnapshot: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    Timestamp: {
        fromDate: jest.fn((d) => d),
    },
}));

describe('ListRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('subscribe calls callback with lists', () => {
        const fakeCallback = jest.fn();
        const fakeQuerySnapshot = {
            forEach: (cb: any) => {
                cb({ id: '1', data: () => ({ name: 'List 1', visibility: 'private', description: '', created_at: { toDate: () => 0 }, updated_at: { toDate: () => 0 }, item_count: 0, preview_covers: [], items: [] }) });
                cb({ id: '2', data: () => ({ name: 'List 2', visibility: 'shared', description: '', created_at: { toDate: () => 0 }, updated_at: { toDate: () => 0 }, item_count: 0, preview_covers: [], items: [] }) });
            }
        };

        (collection as jest.Mock).mockReturnValue('col-ref');
        (onSnapshot as jest.Mock).mockImplementation((colRef, cb) => {
            cb(fakeQuerySnapshot);
            return jest.fn(); // unsubscribe
        });

        listRepository.subscribe(fakeCallback);

        expect(fakeCallback).toHaveBeenCalledWith([
            expect.objectContaining({ id: '1', name: 'List 1', visibility: 'private' }),
            expect.objectContaining({ id: '2', name: 'List 2', visibility: 'shared' }),
        ]);
    });

    it('add calls addDoc with correct fields', async () => {
        (collection as jest.Mock).mockReturnValue('col-ref');
        (addDoc as jest.Mock).mockResolvedValue(undefined);

        const newList = { name: 'New', owner_user_id: '1', visibility: 'private', description: 'desc', group_id: '0', created_at: 0, updated_at: 0, item_count: 0, preview_covers: [], items: [] };

        await listRepository.add(newList);

        expect(addDoc).toHaveBeenCalledWith('col-ref', expect.objectContaining({
            name: 'New',
            owner_user_id: '1',
            visibility: 'private',
            group_id: '0',
            description: 'desc',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            item_count: 0,
            // preview_covers: ['https://reactnative.dev/img/tiny_logo.png'],
        }));
    });

    it('update throws if no id', async () => {
        await expect(listRepository.update({ name: 'X' } as any)).rejects.toThrow('List must have an id to be updated');
    });

    it('update calls updateDoc correctly', async () => {
        (doc as jest.Mock).mockReturnValue('doc-ref');
        (updateDoc as jest.Mock).mockResolvedValue(undefined);

        const existingList = { id: 'abc', name: 'List', owner_user_id: '1', visibility: 'private', description: 'desc', group_id: '0', created_at: 0, updated_at: 0, item_count: 0, preview_covers: [], items: [] };

        await listRepository.update(existingList);

        expect(updateDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({
            name: 'List',
            owner_user_id: '1',
            description: 'desc',
            visibility: 'private',
            group_id: '0',
            created_at: 0,
            updated_at: expect.anything(),
        }));
    });

    it('delete calls deleteDoc correctly', async () => {
        (doc as jest.Mock).mockReturnValue('doc-ref');
        (deleteDoc as jest.Mock).mockResolvedValue(undefined);

        await listRepository.delete('abc');

        expect(deleteDoc).toHaveBeenCalledWith('doc-ref');
    });

    it('toggleVisibility throws if no id', async () => {
        await expect(listRepository.toggleVisibility({ name: 'X' } as any)).rejects.toThrow('List must have an id to be updated');
    });

    it('toggleVisibility calls updateDoc correctly', async () => {
        (doc as jest.Mock).mockReturnValue('doc-ref');
        (updateDoc as jest.Mock).mockResolvedValue(undefined);

        const list = { id: 'abc', name: 'List', visibility:'private' as WatchlistVisibility, owner_user_id: '1', description: '', group_id: '0', created_at: 0, updated_at: 0, item_count: 0, preview_covers: [], items: [] };

        await listRepository.toggleVisibility(list);

        expect(updateDoc).toHaveBeenCalledWith('doc-ref', { visibility: 'shared' });
    });
});