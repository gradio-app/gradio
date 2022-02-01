/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Sharpen extending fabric.Image.filters.Convolute
 */
import { fabric } from 'fabric';

/**
 * Sharpen object
 * @class Sharpen
 * @extends {fabric.Image.filters.Convolute}
 * @ignore
 */
const Sharpen = fabric.util.createClass(
  fabric.Image.filters.Convolute,
  /** @lends Convolute.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Sharpen',

    /**
     * constructor
     * @override
     */
    initialize() {
      this.matrix = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    },
  }
);

export default Sharpen;
