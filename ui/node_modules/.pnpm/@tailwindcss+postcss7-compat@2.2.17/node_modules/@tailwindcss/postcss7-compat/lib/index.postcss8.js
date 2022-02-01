"use strict";

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

var _getModuleDependencies = _interopRequireDefault(require("./lib/getModuleDependencies"));

var _registerConfigAsDependency = _interopRequireDefault(require("./lib/registerConfigAsDependency"));

var _processTailwindFeatures = _interopRequireDefault(require("./processTailwindFeatures"));

var _formatCSS = _interopRequireDefault(require("./lib/formatCSS"));

var _resolveConfig = _interopRequireDefault(require("./util/resolveConfig"));

var _getAllConfigs = _interopRequireDefault(require("./util/getAllConfigs"));

var _constants = require("./constants");

var _defaultConfigStub = _interopRequireDefault(require("../stubs/defaultConfig.stub.js"));

var _jit = _interopRequireDefault(require("./jit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveConfigPath(filePath) {
  // require('tailwindcss')({ theme: ..., variants: ... })
  if (_lodash.default.isObject(filePath) && !_lodash.default.has(filePath, 'config') && !_lodash.default.isEmpty(filePath)) {
    return undefined;
  } // require('tailwindcss')({ config: 'custom-config.js' })


  if (_lodash.default.isObject(filePath) && _lodash.default.has(filePath, 'config') && _lodash.default.isString(filePath.config)) {
    return _path.default.resolve(filePath.config);
  } // require('tailwindcss')({ config: { theme: ..., variants: ... } })


  if (_lodash.default.isObject(filePath) && _lodash.default.has(filePath, 'config') && _lodash.default.isObject(filePath.config)) {
    return undefined;
  } // require('tailwindcss')('custom-config.js')


  if (_lodash.default.isString(filePath)) {
    return _path.default.resolve(filePath);
  } // require('tailwindcss')


  for (const configFile of _constants.supportedConfigFiles) {
    try {
      const configPath = _path.default.resolve(configFile);

      _fs.default.accessSync(configPath);

      return configPath;
    } catch (err) {}
  }

  return undefined;
}

const getConfigFunction = config => () => {
  if (_lodash.default.isUndefined(config)) {
    return (0, _resolveConfig.default)([...(0, _getAllConfigs.default)(_defaultConfigStub.default), {
      corePlugins: {
        caretColor: false,
        content: false
      }
    }]);
  } // Skip this if Jest is running: https://github.com/facebook/jest/pull/9841#issuecomment-621417584


  if (process.env.JEST_WORKER_ID === undefined) {
    if (!_lodash.default.isObject(config)) {
      (0, _getModuleDependencies.default)(config).forEach(mdl => {
        delete require.cache[require.resolve(mdl.file)];
      });
    }
  }

  const configObject = _lodash.default.isObject(config) ? _lodash.default.get(config, 'config', config) : require(config);
  return (0, _resolveConfig.default)([...(0, _getAllConfigs.default)(configObject), {
    corePlugins: {
      caretColor: false,
      content: false
    }
  }]);
};

module.exports = function tailwindcss(config) {
  const resolvedConfigPath = resolveConfigPath(config);
  const getConfig = getConfigFunction(resolvedConfigPath || config);

  const mode = _lodash.default.get(getConfig(), 'mode', 'aot');

  if (mode === 'jit') {
    return {
      postcssPlugin: 'tailwindcss',
      plugins: (0, _jit.default)(config)
    };
  }

  const plugins = [];

  if (!_lodash.default.isUndefined(resolvedConfigPath)) {
    plugins.push((0, _registerConfigAsDependency.default)(resolvedConfigPath));
  }

  return {
    postcssPlugin: 'tailwindcss',
    plugins: [...plugins, (0, _processTailwindFeatures.default)(getConfig), _formatCSS.default]
  };
};

module.exports.postcss = true;