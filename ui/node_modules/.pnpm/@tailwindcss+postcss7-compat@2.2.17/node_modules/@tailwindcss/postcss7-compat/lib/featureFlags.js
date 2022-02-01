"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flagEnabled = flagEnabled;
exports.issueFlagNotices = issueFlagNotices;
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _chalk = _interopRequireDefault(require("chalk"));

var _log = _interopRequireDefault(require("./util/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const featureFlags = {
  future: [],
  experimental: ['optimizeUniversalDefaults']
};

function flagEnabled(config, flag) {
  if (featureFlags.future.includes(flag)) {
    return config.future === 'all' || _lodash.default.get(config, ['future', flag], false);
  }

  if (featureFlags.experimental.includes(flag)) {
    return config.experimental === 'all' || _lodash.default.get(config, ['experimental', flag], false);
  }

  return false;
}

function experimentalFlagsEnabled(config) {
  if (config.experimental === 'all') {
    return featureFlags.experimental;
  }

  return Object.keys(_lodash.default.get(config, 'experimental', {})).filter(flag => featureFlags.experimental.includes(flag) && config.experimental[flag]);
}

function issueFlagNotices(config) {
  if (process.env.JEST_WORKER_ID !== undefined) {
    return;
  }

  if (experimentalFlagsEnabled(config).length > 0) {
    const changes = experimentalFlagsEnabled(config).map(s => _chalk.default.yellow(s)).join(', ');

    _log.default.warn([`You have enabled experimental features: ${changes}`, 'Experimental features are not covered by semver, may introduce breaking changes, and can change at any time.']);
  }
}

var _default = featureFlags;
exports.default = _default;