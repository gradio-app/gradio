(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }), pow = Math.pow, floor = Math.floor,
      sqrt = Math.sqrt, abs = Math.abs, round = Math.round, sin = Math.sin,
      ceil = Math.ceil,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Resize image filter class
   * @class fabric.Image.filters.Resize
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Resize();
   * object.filters.push(filter);
   * object.applyFilters(canvas.renderAll.bind(canvas));
   */
  filters.Resize = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Resize.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Resize',

    /**
     * Resize type
     * for webgl resizeType is just lanczos, for canvas2d can be:
     * bilinear, hermite, sliceHack, lanczos.
     * @param {String} resizeType
     * @default
     */
    resizeType: 'hermite',

    /**
     * Scale factor for resizing, x axis
     * @param {Number} scaleX
     * @default
     */
    scaleX: 1,

    /**
     * Scale factor for resizing, y axis
     * @param {Number} scaleY
     * @default
     */
    scaleY: 1,

    /**
     * LanczosLobes parameter for lanczos filter, valid for resizeType lanczos
     * @param {Number} lanczosLobes
     * @default
     */
    lanczosLobes: 3,


    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uDelta: gl.getUniformLocation(program, 'uDelta'),
        uTaps: gl.getUniformLocation(program, 'uTaps'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform2fv(uniformLocations.uDelta, this.horizontal ? [1 / this.width, 0] : [0, 1 / this.height]);
      gl.uniform1fv(uniformLocations.uTaps, this.taps);
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var filterWindow = this.getFilterWindow(), cacheKey = this.type + '_' + filterWindow;
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        var fragmentShader = this.generateShader(filterWindow);
        options.programCache[cacheKey] = this.createProgram(options.context, fragmentShader);
      }
      return options.programCache[cacheKey];
    },

    getFilterWindow: function() {
      var scale = this.tempScale;
      return Math.ceil(this.lanczosLobes / scale);
    },

    getTaps: function() {
      var lobeFunction = this.lanczosCreate(this.lanczosLobes), scale = this.tempScale,
          filterWindow = this.getFilterWindow(), taps = new Array(filterWindow);
      for (var i = 1; i <= filterWindow; i++) {
        taps[i - 1] = lobeFunction(i * scale);
      }
      return taps;
    },

    /**
     * Generate vertex and shader sources from the necessary steps numbers
     * @param {Number} filterWindow
     */
    generateShader: function(filterWindow) {
      var offsets = new Array(filterWindow),
          fragmentShader = this.fragmentSourceTOP, filterWindow;

      for (var i = 1; i <= filterWindow; i++) {
        offsets[i - 1] = i + '.0 * uDelta';
      }

      fragmentShader += 'uniform float uTaps[' + filterWindow + '];\n';
      fragmentShader += 'void main() {\n';
      fragmentShader += '  vec4 color = texture2D(uTexture, vTexCoord);\n';
      fragmentShader += '  float sum = 1.0;\n';

      offsets.forEach(function(offset, i) {
        fragmentShader += '  color += texture2D(uTexture, vTexCoord + ' + offset + ') * uTaps[' + i + '];\n';
        fragmentShader += '  color += texture2D(uTexture, vTexCoord - ' + offset + ') * uTaps[' + i + '];\n';
        fragmentShader += '  sum += 2.0 * uTaps[' + i + '];\n';
      });
      fragmentShader += '  gl_FragColor = color / sum;\n';
      fragmentShader += '}';
      return fragmentShader;
    },

    fragmentSourceTOP: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec2 uDelta;\n' +
      'varying vec2 vTexCoord;\n',

    /**
     * Apply the resize filter to the image
     * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be executed
     * @param {Boolean} options.webgl Whether to use webgl to render the filter.
     * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
     * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    applyTo: function(options) {
      if (options.webgl) {
        options.passes++;
        this.width = options.sourceWidth;
        this.horizontal = true;
        this.dW = Math.round(this.width * this.scaleX);
        this.dH = options.sourceHeight;
        this.tempScale = this.dW / this.width;
        this.taps = this.getTaps();
        options.destinationWidth = this.dW;
        this._setupFrameBuffer(options);
        this.applyToWebGL(options);
        this._swapTextures(options);
        options.sourceWidth = options.destinationWidth;

        this.height = options.sourceHeight;
        this.horizontal = false;
        this.dH = Math.round(this.height * this.scaleY);
        this.tempScale = this.dH / this.height;
        this.taps = this.getTaps();
        options.destinationHeight = this.dH;
        this._setupFrameBuffer(options);
        this.applyToWebGL(options);
        this._swapTextures(options);
        options.sourceHeight = options.destinationHeight;
      }
      else {
        this.applyTo2d(options);
      }
    },

    isNeutralState: function() {
      return this.scaleX === 1 && this.scaleY === 1;
    },

    lanczosCreate: function(lobes) {
      return function(x) {
        if (x >= lobes || x <= -lobes) {
          return 0.0;
        }
        if (x < 1.19209290E-07 && x > -1.19209290E-07) {
          return 1.0;
        }
        x *= Math.PI;
        var xx = x / lobes;
        return (sin(x) / x) * sin(xx) / xx;
      };
    },

    /**
     * Applies filter to canvas element
     * @memberOf fabric.Image.filters.Resize.prototype
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} scaleX
     * @param {Number} scaleY
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          scaleX = this.scaleX,
          scaleY = this.scaleY;

      this.rcpScaleX = 1 / scaleX;
      this.rcpScaleY = 1 / scaleY;

      var oW = imageData.width, oH = imageData.height,
          dW = round(oW * scaleX), dH = round(oH * scaleY),
          newData;

      if (this.resizeType === 'sliceHack') {
        newData = this.sliceByTwo(options, oW, oH, dW, dH);
      }
      else if (this.resizeType === 'hermite') {
        newData = this.hermiteFastResize(options, oW, oH, dW, dH);
      }
      else if (this.resizeType === 'bilinear') {
        newData = this.bilinearFiltering(options, oW, oH, dW, dH);
      }
      else if (this.resizeType === 'lanczos') {
        newData = this.lanczosResize(options, oW, oH, dW, dH);
      }
      options.imageData = newData;
    },

    /**
     * Filter sliceByTwo
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    sliceByTwo: function(options, oW, oH, dW, dH) {
      var imageData = options.imageData,
          mult = 0.5, doneW = false, doneH = false, stepW = oW * mult,
          stepH = oH * mult, resources = fabric.filterBackend.resources,
          tmpCanvas, ctx, sX = 0, sY = 0, dX = oW, dY = 0;
      if (!resources.sliceByTwo) {
        resources.sliceByTwo = document.createElement('canvas');
      }
      tmpCanvas = resources.sliceByTwo;
      if (tmpCanvas.width < oW * 1.5 || tmpCanvas.height < oH) {
        tmpCanvas.width = oW * 1.5;
        tmpCanvas.height = oH;
      }
      ctx = tmpCanvas.getContext('2d');
      ctx.clearRect(0, 0, oW * 1.5, oH);
      ctx.putImageData(imageData, 0, 0);

      dW = floor(dW);
      dH = floor(dH);

      while (!doneW || !doneH) {
        oW = stepW;
        oH = stepH;
        if (dW < floor(stepW * mult)) {
          stepW = floor(stepW * mult);
        }
        else {
          stepW = dW;
          doneW = true;
        }
        if (dH < floor(stepH * mult)) {
          stepH = floor(stepH * mult);
        }
        else {
          stepH = dH;
          doneH = true;
        }
        ctx.drawImage(tmpCanvas, sX, sY, oW, oH, dX, dY, stepW, stepH);
        sX = dX;
        sY = dY;
        dY += stepH;
      }
      return ctx.getImageData(sX, sY, dW, dH);
    },

    /**
     * Filter lanczosResize
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    lanczosResize: function(options, oW, oH, dW, dH) {

      function process(u) {
        var v, i, weight, idx, a, red, green,
            blue, alpha, fX, fY;
        center.x = (u + 0.5) * ratioX;
        icenter.x = floor(center.x);
        for (v = 0; v < dH; v++) {
          center.y = (v + 0.5) * ratioY;
          icenter.y = floor(center.y);
          a = 0; red = 0; green = 0; blue = 0; alpha = 0;
          for (i = icenter.x - range2X; i <= icenter.x + range2X; i++) {
            if (i < 0 || i >= oW) {
              continue;
            }
            fX = floor(1000 * abs(i - center.x));
            if (!cacheLanc[fX]) {
              cacheLanc[fX] = { };
            }
            for (var j = icenter.y - range2Y; j <= icenter.y + range2Y; j++) {
              if (j < 0 || j >= oH) {
                continue;
              }
              fY = floor(1000 * abs(j - center.y));
              if (!cacheLanc[fX][fY]) {
                cacheLanc[fX][fY] = lanczos(sqrt(pow(fX * rcpRatioX, 2) + pow(fY * rcpRatioY, 2)) / 1000);
              }
              weight = cacheLanc[fX][fY];
              if (weight > 0) {
                idx = (j * oW + i) * 4;
                a += weight;
                red += weight * srcData[idx];
                green += weight * srcData[idx + 1];
                blue += weight * srcData[idx + 2];
                alpha += weight * srcData[idx + 3];
              }
            }
          }
          idx = (v * dW + u) * 4;
          destData[idx] = red / a;
          destData[idx + 1] = green / a;
          destData[idx + 2] = blue / a;
          destData[idx + 3] = alpha / a;
        }

        if (++u < dW) {
          return process(u);
        }
        else {
          return destImg;
        }
      }

      var srcData = options.imageData.data,
          destImg = options.ctx.createImageData(dW, dH),
          destData = destImg.data,
          lanczos = this.lanczosCreate(this.lanczosLobes),
          ratioX = this.rcpScaleX, ratioY = this.rcpScaleY,
          rcpRatioX = 2 / this.rcpScaleX, rcpRatioY = 2 / this.rcpScaleY,
          range2X = ceil(ratioX * this.lanczosLobes / 2),
          range2Y = ceil(ratioY * this.lanczosLobes / 2),
          cacheLanc = { }, center = { }, icenter = { };

      return process(0);
    },

    /**
     * bilinearFiltering
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    bilinearFiltering: function(options, oW, oH, dW, dH) {
      var a, b, c, d, x, y, i, j, xDiff, yDiff, chnl,
          color, offset = 0, origPix, ratioX = this.rcpScaleX,
          ratioY = this.rcpScaleY,
          w4 = 4 * (oW - 1), img = options.imageData,
          pixels = img.data, destImage = options.ctx.createImageData(dW, dH),
          destPixels = destImage.data;
      for (i = 0; i < dH; i++) {
        for (j = 0; j < dW; j++) {
          x = floor(ratioX * j);
          y = floor(ratioY * i);
          xDiff = ratioX * j - x;
          yDiff = ratioY * i - y;
          origPix = 4 * (y * oW + x);

          for (chnl = 0; chnl < 4; chnl++) {
            a = pixels[origPix + chnl];
            b = pixels[origPix + 4 + chnl];
            c = pixels[origPix + w4 + chnl];
            d = pixels[origPix + w4 + 4 + chnl];
            color = a * (1 - xDiff) * (1 - yDiff) + b * xDiff * (1 - yDiff) +
                    c * yDiff * (1 - xDiff) + d * xDiff * yDiff;
            destPixels[offset++] = color;
          }
        }
      }
      return destImage;
    },

    /**
     * hermiteFastResize
     * @param {Object} canvasEl Canvas element to apply filter to
     * @param {Number} oW Original Width
     * @param {Number} oH Original Height
     * @param {Number} dW Destination Width
     * @param {Number} dH Destination Height
     * @returns {ImageData}
     */
    hermiteFastResize: function(options, oW, oH, dW, dH) {
      var ratioW = this.rcpScaleX, ratioH = this.rcpScaleY,
          ratioWHalf = ceil(ratioW / 2),
          ratioHHalf = ceil(ratioH / 2),
          img = options.imageData, data = img.data,
          img2 = options.ctx.createImageData(dW, dH), data2 = img2.data;
      for (var j = 0; j < dH; j++) {
        for (var i = 0; i < dW; i++) {
          var x2 = (i + j * dW) * 4, weight = 0, weights = 0, weightsAlpha = 0,
              gxR = 0, gxG = 0, gxB = 0, gxA = 0, centerY = (j + 0.5) * ratioH;
          for (var yy = floor(j * ratioH); yy < (j + 1) * ratioH; yy++) {
            var dy = abs(centerY - (yy + 0.5)) / ratioHHalf,
                centerX = (i + 0.5) * ratioW, w0 = dy * dy;
            for (var xx = floor(i * ratioW); xx < (i + 1) * ratioW; xx++) {
              var dx = abs(centerX - (xx + 0.5)) / ratioWHalf,
                  w = sqrt(w0 + dx * dx);
              /* eslint-disable max-depth */
              if (w > 1 && w < -1) {
                continue;
              }
              //hermite filter
              weight = 2 * w * w * w - 3 * w * w + 1;
              if (weight > 0) {
                dx = 4 * (xx + yy * oW);
                //alpha
                gxA += weight * data[dx + 3];
                weightsAlpha += weight;
                //colors
                if (data[dx + 3] < 255) {
                  weight = weight * data[dx + 3] / 250;
                }
                gxR += weight * data[dx];
                gxG += weight * data[dx + 1];
                gxB += weight * data[dx + 2];
                weights += weight;
              }
              /* eslint-enable max-depth */
            }
          }
          data2[x2] = gxR / weights;
          data2[x2 + 1] = gxG / weights;
          data2[x2 + 2] = gxB / weights;
          data2[x2 + 3] = gxA / weightsAlpha;
        }
      }
      return img2;
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return {
        type: this.type,
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        resizeType: this.resizeType,
        lanczosLobes: this.lanczosLobes
      };
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Resize} Instance of fabric.Image.filters.Resize
   */
  fabric.Image.filters.Resize.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
