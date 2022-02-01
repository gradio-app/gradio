(function() {

  'use strict';

  /**
   * Tests if webgl supports certain precision
   * @param {WebGL} Canvas WebGL context to test on
   * @param {String} Precision to test can be any of following: 'lowp', 'mediump', 'highp'
   * @returns {Boolean} Whether the user's browser WebGL supports given precision.
   */
  function testPrecision(gl, precision){
    var fragmentSource = 'precision ' + precision + ' float;\nvoid main(){}';
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      return false;
    }
    return true;
  }

  /**
   * Indicate whether this filtering backend is supported by the user's browser.
   * @param {Number} tileSize check if the tileSize is supported
   * @returns {Boolean} Whether the user's browser supports WebGL.
   */
  fabric.isWebglSupported = function(tileSize) {
    if (fabric.isLikelyNode) {
      return false;
    }
    tileSize = tileSize || fabric.WebglFilterBackend.prototype.tileSize;
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    var isSupported = false;
    // eslint-disable-next-line
    if (gl) {
      fabric.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      isSupported = fabric.maxTextureSize >= tileSize;
      var precisions = ['highp', 'mediump', 'lowp'];
      for (var i = 0; i < 3; i++){
        if (testPrecision(gl, precisions[i])){
          fabric.webGlPrecision = precisions[i];
          break;
        };
      }
    }
    this.isSupported = isSupported;
    return isSupported;
  };

  fabric.WebglFilterBackend = WebglFilterBackend;

  /**
   * WebGL filter backend.
   */
  function WebglFilterBackend(options) {
    if (options && options.tileSize) {
      this.tileSize = options.tileSize;
    }
    this.setupGLContext(this.tileSize, this.tileSize);
    this.captureGPUInfo();
  };

  WebglFilterBackend.prototype = /** @lends fabric.WebglFilterBackend.prototype */ {

    tileSize: 2048,

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
     * Setup a WebGL context suitable for filtering, and bind any needed event handlers.
     */
    setupGLContext: function(width, height) {
      this.dispose();
      this.createWebGLCanvas(width, height);
      // eslint-disable-next-line
      this.aPosition = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);
      this.chooseFastestCopyGLTo2DMethod(width, height);
    },

    /**
     * Pick a method to copy data from GL context to 2d canvas.  In some browsers using
     * putImageData is faster than drawImage for that specific operation.
     */
    chooseFastestCopyGLTo2DMethod: function(width, height) {
      var canMeasurePerf = typeof window.performance !== 'undefined', canUseImageData;
      try {
        new ImageData(1, 1);
        canUseImageData = true;
      }
      catch (e) {
        canUseImageData = false;
      }
      // eslint-disable-next-line no-undef
      var canUseArrayBuffer = typeof ArrayBuffer !== 'undefined';
      // eslint-disable-next-line no-undef
      var canUseUint8Clamped = typeof Uint8ClampedArray !== 'undefined';

      if (!(canMeasurePerf && canUseImageData && canUseArrayBuffer && canUseUint8Clamped)) {
        return;
      }

      var targetCanvas = fabric.util.createCanvasElement();
      // eslint-disable-next-line no-undef
      var imageBuffer = new ArrayBuffer(width * height * 4);
      if (fabric.forceGLPutImageData) {
        this.imageBuffer = imageBuffer;
        this.copyGLTo2D = copyGLTo2DPutImageData;
        return;
      }
      var testContext = {
        imageBuffer: imageBuffer,
        destinationWidth: width,
        destinationHeight: height,
        targetCanvas: targetCanvas
      };
      var startTime, drawImageTime, putImageDataTime;
      targetCanvas.width = width;
      targetCanvas.height = height;

      startTime = window.performance.now();
      copyGLTo2DDrawImage.call(testContext, this.gl, testContext);
      drawImageTime = window.performance.now() - startTime;

      startTime = window.performance.now();
      copyGLTo2DPutImageData.call(testContext, this.gl, testContext);
      putImageDataTime = window.performance.now() - startTime;

      if (drawImageTime > putImageDataTime) {
        this.imageBuffer = imageBuffer;
        this.copyGLTo2D = copyGLTo2DPutImageData;
      }
      else {
        this.copyGLTo2D = copyGLTo2DDrawImage;
      }
    },

    /**
     * Create a canvas element and associated WebGL context and attaches them as
     * class properties to the GLFilterBackend class.
     */
    createWebGLCanvas: function(width, height) {
      var canvas = fabric.util.createCanvasElement();
      canvas.width = width;
      canvas.height = height;
      var glOptions = {
            alpha: true,
            premultipliedAlpha: false,
            depth: false,
            stencil: false,
            antialias: false
          },
          gl = canvas.getContext('webgl', glOptions);
      if (!gl) {
        gl = canvas.getContext('experimental-webgl', glOptions);
      }
      if (!gl) {
        return;
      }
      gl.clearColor(0, 0, 0, 0);
      // this canvas can fire webglcontextlost and webglcontextrestored
      this.canvas = canvas;
      this.gl = gl;
    },

    /**
     * Attempts to apply the requested filters to the source provided, drawing the filtered output
     * to the provided target canvas.
     *
     * @param {Array} filters The filters to apply.
     * @param {HTMLImageElement|HTMLCanvasElement} source The source to be filtered.
     * @param {Number} width The width of the source input.
     * @param {Number} height The height of the source input.
     * @param {HTMLCanvasElement} targetCanvas The destination for filtered output to be drawn.
     * @param {String|undefined} cacheKey A key used to cache resources related to the source. If
     * omitted, caching will be skipped.
     */
    applyFilters: function(filters, source, width, height, targetCanvas, cacheKey) {
      var gl = this.gl;
      var cachedTexture;
      if (cacheKey) {
        cachedTexture = this.getCachedTexture(cacheKey, source);
      }
      var pipelineState = {
        originalWidth: source.width || source.originalWidth,
        originalHeight: source.height || source.originalHeight,
        sourceWidth: width,
        sourceHeight: height,
        destinationWidth: width,
        destinationHeight: height,
        context: gl,
        sourceTexture: this.createTexture(gl, width, height, !cachedTexture && source),
        targetTexture: this.createTexture(gl, width, height),
        originalTexture: cachedTexture ||
          this.createTexture(gl, width, height, !cachedTexture && source),
        passes: filters.length,
        webgl: true,
        aPosition: this.aPosition,
        programCache: this.programCache,
        pass: 0,
        filterBackend: this,
        targetCanvas: targetCanvas
      };
      var tempFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, tempFbo);
      filters.forEach(function(filter) { filter && filter.applyTo(pipelineState); });
      resizeCanvasIfNeeded(pipelineState);
      this.copyGLTo2D(gl, pipelineState);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(pipelineState.sourceTexture);
      gl.deleteTexture(pipelineState.targetTexture);
      gl.deleteFramebuffer(tempFbo);
      targetCanvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
      return pipelineState;
    },

    /**
     * Detach event listeners, remove references, and clean up caches.
     */
    dispose: function() {
      if (this.canvas) {
        this.canvas = null;
        this.gl = null;
      }
      this.clearWebGLCaches();
    },

    /**
     * Wipe out WebGL-related caches.
     */
    clearWebGLCaches: function() {
      this.programCache = {};
      this.textureCache = {};
    },

    /**
     * Create a WebGL texture object.
     *
     * Accepts specific dimensions to initialize the texture to or a source image.
     *
     * @param {WebGLRenderingContext} gl The GL context to use for creating the texture.
     * @param {Number} width The width to initialize the texture at.
     * @param {Number} height The height to initialize the texture.
     * @param {HTMLImageElement|HTMLCanvasElement} textureImageSource A source for the texture data.
     * @returns {WebGLTexture}
     */
    createTexture: function(gl, width, height, textureImageSource) {
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (textureImageSource) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImageSource);
      }
      else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      return texture;
    },

    /**
     * Can be optionally used to get a texture from the cache array
     *
     * If an existing texture is not found, a new texture is created and cached.
     *
     * @param {String} uniqueId A cache key to use to find an existing texture.
     * @param {HTMLImageElement|HTMLCanvasElement} textureImageSource A source to use to create the
     * texture cache entry if one does not already exist.
     */
    getCachedTexture: function(uniqueId, textureImageSource) {
      if (this.textureCache[uniqueId]) {
        return this.textureCache[uniqueId];
      }
      else {
        var texture = this.createTexture(
          this.gl, textureImageSource.width, textureImageSource.height, textureImageSource);
        this.textureCache[uniqueId] = texture;
        return texture;
      }
    },

    /**
     * Clear out cached resources related to a source image that has been
     * filtered previously.
     *
     * @param {String} cacheKey The cache key provided when the source image was filtered.
     */
    evictCachesForKey: function(cacheKey) {
      if (this.textureCache[cacheKey]) {
        this.gl.deleteTexture(this.textureCache[cacheKey]);
        delete this.textureCache[cacheKey];
      }
    },

    copyGLTo2D: copyGLTo2DDrawImage,

    /**
     * Attempt to extract GPU information strings from a WebGL context.
     *
     * Useful information when debugging or blacklisting specific GPUs.
     *
     * @returns {Object} A GPU info object with renderer and vendor strings.
     */
    captureGPUInfo: function() {
      if (this.gpuInfo) {
        return this.gpuInfo;
      }
      var gl = this.gl, gpuInfo = { renderer: '', vendor: '' };
      if (!gl) {
        return gpuInfo;
      }
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        var renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        var vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
        if (renderer) {
          gpuInfo.renderer = renderer.toLowerCase();
        }
        if (vendor) {
          gpuInfo.vendor = vendor.toLowerCase();
        }
      }
      this.gpuInfo = gpuInfo;
      return gpuInfo;
    },
  };
})();

