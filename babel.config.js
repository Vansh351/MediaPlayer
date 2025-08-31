module.exports = function(api) {
  const isProduction = api.env('production');

  const presets = ['module:metro-react-native-babel-preset'];
  
  // Add the new plugin to the plugins array
  const plugins = [
    ['@babel/plugin-transform-private-methods', { 'loose': true }]
  ];

  if (isProduction) {
    // remove console in production
    plugins.push('transform-remove-console');
  }

  return {
    presets,
    plugins,
  };
};