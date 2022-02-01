/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Util
 */
import { forEach, sendHostname, extend, isString, pick, inArray } from 'tui-code-snippet';
import {
  commandNames,
  filterType,
  historyNames,
  SHAPE_FILL_TYPE,
  SHAPE_TYPE,
  emptyCropRectValues,
} from '@/consts';

const FLOATING_POINT_DIGIT = 2;
const CSS_PREFIX = 'tui-image-editor-';
const { min, max } = Math;
let hostnameSent = false;

export function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Clamp value
 * @param {number} value - Value
 * @param {number} minValue - Minimum value
 * @param {number} maxValue - Maximum value
 * @returns {number} clamped value
 */
export function clamp(value, minValue, maxValue) {
  if (minValue > maxValue) {
    [minValue, maxValue] = [maxValue, minValue];
  }

  return max(minValue, min(value, maxValue));
}

/**
 * Make key-value object from arguments
 * @returns {object.<string, string>}
 */
export function keyMirror(...args) {
  const obj = {};

  forEach(args, (key) => {
    obj[key] = key;
  });

  return obj;
}

/**
 * Make CSSText
 * @param {Object} styleObj - Style info object
 * @returns {string} Connected string of style
 */
export function makeStyleText(styleObj) {
  let styleStr = '';

  forEach(styleObj, (value, prop) => {
    styleStr += `${prop}: ${value};`;
  });

  return styleStr;
}

/**
 * Get object's properties
 * @param {Object} obj - object
 * @param {Array} keys - keys
 * @returns {Object} properties object
 */
export function getProperties(obj, keys) {
  const props = {};
  const { length } = keys;
  let i = 0;
  let key;

  for (i = 0; i < length; i += 1) {
    key = keys[i];
    props[key] = obj[key];
  }

  return props;
}

/**
 * ParseInt simpliment
 * @param {number} value - Value
 * @returns {number}
 */
export function toInteger(value) {
  return parseInt(value, 10);
}

/**
 * String to camelcase string
 * @param {string} targetString - change target
 * @returns {string}
 * @private
 */
export function toCamelCase(targetString) {
  return targetString.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
}

/**
 * Check browser file api support
 * @returns {boolean}
 * @private
 */
export function isSupportFileApi() {
  return !!(window.File && window.FileList && window.FileReader);
}

/**
 * hex to rgb
 * @param {string} color - hex color
 * @param {string} alpha - color alpha value
 * @returns {string} rgb expression
 */
