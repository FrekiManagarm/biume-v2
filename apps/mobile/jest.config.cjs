const path = require('node:path');

// Metro loads the ESM build of the icons; Jest transforms only `.js`/`.ts`, so
// the same modules are resolved to the package's own CommonJS build instead of
// teaching Babel about a second extension.
const lucideCommonJs = path.dirname(require.resolve('lucide-react-native'));

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
    '^lucide-react-native/icons/(.*)$': path.join(lucideCommonJs, 'icons', '$1.js'),
    '^lucide-react-native$': path.join(lucideCommonJs, 'lucide-react-native.js'),
  },
  transformIgnorePatterns: [
    // `@noble/ciphers` and `lucide-react-native` ship ESM only, so they must be
    // transformed rather than required as-is.
    'node_modules/(?!(.bun|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|lucide-react-native|@noble/.*))',
  ],
};
