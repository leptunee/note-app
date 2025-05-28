const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.alias = {
  '@10play/tentap-editor': '@10play/tentap-editor/src/index',
};

module.exports = config;
