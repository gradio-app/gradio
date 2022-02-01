"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var plugins = _interopRequireWildcard(require("./plugins/index.js"));

var _configurePlugins = _interopRequireDefault(require("./util/configurePlugins"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function move(items, item, befores) {
  let lowestBefore = -1;

  for (let before of befores) {
    let index = items.indexOf(before);

    if (index >= 0 && (index < lowestBefore || lowestBefore === -1)) {
      lowestBefore = index;
    }
  }

  if (items.indexOf(item) === -1 || lowestBefore === -1) {
    return items;
  }

  items = [...items];
  let fromIndex = items.indexOf(item);
  let toIndex = lowestBefore;
  items.splice(fromIndex, 1);
  items.splice(toIndex, 0, item);
  return items;
}

function _default({
  corePlugins: corePluginConfig
}) {
  let pluginOrder = Object.keys(plugins);
  pluginOrder = (0, _configurePlugins.default)(corePluginConfig, pluginOrder);
  pluginOrder = move(pluginOrder, 'transform', ['translate', 'rotate', 'skew', 'scale']);
  pluginOrder = move(pluginOrder, 'filter', ['blur', 'brightness', 'contrast', 'dropShadow', 'grayscale', 'hueRotate', 'invert', 'saturate', 'sepia']);
  pluginOrder = move(pluginOrder, 'backdropFilter', ['backdropBlur', 'backdropBrightness', 'backdropContrast', 'backdropGrayscale', 'backdropHueRotate', 'backdropInvert', 'backdropOpacity', 'backdropSaturate', 'backdropSepia']);
  return pluginOrder.map(pluginName => {
    return plugins[pluginName]();
  });
}