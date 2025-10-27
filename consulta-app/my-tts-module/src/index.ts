// Reexport the native module. On web, it will be resolved to MyTtsModule.web.ts
// and on native platforms to MyTtsModule.ts
export { default } from './MyTtsModule';
export { default as MyTtsModuleView } from './MyTtsModuleView';
export * from  './MyTtsModule.types';
