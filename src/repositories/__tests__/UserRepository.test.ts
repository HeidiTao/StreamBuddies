import { userRepository } from "../UserRepository";
import { doc, getDoc, setDoc, updateDoc, deleteDoc,
    collection, onSnapshot,
 } from "firebase/firestore";
import { db } from "../../../config/firebase";

jest.mock("../../../config/firebase", () => ({
    db: "mocked-db",
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    collection: jest.fn(),
    onSnapshot: jest.fn(),
    Timestamp: {
        fromDate: jest.fn(() => "mocked-timestamp"),
    },
}));

describe("UserRepository", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ---------------------------
    // getUser
    // ---------------------------
    describe("getUser", () => {
        it("returns formatted user when doc exists", async () => {
            (doc as jest.Mock).mockReturnValue("doc-ref");

            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => true,
                id: "123",
                data: () => ({
                    user_name: "random name",
                    phone_number: "1112223333",
                    birthday: "2000-01-01",
                    // join_date: { toDate: () => new Date("2020-01-01") },
                    streaming_services: ["netflix"],
                    profile_pic: "pic_url",
                    created_at: { toDate: () => new Date("2020-01-01") },
                    updated_at: { toDate: () => new Date("2020-01-02") },
                }),
            });

            const result = await userRepository.getUser("123");

            expect(doc).toHaveBeenCalledWith("mocked-db", "users", "123");
            expect(result).toEqual({
                id: "123",
                user_name: "random name",
                phone_number: "1112223333",
                birthday: "2000-01-01",
                // join_date: new Date("2020-01-01"),
                streaming_services: ["netflix"],
                profile_pic: "pic_url",
                created_at: new Date("2020-01-01"),
                updated_at: new Date("2020-01-02"),
            });
        });

        it("returns null when doc does not exist", async () => {
            (doc as jest.Mock).mockReturnValue("doc-ref");

            (getDoc as jest.Mock).mockResolvedValue({
                exists: () => false
            });

            const result = await userRepository.getUser("fake-id");
            expect(result).toBeNull();
        });
    });

    // ---------------------------
    // create
    // ---------------------------
    describe("create", () => {
        it("calls setDoc with timestamped data", async () => {
            (doc as jest.Mock).mockReturnValue("doc-ref");
            
            const data = {
                user_name: "ABC",
                phone_number: "123",
                // birthday: null,
                // join_date: null,
                streaming_services: [],
                profile_pic: "pic",
            };

            await userRepository.create("uid123", data);

            expect(setDoc).toHaveBeenCalledWith("doc-ref", {
                ...data,
                created_at: "mocked-timestamp",
                updated_at: "mocked-timestamp",
            });
        });
    });

     // ---------------------------
    // update
    // ---------------------------
    describe("update", () => {
        it("throws error if user.id is missing", async () => {
            await expect(userRepository.update({ id: "", user_name: "H" } as any))
                .rejects
                .toThrow("User must have an id to be updated");
        });

        it("calls updateDoc with formatted data", async () => {
            (doc as jest.Mock).mockReturnValue("doc-ref");

            const user = {
                id: "123",
                user_name: "bob",
                birthday: null,
                join_date: null,
                streaming_services: ["hulu", "max"],
                profile_pic: "pic",
            } as any;

            await userRepository.update(user);

            expect(updateDoc).toHaveBeenCalledWith("doc-ref", {
                user_name: "bob",
                join_date: null,
                birthday: null,
                streaming_services: ["hulu", "max"],
                profile_pic: "pic",
                updated_at: "mocked-timestamp",
            });
        });
    });

    // ---------------------------
    // delete
    // ---------------------------
    describe("delete", () => {
        it("calls deleteDoc with reference", async () => {
            (doc as jest.Mock).mockReturnValue("doc-ref");

            await userRepository.delete("abc");

            expect(doc).toHaveBeenCalledWith("mocked-db", "users", "abc");
            expect(deleteDoc).toHaveBeenCalledWith("doc-ref");
        });
    });

    
    // ---------------------------
    // subscribe
    // ---------------------------
    describe("subscribe", () => {
        it("transforms snapshot results and calls the callback", () => {
            const mockCallback = jest.fn();
            const mockUnsubscribe = jest.fn();

            (collection as jest.Mock).mockReturnValue("collection-ref");

            // Firestore onSnapshot simulation
            (onSnapshot as jest.Mock).mockImplementation((ref, cb) => {
                cb({
                    forEach: (fn) => {
                        fn({
                            id: "1",
                            data: () => ({
                                user_name: "A",
                                phone_number: "111",
                                birthday: null,
                                join_date: { toDate: () => new Date("2020-01-01") },
                                streaming_services: [],
                                profile_pic: "pic",
                                created_at: { toDate: () => new Date("2020-01-01") },
                                updated_at: { toDate: () => new Date("2020-01-02") },
                            }),
                        });
                    }
                });
                return mockUnsubscribe;
            });

            const unsub = userRepository.subscribe(mockCallback);

            expect(collection).toHaveBeenCalledWith("mocked-db", "users");
            expect(mockCallback).toHaveBeenCalledWith([
                {
                    id: "1",
                    user_name: "A",
                    phone_number: "111",
                    birthday: null,
                    join_date: new Date("2020-01-01"),
                    streaming_services: [],
                    profile_pic: "pic",
                    created_at: new Date("2020-01-01"),
                    updated_at: new Date("2020-01-02"),
                }
            ]);

            unsub();
            expect(mockUnsubscribe).toHaveBeenCalled();
        });
    });

    // ---------------------------
    // subscribeToUser
    // ---------------------------
    describe("subscribeToUser", () => {
        it("sends null if user does not exist", () => {
            const mockCallback = jest.fn();

            (doc as jest.Mock).mockReturnValue("doc-ref");

            (onSnapshot as jest.Mock).mockImplementation((ref, cb) => {
                cb({
                    exists: () => false
                });
                return () => {};
            });

            userRepository.subscribeToUser("123", mockCallback);
            expect(mockCallback).toHaveBeenCalledWith(null);
        });

        it("calls callback with formatted user when doc exists", () => {
            const mockCallback = jest.fn();

            (doc as jest.Mock).mockReturnValue("doc-ref");

            (onSnapshot as jest.Mock).mockImplementation((ref, cb) => {
                cb({
                    exists: () => true,
                    id: "abc",
                    data: () => ({
                        user_name: "Heidi",
                        phone_number: "1112223333",
                        birthday: "2000-01-01",
                        join_date: { toDate: () => new Date("2020-01-01") },
                        streaming_services: ["netflix"],
                        profile_pic: "pic",
                        created_at: { toDate: () => new Date("2020-01-01") },
                        updated_at: { toDate: () => new Date("2020-01-02") },
                    }),
                });
                return () => {};
            });

            userRepository.subscribeToUser("abc", mockCallback);

            expect(mockCallback).toHaveBeenCalledWith({
                id: "abc",
                user_name: "Heidi",
                phone_number: "1112223333",
                birthday: "2000-01-01",
                join_date: new Date("2020-01-01"),
                streaming_services: ["netflix"],
                profile_pic: "pic",
                created_at: new Date("2020-01-01"),
                updated_at: new Date("2020-01-02"),
            });
        });

    });


})
