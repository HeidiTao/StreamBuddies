import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserProfile } from '../useUserProfile';
import { UserDoc, StreamingServiceKey } from '../../sample_structs';
import { userRepository } from '../../repositories/UserRepository';
import { getFirestore } from 'firebase/firestore';

jest.mock('../../repositories/UserRepository'); // points Jest to the manual mock

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
}));

describe("useUserProfile", () => {
    const fakeUser: UserDoc = { 
        id: '1', user_name: 'Heidi', phone_number: '+19876543210',
        streaming_services: ['disney'],
     };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when uid is not provided', async () => {
        const { result } = renderHook(() => useUserProfile(undefined));

        expect(result.current.profile).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('subscribes and returns user data', async () => {
        // fake subscribe: calls callback immediately with fakeUser
        const unsubscribe = jest.fn();
        (userRepository.subscribeToUser as jest.Mock).mockImplementation((uid, callback) => {
            callback(fakeUser);
            return unsubscribe;
        });

        const { result } = renderHook(() => useUserProfile('123'));

        // wait for state update in useEffect
        await waitFor(() => {
        expect(result.current.loading).toBe(false);
        });

        expect(result.current.profile).toEqual(fakeUser);
        expect(userRepository.subscribeToUser).toHaveBeenCalledWith('123', expect.any(Function));
    });

    it('calls createUser correctly', async () => {
        // const mockDate = new Date('2025-12-04T12:34:56Z');
        // global.Date = class extends Date {
        //     constructor() {
        //     super();
        //     return mockDate;
        //     }
        // } as unknown as DateConstructor;

        (userRepository.create as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useUserProfile('123'));

        await act(async () => {
        await result.current.createUser({ 
            user_name: 'Test', phone_number: '+10404040404', 
            streaming_services: ['apple_tv', 'netflix'],
            profile_pic: 'test_image_url'
        });
        });

        expect(userRepository.create).toHaveBeenCalledWith('123', {
            user_name: 'Test',
            phone_number: '+10404040404',
            streaming_services: ['apple_tv', 'netflix'],
            profile_pic: 'test_image_url',
            // created_at: mockDate.toISOString(),
            // join_date: mockDate.toISOString(),
        });

        // // restore real date
        // global.Date = Date;
    });

    it('updates user correctly', async () => {
        const initialProfile = {
            id: '123',
            user_name: 'Old Name',
            phone_number: '+1010101010',
            streaming_services: [],
            profile_pic: 'old_url',
        };

        (userRepository.update as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useUserProfile('123'));

        // Set the initial profile manually since hook normally gets it from subscription
        act(() => {
            result.current.setProfile(initialProfile);
        });

        const updates = { user_name: 'New Name', streaming_services: [ 'netflix'] as StreamingServiceKey[],};

        await act(async () => {
            await result.current.updateUser(updates);
        });

        // Check the repo call
        expect(userRepository.update).toHaveBeenCalledWith({
            ...initialProfile,
            ...updates,
        });

        // Check local state updated
        expect(result.current.profile).toEqual({
            ...initialProfile,
            ...updates,
        });
    });

    it("throws if updateUser is called when no profile is loaded", async () => {
        // Mock the subscription function to return an unsubscribe,
        // but do NOT call the callback → profile stays null
        (userRepository.subscribeToUser as jest.Mock).mockImplementation(
            (uid, callback) => {
            return jest.fn(); // unsubscribe
            }
        );

        const { result } = renderHook(() => useUserProfile("123"));

        await expect(
            act(async () => {
            await result.current.updateUser({ user_name: "Foo" });
            })
        ).rejects.toThrow("No profile loaded");
    });

    it("throws if functions called when no uid is provided", async () => {

        const { result } = renderHook(() => useUserProfile(undefined));

        await expect(
            act(async () => {
                await result.current.createUser({ 
                    user_name: 'Test', phone_number: '+10404040404', 
                    streaming_services: ['apple_tv', 'netflix'],
                });
            })
        ).rejects.toThrow("No auth UID available");

        await expect(
            act(async () => {
                await result.current.updateUser({ user_name: "random" });
            })
        ).rejects.toThrow("No auth UID available");

        await expect(
            act(async () => {
                await result.current.deleteUser();
            })
        ).rejects.toThrow("No auth UID available");
    });


    it('deletes user correctly', async () => {
        (userRepository.delete as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useUserProfile('123'));

        await act(async () => {
            await result.current.deleteUser();
        });

        expect(userRepository.delete).toHaveBeenCalledWith('123');
    });

});