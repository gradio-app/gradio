(function(global) {
  'use strict';

  var fabric = global.fabric,
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * Image Blend filter class
   * @class fabric.Image.filter.BlendImage
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

  filters.BlendImage = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.BlendImage.prototype */ {
    type: 'BlendImage',

    /**
     * Color to make the blend operation with. default to a reddish color since black or white
     * gives always strong result.
     **/
    image: null,

    /**
     * Blend mode for the filter: one of multiply, add, diff, screen, subtract,
     * darken, lighten, overlay, exclusion, tint.
     **/
    mode: 'multiply',

    /**
     * alpha value. represent the strength of the blend image operation.
     * not implemented.
     **/
    alpha: 1,

    vertexSource: 'attribute vec2 aPosition;\n' +
      'varying vec2 vTexCoord;\n' +
      'varying vec2 vTexCoord2;\n' +
      'uniform mat3 uTransformMatrix;\n' +
      'void main() {\n' +
        'vTexCoord = aPosition;\n' +
        'vTexCoord2 = (uTransformMatrix * vec3(aPosition, 1.0)).xy;\n' +
        'gl_Position = vec4(aPosition * 2.0 - 1.0, 0.0, 1.0);\n' +
      '}',

    /**
     * Fragment source for the Multiply program
     */
    fragmentSource: {
      multiply: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform sampler2D uImage;\n' +
        'uniform vec4 uColor;\n' +
        'varying vec2 vTexCoord;\n' +
        'varying vec2 vTexCoord2;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'vec4 color2 = texture2D(uImage, vTexCoord2);\n' +
          'color.rgba *= color2.rgba;\n' +
          'gl_FragColor = color;\n' +
        '}',
      mask: 'precision highp float;\n' +
        'uniform sampler2D uTexture;\n' +
        'uniform sampler2D uImage;\n' +
        'uniform vec4 uColor;\n' +
        'varying vec2 vTexCoord;\n' +
        'varying vec2 vTexCoord2;\n' +
        'void main() {\n' +
          'vec4 color = texture2D(uTexture, vTexCoord);\n' +
          'vec4 color2 = texture2D(uImage, vTexCoord2);\n' +
          'color.a = color2.a;\n' +
          'gl_FragColor = color;\n' +
        '}',
    },

    /**
     * Retrieves the cached shader.
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    retrieveShader: function(options) {
      var cacheKey = this.type + '_' + this.mode;
      var shaderSource = this.fragmentSource[this.mode];
      if (!options.programCache.hasOwnProperty(cacheKey)) {
        options.programCache[cacheKey] = this.createProgram(options.context, shaderSource);
      }
      return options.programCache[cacheKey];
    },

    applyToWebGL: function(options) {
      // load texture to blend.
      var gl = options.context,
          texture = this.createTexture(options.filterBackend, this.image);
      this.bindAdditionalTexture(gl, texture, gl.TEXTURE1);
      this.callSuper('applyToWebGL', options);
      this.unbindAdditionalTexture(gl, gl.TEXTURE1);
    },

    createTexture: function(backend, image) {
      return backend.getCachedTexture(image.cacheKey, image._element);
    },

    /**
     * Calculate a transformMatrix to adapt the image to blend over
     * @param {Object} options
     * @param {WebGLRenderingContext} options.context The GL context used for rendering.
     * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
     */
    calculateMatrix: function() {
      var image = this.image,
          width = image._element.width,
          height = image._element.height;
      return [
        1 / image.scaleX, 0, 0,
        0, 1 / image.scaleY, 0,
        -image.left / width, -image.top / height, 1
      ];
    },

    /**
     * Apply the Blend operation to a Uint8ClampedArray representing the pixels of an image.
     *
     * @param {Object} options
     * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
     */
    applyTo2d: function(options) {
      var imageData = options.imageData,
          resources = options.filterBackend.resources,
          data = imageData.data, iLen = data.length,
          width = imageData.width,
          height = imageData.height,
          tr, tg, tb, ta,
          r, g, b, a,
          canvas1, context, image = this.image, blendData;

      if (!resources.blendImage) {
        resources.blendImage = fabric.util.createCanvasElement();
      }
      canvas1 = resources.blendImage;
      context = canvas1.getContext('2d');
      if (canvas1.width !== width || canvas1.height !== height) {
        canvas1.width = width;
        canvas1.height = height;
      }
      else {
        context.clearRect(0, 0, width, height);
      }
      context.setTransform(image.scaleX, 0, 0, image.scaleY, image.left, image.top);
      context.drawImage(image._element, 0, 0, width, height);
      blendData = context.getImageData(0, 0, width, height).data;
      for (var i = 0; i < iLen; i += 4) {

        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];

        tr = blendData[i];
        tg = blendData[i + 1];
        tb = blendData[i + 2];
        ta = blendData[i + 3];

        switch (this.mode) {
          case 'multiply':
            data[i] = r * tr / 255;
            data[i + 1] = g * tg / 255;
            data[i + 2] = b * tb / 255;
            data[i + 3] = a * ta / 255;
            break;
          case 'mask':
            data[i + 3] = ta;
            break;
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
        uTransformMatrix: gl.getUniformLocation(program, 'uTransformMatrix'),
        uImage: gl.getUniformLocation(program, 'uImage'),
      };
    },

    /**
     * Send data from this filter to its shader program's uniforms.
     *
     * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
     * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
     */
    sendUniformData: function(gl, uniformLocations) {
      var matrix = this.calculateMatrix();
      gl.uniform1i(uniformLocations.uImage, 1); // texture unit 1.
      gl.uniformMatrix3fv(uniformLocations.uTransformMatrix, false, matrix);
    },

    /**
     * Returns object representation of an instance
     * @return {Object} Object representation of an instance
     */
    toObject: function() {
      return {
        type: this.type,
        image: this.image && this.image.toObject(),
        mode: this.mode,
        alpha: this.alpha
      };
    }
  });

  /**
   * Returns filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @param {function} callback to be invoked after filter creation
   * @return {fabric.Image.filters.BlendImage} Instance of fabric.Image.filters.BlendImage
   */
  fabric.Image.filters.BlendImage.fromObject = function(object, callback) {
    fabric.Image.fromObject(object.image, function(image) {
      var options = fabric.util.object.clone(object);
      options.image = image;
      callback(new fabric.Image.filters.BlendImage(options));
    });
  };

})(typeof exports !== 'undefined' ? exports : this);
