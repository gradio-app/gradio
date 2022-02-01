(function(global) {
  'use strict';

  var fabric = global.fabric,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Color Blend filter class
   * @class fabric.Image.filter.BlendColor
   * @memberOf fabric.Image.filters
   * @extends fabric.Image.filters.BaseFilter
   * @example
   * var filter = new fabric.Image.filters.BlendColor({
   *  color: '#000',
   *  mode: 'multiply'
   * });
   *
   * var filter = new fabric.Image.filters.BlendImage({
   *  image: fabricImageObject,
   *  mode: 'multiply',
   *  alpha: 0.5
   * });
   * object.filters.push(filter);
   * object.applyFilters();
   * canvas.renderAll();
   */

  filters.BlendColor = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Blend.prototype */ {
    type: 'BlendColor',

    /**
     * Color to make the blend operation with. default to a reddish color since black or white
     * gives always strong result.
     **/
    color: '#F95C63',

    /**
     * Blend mode for the filter: one of multiply, add, diff, screen, subtract,
     * darken, lighten, overlay, exclusion, tint.
     **/
    mode: 'multiply',

    /**
     * alpha value. represent the strength of the blend color operation.
     **/
    alpha: 1,

    /**
     * Fragment source for the Multiply program
     */
    fragmentSource: {
      multiply: 'gl_FragColor.rgb *= uColor.rgb;\n',
      screen: 'gl_FragColor.rgb = 1.0 - (1.0 - gl_FragColor.rgb) * (1.0 - uColor.rgb);\n',
      add: 'gl_FragColor.rgb += uColor.rgb;\n',
      diff: 'gl_FragColor.rgb = abs(gl_FragColor.rgb - uColor.rgb);\n',
      subtract: 'gl_FragColor.rgb -= uColor.rgb;\n',
      lighten: 'gl_FragColor.rgb = max(gl_FragColor.rgb, uColor.rgb);\n',
      darken: 'gl_FragColor.rgb = min(gl_FragColor.rgb, uColor.rgb);\n',
      exclusion: 'gl_FragColor.rgb += uColor.rgb - 2.0 * (uColor.rgb * gl_FragColor.rgb);\n',
      overlay: 'if (uColor.r < 0.5) {\n' +
          'gl_FragColor.r *= 2.0 * uColor.r;\n' +
        '} else {\n' +
          'gl_FragColor.r = 1.0 - 2.0 * (1.0 - gl_FragColor.r) * (1.0 - uColor.r);\n' +
        '}\n' +
        'if (uColor.g < 0.5) {\n' +
          'gl_FragColor.g *= 2.0 * uColor.g;\n' +
        '} else {\n' +
          'gl_FragColor.g = 1.0 - 2.0 * (1.0 - gl_FragColor.g) * (1.0 - uColor.g);\n' +
        '}\n' +
        'if (uColor.b < 0.5) {\n' +
          'gl_FragColor.b *= 2.0 * uColor.b;\n' +
        '} else {\n' +
          'gl_FragColor.b = 1.0 - 2.0 * (1.0 - gl_FragColor.b) * (1.0 - uColor.b);\n' +
        '}\n',
      tint: 'gl_FragColor.rgb *= (1.0 - uColor.a);\n' +
        'gl_FragColor.rgb += uColor.rgb;\n',
    },

    /**
     * build the fragment source for the filters, joining the common part with
     * the specific one.
     * @param {String} mode the mode of the filter, a key of this.fragmentSource
     * @return {String} the source to be compiled
     * @private
     */
    buildSource: function(mode) {
      return 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform vec4 uColor;\n' +
        'varying vec2 vTexCoord;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'gl_FragColor = color;\n' +
          'if (color.a > 0.0) {\n' +
            this.fragmentSource[mode] +
          '}\n' +
        '}';
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var cacheKey = this.type + '_' + this.mode, shaderSource;
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        shaderSource = this.buildSource(this.mode);
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    /**
     * Apply the Blend operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          data = imageData.data, iLen = data.length,
          tr, tg, tb,
          r, g, b,
          source, alpha1 = 1 - this.alpha;

      source = new fabric.Color(this.color).getSource();
      tr = source[0] * this.alpha;
      tg = source[1] * this.alpha;
      tb = source[2] * this.alpha;

      for (var i = 0; i < iLen; i += 4) {

        r = data[i];
        g = data[i + 1];
        b = data[i + 2];

        switch (this.mode) {
          case 'multiply':
            data[i] = r * tr / 255;
            data[i + 1] = g * tg / 255;
            data[i + 2] = b * tb / 255;
            break;
          case 'screen':
            data[i] = 255 - (255 - r) * (255 - tr) / 255;
            data[i + 1] = 255 - (255 - g) * (255 - tg) / 255;
            data[i + 2] = 255 - (255 - b) * (255 - tb) / 255;
            break;
          case 'add':
            data[i] = r + tr;
            data[i + 1] = g + tg;
            data[i + 2] = b + tb;
            break;
          case 'diff':
          case 'difference':
            data[i] = Math.abs(r - tr);
            data[i + 1] = Math.abs(g - tg);
            data[i + 2] = Math.abs(b - tb);
            break;
          case 'subtract':
            data[i] = r - tr;
            data[i + 1] = g - tg;
            data[i + 2] = b - tb;
            break;
          case 'darken':
            data[i] = Math.min(r, tr);
            data[i + 1] = Math.min(g, tg);
            data[i + 2] = Math.min(b, tb);
            break;
          case 'lighten':
            data[i] = Math.max(r, tr);
            data[i + 1] = Math.max(g, tg);
            data[i + 2] = Math.max(b, tb);
            break;
          case 'overlay':
            data[i] = tr < 128 ? (2 * r * tr / 255) : (255 - 2 * (255 - r) * (255 - tr) / 255);
            data[i + 1] = tg < 128 ? (2 * g * tg / 255) : (255 - 2 * (255 - g) * (255 - tg) / 255);
            data[i + 2] = tb < 128 ? (2 * b * tb / 255) : (255 - 2 * (255 - b) * (255 - tb) / 255);
            break;
          case 'exclusion':
            data[i] = tr + r - ((2 * tr * r) / 255);
            data[i + 1] = tg + g - ((2 * tg * g) / 255);
            data[i + 2] = tb + b - ((2 * tb * b) / 255);
            break;
          case 'tint':
            data[i] = tr + r * alpha1;
            data[i + 1] = tg + g * alpha1;
            data[i + 2] = tb + b * alpha1;
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
        uColor: gl.getUniformLocation(program, 'uColor'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var source = new fabric.Color(this.color).getSource();
      source[0] = this.alpha * source[0] / 255;
      source[1] = this.alpha * source[1] / 255;
      source[2] = this.alpha * source[2] / 255;
      source[3] = this.alpha;
      gl.uniform4fv(uniformLocations.uColor, source);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return {
        type: this.type,
        color: this.color,
        mode: this.mode,
        alpha: this.alpha
      };
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} [callback] to be invoked after filter creation
   * @return {fabric.Image.filters.BlendColor} Instance of fabric.Image.filters.BlendColor
   */
  fabric.Image.filters.BlendColor.fromObject = fabric.Image.filters.BaseFilter.fromObject;

})(typeof exports !== 'undefined' ? exports : this);
