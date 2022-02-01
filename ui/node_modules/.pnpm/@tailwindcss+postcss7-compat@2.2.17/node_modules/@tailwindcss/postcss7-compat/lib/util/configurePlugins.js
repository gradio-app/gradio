"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(pluginConfig, plugins) {
  if (pluginConfig === undefined) {
    return plugins;
  }

  const pluginNames = Array.isArray(pluginConfig) ? pluginConfig : [...new Set(plugins.filter(pluginName => {
    return pluginConfig !== false && pluginConfig[pluginName] !== false;
  }).concat(Object.keys(pluginConfig).filter(pluginName => {
    return pluginConfig[pluginName] !== false;
  })))];
  return pluginNames;
}