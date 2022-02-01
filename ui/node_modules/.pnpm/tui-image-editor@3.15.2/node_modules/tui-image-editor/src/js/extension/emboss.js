/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Emboss extending fabric.Image.filters.Convolute
 */
import { fabric } from 'fabric';

/**
 * Emboss object
 * @class Emboss
 * @extends {fabric.Image.filters.Convolute}
 * @ignore
 */
const Emboss = fabric.util.createClass(
  fabric.Image.filters.Convolute,
  /** @lends Convolute.prototype */ {
    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Emboss',

    /**
     * constructor
     * @override
     */
    initialize() {
      this.matrix = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];
    },
  }
);

export default Emboss;
