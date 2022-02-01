(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Adapted from <a href="http://www.html5rocks.com/en/tutorials/canvas/imagefilters/">html5rocks article</a>
   * @class fabric.Image.filters.Convolute
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Convolute#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example <caption>Sharpen filter</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   matrix: [ 0, -1,  0,
   *            -1,  5, -1,
   *             0, -1,  0 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   * @example <caption>Blur filter</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   matrix: [ 1/9, 1/9, 1/9,
   *             1/9, 1/9, 1/9,
   *             1/9, 1/9, 1/9 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   * @example <caption>Emboss filter</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   matrix: [ 1,   1,  1,
   *             1, 0.7, -1,
   *            -1,  -1, -1 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   * @example <caption>Emboss filter with opaqueness</caption>
   * var filter = new fabric.Image.filters.Convolute({
   *   opaque: true,
   *   matrix: [ 1,   1,  1,
   *             1, 0.7, -1,
   *            -1,  -1, -1 ]
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */
  filters.Convolute = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Convolute.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Convolute',

    /*
     * Opaque value (true/false)
     */
    opaque: false,

    /*
     * matrix for the filter, max 9x9
     */
    matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0],

    /**
     * Fragment source for the brightness program
     */
    fragmentSource: {
      Convolute_3_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[9];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 3.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 3.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 1), uStepH * (h - 1));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 3.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_3_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[9];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 3.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 3.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 1.0), uStepH * (h - 1.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 3.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
      Convolute_5_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[25];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 5.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 5.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 2.0), uStepH * (h - 2.0));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 5.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_5_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[25];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 5.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 5.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 2.0), uStepH * (h - 2.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 5.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
      Convolute_7_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[49];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 7.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 7.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 3.0), uStepH * (h - 3.0));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 7.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_7_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[49];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 7.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 7.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 3.0), uStepH * (h - 3.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 7.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
      Convolute_9_1: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[81];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 0);\n' +
          'for (float h = 0.0; h < 9.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 9.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 4.0), uStepH * (h - 4.0));\n' +
              'color += texture2D(uTexture, vTexCoord + matrixPos) * uMatrix[int(h * 9.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'gl_FragColor = color;\n' +
        '}',
      Convolute_9_0: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform float uMatrix[81];\n' +
        'uniform float uStepW;\n' +
        'uniform float uStepH;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = vec4(0, 0, 0, 1);\n' +
          'for (float h = 0.0; h < 9.0; h+=1.0) {\n' +
            'for (float w = 0.0; w < 9.0; w+=1.0) {\n' +
              'vec2 matrixPos = vec2(uStepW * (w - 4.0), uStepH * (h - 4.0));\n' +
              'color.rgb += texture2D(uTexture, vTexCoord + matrixPos).rgb * uMatrix[int(h * 9.0 + w)];\n' +
            '}\n' +
          '}\n' +
          'float alpha = texture2D(uTexture, vTexCoord).a;\n' +
          'gl_FragColor = color;\n' +
          'gl_FragColor.a = alpha;\n' +
        '}',
    },

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Convolute.prototype
     * @param {Object} [options] Options object
     * @param {Boolean} [options.opaque=false] Opaque value (true/false)
     * @param {Array} [options.matrix] Filter matrix
     */


    /**
    * Retrieves the cached shader.
    * @param {Object} options
    * @param {WebGLRenderingContext} options.context The GL context used for rendering.
    * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
    */
    retrieveShader: function(options) {
      var size = Math.sqrt(this.matrix.length);
      var cacheKey = this.type + '_' + size + '_' + (this.opaque ? 1 : 0);
      var shaderSource = this.fragmentSource[cacheKey];
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    /**
     * Apply the Brightness operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data,
          weights = this.matrix,
          side = Math.round(Math.sqrt(weights.length)),
          halfSide = Math.floor(side / 2),
          sw = imageData.width,
          sh = imageData.height,
          output = options.ctx.createImageData(sw, sh),
          dst = output.data,
          // go through the destination image pixels
          alphaFac = this.opaque ? 1 : 0,
          r, g, b, a, dstOff,
          scx, scy, srcOff, wt,
          x, y, cx, cy;

      for (y = 0; y < sh; y++) {
        for (x = 0; x < sw; x++) {
          dstOff = (y * sw + x) * 4;
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          r = 0; g = 0; b = 0; a = 0;

          for (cy = 0; cy < side; cy++) {
            for (cx = 0; cx < side; cx++) {
              scy = y + cy - halfSide;
              scx = x + cx - halfSide;

              // eslint-disable-next-line max-depth
              if (scy < 0 || scy >= sh || scx < 0 || scx >= sw) {
                continue;
              }

              srcOff = (scy * sw + scx) * 4;
              wt = weights[cy * side + cx];

              r += data[srcOff] * wt;
              g += data[srcOff + 1] * wt;
              b += data[srcOff + 2] * wt;
              // eslint-disable-next-line max-depth
              if (!alphaFac) {
                a += data[srcOff + 3] * wt;
              }
            }
          }
          dst[dstOff] = r;
          dst[dstOff + 1] = g;
          dst[dstOff + 2] = b;
          if (!alphaFac) {
            dst[dstOff + 3] = a;
          }
          else {
            dst[dstOff + 3] = data[dstOff + 3];
          }
        }
      }
      options.imageData = output;
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uMatrix: gl.getUniformLocation(program, 'uMatrix'),
        uOpaque: gl.getUniformLocation(program, 'uOpaque'),
        uHalfSize: gl.getUniformLocation(program, 'uHalfSize'),
        uSize: gl.getUniformLocation(program, 'uSize'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1fv(uniformLocations.uMatrix, this.matrix);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return extend(this.callSuper('toObject'), {
        opaque: this.opaque,
        matrix: this.matrix
      });
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Convolute} Instance of fabric.Image.filters.Convolute
   */
  fabric.Image.filters.Convolute.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
