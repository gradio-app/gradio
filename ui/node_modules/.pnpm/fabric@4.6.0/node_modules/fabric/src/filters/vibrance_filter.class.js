(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Vibrance filter class
   * @class fabric.Image.filters.Vibrance
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.Vibrance#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.Vibrance({
   *   vibrance: 1
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   */
  filters.Vibrance = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Vibrance.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'Vibrance',

    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform float uVibrance;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'vec4 color = texture2D(uTexture, vTexCoord);\n' +
        'float max = max(color.r, max(color.g, color.b));\n' +
        'float avg = (color.r + color.g + color.b) / 3.0;\n' +
        'float amt = (abs(max - avg) * 2.0) * uVibrance;\n' +
        'color.r += max != color.r ? (max - color.r) * amt : 0.00;\n' +
        'color.g += max != color.g ? (max - color.g) * amt : 0.00;\n' +
        'color.b += max != color.b ? (max - color.b) * amt : 0.00;\n' +
        'gl_FragColor = color;\n' +
      '}',

    /**
     * Vibrance value, from -1 to 1.
     * Increases/decreases the saturation of more muted colors with less effect on saturated colors.
     * A value of 0 has no effect.
     * 
     * @param {Number} vibrance
     * @default
     */
    vibrance: 0,

    mainParameter: 'vibrance',

    /**
     * Constructor
     * @memberOf fabric.Image.filters.Vibrance.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.vibrance=0] Vibrance value for the image (between -1 and 1)
     */

    /**
     * Apply the Vibrance operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      if (this.vibrance === 0) {
        return;
      }
      var imageData = options.imageData,
          data = imageData.data, len = data.length,
          adjust = -this.vibrance, i, max, avg, amt;

      for (i = 0; i < len; i += 4) {
        max = Math.max(data[i], data[i + 1], data[i + 2]);
        avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        amt = ((Math.abs(max - avg) * 2 / 255) * adjust);
        data[i] += max !== data[i] ? (max - data[i]) * amt : 0;
        data[i + 1] += max !== data[i + 1] ? (max - data[i + 1]) * amt : 0;
        data[i + 2] += max !== data[i + 2] ? (max - data[i + 2]) * amt : 0;
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
        uVibrance: gl.getUniformLocation(program, 'uVibrance'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      gl.uniform1f(uniformLocations.uVibrance, -this.vibrance);
    },
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.Vibrance} Instance of fabric.Image.filters.Vibrance
   */
  fabric.Image.filters.Vibrance.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
