/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Mask extending fabric.Image.filters.Mask
 */
import { fabric } from 'fabric';

/**
 * Mask object
 * @class Mask
 * @extends {fabric.Image.filters.BlendImage}
 * @ignore
 */
const Mask = fabric.util.createClass(
  fabric.Image.filters.BlendImage,
  /** @lends Mask.prototype */ {
    /**
     * Apply filter to canvas element
     * @param {Object} pipelineState - Canvas element to apply filter
     * @override
     */
    applyTo(pipelineState) {
      if (!this.mask) {
        return;
      }

      const canvas = pipelineState.canvasEl;
      const { width, height } = canvas;
      const maskCanvasEl = this._createCanvasOfMask(width, height);
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvasEl.getContext('2d');
      const imageData = ctx.getImageData(0, 0, width, height);

      this._drawMask(maskCtx, canvas, ctx);
      this._mapData(maskCtx, imageData, width, height);

      pipelineState.imageData = imageData;
    },

    /**
     * Create canvas of mask image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @returns {HTMLElement} Canvas element
     * @private
     */
    _createCanvasOfMask(width, height) {
      const maskCanvasEl = fabric.util.createCanvasElement();

      maskCanvasEl.width = width;
      maskCanvasEl.height = height;

      return maskCanvasEl;
    },

    /**
     * Draw mask image on canvas element
     * @param {Object} maskCtx - Context of mask canvas
     * @private
     */
    _drawMask(maskCtx) {
      const { mask } = this;
      const maskImg = mask.getElement();
      const { angle, left, scaleX, scaleY, top } = mask;

      maskCtx.save();
      maskCtx.translate(left, top);
      maskCtx.rotate((angle * Math.PI) / 180);
      maskCtx.scale(scaleX, scaleY);
      maskCtx.drawImage(maskImg, -maskImg.width / 2, -maskImg.height / 2);
      maskCtx.restore();
    },

    /**
     * Map mask image data to source image data
     * @param {Object} maskCtx - Context of mask canvas
     * @param {Object} imageData - Data of source image
     * @param {number} width - Width of main canvas
     * @param {number} height - Height of main canvas
     * @private
     */
    _mapData(maskCtx, imageData, width, height) {
      const { data, height: imgHeight, width: imgWidth } = imageData;
      const sourceData = data;
      const len = imgWidth * imgHeight * 4;
      const maskData = maskCtx.getImageData(0, 0, width, height).data;

      for (let i = 0; i < len; i += 4) {
        sourceData[i + 3] = maskData[i]; // adjust value of alpha data
      }
    },
  }
);

export default Mask;
