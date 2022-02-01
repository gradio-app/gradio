import { IS_BROWSER, WINDOW } from './constants';

/**
 * Check if the given value is not a number.
 */
export const isNaN = Number.isNaN || WINDOW.isNaN;

/**
 * Check if the given value is a number.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a number, else `false`.
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if the given value is a positive number.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a positive number, else `false`.
 */
export const isPositiveNumber = (value) => value > 0 && value < Infinity;

/**
 * Check if the given value is undefined.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
 */
export function isUndefined(value) {
  return typeof value === 'undefined';
}

/**
 * Check if the given value is an object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is an object, else `false`.
 */
export function isObject(value) {
  return typeof value === 'object' && value !== null;
}

const { hasOwnProperty } = Object.prototype;

/**
 * Check if the given value is a plain object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
 */
export function isPlainObject(value) {
  if (!isObject(value)) {
    return false;
  }

  try {
    const { constructor } = value;
    const { prototype } = constructor;

    return constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
  } catch (error) {
    return false;
  }
}

/**
 * Check if the given value is a function.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a function, else `false`.
 */
export function isFunction(value) {
  return typeof value === 'function';
}

const { slice } = Array.prototype;

/**
 * Convert array-like or iterable object to an array.
 * @param {*} value - The value to convert.
 * @returns {Array} Returns a new array.
 */
export function toArray(value) {
  return Array.from ? Array.from(value) : slice.call(value);
}

/**
 * Iterate the given data.
 * @param {*} data - The data to iterate.
 * @param {Function} callback - The process function for each element.
 * @returns {*} The original data.
 */
export function forEach(data, callback) {
  if (data && isFunction(callback)) {
    if (Array.isArray(data) || isNumber(data.length)/* array-like */) {
      toArray(data).forEach((value, key) => {
        callback.call(data, value, key, data);
      });
    } else if (isObject(data)) {
      Object.keys(data).forEach((key) => {
        callback.call(data, data[key], key, data);
      });
    }
  }

  return data;
}

/**
 * Extend the given object.
 * @param {*} target - The target object to extend.
 * @param {*} args - The rest objects for merging to the target object.
 * @returns {Object} The extended object.
 */
export const assign = Object.assign || function assign(target, ...args) {
  if (isObject(target) && args.length > 0) {
    args.forEach((arg) => {
      if (isObject(arg)) {
        Object.keys(arg).forEach((key) => {
          target[key] = arg[key];
        });
      }
    });
  }

  return target;
};

const REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/;

/**
 * Normalize decimal number.
 * Check out {@link https://0.30000000000000004.com/}
 * @param {number} value - The value to normalize.
 * @param {number} [times=100000000000] - The times for normalizing.
 * @returns {number} Returns the normalized number.
 */
export function normalizeDecimalNumber(value, times = 100000000000) {
  return REGEXP_DECIMALS.test(value) ? (Math.round(value * times) / times) : value;
}

const REGEXP_SUFFIX = /^width|height|left|top|marginLeft|marginTop$/;

/**
 * Apply styles to the given element.
 * @param {Element} element - The target element.
 * @param {Object} styles - The styles for applying.
 */
export function setStyle(element, styles) {
  const { style } = element;

  forEach(styles, (value, property) => {
    if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
      value = `${value}px`;
    }

    style[property] = value;
  });
}

/**
 * Check if the given element has a special class.
 * @param {Element} element - The element to check.
 * @param {string} value - The class to search.
 * @returns {boolean} Returns `true` if the special class was found.
 */
export function hasClass(element, value) {
  return element.classList
    ? element.classList.contains(value)
    : element.className.indexOf(value) > -1;
}

/**
 * Add classes to the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be added.
 */
export function addClass(element, value) {
  if (!value) {
    return;
  }

  if (isNumber(element.length)) {
    forEach(element, (elem) => {
      addClass(elem, value);
    });
    return;
  }

  if (element.classList) {
    element.classList.add(value);
    return;
  }

  const className = element.className.trim();

  if (!className) {
    element.className = value;
  } else if (className.indexOf(value) < 0) {
    element.className = `${className} ${value}`;
  }
}

/**
 * Remove classes from the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be removed.
 */
export function removeClass(element, value) {
  if (!value) {
    return;
  }

  if (isNumber(element.length)) {
    forEach(element, (elem) => {
      removeClass(elem, value);
    });
    return;
  }

  if (element.classList) {
    element.classList.remove(value);
    return;
  }

  if (element.className.indexOf(value) >= 0) {
    element.className = element.className.replace(value, '');
  }
}

