const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    resolverMainFields: ['react-native', 'browser', 'main'],
    platforms: ['ios', 'android', 'native', 'web'],
    alias: {
      '@10play/tentap-editor': '@10play/tentap-editor/lib/commonjs/index.js',
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);