"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = processTailwindFeatures;

var _normalizeTailwindDirectives = _interopRequireDefault(require("./lib/normalizeTailwindDirectives"));

var _expandTailwindAtRules = _interopRequireDefault(require("./lib/expandTailwindAtRules"));

var _expandApplyAtRules = _interopRequireDefault(require("./lib/expandApplyAtRules"));

var _evaluateTailwindFunctions = _interopRequireDefault(require("../lib/evaluateTailwindFunctions"));

var _substituteScreenAtRules = _interopRequireDefault(require("../lib/substituteScreenAtRules"));

var _resolveDefaultsAtRules = _interopRequireDefault(require("./lib/resolveDefaultsAtRules"));

var _collapseAdjacentRules = _interopRequireDefault(require("./lib/collapseAdjacentRules"));

var _setupContextUtils = require("./lib/setupContextUtils");

var _log = _interopRequireDefault(require("../util/log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let warned = false;

function processTailwindFeatures(setupContext) {
  return function (root, result) {
    if (!warned) {
      _log.default.warn([`You have enabled the JIT engine which is currently in preview.`, 'Preview features are not covered by semver, may introduce breaking changes, and can change at any time.']);

      warned = true;
    }

    let tailwindDirectives = (0, _normalizeTailwindDirectives.default)(root);
    let context = setupContext({
      tailwindDirectives,

      registerDependency(dependency) {
        result.messages.push({
          plugin: 'tailwindcss',
          parent: result.opts.from,
          ...dependency
        });
      },

      createContext(tailwindConfig, changedContent) {
        return (0, _setupContextUtils.createContext)(tailwindConfig, changedContent, tailwindDirectives, root);
      }

    })(root, result);

    if (context.tailwindConfig.separator === '-') {
      throw new Error("The '-' character cannot be used as a custom separator in JIT mode due to parsing ambiguity. Please use another character like '_' instead.");
    }

    (0, _expandTailwindAtRules.default)(context)(root, result);
    (0, _expandApplyAtRules.default)(context)(root, result);
    (0, _evaluateTailwindFunctions.default)(context)(root, result);
    (0, _substituteScreenAtRules.default)(context)(root, result);
    (0, _resolveDefaultsAtRules.default)(context)(root, result);
    (0, _collapseAdjacentRules.default)(context)(root, result);
  };
}