/**
 * Add or remove classes from the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be toggled.
 * @param {boolean} added - Add only.
 */
export function toggleClass(element, value, added) {
  if (!value) {
    return;
  }

  if (isNumber(element.length)) {
    forEach(element, (elem) => {
      toggleClass(elem, value, added);
    });
    return;
  }

  // IE10-11 doesn't support the second parameter of `classList.toggle`
  if (added) {
    addClass(element, value);
  } else {
    removeClass(element, value);
  }
}

const REGEXP_CAMEL_CASE = /([a-z\d])([A-Z])/g;

/**
 * Transform the given string from camelCase to kebab-case
 * @param {string} value - The value to transform.
 * @returns {string} The transformed value.
 */
export function toParamCase(value) {
  return value.replace(REGEXP_CAMEL_CASE, '$1-$2').toLowerCase();
}

/**
 * Get data from the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to get.
 * @returns {string} The data value.
 */
export function getData(element, name) {
  if (isObject(element[name])) {
    return element[name];
  }

  if (element.dataset) {
    return element.dataset[name];
  }

  return element.getAttribute(`data-${toParamCase(name)}`);
}

/**
 * Set data to the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to set.
 * @param {string} data - The data value.
 */
export function setData(element, name, data) {
  if (isObject(data)) {
    element[name] = data;
  } else if (element.dataset) {
    element.dataset[name] = data;
  } else {
    element.setAttribute(`data-${toParamCase(name)}`, data);
  }
}

/**
 * Remove data from the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to remove.
 */
export function removeData(element, name) {
  if (isObject(element[name])) {
    try {
      delete element[name];
    } catch (error) {
      element[name] = undefined;
    }
  } else if (element.dataset) {
    // #128 Safari not allows to delete dataset property
    try {
      delete element.dataset[name];
    } catch (error) {
      element.dataset[name] = undefined;
    }
  } else {
    element.removeAttribute(`data-${toParamCase(name)}`);
  }
}

const REGEXP_SPACES = /\s\s*/;
const onceSupported = (() => {
  let supported = false;

  if (IS_BROWSER) {
    let once = false;
    const listener = () => {};
    const options = Object.defineProperty({}, 'once', {
      get() {
        supported = true;
        return once;
      },

      /**
       * This setter can fix a `TypeError` in strict mode
       * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only}
       * @param {boolean} value - The value to set
       */
      set(value) {
        once = value;
      },
    });

    WINDOW.addEventListener('test', listener, options);
    WINDOW.removeEventListener('test', listener, options);
  }

  return supported;
})();

/**
 * Remove event listener from the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Function} listener - The event listener.
 * @param {Object} options - The event options.
 */
export function removeListener(element, type, listener, options = {}) {
  let handler = listener;

  type.trim().split(REGEXP_SPACES).forEach((event) => {
    if (!onceSupported) {
      const { listeners } = element;

      if (listeners && listeners[event] && listeners[event][listener]) {
        handler = listeners[event][listener];
        delete listeners[event][listener];

        if (Object.keys(listeners[event]).length === 0) {
          delete listeners[event];
        }

        if (Object.keys(listeners).length === 0) {
          delete element.listeners;
        }
      }
    }

    element.removeEventListener(event, handler, options);
  });
}

/**
 * Add event listener to the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Function} listener - The event listener.
 * @param {Object} options - The event options.
 */
export function addListener(element, type, listener, options = {}) {
  let handler = listener;

  type.trim().split(REGEXP_SPACES).forEach((event) => {
    if (options.once && !onceSupported) {
      const { listeners = {} } = element;

      handler = (...args) => {
        delete listeners[event][listener];
        element.removeEventListener(event, handler, options);
        listener.apply(element, args);
      };

      if (!listeners[event]) {
        listeners[event] = {};
      }

      if (listeners[event][listener]) {
        element.removeEventListener(event, listeners[event][listener], options);
      }

      listeners[event][listener] = handler;
      element.listeners = listeners;
    }

    element.addEventListener(event, handler, options);
  });
}

/**
 * Dispatch event on the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Object} data - The additional event data.
 * @returns {boolean} Indicate if the event is default prevented or not.
 */