function resizeCanvasIfNeeded(pipelineState) {
  var targetCanvas = pipelineState.targetCanvas,
      width = targetCanvas.width, height = targetCanvas.height,
      dWidth = pipelineState.destinationWidth,
      dHeight = pipelineState.destinationHeight;

  if (width !== dWidth || height !== dHeight) {
    targetCanvas.width = dWidth;
    targetCanvas.height = dHeight;
  }
}

/**
 * Copy an input WebGL canvas on to an output 2D canvas.
 *
 * The WebGL canvas is assumed to be upside down, with the top-left pixel of the
 * desired output image appearing in the bottom-left corner of the WebGL canvas.
 *
 * @param {WebGLRenderingContext} sourceContext The WebGL context to copy from.
 * @param {HTMLCanvasElement} targetCanvas The 2D target canvas to copy on to.
 * @param {Object} pipelineState The 2D target canvas to copy on to.
 */
function copyGLTo2DDrawImage(gl, pipelineState) {
  var glCanvas = gl.canvas, targetCanvas = pipelineState.targetCanvas,
      ctx = targetCanvas.getContext('2d');
  ctx.translate(0, targetCanvas.height); // move it down again
  ctx.scale(1, -1); // vertical flip
  // where is my image on the big glcanvas?
  var sourceY = glCanvas.height - targetCanvas.height;
  ctx.drawImage(glCanvas, 0, sourceY, targetCanvas.width, targetCanvas.height, 0, 0,
    targetCanvas.width, targetCanvas.height);
}

