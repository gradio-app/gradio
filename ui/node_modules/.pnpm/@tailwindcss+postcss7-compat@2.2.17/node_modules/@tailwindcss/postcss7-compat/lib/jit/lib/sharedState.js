"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.contentMatchCache = exports.contextSourcesMap = exports.configContextMap = exports.contextMap = exports.env = void 0;

var _quickLru = _interopRequireDefault(require("quick-lru"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const env = {
  TAILWIND_MODE: process.env.TAILWIND_MODE,
  NODE_ENV: process.env.NODE_ENV,
  DEBUG: process.env.DEBUG !== undefined,
  TAILWIND_DISABLE_TOUCH: process.env.TAILWIND_DISABLE_TOUCH !== undefined,
  TAILWIND_TOUCH_DIR: process.env.TAILWIND_TOUCH_DIR
};
exports.env = env;
const contextMap = new Map();
exports.contextMap = contextMap;
const configContextMap = new Map();
exports.configContextMap = configContextMap;
const contextSourcesMap = new Map();
exports.contextSourcesMap = contextSourcesMap;
const contentMatchCache = new _quickLru.default({
  maxSize: 25000
});
exports.contentMatchCache = contentMatchCache;