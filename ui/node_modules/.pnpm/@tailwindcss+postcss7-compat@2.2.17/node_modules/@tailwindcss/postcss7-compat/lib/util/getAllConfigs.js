"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAllConfigs;

var _defaultConfigStub = _interopRequireDefault(require("../../stubs/defaultConfig.stub.js"));

var _featureFlags = require("../featureFlags");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAllConfigs(config) {
  var _config$presets;

  const configs = ((_config$presets = config === null || config === void 0 ? void 0 : config.presets) !== null && _config$presets !== void 0 ? _config$presets : [_defaultConfigStub.default]).slice().reverse().flatMap(preset => getAllConfigs(preset instanceof Function ? preset() : preset));
  const features = {// Add experimental configs here...
  };
  const experimentals = Object.keys(features).filter(feature => (0, _featureFlags.flagEnabled)(config, feature)).map(feature => features[feature]);
  return [config, ...experimentals, ...configs];
}