const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve .js (CJS) files before .mjs (ESM) files
// This prevents the `import.meta.env` syntax error from zustand's ESM build
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

module.exports = config;
