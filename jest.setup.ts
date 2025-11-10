import "@testing-library/jest-native/extend-expect";

/**
 * Some RN versions move/rename the NativeAnimatedHelper path.
 * Guard this mock so tests don’t fail when the path isn’t present.
 */
const animatedHelperPath = "react-native/Libraries/Animated/NativeAnimatedHelper";
try {
  // If the module exists, mock it to silence warnings.
  require.resolve(animatedHelperPath);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  jest.mock(animatedHelperPath, () => ({}));
} catch {
  // No-op: path not found in this RN version; nothing to mock.
}

/**
 * Mock reanimated to a stable Jest mock implementation to avoid native errors.
 * (Matches the official RN Testing Library guidance)
 */
// jest.mock("react-native-reanimated", () => {
//   const Reanimated = require("react-native-reanimated/mock");
//   // The mock has a no-op default .call; keep it to avoid undefined errors.
//   Reanimated.default.call = () => {};
//   return Reanimated;
// });

/**
 * Mock navigation so we can assert .navigate calls in unit tests
 * without rendering a NavigationContainer.
 */
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
  };
});

jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn() },
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));