import { groupRepository } from "../GroupRepository";

import { doc, getDoc, getDocs, addDoc, deleteDoc,
    collection, onSnapshot, query,
} from "firebase/firestore";

jest.mock("../../../config/firebase", () => ({
    db: "mocked-db",
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    collection: jest.fn(),
    onSnapshot: jest.fn(),
}));

describe('GroupRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createGroup', () => {
        it('should generate a unique code and call addDoc', async () => {
            // getDocs returns empty to simulate unique code
            (getDocs as jest.Mock).mockResolvedValue({ empty: true });
            (addDoc as jest.Mock).mockResolvedValue({ id: '123' });

            const group = { name: 'Test Group', description: 'desc', created_by: 'user1', created_at: Date.now(), updated_at: Date.now(), member_count: 1, code: '' };
            const savedGroup = await groupRepository.createGroup(group as any);

            expect(getDocs).toHaveBeenCalled();       // checked uniqueness
            expect(addDoc).toHaveBeenCalled();        // added to Firestore
            expect(savedGroup.id).toBe('123');        // returns saved ID
            expect(savedGroup.code).toHaveLength(6);  // generated code
        });

        it('should retry code generation if collision occurs', async () => {
            const firstSnap = { empty: false }; // collision
            const secondSnap = { empty: true }; // success
            (getDocs as jest.Mock).mockResolvedValueOnce(firstSnap).mockResolvedValueOnce(secondSnap);
            (addDoc as jest.Mock).mockResolvedValue({ id: '456' });

            const group = { name: 'Retry Group', description: '', created_by: 'user2', created_at: Date.now(), updated_at: Date.now(), member_count: 1, code: '' };
            const savedGroup = await groupRepository.createGroup(group as any);

            expect(getDocs).toHaveBeenCalledTimes(2);
            expect(addDoc).toHaveBeenCalled();
            expect(savedGroup.id).toBe('456');
        });
    });

    describe('deleteGroup', () => {
        it('should call deleteDoc with correct path', async () => {
            (deleteDoc as jest.Mock).mockResolvedValue(undefined);

            await groupRepository.deleteGroup('abc123');

            expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object), 'groups', 'abc123');
            });

        it('should throw error if deleteDoc fails', async () => {
            (deleteDoc as jest.Mock).mockRejectedValue(new Error('Delete failed'));

            await expect(groupRepository.deleteGroup('fail123')).rejects.toThrow('Delete failed');
        });
    });

    describe('subscribe', () => {
        it('should call onSnapshot and return unsubscribe', () => {
            const fakeUnsubscribe = jest.fn();
            const fakeCallback = jest.fn();
            const fakeQuery = {};
            const fakeCollection = {};
            const fakeSnapshot = { forEach: jest.fn() };
            const { onSnapshot } = require('firebase/firestore');

            (collection as jest.Mock).mockReturnValue(fakeCollection);
            (query as jest.Mock).mockReturnValue(fakeQuery);
            onSnapshot.mockImplementation((q, callback) => {
                callback(fakeSnapshot);
                return fakeUnsubscribe;
            });

            const unsubscribe = groupRepository.subscribe(fakeCallback);
            expect(unsubscribe).toBe(fakeUnsubscribe);
            expect(fakeSnapshot.forEach).toHaveBeenCalled();
        });
})






})