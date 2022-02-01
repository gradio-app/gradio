/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview ColorFilter extending fabric.Image.filters.BaseFilter
 */
import { fabric } from 'fabric';

/**
 * ColorFilter object
 * @class ColorFilter
 * @extends {fabric.Image.filters.BaseFilter}
 * @ignore
 */
const ColorFilter = fabric.util.createClass(
  fabric.Image.filters.BaseFilter,
  /** @lends BaseFilter.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'ColorFilter',

    /**
     * Constructor
     * @member fabric.Image.filters.ColorFilter.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.color='#FFFFFF'] Value of color (0...255)
     * @param {Number} [options.threshold=45] Value of threshold (0...255)
     * @override
     */
    initialize(options) {
      if (!options) {
        options = {};
      }
      this.color = options.color || '#FFFFFF';
      this.threshold = options.threshold || 45;
      this.x = options.x || null;
      this.y = options.y || null;
    },

    /**
     * Applies filter to canvas element
     * @param {Object} canvas Canvas object passed by fabric
     */
    // eslint-disable-next-line complexity
    applyTo(canvas) {
      const { canvasEl } = canvas;
      const context = canvasEl.getContext('2d');
      const imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
      const { data } = imageData;
      const { threshold } = this;
      let filterColor = fabric.Color.sourceFromHex(this.color);
      let i, len;

      if (this.x && this.y) {
        filterColor = this._getColor(imageData, this.x, this.y);
      }

      for (i = 0, len = data.length; i < len; i += 4) {
        if (
          this._isOutsideThreshold(data[i], filterColor[0], threshold) ||
          this._isOutsideThreshold(data[i + 1], filterColor[1], threshold) ||
          this._isOutsideThreshold(data[i + 2], filterColor[2], threshold)
        ) {
          continue;
        }
        data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
      }
      context.putImageData(imageData, 0, 0);
    },

    /**
     * Check color if it is within threshold
     * @param {Number} color1 source color
     * @param {Number} color2 filtering color
     * @param {Number} threshold threshold
     * @returns {boolean} true if within threshold or false
     */
    _isOutsideThreshold(color1, color2, threshold) {
      const diff = color1 - color2;

      return Math.abs(diff) > threshold;
    },

    /**
     * Get color at (x, y)
     * @param {Object} imageData of canvas
     * @param {Number} x left position
     * @param {Number} y top position
     * @returns {Array} color array
     */
    _getColor(imageData, x, y) {
      const color = [0, 0, 0, 0];
      const { data, width } = imageData;
      const bytes = 4;
      const position = (width * y + x) * bytes;

      color[0] = data[position];
      color[1] = data[position + 1];
      color[2] = data[position + 2];
      color[3] = data[position + 3];

      return color;
    },
  }
);

export default ColorFilter;