/**
 * Copy an input WebGL canvas on to an output 2D canvas using 2d canvas' putImageData
 * API. Measurably faster than using ctx.drawImage in Firefox (version 54 on OSX Sierra).
 *
 * @param {WebGLRenderingContext} sourceContext The WebGL context to copy from.
 * @param {HTMLCanvasElement} targetCanvas The 2D target canvas to copy on to.
 * @param {Object} pipelineState The 2D target canvas to copy on to.
 */
function copyGLTo2DPutImageData(gl, pipelineState) {
  var targetCanvas = pipelineState.targetCanvas, ctx = targetCanvas.getContext('2d'),
      dWidth = pipelineState.destinationWidth,
      dHeight = pipelineState.destinationHeight,
      numBytes = dWidth * dHeight * 4;

  // eslint-disable-next-line no-undef
  var u8 = new Uint8Array(this.imageBuffer, 0, numBytes);
  // eslint-disable-next-line no-undef
  var u8Clamped = new Uint8ClampedArray(this.imageBuffer, 0, numBytes);

  gl.readPixels(0, 0, dWidth, dHeight, gl.RGBA, gl.UNSIGNED_BYTE, u8);
  var imgData = new ImageData(u8Clamped, dWidth, dHeight);
  ctx.putImageData(imgData, 0, 0);
}
