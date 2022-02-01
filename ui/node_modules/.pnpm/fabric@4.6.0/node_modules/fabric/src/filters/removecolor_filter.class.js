(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Remove white filter class
   * @class fabric.Image.filters.RemoveColor
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @see {@link fabric.Image.filters.RemoveColor#initialize} for constructor definition
   * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
   * @example
   * var filter = new fabric.Image.filters.RemoveColor({
   *   threshold: 0.2,
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */
  filters.RemoveColor = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.RemoveColor.prototype */ {

    /**
     * Filter type
     * @param {String} type
     * @default
     */
    type: 'RemoveColor',

    /**
     * Color to remove, in any format understood by fabric.Color.
     * @param {String} type
     * @default
     */
    color: '#FFFFFF',

    /**
     * Fragment source for the brightness program
     */
    fragmentSource: 'precision highp float;\n' +
      'uniform sampler2D uTexture;\n' +
      'uniform vec4 uLow;\n' +
      'uniform vec4 uHigh;\n' +
      'varying vec2 vTexCoord;\n' +
      'void main() {\n' +
        'gl_FragColor = texture2D(uTexture, vTexCoord);\n' +
        'if(all(greaterThan(gl_FragColor.rgb,uLow.rgb)) && all(greaterThan(uHigh.rgb,gl_FragColor.rgb))) {\n' +
          'gl_FragColor.a = 0.0;\n' +
        '}\n' +
      '}',

    /**
     * distance to actual color, as value up or down from each r,g,b
     * between 0 and 1
     **/
    distance: 0.02,

    /**
     * For color to remove inside distance, use alpha channel for a smoother deletion
     * NOT IMPLEMENTED YET
     **/
    useAlpha: false,

    /**
     * Constructor
     * @memberOf fabric.Image.filters.RemoveWhite.prototype
     * @param {Object} [options] Options object
     * @param {Number} [options.color=#RRGGBB] Threshold value
     * @param {Number} [options.distance=10] Distance value
     */

    /**
     * Applies filter to canvas element
     * @param {Object} canvasEl Canvas element to apply filter to
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, i,
          distance = this.distance * 255,
          r, g, b,
          source = new fabric.Color(this.color).getSource(),
          lowC = [
            source[0] - distance,
            source[1] - distance,
            source[2] - distance,
          ],
          highC = [
            source[0] + distance,
            source[1] + distance,
            source[2] + distance,
          ];


      for (i = 0; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];

        if (r > lowC[0] &&
            g > lowC[1] &&
            b > lowC[2] &&
            r < highC[0] &&
            g < highC[1] &&
            b < highC[2]) {
          data[i + 3] = 0;
        }
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
        uLow: gl.getUniformLocation(program, 'uLow'),
        uHigh: gl.getUniformLocation(program, 'uHigh'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var source = new fabric.Color(this.color).getSource(),
          distance = parseFloat(this.distance),
          lowC = [
            0 + source[0] / 255 - distance,
            0 + source[1] / 255 - distance,
            0 + source[2] / 255 - distance,
            1
          ],
          highC = [
            source[0] / 255 + distance,
            source[1] / 255 + distance,
            source[2] / 255 + distance,
            1
          ];
      gl.uniform4fv(uniformLocations.uLow, lowC);
      gl.uniform4fv(uniformLocations.uHigh, highC);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return extend(this.callSuper('toObject'), {
        color: this.color,
        distance: this.distance
      });
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.RemoveColor} Instance of fabric.Image.filters.RemoveWhite
   */
  fabric.Image.filters.RemoveColor.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
