"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveConfigPath;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isObject(value) {
  return typeof value === 'object' && value !== null;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function resolveConfigPath(pathOrConfig) {
  // require('tailwindcss')({ theme: ..., variants: ... })
  if (isObject(pathOrConfig) && pathOrConfig.config === undefined && !isEmpty(pathOrConfig)) {
    return null;
  } // require('tailwindcss')({ config: 'custom-config.js' })


  if (isObject(pathOrConfig) && pathOrConfig.config !== undefined && isString(pathOrConfig.config)) {
    return _path.default.resolve(pathOrConfig.config);
  } // require('tailwindcss')({ config: { theme: ..., variants: ... } })


  if (isObject(pathOrConfig) && pathOrConfig.config !== undefined && isObject(pathOrConfig.config)) {
    return null;
  } // require('tailwindcss')('custom-config.js')


  if (isString(pathOrConfig)) {
    return _path.default.resolve(pathOrConfig);
  } // require('tailwindcss')


  for (const configFile of ['./tailwind.config.js', './tailwind.config.cjs']) {
    try {
      const configPath = _path.default.resolve(configFile);

      _fs.default.accessSync(configPath);

      return configPath;
    } catch (err) {}
  }

  return null;
}