export function getRgb(color, alpha) {
  if (color.length === 4) {
    color = `${color}${color.slice(1, 4)}`;
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const a = alpha || 1;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * send hostname
 */
export function sendHostName() {
  if (hostnameSent) {
    return;
  }
  hostnameSent = true;

  sendHostname('image-editor', 'UA-129999381-1');
}

/**
 * Apply css resource
 * @param {string} styleBuffer - serialized css text
 * @param {string} tagId - style tag id
 */
export function styleLoad(styleBuffer, tagId) {
  const [head] = document.getElementsByTagName('head');
  const linkElement = document.createElement('link');
  const styleData = encodeURIComponent(styleBuffer);
  if (tagId) {
    linkElement.id = tagId;
    // linkElement.id = 'tui-image-editor-theme-style';
  }
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('type', 'text/css');
  linkElement.setAttribute('href', `data:text/css;charset=UTF-8,${styleData}`);
  head.appendChild(linkElement);
}

/**
 * Get selector
 * @param {HTMLElement} targetElement - target element
 * @returns {Function} selector
 */
export function getSelector(targetElement) {
  return (str) => targetElement.querySelector(str);
}

/**
 * Change base64 to blob
 * @param {String} data - base64 string data
 * @returns {Blob} Blob Data
 */
export function base64ToBlob(data) {
  const rImageType = /data:(image\/.+);base64,/;
  let mimeString = '';
  let raw, uInt8Array, i;

  raw = data.replace(rImageType, (header, imageType) => {
    mimeString = imageType;

    return '';
  });

  raw = atob(raw);
  const rawLength = raw.length;
  uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

  for (i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: mimeString });
}

/**
 * Fix floating point diff.
 * @param {number} value - original value
 * @returns {number} fixed value
 */
export function fixFloatingPoint(value) {
  return Number(value.toFixed(FLOATING_POINT_DIGIT));
}

/**
 * Assignment for destroying objects.
 * @param {Object} targetObject - object to be removed.
 */
export function assignmentForDestroy(targetObject) {
  forEach(targetObject, (value, key) => {
    targetObject[key] = null;
  });
}

/**
 * Make class name for ui
 * @param {String} str  - main string of className
 * @param {String} prefix - prefix string of className
 * @returns {String} class name
 */
export function cls(str = '', prefix = '') {
  if (str.charAt(0) === '.') {
    return `.${CSS_PREFIX}${prefix}${str.slice(1)}`;
  }

  return `${CSS_PREFIX}${prefix}${str}`;
}

/**
 * Change object origin
 * @param {fabric.Object} fObject - fabric object
 * @param {Object} origin - origin of fabric object
 *   @param {string} originX - horizontal basis.
 *   @param {string} originY - vertical basis.
 */
export function changeOrigin(fObject, origin) {
  const { originX, originY } = origin;
  const { x: left, y: top } = fObject.getPointByOrigin(originX, originY);

  fObject.set({
    left,
    top,
    originX,
    originY,
  });

  fObject.setCoords();
}

/**
 * Object key value flip
 * @param {Object} targetObject - The data object of the key value.
 * @returns {Object}
 */
export function flipObject(targetObject) {
  const result = {};

  Object.keys(targetObject).forEach((key) => {
    result[targetObject[key]] = key;
  });

  return result;
}

/**
 * Set custom properties
 * @param {Object} targetObject - target object
 * @param {Object} props - custom props object
 */
export function setCustomProperty(targetObject, props) {
  targetObject.customProps = targetObject.customProps || {};
  extend(targetObject.customProps, props);
}

/**
 * Get custom property
 * @param {fabric.Object} fObject - fabric object
 * @param {Array|string} propNames - prop name array
 * @returns {object | number | string}
 */
export function getCustomProperty(fObject, propNames) {
  const resultObject = {};
  if (isString(propNames)) {
    propNames = [propNames];
  }
  forEach(propNames, (propName) => {
    resultObject[propName] = fObject.customProps[propName];
  });

  return resultObject;
}

/**
 * Capitalize string
 * @param {string} targetString - target string
 * @returns {string}
 */
export function capitalizeString(targetString) {
  return targetString.charAt(0).toUpperCase() + targetString.slice(1);
}

/**
 * Array includes check
 * @param {Array} targetArray - target array
 * @param {string|number} compareValue - compare value
 * @returns {boolean}
 */
export function includes(targetArray, compareValue) {
  return targetArray.indexOf(compareValue) >= 0;
}

/**
 * Get fill type
 * @param {Object | string} fillOption - shape fill option
 * @returns {string} 'color' or 'filter'
 */
export function getFillTypeFromOption(fillOption = {}) {
  return pick(fillOption, 'type') || SHAPE_FILL_TYPE.COLOR;
}

/**
 * Get fill type of shape type object
 * @param {fabric.Object} shapeObj - fabric object
 * @returns {string} 'transparent' or 'color' or 'filter'
 */
export function getFillTypeFromObject(shapeObj) {
  const { fill = {} } = shapeObj;
  if (fill.source) {
    return SHAPE_FILL_TYPE.FILTER;
  }

  return SHAPE_FILL_TYPE.COLOR;
}

/**
 * Check if the object is a shape object.
 * @param {fabric.Object} obj - fabric object
 * @returns {boolean}
 */
export function isShape(obj) {
  return inArray(obj.get('type'), SHAPE_TYPE) >= 0;
}

/**
 * Get object type
 * @param {string} type - fabric object type
 * @returns {string} type of object (ex: shape, icon, ...)
 */
export function getObjectType(type) {
  if (includes(SHAPE_TYPE, type)) {
    return 'Shape';
  }

  switch (type) {
    case 'i-text':
      return 'Text';
    case 'path':
    case 'line':
      return 'Draw';
    case 'activeSelection':
      return 'Group';
    default:
      return toStartOfCapital(type);
  }
}

/**
 * Get filter type
 * @param {string} type - fabric filter type
 * @param {object} [options] - filter type options
 *   @param {boolean} [options.useAlpha=true] - usage of alpha(true is 'color filter', false is 'remove white')
 *   @param {string} [options.mode] - mode of blendColor
 * @returns {string} type of filter (ex: sepia, blur, ...)
 */
function getFilterType(type, { useAlpha = true, mode } = {}) {
  const { VINTAGE, REMOVE_COLOR, BLEND_COLOR, SEPIA2, COLOR_FILTER, REMOVE_WHITE, BLEND } =
    filterType;

  let filterName;

  switch (type) {
    case VINTAGE:
      filterName = SEPIA2;
      break;
    case REMOVE_COLOR:
      filterName = useAlpha ? COLOR_FILTER : REMOVE_WHITE;
      break;
    case BLEND_COLOR:
      filterName = mode === 'add' ? BLEND : mode;
      break;
    default:
      filterName = type;
  }

  return toStartOfCapital(filterName);
}

/**
 * Check if command is silent command
 * @param {Command|string} command - command or command name
 * @returns {boolean}
 */
export function isSilentCommand(command) {
  const { LOAD_IMAGE } = commandNames;

  return typeof command === 'string' ? LOAD_IMAGE === command : LOAD_IMAGE === command.name;
}

/**
 * Get command name
 * @param {Command|string} command - command or command name
 * @returns {{name: string, ?detail: string}}
 */
// eslint-disable-next-line complexity, require-jsdoc
export function getHistoryTitle(command) {
  const {
    FLIP_IMAGE,
    ROTATE_IMAGE,
    ADD_TEXT,
    APPLY_FILTER,
    REMOVE_FILTER,
    CHANGE_SHAPE,
    CHANGE_ICON_COLOR,
    CHANGE_TEXT_STYLE,
    CLEAR_OBJECTS,
    ADD_IMAGE_OBJECT,
    REMOVE_OBJECT,
    RESIZE_IMAGE,
  } = commandNames;
  const { name, args } = command;
  let historyInfo;

  switch (name) {
    case FLIP_IMAGE:
      historyInfo = { name, detail: args[1] === 'reset' ? args[1] : args[1].slice(4) };
      break;
    case ROTATE_IMAGE:
      historyInfo = { name, detail: args[2] };
      break;
    case APPLY_FILTER:
      historyInfo = { name: historyNames.APPLY_FILTER, detail: getFilterType(args[1], args[2]) };
      break;
    case REMOVE_FILTER:
      historyInfo = { name: historyNames.REMOVE_FILTER, detail: 'Remove' };
      break;
    case CHANGE_SHAPE:
      historyInfo = { name: historyNames.CHANGE_SHAPE, detail: 'Change' };
      break;
    case CHANGE_ICON_COLOR:
      historyInfo = { name: historyNames.CHANGE_ICON_COLOR, detail: 'Change' };
      break;
    case CHANGE_TEXT_STYLE:
      historyInfo = { name: historyNames.CHANGE_TEXT_STYLE, detail: 'Change' };
      break;
    case REMOVE_OBJECT:
      historyInfo = { name: historyNames.REMOVE_OBJECT, detail: args[2] };
      break;
    case CLEAR_OBJECTS:
      historyInfo = { name: historyNames.CLEAR_OBJECTS, detail: 'All' };
      break;
    case ADD_IMAGE_OBJECT:
      historyInfo = { name: historyNames.ADD_IMAGE_OBJECT, detail: 'Add' };
      break;
    case ADD_TEXT:
      historyInfo = { name: historyNames.ADD_TEXT };
      break;
    case RESIZE_IMAGE:
      historyInfo = { name: historyNames.RESIZE, detail: `${~~args[1].width}x${~~args[1].height}` };
      break;

    default:
      historyInfo = { name };
      break;
  }

  if (args[1] === 'mask') {
    historyInfo = { name: historyNames.LOAD_MASK_IMAGE, detail: 'Apply' };
  }

  return historyInfo;
}

/**
 * Get help menubar position(opposite of menubar)
 * @param {string} position - position of menubar
 * @returns {string} position of help menubar
 */
export function getHelpMenuBarPosition(position) {
  if (position === 'top') {
    return 'bottom';
  }
  if (position === 'left') {
    return 'right';
  }
  if (position === 'right') {
    return 'left';
  }

  return 'top';
}

/**
 * Change to capital start letter
 * @param {string} str - string to change
 * @returns {string}
 */
function toStartOfCapital(str) {
  return str.replace(/[a-z]/, (first) => first.toUpperCase());
}

/**
 * Check if cropRect is Empty.
 * @param {Object} cropRect - cropRect object
 *  @param {Number} cropRect.left - cropRect left position value
 *  @param {Number} cropRect.top - cropRect top position value
 *  @param {Number} cropRect.width - cropRect width value
 *  @param {Number} cropRect.height - cropRect height value
 * @returns {boolean}
 */
export function isEmptyCropzone(cropRect) {
  const { left, top, width, height } = cropRect;
  const { LEFT, TOP, WIDTH, HEIGHT } = emptyCropRectValues;

  return left === LEFT && top === TOP && width === WIDTH && height === HEIGHT;
}
