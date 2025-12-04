import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserProfile } from '../useUserProfile';
import { UserDoc } from '../../sample_structs';
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

    it('calls updateUser correctly', async () => {
        
    });
});