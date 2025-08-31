module.exports = function(api) {
  const isProduction = api.env('production');

  const presets = ['module:metro-react-native-babel-preset'];
  const plugins = [];

  if (isProduction) {
    // remove console in production
    plugins.push('transform-remove-console');
  }

  return {
    presets,
    plugins,
  };
};