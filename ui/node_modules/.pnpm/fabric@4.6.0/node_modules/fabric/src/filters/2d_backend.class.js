(function() {

  'use strict';

  var noop = function() {};

  fabric.Canvas2dFilterBackend = Canvas2dFilterBackend;

  /**
   * Canvas 2D filter backend.
   */
  function Canvas2dFilterBackend() {};

  Canvas2dFilterBackend.prototype = /** @lends fabric.Canvas2dFilterBackend.prototype */ {
    evictCachesForKey: noop,
    dispose: noop,
    clearWebGLCaches: noop,

    /**
     * Experimental. This object is a sort of repository of help layers used to avoid
     * of recreating them during frequent filtering. If you are previewing a filter with
     * a slider you probably do not want to create help layers every filter step.
     * in this object there will be appended some canvases, created once, resized sometimes
     * cleared never. Clearing is left to the developer.
     **/
    resources: {

    },

    /**
     * Apply a set of filters against a source image and draw the filtered output
     * to the provided destination canvas.
     *
     * @param {EnhancedFilter} filters The filter to apply.
     * @param {HTMLImageElement|HTMLCanvasElement} sourceElement The source to be filtered.
     * @param {Number} sourceWidth The width of the source input.
     * @param {Number} sourceHeight The height of the source input.
     * @param {HTMLCanvasElement} targetCanvas The destination for filtered output to be drawn.
     */
    applyFilters: function(filters, sourceElement, sourceWidth, sourceHeight, targetCanvas) {
      var ctx = targetCanvas.getContext('2d');
      ctx.drawImage(sourceElement, 0, 0, sourceWidth, sourceHeight);
      var imageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      var originalImageData = ctx.getImageData(0, 0, sourceWidth, sourceHeight);
      var pipelineState = {
        sourceWidth: sourceWidth,
        sourceHeight: sourceHeight,
        imageData: imageData,
        originalEl: sourceElement,
        originalImageData: originalImageData,
        canvasEl: targetCanvas,
        ctx: ctx,
        filterBackend: this,
      };
      filters.forEach(function(filter) { filter.applyTo(pipelineState); });
      if (pipelineState.imageData.width !== sourceWidth || pipelineState.imageData.height !== sourceHeight) {
        targetCanvas.width = pipelineState.imageData.width;
        targetCanvas.height = pipelineState.imageData.height;
      }
      ctx.putImageData(pipelineState.imageData, 0, 0);
      return pipelineState;
    },

  };
})();
