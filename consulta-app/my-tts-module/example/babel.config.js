module.exports = function(api) {
  api.cache(true);
  return {
    // Mantenemos el preset por defecto de Expo
    presets: ['babel-preset-expo'],
    plugins: [
      // Añadimos el plugin de decoradores
      ['@babel/plugin-proposal-decorators', { legacy: true }]
    ]
  };
};