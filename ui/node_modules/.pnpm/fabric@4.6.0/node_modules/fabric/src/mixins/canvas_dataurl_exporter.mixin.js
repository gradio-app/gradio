(function () {
  fabric.util.object.extend(fabric.StaticCanvas.prototype, /** @lends fabric.StaticCanvas.prototype */ {

    /**
     * Exports canvas element to a dataurl image. Note that when multiplier is used, cropping is scaled appropriately
     * @param {Object} [options] Options object
     * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
     * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
     * @param {Number} [options.multiplier=1] Multiplier to scale by, to have consistent
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 2.0.0
     * @return {String} Returns a data: URL containing a representation of the object in the format specified by options.format
     * @see {@link http://jsfiddle.net/fabricjs/NfZVb/|jsFiddle demo}
     * @example <caption>Generate jpeg dataURL with lower quality</caption>
     * var dataURL = canvas.toDataURL({
     *   format: 'jpeg',
     *   quality: 0.8
     * });
     * @example <caption>Generate cropped png dataURL (clipping of canvas)</caption>
     * var dataURL = canvas.toDataURL({
     *   format: 'png',
     *   left: 100,
     *   top: 100,
     *   width: 200,
     *   height: 200
     * });
     * @example <caption>Generate double scaled png dataURL</caption>
     * var dataURL = canvas.toDataURL({
     *   format: 'png',
     *   multiplier: 2
     * });
     */
    toDataURL: function (options) {
      options || (options = { });

      var format = options.format || 'png',
          quality = options.quality || 1,
          multiplier = (options.multiplier || 1) * (options.enableRetinaScaling ? this.getRetinaScaling() : 1),
          canvasEl = this.toCanvasElement(multiplier, options);
      return fabric.util.toDataURL(canvasEl, format, quality);
    },

    /**
     * Create a new HTMLCanvas element painted with the current canvas content.
     * No need to resize the actual one or repaint it.
     * Will transfer object ownership to a new canvas, paint it, and set everything back.
     * This is an intermediary step used to get to a dataUrl but also it is useful to
     * create quick image copies of a canvas without passing for the dataUrl string
     * @param {Number} [multiplier] a zoom factor.
     * @param {Object} [cropping] Cropping informations
     * @param {Number} [cropping.left] Cropping left offset.
     * @param {Number} [cropping.top] Cropping top offset.
     * @param {Number} [cropping.width] Cropping width.
     * @param {Number} [cropping.height] Cropping height.
     */
    toCanvasElement: function(multiplier, cropping) {
      multiplier = multiplier || 1;
      cropping = cropping || { };
      var scaledWidth = (cropping.width || this.width) * multiplier,
          scaledHeight = (cropping.height || this.height) * multiplier,
          zoom = this.getZoom(),
          originalWidth = this.width,
          originalHeight = this.height,
          newZoom = zoom * multiplier,
          vp = this.viewportTransform,
          translateX = (vp[4] - (cropping.left || 0)) * multiplier,
          translateY = (vp[5] - (cropping.top || 0)) * multiplier,
          originalInteractive = this.interactive,
          newVp = [newZoom, 0, 0, newZoom, translateX, translateY],
          originalRetina = this.enableRetinaScaling,
          canvasEl = fabric.util.createCanvasElement(),
          originalContextTop = this.contextTop;
      canvasEl.width = scaledWidth;
      canvasEl.height = scaledHeight;
      this.contextTop = null;
      this.enableRetinaScaling = false;
      this.interactive = false;
      this.viewportTransform = newVp;
      this.width = scaledWidth;
      this.height = scaledHeight;
      this.calcViewportBoundaries();
      this.renderCanvas(canvasEl.getContext('2d'), this._objects);
      this.viewportTransform = vp;
      this.width = originalWidth;
      this.height = originalHeight;
      this.calcViewportBoundaries();
      this.interactive = originalInteractive;
      this.enableRetinaScaling = originalRetina;
      this.contextTop = originalContextTop;
      return canvasEl;
    },
  });

})();
