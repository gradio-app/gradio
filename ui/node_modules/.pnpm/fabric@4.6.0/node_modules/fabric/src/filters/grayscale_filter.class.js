(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Grayscale image filter class
   * @class fabric.Image.filters.Grayscale
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Grayscale();
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Grayscale = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Grayscale.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Grayscale',

    fragmentSource: {
      average: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'float average = (color.r + color.b + color.g) / 3.0;\n' +
          'gl_FragColor = vec4(average, average, average, color.a);\n' +
        '}',
      lightness: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform int uMode;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 col = texture2D(uTexture, vTexCoord);\n' +
          'float average = (max(max(col.r, col.g),col.b) + min(min(col.r, col.g),col.b)) / 2.0;\n' +
          'gl_FragColor = vec4(average, average, average, col.a);\n' +
        '}',
      luminosity: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform int uMode;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 col = texture2D(uTexture, vTexCoord);\n' +
          'float average = 0.21 * col.r + 0.72 * col.g + 0.07 * col.b;\n' +
          'gl_FragColor = vec4(average, average, average, col.a);\n' +
        '}',
    },


    /**
     * Grayscale mode, between 'average', 'lightness', 'luminosity'
     * @param {String} type
     * @default
     */
    mode: 'average',

    mainParameter: 'mode',

    /**
     * Apply the Grayscale operation to a Uint8Array representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8Array to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, i,
          len = data.length, value,
          mode = this.mode;
      for (i = 0; i < len; i += 4) {
        if (mode === 'average') {
          value = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        else if (mode === 'lightness') {
          value = (Math.min(data[i], data[i + 1], data[i + 2]) +
            Math.max(data[i], data[i + 1], data[i + 2])) / 2;
        }
        else if (mode === 'luminosity') {
          value = 0.21 * data[i] + 0.72 * data[i + 1] + 0.07 * data[i + 2];
        }
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var cacheKey = this.type + '_' + this.mode;
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        var shaderSource = this.fragmentSource[this.mode];
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uMode: gl.getUniformLocation(program, 'uMode'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      // default average mode.
      var mode = 1;
      gl.uniform1i(uniformLocations.uMode, mode);
    },

    /**
     * Grayscale filter isNeutralState implementation
     * The filter is never neutral
     * on the image
     **/
    isNeutralState: function() {
      return false;
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Grayscale} Instance of fabric.Image.filters.Grayscale
   */
  fabric.Image.filters.Grayscale.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
