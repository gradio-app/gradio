(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Saturate filter class
   * @class fabric.Image.filters.Saturation
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Saturation#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Saturation({
   *   saturation: 1
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Saturation = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Saturation.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Saturation',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uSaturation;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'float rgMax = max(color.r, color.g);\n' +
        'float rgbMax = max(rgMax, color.b);\n' +
        'color.r += rgbMax != color.r ? (rgbMax - color.r) * uSaturation : 0.00;\n' +
        'color.g += rgbMax != color.g ? (rgbMax - color.g) * uSaturation : 0.00;\n' +
        'color.b += rgbMax != color.b ? (rgbMax - color.b) * uSaturation : 0.00;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Saturation value, from -1 to 1.
     * Increases/decreases the color saturation.
     * A value of 0 has no effect.
     * 
     * @param {Number} saturation
     * @default
     */
    saturation: 0,

    mainParameter: 'saturation',

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Saturate.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.saturate=0] Value to saturate the image (-1...1)
     */

    /**
     * Apply the Saturation operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      if (this.saturation === 0) {
        return;
      }
      var imageData = options.imageData,
          data = imageData.data, len = data.length,
          adjust = -this.saturation, i, max;

      for (i = 0; i < len; i += 4) {
        max = Math.max(data[i], data[i + 1], data[i + 2]);
        data[i] += max !== data[i] ? (max - data[i]) * adjust : 0;
        data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * adjust : 0;
        data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * adjust : 0;
      }
    },

    /**
     * Return WebGL uniform locations for this filter's shader.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {WebGLShaderProgram} program This filter's compiled shader program.
     */
    getUniformLocations: function(gl, program) {
      return {
        uSaturation: gl.getUniformLocation(program, 'uSaturation'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uSaturation, -this.saturation);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Saturation} Instance of fabric.Image.filters.Saturate
   */
  fabric.Image.filters.Saturation.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
