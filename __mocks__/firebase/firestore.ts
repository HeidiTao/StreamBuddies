// sob why isn't the test working
export const Timestamp = {
  now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })),
  fromDate: jest.fn((date: Date) => date),
};

export const collection = jest.fn();
export const doc = jest.fn();
export const getDocs = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();