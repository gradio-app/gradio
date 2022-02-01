/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Blur extending fabric.Image.filters.Convolute
 */
import { fabric } from 'fabric';

const ARROW_ANGLE = 30;
const CHEVRON_SIZE_RATIO = 2.7;
const TRIANGLE_SIZE_RATIO = 1.7;
const RADIAN_CONVERSION_VALUE = 180;

const ArrowLine = fabric.util.createClass(
  fabric.Line,
  /** @lends Convolute.prototype */ {
    /**
     * Line type
     * @param {String} type
     * @default
     */
    type: 'line',

    /**
     * Constructor
     * @param {Array} [points] Array of points
     * @param {Object} [options] Options object
     * @override
     */
    initialize(points, options = {}) {
      this.callSuper('initialize', points, options);

      this.arrowType = options.arrowType;
    },

    /**
     * Render ArrowLine
     * @private
     * @override
     */
    _render(ctx) {
      const { x1: fromX, y1: fromY, x2: toX, y2: toY } = this.calcLinePoints();
      const linePosition = {
        fromX,
        fromY,
        toX,
        toY,
      };
      this.ctx = ctx;
      ctx.lineWidth = this.strokeWidth;

      this._renderBasicLinePath(linePosition);
      this._drawDecoratorPath(linePosition);

      this._renderStroke(ctx);
    },

    /**
     * Render Basic line path
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _renderBasicLinePath({ fromX, fromY, toX, toY }) {
      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
    },

    /**
     * Render Arrow Head
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _drawDecoratorPath(linePosition) {
      this._drawDecoratorPathType('head', linePosition);
      this._drawDecoratorPathType('tail', linePosition);
    },

    /**
     * Render Arrow Head
     * @param {string} type - 'head' or 'tail'
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _drawDecoratorPathType(type, linePosition) {
      switch (this.arrowType[type]) {
        case 'triangle':
          this._drawTrianglePath(type, linePosition);
          break;
        case 'chevron':
          this._drawChevronPath(type, linePosition);
          break;
        default:
          break;
      }
    },

    /**
     * Render Triangle Head
     * @param {string} type - 'head' or 'tail'
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @private
     */
    _drawTrianglePath(type, linePosition) {
      const decorateSize = this.ctx.lineWidth * TRIANGLE_SIZE_RATIO;

      this._drawChevronPath(type, linePosition, decorateSize);
      this.ctx.closePath();
    },

    /**
     * Render Chevron Head
     * @param {string} type - 'head' or 'tail'
     * @param {Object} linePosition - line position
     *  @param {number} option.fromX - line start position x
     *  @param {number} option.fromY - line start position y
     *  @param {number} option.toX - line end position x
     *  @param {number} option.toY - line end position y
     * @param {number} decorateSize - decorate size
     * @private
     */
    _drawChevronPath(type, { fromX, fromY, toX, toY }, decorateSize) {
      const { ctx } = this;
      if (!decorateSize) {
        decorateSize = this.ctx.lineWidth * CHEVRON_SIZE_RATIO;
      }

      const [standardX, standardY] = type === 'head' ? [fromX, fromY] : [toX, toY];
      const [compareX, compareY] = type === 'head' ? [toX, toY] : [fromX, fromY];

      const angle =
        (Math.atan2(compareY - standardY, compareX - standardX) * RADIAN_CONVERSION_VALUE) /
        Math.PI;
      const rotatedPosition = (changeAngle) =>
        this.getRotatePosition(decorateSize, changeAngle, {
          x: standardX,
          y: standardY,
        });

      ctx.moveTo(...rotatedPosition(angle + ARROW_ANGLE));
      ctx.lineTo(standardX, standardY);
      ctx.lineTo(...rotatedPosition(angle - ARROW_ANGLE));
    },

    /**
     * return position from change angle.
     * @param {number} distance - change distance
     * @param {number} angle - change angle
     * @param {Object} referencePosition - reference position
     * @returns {Array}
     * @private
     */
    getRotatePosition(distance, angle, referencePosition) {
      const radian = (angle * Math.PI) / RADIAN_CONVERSION_VALUE;
      const { x, y } = referencePosition;

      return [distance * Math.cos(radian) + x, distance * Math.sin(radian) + y];
    },
  }
);

export default ArrowLine;
