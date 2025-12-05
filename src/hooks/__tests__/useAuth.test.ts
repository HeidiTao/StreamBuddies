import { useAuth } from "../useAuth";
import { onAuthStateChanged } from "firebase/auth";
import { renderHook, act } from "@testing-library/react-native";

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}));

// jest.mock("firebase/auth", () => {
//     return {
//         onAuthStateChanged: jest.fn(),
//     };
// });
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    onAuthStateChanged: jest.fn(),
}));
// jest.mock("../../config/firebase", () => ({
//     auth: { mocked: true }
// }));


describe("useAuth", () => {

    it("starts with loading=true and authUser=null", () => {
        (onAuthStateChanged as jest.Mock).mockReturnValue(() => {});

        const { result } = renderHook(() => useAuth());

        expect(result.current.loading).toBe(true);
        expect(result.current.authUser).toBe(null);
    });

    it("updates authUser and loading when Firebase callback fires", async () => {
        let callback: any;

        // Mock the subscription & capture the callback
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, cb) => {
            callback = cb;
            return jest.fn(); // unsubscribe
        });

        const { result } = renderHook(() => useAuth());

        // Before the callback: still loading
        expect(result.current.loading).toBe(true);

        const fakeUser = { uid: "123", email: "test@example.com" };

        await act(async () => {
            callback(fakeUser);
        });

        expect(result.current.authUser).toEqual(fakeUser);
        expect(result.current.loading).toBe(false);
    });

    it("calls unsubscribe on unmount", () => {
        const unsubscribe = jest.fn();

        (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribe);

        const { unmount } = renderHook(() => useAuth());

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });

})