export function dispatchEvent(element, type, data) {
  let event;

  // Event and CustomEvent on IE9-11 are global objects, not constructors
  if (isFunction(Event) && isFunction(CustomEvent)) {
    event = new CustomEvent(type, {
      detail: data,
      bubbles: true,
      cancelable: true,
    });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, data);
  }

  return element.dispatchEvent(event);
}

/**
 * Get the offset base on the document.
 * @param {Element} element - The target element.
 * @returns {Object} The offset data.
 */
export function getOffset(element) {
  const box = element.getBoundingClientRect();

  return {
    left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
    top: box.top + (window.pageYOffset - document.documentElement.clientTop),
  };
}

const { location } = WINDOW;
const REGEXP_ORIGINS = /^(\w+:)\/\/([^:/?#]*):?(\d*)/i;

/**
 * Check if the given URL is a cross origin URL.
 * @param {string} url - The target URL.
 * @returns {boolean} Returns `true` if the given URL is a cross origin URL, else `false`.
 */
export function isCrossOriginURL(url) {
  const parts = url.match(REGEXP_ORIGINS);

  return parts !== null && (
    parts[1] !== location.protocol
    || parts[2] !== location.hostname
    || parts[3] !== location.port
  );
}

/**
 * Add timestamp to the given URL.
 * @param {string} url - The target URL.
 * @returns {string} The result URL.
 */
export function addTimestamp(url) {
  const timestamp = `timestamp=${(new Date()).getTime()}`;

  return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
}

/**
 * Get transforms base on the given object.
 * @param {Object} obj - The target object.
 * @returns {string} A string contains transform values.
 */
export function getTransforms({
  rotate,
  scaleX,
  scaleY,
  translateX,
  translateY,
}) {
  const values = [];

  if (isNumber(translateX) && translateX !== 0) {
    values.push(`translateX(${translateX}px)`);
  }

  if (isNumber(translateY) && translateY !== 0) {
    values.push(`translateY(${translateY}px)`);
  }

  // Rotate should come first before scale to match orientation transform
  if (isNumber(rotate) && rotate !== 0) {
    values.push(`rotate(${rotate}deg)`);
  }

  if (isNumber(scaleX) && scaleX !== 1) {
    values.push(`scaleX(${scaleX})`);
  }

  if (isNumber(scaleY) && scaleY !== 1) {
    values.push(`scaleY(${scaleY})`);
  }

  const transform = values.length ? values.join(' ') : 'none';

  return {
    WebkitTransform: transform,
    msTransform: transform,
    transform,
  };
}

/**
 * Get the max ratio of a group of pointers.
 * @param {string} pointers - The target pointers.
 * @returns {number} The result ratio.
 */
export function getMaxZoomRatio(pointers) {
  const pointers2 = { ...pointers };
  let maxRatio = 0;

  forEach(pointers, (pointer, pointerId) => {
    delete pointers2[pointerId];

    forEach(pointers2, (pointer2) => {
      const x1 = Math.abs(pointer.startX - pointer2.startX);
      const y1 = Math.abs(pointer.startY - pointer2.startY);
      const x2 = Math.abs(pointer.endX - pointer2.endX);
      const y2 = Math.abs(pointer.endY - pointer2.endY);
      const z1 = Math.sqrt((x1 * x1) + (y1 * y1));
      const z2 = Math.sqrt((x2 * x2) + (y2 * y2));
      const ratio = (z2 - z1) / z1;

      if (Math.abs(ratio) > Math.abs(maxRatio)) {
        maxRatio = ratio;
      }
    });
  });

  return maxRatio;
}

/**
 * Get a pointer from an event object.
 * @param {Object} event - The target event object.
 * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
 * @returns {Object} The result pointer contains start and/or end point coordinates.
 */
export function getPointer({ pageX, pageY }, endOnly) {
  const end = {
    endX: pageX,
    endY: pageY,
  };

  return endOnly ? end : ({
    startX: pageX,
    startY: pageY,
    ...end,
  });
}

/**
 * Get the center point coordinate of a group of pointers.
 * @param {Object} pointers - The target pointers.
 * @returns {Object} The center point coordinate.
 */
export function getPointersCenter(pointers) {
  let pageX = 0;
  let pageY = 0;
  let count = 0;

  forEach(pointers, ({ startX, startY }) => {
    pageX += startX;
    pageY += startY;
    count += 1;
  });

  pageX /= count;
  pageY /= count;

  return {
    pageX,
    pageY,
  };
}

/**
 * Get the max sizes in a rectangle under the given aspect ratio.
 * @param {Object} data - The original sizes.
 * @param {string} [type='contain'] - The adjust type.
 * @returns {Object} The result sizes.
 */
export function getAdjustedSizes(
  {
    aspectRatio,
    height,
    width,
  },
  type = 'contain', // or 'cover'
) {
  const isValidWidth = isPositiveNumber(width);
  const isValidHeight = isPositiveNumber(height);

  if (isValidWidth && isValidHeight) {
    const adjustedWidth = height * aspectRatio;

    if ((type === 'contain' && adjustedWidth > width) || (type === 'cover' && adjustedWidth < width)) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
  } else if (isValidWidth) {
    height = width / aspectRatio;
  } else if (isValidHeight) {
    width = height * aspectRatio;
  }

  return {
    width,
    height,
  };
}

/**
 * Get the new sizes of a rectangle after rotated.
 * @param {Object} data - The original sizes.
 * @returns {Object} The result sizes.
 */
export function getRotatedSizes({ width, height, degree }) {
  degree = Math.abs(degree) % 180;

  if (degree === 90) {
    return {
      width: height,
      height: width,
    };
  }

  const arc = ((degree % 90) * Math.PI) / 180;
  const sinArc = Math.sin(arc);
  const cosArc = Math.cos(arc);
  const newWidth = (width * cosArc) + (height * sinArc);
  const newHeight = (width * sinArc) + (height * cosArc);

  return degree > 90 ? {
    width: newHeight,
    height: newWidth,
  } : {
    width: newWidth,
    height: newHeight,
  };
}

/**
 * Get a canvas which drew the given image.
 * @param {HTMLImageElement} image - The image for drawing.
 * @param {Object} imageData - The image data.
 * @param {Object} canvasData - The canvas data.
 * @param {Object} options - The options.
 * @returns {HTMLCanvasElement} The result canvas.
 */
export function getSourceCanvas(
  image,
  {
    aspectRatio: imageAspectRatio,
    naturalWidth: imageNaturalWidth,
    naturalHeight: imageNaturalHeight,
    rotate = 0,
    scaleX = 1,
    scaleY = 1,
  },
  {
    aspectRatio,
    naturalWidth,
    naturalHeight,
  },
  {
    fillColor = 'transparent',
    imageSmoothingEnabled = true,
    imageSmoothingQuality = 'low',
    maxWidth = Infinity,
    maxHeight = Infinity,
    minWidth = 0,
    minHeight = 0,
  },
) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const maxSizes = getAdjustedSizes({
    aspectRatio,
    width: maxWidth,
    height: maxHeight,
  });
  const minSizes = getAdjustedSizes({
    aspectRatio,
    width: minWidth,
    height: minHeight,
  }, 'cover');
  const width = Math.min(maxSizes.width, Math.max(minSizes.width, naturalWidth));
  const height = Math.min(maxSizes.height, Math.max(minSizes.height, naturalHeight));

  // Note: should always use image's natural sizes for drawing as
  // imageData.naturalWidth === canvasData.naturalHeight when rotate % 180 === 90
  const destMaxSizes = getAdjustedSizes({
    aspectRatio: imageAspectRatio,
    width: maxWidth,
    height: maxHeight,
  });
  const destMinSizes = getAdjustedSizes({
    aspectRatio: imageAspectRatio,
    width: minWidth,
    height: minHeight,
  }, 'cover');
  const destWidth = Math.min(
    destMaxSizes.width,
    Math.max(destMinSizes.width, imageNaturalWidth),
  );
  const destHeight = Math.min(
    destMaxSizes.height,
    Math.max(destMinSizes.height, imageNaturalHeight),
  );
  const params = [
    -destWidth / 2,
    -destHeight / 2,
    destWidth,
    destHeight,
  ];

  canvas.width = normalizeDecimalNumber(width);
  canvas.height = normalizeDecimalNumber(height);
  context.fillStyle = fillColor;
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate((rotate * Math.PI) / 180);
  context.scale(scaleX, scaleY);
  context.imageSmoothingEnabled = imageSmoothingEnabled;
  context.imageSmoothingQuality = imageSmoothingQuality;
  context.drawImage(image, ...params.map((param) => Math.floor(normalizeDecimalNumber(param))));
  context.restore();
  return canvas;
}

const { fromCharCode } = String;

/**
 * Get string from char code in data view.
 * @param {DataView} dataView - The data view for read.
 * @param {number} start - The start index.
 * @param {number} length - The read length.
 * @returns {string} The read result.
 */
export function getStringFromCharCode(dataView, start, length) {
  let str = '';

  length += start;

  for (let i = start; i < length; i += 1) {
    str += fromCharCode(dataView.getUint8(i));
  }

  return str;
}

const REGEXP_DATA_URL_HEAD = /^data:.*,/;

/**
 * Transform Data URL to array buffer.
 * @param {string} dataURL - The Data URL to transform.
 * @returns {ArrayBuffer} The result array buffer.
 */
export function dataURLToArrayBuffer(dataURL) {
  const base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
  const binary = atob(base64);
  const arrayBuffer = new ArrayBuffer(binary.length);
  const uint8 = new Uint8Array(arrayBuffer);

  forEach(uint8, (value, i) => {
    uint8[i] = binary.charCodeAt(i);
  });

  return arrayBuffer;
}

/**
 * Transform array buffer to Data URL.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {string} mimeType - The mime type of the Data URL.
 * @returns {string} The result Data URL.
 */
export function arrayBufferToDataURL(arrayBuffer, mimeType) {
  const chunks = [];

  // Chunk Typed Array for better performance (#435)
  const chunkSize = 8192;
  let uint8 = new Uint8Array(arrayBuffer);

  while (uint8.length > 0) {
    // XXX: Babel's `toConsumableArray` helper will throw error in IE or Safari 9
    // eslint-disable-next-line prefer-spread
    chunks.push(fromCharCode.apply(null, toArray(uint8.subarray(0, chunkSize))));
    uint8 = uint8.subarray(chunkSize);
  }

  return `data:${mimeType};base64,${btoa(chunks.join(''))}`;
}

/**
 * Get orientation value from given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
 * @returns {number} The read orientation value.
 */
export function resetAndGetOrientation(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  let orientation;

  // Ignores range error when the image does not have correct Exif information
  try {
    let littleEndian;
    let app1Start;
    let ifdStart;

    // Only handle JPEG image (start by 0xFFD8)
    if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
      const length = dataView.byteLength;
      let offset = 2;

      while (offset + 1 < length) {
        if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
          app1Start = offset;
          break;
        }

        offset += 1;
      }
    }

    if (app1Start) {
      const exifIDCode = app1Start + 4;
      const tiffOffset = app1Start + 10;

      if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
        const endianness = dataView.getUint16(tiffOffset);

        littleEndian = endianness === 0x4949;

        if (littleEndian || endianness === 0x4D4D /* bigEndian */) {
          if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
            const firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

            if (firstIFDOffset >= 0x00000008) {
              ifdStart = tiffOffset + firstIFDOffset;
            }
          }
        }
      }
    }

    if (ifdStart) {
      const length = dataView.getUint16(ifdStart, littleEndian);
      let offset;
      let i;

      for (i = 0; i < length; i += 1) {
        offset = ifdStart + (i * 12) + 2;

        if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
          // 8 is the offset of the current tag's value
          offset += 8;

          // Get the original orientation value
          orientation = dataView.getUint16(offset, littleEndian);

          // Override the orientation with its default value
          dataView.setUint16(offset, 1, littleEndian);
          break;
        }
      }
    }
  } catch (error) {
    orientation = 1;
  }

  return orientation;
}

/**
 * Parse Exif Orientation value.
 * @param {number} orientation - The orientation to parse.
 * @returns {Object} The parsed result.
 */
export function parseOrientation(orientation) {
  let rotate = 0;
  let scaleX = 1;
  let scaleY = 1;

  switch (orientation) {
    // Flip horizontal
    case 2:
      scaleX = -1;
      break;

    // Rotate left 180°
    case 3:
      rotate = -180;
      break;

    // Flip vertical
    case 4:
      scaleY = -1;
      break;

    // Flip vertical and rotate right 90°
    case 5:
      rotate = 90;
      scaleY = -1;
      break;

    // Rotate right 90°
    case 6:
      rotate = 90;
      break;

    // Flip horizontal and rotate right 90°
    case 7:
      rotate = 90;
      scaleX = -1;
      break;

    // Rotate left 90°
    case 8:
      rotate = -90;
      break;

    default:
  }

  return {
    rotate,
    scaleX,
    scaleY,
  };
}
