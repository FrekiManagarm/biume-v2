module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // The mobile app pins React to the version Expo SDK 57 requires, while the
  // workspace root carries its own for the web apps. Without this mapping the
  // component under test and the test renderer each load a different copy, and
  // every hook call fails with "Invalid hook call".
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  transformIgnorePatterns: [
    // `@noble/ciphers` ships ESM only, so it must be transformed rather than
    // required as-is.
    'node_modules/(?!(.bun|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@noble/.*))',
  ],
};
