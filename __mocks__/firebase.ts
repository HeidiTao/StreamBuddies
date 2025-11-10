// __mocks__/firebase.ts
export const initializeApp = jest.fn();
export const getFirestore = jest.fn();
export const collection = jest.fn();
export const doc = jest.fn();
export const getDocs = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const Timestamp = {
  now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })),
  fromDate: (date: Date) => date, // just return the Date for tests
};
