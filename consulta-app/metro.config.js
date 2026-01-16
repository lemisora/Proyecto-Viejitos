// consulta-app/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// Define la ruta exacta al módulo hermano
const moduleRoot = path.resolve(projectRoot, '../tts-to-audio-module');

const config = getDefaultConfig(projectRoot);

// 1. Evitar conflictos de duplicidad de React y React-Native
// Esto es vital si el módulo tiene su propia carpeta node_modules
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList ?? []),
  new RegExp(path.resolve(moduleRoot, 'node_modules', 'react')),
  new RegExp(path.resolve(moduleRoot, 'node_modules', 'react-native')),
];

// 2. Indicar a Metro dónde buscar dependencias
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(moduleRoot, 'node_modules'),
];

// 3. Mapear el nombre del paquete a su ubicación física
config.resolver.extraNodeModules = {
  'tts-to-audio-module': moduleRoot,
};

// 4. Vigilar los cambios en la carpeta del módulo hermano
config.watchFolders = [moduleRoot];

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;