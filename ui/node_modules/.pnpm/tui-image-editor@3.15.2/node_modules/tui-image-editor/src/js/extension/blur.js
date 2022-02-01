/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Blur extending fabric.Image.filters.Convolute
 */
import { fabric } from 'fabric';

/**
 * Blur object
 * @class Blur
 * @extends {fabric.Image.filters.Convolute}
 * @ignore
 */
const Blur = fabric.util.createClass(
  fabric.Image.filters.Convolute,
  /** @lends Convolute.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Blur',

    /**
     * constructor
     * @override
     */
    initialize() {
      this.matrix = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
    },
  }
);

export default Blur;
