module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(firebase|@firebase|react-native|@react-native|react-native-deck-swiper|@react-navigation|expo|expo-modules-core|@expo|@unimodules|expo(nent)?|@expo(nent)?)/)"
  ],
  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
};
