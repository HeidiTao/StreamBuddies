

import { doc, getDoc, getDocs, addDoc, deleteDoc, updateDoc,
    collection, onSnapshot, query, where
} from "firebase/firestore";

jest.mock("../../../config/firebase", () => ({
    db: "mocked-db",
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    onSnapshot: jest.fn(),
    Timestamp: {
        fromDate: jest.fn((d) => d),
    },
}));

import { groupRepository } from "../GroupRepository";

describe('GroupRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call callback with parsed group docs", () => {
        // mock collection + query
        const mockQ = {};
        collection.mockReturnValue("mockCollection");
        query.mockReturnValue(mockQ);
        where.mockReturnValue("mockWhere");

        // fake docs returned by Firestore
        const fakeDocs = [
        {
            id: "g1",
            data: () => ({
            name: "Study Buddies",
            description: "We do things",
            created_by: "u1",
            member_ids: ["u1", "u2"],
            member_count: 2,
            code: "ABC123",
            currently_watching: [],
            finished: [],
            comments: [],
            created_at: 123,
            updated_at: 456,
            }),
        },
        ];

        // fake QuerySnapshot
        const fakeQuerySnapshot = {
        forEach: (fn: any) => fakeDocs.forEach(fn),
        };

        // mock onSnapshot to instantly fire the callback
        onSnapshot.mockImplementation((_q, cb) => {
        cb(fakeQuerySnapshot);
        return () => {}; // unsubscribe fn
        });

        const callback = jest.fn();

        // run
        groupRepository.subscribeToUserGroups("u1", callback);

        // assert
        expect(callback).toHaveBeenCalledWith([
            {
                id: "g1",
                name: "Study Buddies",
                description: "We do things",
                created_by: "u1",
                member_ids: ["u1", "u2"],
                member_count: 2,
                code: "ABC123",
                currently_watching: [],
                finished: [],
                comments: [],
                created_at: 123,
                updated_at: 456,
            },
        ]);
    });

    describe("createGroup", () => {
        it("generates a unique code and calls addDoc", async () => {
            (getDocs as jest.Mock).mockResolvedValue({ empty: true });
            (addDoc as jest.Mock).mockResolvedValue({ id: "123" });

            const groupData = {
                name: "Test Group",
                description: "desc",
                created_by: "user1",
                member_count: 1,
                code: "",
                created_at: Date.now(),
                updated_at: Date.now(),
            };

            const savedGroup = await groupRepository.createGroup("user1", groupData as any);

            expect(addDoc).toHaveBeenCalled();
            expect(savedGroup.id).toBe("123");
            expect(savedGroup.code).toHaveLength(6);
        });
    });


    describe("deleteGroup", () => {
        it("calls deleteDoc with correct path", async () => {
            (deleteDoc as jest.Mock).mockResolvedValue("deleted");

            await groupRepository.deleteGroup("group1");

            expect(deleteDoc).toHaveBeenCalled();
        });

        it("throws if deleteDoc fails", async () => {
            (deleteDoc as jest.Mock).mockRejectedValue(new Error("Delete failed"));

            await expect(groupRepository.deleteGroup("fail1")).rejects.toThrow("Delete failed");
        });
    });

    describe("subscribeToUserGroups", () => {
        it("calls callback with parsed groups", () => {
            const fakeUnsubscribe = jest.fn();
            const fakeCallback = jest.fn();
            const fakeCollection = {};
            const fakeQuery = {};
            const fakeDocs = [
                {
                    id: "g1",
                    data: () => ({
                        name: "Study Buddies",
                        description: "We do things",
                        created_by: "u1",
                        member_ids: ["u1"],
                        member_count: 1,
                        code: "ABC123",
                        currently_watching: [],
                        finished: [],
                        comments: [],
                        created_at: 123,
                        updated_at: 456,
                    }),
                },
            ];

            (collection as jest.Mock).mockReturnValue(fakeCollection);
            (query as jest.Mock).mockReturnValue(fakeQuery);
            (where as jest.Mock).mockReturnValue("mockWhere");

            (onSnapshot as jest.Mock).mockImplementation((_q, cb) => {
                cb({ forEach: (fn: any) => fakeDocs.forEach(fn) });
                return fakeUnsubscribe;
            });

            const unsubscribe = groupRepository.subscribeToUserGroups("u1", fakeCallback);

            expect(unsubscribe).toBe(fakeUnsubscribe);
            expect(fakeCallback).toHaveBeenCalledWith([
                {
                id: "g1",
                name: "Study Buddies",
                description: "We do things",
                created_by: "u1",
                member_ids: ["u1"],
                member_count: 1,
                code: "ABC123",
                currently_watching: [],
                finished: [],
                comments: [],
                created_at: 123,
                updated_at: 456,
                },
            ]);
        });
    });

    describe("joinGroup", () => {
        it("adds user to member_ids if not already there", async () => {
            const groupDoc = {
                id: "g1",
                data: () => ({ member_ids: [], member_count: 0 }),
            };
            (getDocs as jest.Mock).mockResolvedValue({ empty: false, docs: [groupDoc] });
            (doc as jest.Mock).mockReturnValue("docRef");
            (updateDoc as jest.Mock).mockResolvedValue(undefined);

            const group = await groupRepository.joinGroup("CODE1", "user1");

            expect(updateDoc).toHaveBeenCalledWith("docRef", expect.objectContaining({ member_ids: ["user1"] }));
            expect(group).toHaveProperty("id", "g1");
            });

            it("returns null if group code not found", async () => {
            (getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] });

            const group = await groupRepository.joinGroup("BADCODE", "user1");

            expect(group).toBeNull();
        });
    });

    describe("getGroupWithMembers", () => {
        it("fetches group and member details", async () => {
            const groupSnap = { exists: () => true, id: "g1", data: () => ({ member_ids: ["u1"], name: "G1", created_by: "u1", description: "", member_count: 1, code: "ABC123", currently_watching: [], finished: [], created_at: 123, updated_at: 456 }) };
            const userSnap = { exists: () => true, id: "u1", data: () => ({ user_name: "U1", phone_number: "", birthday: "", join_date: { toDate: () => 0 }, streaming_services: [], profile_pic: "", created_at: { toDate: () => 0 }, updated_at: { toDate: () => 0 } }) };

            (doc as jest.Mock).mockReturnValueOnce("groupDocRef").mockReturnValueOnce("userDocRef");
            (getDoc as jest.Mock).mockResolvedValueOnce(groupSnap).mockResolvedValueOnce(userSnap);

            const result = await groupRepository.getGroupWithMembers("g1");

            expect(result?.group.id).toBe("g1");
            expect(result?.members[0].id).toBe("u1");
        });

        it("returns null if group does not exist", async () => {
            (doc as jest.Mock).mockReturnValue("groupDocRef");
            (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

            const result = await groupRepository.getGroupWithMembers("g1");

            expect(result).toBeNull();
        });
    });

})

