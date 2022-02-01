(function () {

  'use strict';

  if (fabric.StaticCanvas) {
    fabric.warn('fabric.StaticCanvas is already defined.');
    return;
  }

  // aliases for faster resolution
  var extend = fabric.util.object.extend,
      getElementOffset = fabric.util.getElementOffset,
      removeFromArray = fabric.util.removeFromArray,
      toFixed = fabric.util.toFixed,
      transformPoint = fabric.util.transformPoint,
      invertTransform = fabric.util.invertTransform,
      getNodeCanvas = fabric.util.getNodeCanvas,
      createCanvasElement = fabric.util.createCanvasElement,

      CANVAS_INIT_ERROR = new Error('Could not initialize `canvas` element');

  /**
   * Static canvas class
   * @class fabric.StaticCanvas
   * @mixes fabric.Collection
   * @mixes fabric.Observable
   * @see {@link http://fabricjs.com/static_canvas|StaticCanvas demo}
   * @see {@link fabric.StaticCanvas#initialize} for constructor definition
   * @fires before:render
   * @fires after:render
   * @fires canvas:cleared
   * @fires object:added
   * @fires object:removed
   */
  fabric.StaticCanvas = fabric.util.createClass(fabric.CommonMethods, /** @lends fabric.StaticCanvas.prototype */ {

    /**
     * Constructor
     * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(el, options) {
      options || (options = { });
      this.renderAndResetBound = this.renderAndReset.bind(this);
      this.requestRenderAllBound = this.requestRenderAll.bind(this);
      this._initStatic(el, options);
    },

    /**
     * Background color of canvas instance.
     * Should be set via {@link fabric.StaticCanvas#setBackgroundColor}.
     * @type {(String|fabric.Pattern)}
     * @default
     */
    backgroundColor: '',

    /**
     * Background image of canvas instance.
     * since 2.4.0 image caching is active, please when putting an image as background, add to the
     * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
     * vale. As an alternative you can disable image objectCaching
     * @type fabric.Image
     * @default
     */
    backgroundImage: null,

    /**
     * Overlay color of canvas instance.
     * Should be set via {@link fabric.StaticCanvas#setOverlayColor}
     * @since 1.3.9
     * @type {(String|fabric.Pattern)}
     * @default
     */
    overlayColor: '',

    /**
     * Overlay image of canvas instance.
     * since 2.4.0 image caching is active, please when putting an image as overlay, add to the
     * canvas property a reference to the canvas it is on. Otherwise the image cannot detect the zoom
     * vale. As an alternative you can disable image objectCaching
     * @type fabric.Image
     * @default
     */
    overlayImage: null,

    /**
     * Indicates whether toObject/toDatalessObject should include default values
     * if set to false, takes precedence over the object value.
     * @type Boolean
     * @default
     */
    includeDefaultValues: true,

    /**
     * Indicates whether objects' state should be saved
     * @type Boolean
     * @default
     */
    stateful: false,

    /**
     * Indicates whether {@link fabric.Collection.add}, {@link fabric.Collection.insertAt} and {@link fabric.Collection.remove},
     * {@link fabric.StaticCanvas.moveTo}, {@link fabric.StaticCanvas.clear} and many more, should also re-render canvas.
     * Disabling this option will not give a performance boost when adding/removing a lot of objects to/from canvas at once
     * since the renders are quequed and executed one per frame.
     * Disabling is suggested anyway and managing the renders of the app manually is not a big effort ( canvas.requestRenderAll() )
     * Left default to true to do not break documentation and old app, fiddles.
     * @type Boolean
     * @default
     */
    renderOnAddRemove: true,

    /**
     * Indicates whether object controls (borders/controls) are rendered above overlay image
     * @type Boolean
     * @default
     */
    controlsAboveOverlay: false,

    /**
     * Indicates whether the browser can be scrolled when using a touchscreen and dragging on the canvas
     * @type Boolean
     * @default
     */
    allowTouchScrolling: false,

    /**
     * Indicates whether this canvas will use image smoothing, this is on by default in browsers
     * @type Boolean
     * @default
     */
    imageSmoothingEnabled: true,

    /**
     * The transformation (in the format of Canvas transform) which focuses the viewport
     * @type Array
     * @default
     */
    viewportTransform: fabric.iMatrix.concat(),

    /**
     * if set to false background image is not affected by viewport transform
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    backgroundVpt: true,

    /**
     * if set to false overlya image is not affected by viewport transform
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    overlayVpt: true,

    /**
     * When true, canvas is scaled by devicePixelRatio for better rendering on retina screens
     * @type Boolean
     * @default
     */
    enableRetinaScaling: true,

    /**
     * Describe canvas element extension over design
     * properties are tl,tr,bl,br.
     * if canvas is not zoomed/panned those points are the four corner of canvas
     * if canvas is viewportTransformed you those points indicate the extension
     * of canvas element in plain untrasformed coordinates
     * The coordinates get updated with @method calcViewportBoundaries.
     * @memberOf fabric.StaticCanvas.prototype
     */
    vptCoords: { },

    /**
     * Based on vptCoords and object.aCoords, skip rendering of objects that
     * are not included in current viewport.
     * May greatly help in applications with crowded canvas and use of zoom/pan
     * If One of the corner of the bounding box of the object is on the canvas
     * the objects get rendered.
     * @memberOf fabric.StaticCanvas.prototype
     * @type Boolean
     * @default
     */
    skipOffscreen: true,

    /**
     * a fabricObject that, without stroke define a clipping area with their shape. filled in black
     * the clipPath object gets used when the canvas has rendered, and the context is placed in the
     * top left corner of the canvas.
     * clipPath will clip away controls, if you do not want this to happen use controlsAboveOverlay = true
     * @type fabric.Object
     */
    clipPath: undefined,

    /**
     * @private
     * @param {HTMLElement | String} el &lt;canvas> element to initialize instance on
     * @param {Object} [options] Options object
     */
    _initStatic: function(el, options) {
      var cb = this.requestRenderAllBound;
      this._objects = [];
      this._createLowerCanvas(el);
      this._initOptions(options);
      // only initialize retina scaling once
      if (!this.interactive) {
        this._initRetinaScaling();
      }

      if (options.overlayImage) {
        this.setOverlayImage(options.overlayImage, cb);
      }
      if (options.backgroundImage) {
        this.setBackgroundImage(options.backgroundImage, cb);
      }
      if (options.backgroundColor) {
        this.setBackgroundColor(options.backgroundColor, cb);
      }
      if (options.overlayColor) {
        this.setOverlayColor(options.overlayColor, cb);
      }
      this.calcOffset();
    },

    /**
     * @private
     */
    _isRetinaScaling: function() {
      return (fabric.devicePixelRatio !== 1 && this.enableRetinaScaling);
    },

    /**
     * @private
     * @return {Number} retinaScaling if applied, otherwise 1;
     */
    getRetinaScaling: function() {
      return this._isRetinaScaling() ? fabric.devicePixelRatio : 1;
    },

    /**
     * @private
     */
    _initRetinaScaling: function() {
      if (!this._isRetinaScaling()) {
        return;
      }
      var scaleRatio = fabric.devicePixelRatio;
      this.__initRetinaScaling(scaleRatio, this.lowerCanvasEl, this.contextContainer);
      if (this.upperCanvasEl) {
        this.__initRetinaScaling(scaleRatio, this.upperCanvasEl, this.contextTop);
      }
    },

    __initRetinaScaling: function(scaleRatio, canvas, context) {
      canvas.setAttribute('width', this.width * scaleRatio);
      canvas.setAttribute('height', this.height * scaleRatio);
      context.scale(scaleRatio, scaleRatio);
    },


    /**
     * Calculates canvas element offset relative to the document
     * This method is also attached as "resize" event handler of window
     * @return {fabric.Canvas} instance
     * @chainable
     */
    calcOffset: function () {
      this._offset = getElementOffset(this.lowerCanvasEl);
      return this;
    },

    /**
     * Sets {@link fabric.StaticCanvas#overlayImage|overlay image} for this canvas
     * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set overlay to
     * @param {Function} callback callback to invoke when image is loaded and set as an overlay
     * @param {Object} [options] Optional options to set for the {@link fabric.Image|overlay image}.
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/fabricjs/MnzHT/|jsFiddle demo}
     * @example <caption>Normal overlayImage with left/top = 0</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   // Needed to position overlayImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>overlayImage with different properties</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>Stretched overlayImage #1 - width/height correspond to canvas width/height</caption>
     * fabric.Image.fromURL('http://fabricjs.com/assets/jail_cell_bars.png', function(img, isError) {
     *    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
     *    canvas.setOverlayImage(img, canvas.renderAll.bind(canvas));
     * });
     * @example <caption>Stretched overlayImage #2 - width/height correspond to canvas width/height</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   width: canvas.width,
     *   height: canvas.height,
     *   // Needed to position overlayImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>overlayImage loaded from cross-origin</caption>
     * canvas.setOverlayImage('http://fabricjs.com/assets/jail_cell_bars.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top',
     *   crossOrigin: 'anonymous'
     * });
     */
    setOverlayImage: function (image, callback, options) {
      return this.__setBgOverlayImage('overlayImage', image, callback, options);
    },

    /**
     * Sets {@link fabric.StaticCanvas#backgroundImage|background image} for this canvas
     * @param {(fabric.Image|String)} image fabric.Image instance or URL of an image to set background to
     * @param {Function} callback Callback to invoke when image is loaded and set as background
     * @param {Object} [options] Optional options to set for the {@link fabric.Image|background image}.
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/djnr8o7a/28/|jsFiddle demo}
     * @example <caption>Normal backgroundImage with left/top = 0</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   // Needed to position backgroundImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>backgroundImage with different properties</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>Stretched backgroundImage #1 - width/height correspond to canvas width/height</caption>
     * fabric.Image.fromURL('http://fabricjs.com/assets/honey_im_subtle.png', function(img, isError) {
     *    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
     *    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
     * });
     * @example <caption>Stretched backgroundImage #2 - width/height correspond to canvas width/height</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   width: canvas.width,
     *   height: canvas.height,
     *   // Needed to position backgroundImage at 0/0
     *   originX: 'left',
     *   originY: 'top'
     * });
     * @example <caption>backgroundImage loaded from cross-origin</caption>
     * canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
     *   opacity: 0.5,
     *   angle: 45,
     *   left: 400,
     *   top: 400,
     *   originX: 'left',
     *   originY: 'top',
     *   crossOrigin: 'anonymous'
     * });
     */
    // TODO: fix stretched examples
    setBackgroundImage: function (image, callback, options) {
      return this.__setBgOverlayImage('backgroundImage', image, callback, options);
    },

    /**
     * Sets {@link fabric.StaticCanvas#overlayColor|foreground color} for this canvas
     * @param {(String|fabric.Pattern)} overlayColor Color or pattern to set foreground color to
     * @param {Function} callback Callback to invoke when foreground color is set
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/fabricjs/pB55h/|jsFiddle demo}
     * @example <caption>Normal overlayColor - color value</caption>
     * canvas.setOverlayColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as overlayColor</caption>
     * canvas.setOverlayColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png'
     * }, canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as overlayColor with repeat and offset</caption>
     * canvas.setOverlayColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
     *   repeat: 'repeat',
     *   offsetX: 200,
     *   offsetY: 100
     * }, canvas.renderAll.bind(canvas));
     */
    setOverlayColor: function(overlayColor, callback) {
      return this.__setBgOverlayColor('overlayColor', overlayColor, callback);
    },

    /**
     * Sets {@link fabric.StaticCanvas#backgroundColor|background color} for this canvas
     * @param {(String|fabric.Pattern)} backgroundColor Color or pattern to set background color to
     * @param {Function} callback Callback to invoke when background color is set
     * @return {fabric.Canvas} thisArg
     * @chainable
     * @see {@link http://jsfiddle.net/fabricjs/hXzvk/|jsFiddle demo}
     * @example <caption>Normal backgroundColor - color value</caption>
     * canvas.setBackgroundColor('rgba(255, 73, 64, 0.6)', canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as backgroundColor</caption>
     * canvas.setBackgroundColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png'
     * }, canvas.renderAll.bind(canvas));
     * @example <caption>fabric.Pattern used as backgroundColor with repeat and offset</caption>
     * canvas.setBackgroundColor({
     *   source: 'http://fabricjs.com/assets/escheresque_ste.png',
     *   repeat: 'repeat',
     *   offsetX: 200,
     *   offsetY: 100
     * }, canvas.renderAll.bind(canvas));
     */
    setBackgroundColor: function(backgroundColor, callback) {
      return this.__setBgOverlayColor('backgroundColor', backgroundColor, callback);
    },

    /**
     * @private
     * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundImage|backgroundImage}
     * or {@link fabric.StaticCanvas#overlayImage|overlayImage})
     * @param {(fabric.Image|String|null)} image fabric.Image instance, URL of an image or null to set background or overlay to
     * @param {Function} callback Callback to invoke when image is loaded and set as background or overlay. The first argument is the created image, the second argument is a flag indicating whether an error occurred or not.
     * @param {Object} [options] Optional options to set for the {@link fabric.Image|image}.
     */
    __setBgOverlayImage: function(property, image, callback, options) {
      if (typeof image === 'string') {
        fabric.util.loadImage(image, function(img, isError) {
          if (img) {
            var instance = new fabric.Image(img, options);
            this[property] = instance;
            instance.canvas = this;
          }
          callback && callback(img, isError);
        }, this, options && options.crossOrigin);
      }
      else {
        options && image.setOptions(options);
        this[property] = image;
        image && (image.canvas = this);
        callback && callback(image, false);
      }

      return this;
    },

    /**
     * @private
     * @param {String} property Property to set ({@link fabric.StaticCanvas#backgroundColor|backgroundColor}
     * or {@link fabric.StaticCanvas#overlayColor|overlayColor})
     * @param {(Object|String|null)} color Object with pattern information, color value or null
     * @param {Function} [callback] Callback is invoked when color is set
     */
    __setBgOverlayColor: function(property, color, callback) {
      this[property] = color;
      this._initGradient(color, property);
      this._initPattern(color, property, callback);
      return this;
    },

    /**
     * @private
     */
    _createCanvasElement: function() {
      var element = createCanvasElement();
      if (!element) {
        throw CANVAS_INIT_ERROR;
      }
      if (!element.style) {
        element.style = { };
      }
      if (typeof element.getContext === 'undefined') {
        throw CANVAS_INIT_ERROR;
      }
      return element;
    },

    /**
     * @private
     * @param {Object} [options] Options object
     */
    _initOptions: function (options) {
      var lowerCanvasEl = this.lowerCanvasEl;
      this._setOptions(options);

      this.width = this.width || parseInt(lowerCanvasEl.width, 10) || 0;
      this.height = this.height || parseInt(lowerCanvasEl.height, 10) || 0;

      if (!this.lowerCanvasEl.style) {
        return;
      }

      lowerCanvasEl.width = this.width;
      lowerCanvasEl.height = this.height;

      lowerCanvasEl.style.width = this.width + 'px';
      lowerCanvasEl.style.height = this.height + 'px';

      this.viewportTransform = this.viewportTransform.slice();
    },

    /**
     * Creates a bottom canvas
     * @private
     * @param {HTMLElement} [canvasEl]
     */
    _createLowerCanvas: function (canvasEl) {
      // canvasEl === 'HTMLCanvasElement' does not work on jsdom/node
      if (canvasEl && canvasEl.getContext) {
        this.lowerCanvasEl = canvasEl;
      }
      else {
        this.lowerCanvasEl = fabric.util.getById(canvasEl) || this._createCanvasElement();
      }

      fabric.util.addClass(this.lowerCanvasEl, 'lower-canvas');
      this._originalCanvasStyle = this.lowerCanvasEl.style;
      if (this.interactive) {
        this._applyCanvasStyle(this.lowerCanvasEl);
      }

      this.contextContainer = this.lowerCanvasEl.getContext('2d');
    },

    /**
     * Returns canvas width (in px)
     * @return {Number}
     */
    getWidth: function () {
      return this.width;
    },

    /**
     * Returns canvas height (in px)
     * @return {Number}
     */
    getHeight: function () {
      return this.height;
    },

    /**
     * Sets width of this canvas instance
     * @param {Number|String} value                         Value to set width to
     * @param {Object}        [options]                     Options object
     * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
     * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setWidth: function (value, options) {
      return this.setDimensions({ width: value }, options);
    },

    /**
     * Sets height of this canvas instance
     * @param {Number|String} value                         Value to set height to
     * @param {Object}        [options]                     Options object
     * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
     * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setHeight: function (value, options) {
      return this.setDimensions({ height: value }, options);
    },

    /**
     * Sets dimensions (width, height) of this canvas instance. when options.cssOnly flag active you should also supply the unit of measure (px/%/em)
     * @param {Object}        dimensions                    Object with width/height properties
     * @param {Number|String} [dimensions.width]            Width of canvas element
     * @param {Number|String} [dimensions.height]           Height of canvas element
     * @param {Object}        [options]                     Options object
     * @param {Boolean}       [options.backstoreOnly=false] Set the given dimensions only as canvas backstore dimensions
     * @param {Boolean}       [options.cssOnly=false]       Set the given dimensions only as css dimensions
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    setDimensions: function (dimensions, options) {
      var cssValue;

      options = options || {};

      for (var prop in dimensions) {
        cssValue = dimensions[prop];

        if (!options.cssOnly) {
          this._setBackstoreDimension(prop, dimensions[prop]);
          cssValue += 'px';
          this.hasLostContext = true;
        }

        if (!options.backstoreOnly) {
          this._setCssDimension(prop, cssValue);
        }
      }
      if (this._isCurrentlyDrawing) {
        this.freeDrawingBrush && this.freeDrawingBrush._setBrushStyles();
      }
      this._initRetinaScaling();
      this.calcOffset();

      if (!options.cssOnly) {
        this.requestRenderAll();
      }

      return this;
    },

    /**
     * Helper for setting width/height
     * @private
     * @param {String} prop property (width|height)
     * @param {Number} value value to set property to
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    _setBackstoreDimension: function (prop, value) {
      this.lowerCanvasEl[prop] = value;

      if (this.upperCanvasEl) {
        this.upperCanvasEl[prop] = value;
      }

      if (this.cacheCanvasEl) {
        this.cacheCanvasEl[prop] = value;
      }

      this[prop] = value;

      return this;
    },

    /**
     * Helper for setting css width/height
     * @private
     * @param {String} prop property (width|height)
     * @param {String} value value to set property to
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    _setCssDimension: function (prop, value) {
      this.lowerCanvasEl.style[prop] = value;

      if (this.upperCanvasEl) {
        this.upperCanvasEl.style[prop] = value;
      }

      if (this.wrapperEl) {
        this.wrapperEl.style[prop] = value;
      }

      return this;
    },

    /**
     * Returns canvas zoom level
     * @return {Number}
     */
    getZoom: function () {
      return this.viewportTransform[0];
    },

    /**
     * Sets viewport transform of this canvas instance
     * @param {Array} vpt the transform in the form of context.transform
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setViewportTransform: function (vpt) {
      var activeObject = this._activeObject,
          backgroundObject = this.backgroundImage,
          overlayObject = this.overlayImage,
          object, i, len;
      this.viewportTransform = vpt;
      for (i = 0, len = this._objects.length; i < len; i++) {
        object = this._objects[i];
        object.group || object.setCoords(true);
      }
      if (activeObject) {
        activeObject.setCoords();
      }
      if (backgroundObject) {
        backgroundObject.setCoords(true);
      }
      if (overlayObject) {
        overlayObject.setCoords(true);
      }
      this.calcViewportBoundaries();
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Sets zoom level of this canvas instance, the zoom centered around point
     * meaning that following zoom to point with the same point will have the visual
     * effect of the zoom originating from that point. The point won't move.
     * It has nothing to do with canvas center or visual center of the viewport.
     * @param {fabric.Point} point to zoom with respect to
     * @param {Number} value to set zoom to, less than 1 zooms out
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    zoomToPoint: function (point, value) {
      // TODO: just change the scale, preserve other transformations
      var before = point, vpt = this.viewportTransform.slice(0);
      point = transformPoint(point, invertTransform(this.viewportTransform));
      vpt[0] = value;
      vpt[3] = value;
      var after = transformPoint(point, vpt);
      vpt[4] += before.x - after.x;
      vpt[5] += before.y - after.y;
      return this.setViewportTransform(vpt);
    },

    /**
     * Sets zoom level of this canvas instance
     * @param {Number} value to set zoom to, less than 1 zooms out
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    setZoom: function (value) {
      this.zoomToPoint(new fabric.Point(0, 0), value);
      return this;
    },

    /**
     * Pan viewport so as to place point at top left corner of canvas
     * @param {fabric.Point} point to move to
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    absolutePan: function (point) {
      var vpt = this.viewportTransform.slice(0);
      vpt[4] = -point.x;
      vpt[5] = -point.y;
      return this.setViewportTransform(vpt);
    },

    /**
     * Pans viewpoint relatively
     * @param {fabric.Point} point (position vector) to move by
     * @return {fabric.Canvas} instance
     * @chainable true
     */
    relativePan: function (point) {
      return this.absolutePan(new fabric.Point(
        -point.x - this.viewportTransform[4],
        -point.y - this.viewportTransform[5]
      ));
    },

    /**
     * Returns &lt;canvas> element corresponding to this instance
     * @return {HTMLCanvasElement}
     */
    getElement: function () {
      return this.lowerCanvasEl;
    },

    /**
     * @private
     * @param {fabric.Object} obj Object that was added
     */
    _onObjectAdded: function(obj) {
      this.stateful && obj.setupState();
      obj._set('canvas', this);
      obj.setCoords();
      this.fire('object:added', { target: obj });
      obj.fire('added');
    },

    /**
     * @private
     * @param {fabric.Object} obj Object that was removed
     */
    _onObjectRemoved: function(obj) {
      this.fire('object:removed', { target: obj });
      obj.fire('removed');
      delete obj.canvas;
    },

    /**
     * Clears specified context of canvas element
     * @param {CanvasRenderingContext2D} ctx Context to clear
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    clearContext: function(ctx) {
      ctx.clearRect(0, 0, this.width, this.height);
      return this;
    },

    /**
     * Returns context of canvas where objects are drawn
     * @return {CanvasRenderingContext2D}
     */
    getContext: function () {
      return this.contextContainer;
    },

    /**
     * Clears all contexts (background, main, top) of an instance
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    clear: function () {
      this.remove.apply(this, this.getObjects());
      this.backgroundImage = null;
      this.overlayImage = null;
      this.backgroundColor = '';
      this.overlayColor = '';
      if (this._hasITextHandlers) {
        this.off('mouse:up', this._mouseUpITextHandler);
        this._iTextInstances = null;
        this._hasITextHandlers = false;
      }
      this.clearContext(this.contextContainer);
      this.fire('canvas:cleared');
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Renders the canvas
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderAll: function () {
      var canvasToDrawOn = this.contextContainer;
      this.renderCanvas(canvasToDrawOn, this._objects);
      return this;
    },

    /**
     * Function created to be instance bound at initialization
     * used in requestAnimationFrame rendering
     * Let the fabricJS call it. If you call it manually you could have more
     * animationFrame stacking on to of each other
     * for an imperative rendering, use canvas.renderAll
     * @private
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderAndReset: function() {
      this.isRendering = 0;
      this.renderAll();
    },

    /**
     * Append a renderAll request to next animation frame.
     * unless one is already in progress, in that case nothing is done
     * a boolean flag will avoid appending more.
     * @return {fabric.Canvas} instance
     * @chainable
     */
    requestRenderAll: function () {
      if (!this.isRendering) {
        this.isRendering = fabric.util.requestAnimFrame(this.renderAndResetBound);
      }
      return this;
    },

    /**
     * Calculate the position of the 4 corner of canvas with current viewportTransform.
     * helps to determinate when an object is in the current rendering viewport using
     * object absolute coordinates ( aCoords )
     * @return {Object} points.tl
     * @chainable
     */
    calcViewportBoundaries: function() {
      var points = { }, width = this.width, height = this.height,
          iVpt = invertTransform(this.viewportTransform);
      points.tl = transformPoint({ x: 0, y: 0 }, iVpt);
      points.br = transformPoint({ x: width, y: height }, iVpt);
      points.tr = new fabric.Point(points.br.x, points.tl.y);
      points.bl = new fabric.Point(points.tl.x, points.br.y);
      this.vptCoords = points;
      return points;
    },

    cancelRequestedRender: function() {
      if (this.isRendering) {
        fabric.util.cancelAnimFrame(this.isRendering);
        this.isRendering = 0;
      }
    },

    /**
     * Renders background, objects, overlay and controls.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array} objects to render
     * @return {fabric.Canvas} instance
     * @chainable
     */
    renderCanvas: function(ctx, objects) {
      var v = this.viewportTransform, path = this.clipPath;
      this.cancelRequestedRender();
      this.calcViewportBoundaries();
      this.clearContext(ctx);
      fabric.util.setImageSmoothing(ctx, this.imageSmoothingEnabled);
      this.fire('before:render', { ctx: ctx, });
      this._renderBackground(ctx);

      ctx.save();
      //apply viewport transform once for all rendering process
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      this._renderObjects(ctx, objects);
      ctx.restore();
      if (!this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
      }
      if (path) {
        path.canvas = this;
        // needed to setup a couple of variables
        path.shouldCache();
        path._transformDone = true;
        path.renderCache({ forClipping: true });
        this.drawClipPathOnCanvas(ctx);
      }
      this._renderOverlay(ctx);
      if (this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
      }
      this.fire('after:render', { ctx: ctx, });
    },

    /**
     * Paint the cached clipPath on the lowerCanvasEl
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawClipPathOnCanvas: function(ctx) {
      var v = this.viewportTransform, path = this.clipPath;
      ctx.save();
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      // DEBUG: uncomment this line, comment the following
      // ctx.globalAlpha = 0.4;
      ctx.globalCompositeOperation = 'destination-in';
      path.transform(ctx);
      ctx.scale(1 / path.zoomX, 1 / path.zoomY);
      ctx.drawImage(path._cacheCanvas, -path.cacheTranslationX, -path.cacheTranslationY);
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Array} objects to render
     */
    _renderObjects: function(ctx, objects) {
      var i, len;
      for (i = 0, len = objects.length; i < len; ++i) {
        objects[i] && objects[i].render(ctx);
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {string} property 'background' or 'overlay'
     */
    _renderBackgroundOrOverlay: function(ctx, property) {
      var fill = this[property + 'Color'], object = this[property + 'Image'],
          v = this.viewportTransform, needsVpt = this[property + 'Vpt'];
      if (!fill && !object) {
        return;
      }
      if (fill) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.width, 0);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fillStyle = fill.toLive
          ? fill.toLive(ctx, this)
          : fill;
        if (needsVpt) {
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        }
        ctx.transform(1, 0, 0, 1, fill.offsetX || 0, fill.offsetY || 0);
        var m = fill.gradientTransform || fill.patternTransform;
        m && ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        ctx.fill();
        ctx.restore();
      }
      if (object) {
        ctx.save();
        if (needsVpt) {
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        }
        object.render(ctx);
        ctx.restore();
      }
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderBackground: function(ctx) {
      this._renderBackgroundOrOverlay(ctx, 'background');
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderOverlay: function(ctx) {
      this._renderBackgroundOrOverlay(ctx, 'overlay');
    },

    /**
     * Returns coordinates of a center of canvas.
     * Returned value is an object with top and left properties
     * @return {Object} object with "top" and "left" number values
     */
    getCenter: function () {
      return {
        top: this.height / 2,
        left: this.width / 2
      };
    },

    /**
     * Centers object horizontally in the canvas
     * @param {fabric.Object} object Object to center horizontally
     * @return {fabric.Canvas} thisArg
     */
    centerObjectH: function (object) {
      return this._centerObject(object, new fabric.Point(this.getCenter().left, object.getCenterPoint().y));
    },

    /**
     * Centers object vertically in the canvas
     * @param {fabric.Object} object Object to center vertically
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    centerObjectV: function (object) {
      return this._centerObject(object, new fabric.Point(object.getCenterPoint().x, this.getCenter().top));
    },

    /**
     * Centers object vertically and horizontally in the canvas
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    centerObject: function(object) {
      var center = this.getCenter();

      return this._centerObject(object, new fabric.Point(center.left, center.top));
    },

    /**
     * Centers object vertically and horizontally in the viewport
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    viewportCenterObject: function(object) {
      var vpCenter = this.getVpCenter();

      return this._centerObject(object, vpCenter);
    },

    /**
     * Centers object horizontally in the viewport, object.top is unchanged
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    viewportCenterObjectH: function(object) {
      var vpCenter = this.getVpCenter();
      this._centerObject(object, new fabric.Point(vpCenter.x, object.getCenterPoint().y));
      return this;
    },

    /**
     * Centers object Vertically in the viewport, object.top is unchanged
     * @param {fabric.Object} object Object to center vertically and horizontally
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    viewportCenterObjectV: function(object) {
      var vpCenter = this.getVpCenter();

      return this._centerObject(object, new fabric.Point(object.getCenterPoint().x, vpCenter.y));
    },

    /**
     * Calculate the point in canvas that correspond to the center of actual viewport.
     * @return {fabric.Point} vpCenter, viewport center
     * @chainable
     */
    getVpCenter: function() {
      var center = this.getCenter(),
          iVpt = invertTransform(this.viewportTransform);
      return transformPoint({ x: center.left, y: center.top }, iVpt);
    },

    /**
     * @private
     * @param {fabric.Object} object Object to center
     * @param {fabric.Point} center Center point
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    _centerObject: function(object, center) {
      object.setPositionByOrigin(center, 'center', 'center');
      object.setCoords();
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Returns dataless JSON representation of canvas
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {String} json string
     */
    toDatalessJSON: function (propertiesToInclude) {
      return this.toDatalessObject(propertiesToInclude);
    },

    /**
     * Returns object representation of canvas
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function (propertiesToInclude) {
      return this._toObjectMethod('toObject', propertiesToInclude);
    },

    /**
     * Returns dataless object representation of canvas
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toDatalessObject: function (propertiesToInclude) {
      return this._toObjectMethod('toDatalessObject', propertiesToInclude);
    },

    /**
     * @private
     */
    _toObjectMethod: function (methodName, propertiesToInclude) {

      var clipPath = this.clipPath, data = {
        version: fabric.version,
        objects: this._toObjects(methodName, propertiesToInclude),
      };
      if (clipPath && !clipPath.excludeFromExport) {
        data.clipPath = this._toObject(this.clipPath, methodName, propertiesToInclude);
      }
      extend(data, this.__serializeBgOverlay(methodName, propertiesToInclude));

      fabric.util.populateWithProperties(this, data, propertiesToInclude);

      return data;
    },

    /**
     * @private
     */
    _toObjects: function(methodName, propertiesToInclude) {
      return this._objects.filter(function(object) {
        return !object.excludeFromExport;
      }).map(function(instance) {
        return this._toObject(instance, methodName, propertiesToInclude);
      }, this);
    },

    /**
     * @private
     */
    _toObject: function(instance, methodName, propertiesToInclude) {
      var originalValue;

      if (!this.includeDefaultValues) {
        originalValue = instance.includeDefaultValues;
        instance.includeDefaultValues = false;
      }

      var object = instance[methodName](propertiesToInclude);
      if (!this.includeDefaultValues) {
        instance.includeDefaultValues = originalValue;
      }
      return object;
    },

    /**
     * @private
     */
    __serializeBgOverlay: function(methodName, propertiesToInclude) {
      var data = {}, bgImage = this.backgroundImage, overlayImage = this.overlayImage,
          bgColor = this.backgroundColor, overlayColor = this.overlayColor;

      if (bgColor && bgColor.toObject) {
        if (!bgColor.excludeFromExport) {
          data.background = bgColor.toObject(propertiesToInclude);
        }
      }
      else if (bgColor) {
        data.background = bgColor;
      }

      if (overlayColor && overlayColor.toObject) {
        if (!overlayColor.excludeFromExport) {
          data.overlay = overlayColor.toObject(propertiesToInclude);
        }
      }
      else if (overlayColor) {
        data.overlay = overlayColor;
      }

      if (bgImage && !bgImage.excludeFromExport) {
        data.backgroundImage = this._toObject(bgImage, methodName, propertiesToInclude);
      }
      if (overlayImage && !overlayImage.excludeFromExport) {
        data.overlayImage = this._toObject(overlayImage, methodName, propertiesToInclude);
      }

      return data;
    },

    /* _TO_SVG_START_ */
    /**
     * When true, getSvgTransform() will apply the StaticCanvas.viewportTransform to the SVG transformation. When true,
     * a zoomed canvas will then produce zoomed SVG output.
     * @type Boolean
     * @default
     */
    svgViewportTransformation: true,

    /**
     * Returns SVG representation of canvas
     * @function
     * @param {Object} [options] Options object for SVG output
     * @param {Boolean} [options.suppressPreamble=false] If true xml tag is not included
     * @param {Object} [options.viewBox] SVG viewbox object
     * @param {Number} [options.viewBox.x] x-coordinate of viewbox
     * @param {Number} [options.viewBox.y] y-coordinate of viewbox
     * @param {Number} [options.viewBox.width] Width of viewbox
     * @param {Number} [options.viewBox.height] Height of viewbox
     * @param {String} [options.encoding=UTF-8] Encoding of SVG output
     * @param {String} [options.width] desired width of svg with or without units
     * @param {String} [options.height] desired height of svg with or without units
     * @param {Function} [reviver] Method for further parsing of svg elements, called after each fabric object converted into svg representation.
     * @return {String} SVG string
     * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#serialization}
     * @see {@link http://jsfiddle.net/fabricjs/jQ3ZZ/|jsFiddle demo}
     * @example <caption>Normal SVG output</caption>
     * var svg = canvas.toSVG();
     * @example <caption>SVG output without preamble (without &lt;?xml ../>)</caption>
     * var svg = canvas.toSVG({suppressPreamble: true});
     * @example <caption>SVG output with viewBox attribute</caption>
     * var svg = canvas.toSVG({
     *   viewBox: {
     *     x: 100,
     *     y: 100,
     *     width: 200,
     *     height: 300
     *   }
     * });
     * @example <caption>SVG output with different encoding (default: UTF-8)</caption>
     * var svg = canvas.toSVG({encoding: 'ISO-8859-1'});
     * @example <caption>Modify SVG output with reviver function</caption>
     * var svg = canvas.toSVG(null, function(svg) {
     *   return svg.replace('stroke-dasharray: ; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; ', '');
     * });
     */
    toSVG: function(options, reviver) {
      options || (options = { });
      options.reviver = reviver;
      var markup = [];

      this._setSVGPreamble(markup, options);
      this._setSVGHeader(markup, options);
      if (this.clipPath) {
        markup.push('<g clip-path="url(#' + this.clipPath.clipPathId + ')" >\n');
      }
      this._setSVGBgOverlayColor(markup, 'background');
      this._setSVGBgOverlayImage(markup, 'backgroundImage', reviver);
      this._setSVGObjects(markup, reviver);
      if (this.clipPath) {
        markup.push('</g>\n');
      }
      this._setSVGBgOverlayColor(markup, 'overlay');
      this._setSVGBgOverlayImage(markup, 'overlayImage', reviver);

      markup.push('</svg>');

      return markup.join('');
    },

    /**
     * @private
     */
    _setSVGPreamble: function(markup, options) {
      if (options.suppressPreamble) {
        return;
      }
      markup.push(
        '<?xml version="1.0" encoding="', (options.encoding || 'UTF-8'), '" standalone="no" ?>\n',
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ',
        '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
      );
    },

    /**
     * @private
     */
    _setSVGHeader: function(markup, options) {
      var width = options.width || this.width,
          height = options.height || this.height,
          vpt, viewBox = 'viewBox="0 0 ' + this.width + ' ' + this.height + '" ',
          NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

      if (options.viewBox) {
        viewBox = 'viewBox="' +
                options.viewBox.x + ' ' +
                options.viewBox.y + ' ' +
                options.viewBox.width + ' ' +
                options.viewBox.height + '" ';
      }
      else {
        if (this.svgViewportTransformation) {
          vpt = this.viewportTransform;
          viewBox = 'viewBox="' +
                  toFixed(-vpt[4] / vpt[0], NUM_FRACTION_DIGITS) + ' ' +
                  toFixed(-vpt[5] / vpt[3], NUM_FRACTION_DIGITS) + ' ' +
                  toFixed(this.width / vpt[0], NUM_FRACTION_DIGITS) + ' ' +
                  toFixed(this.height / vpt[3], NUM_FRACTION_DIGITS) + '" ';
        }
      }

      markup.push(
        '<svg ',
        'xmlns="http://www.w3.org/2000/svg" ',
        'xmlns:xlink="http://www.w3.org/1999/xlink" ',
        'version="1.1" ',
        'width="', width, '" ',
        'height="', height, '" ',
        viewBox,
        'xml:space="preserve">\n',
        '<desc>Created with Fabric.js ', fabric.version, '</desc>\n',
        '<defs>\n',
        this.createSVGFontFacesMarkup(),
        this.createSVGRefElementsMarkup(),
        this.createSVGClipPathMarkup(options),
        '</defs>\n'
      );
    },

    createSVGClipPathMarkup: function(options) {
      var clipPath = this.clipPath;
      if (clipPath) {
        clipPath.clipPathId = 'CLIPPATH_' + fabric.Object.__uid++;
        return  '<clipPath id="' + clipPath.clipPathId + '" >\n' +
          this.clipPath.toClipPathSVG(options.reviver) +
          '</clipPath>\n';
      }
      return '';
    },

    /**
     * Creates markup containing SVG referenced elements like patterns, gradients etc.
     * @return {String}
     */
    createSVGRefElementsMarkup: function() {
      var _this = this,
          markup = ['background', 'overlay'].map(function(prop) {
            var fill = _this[prop + 'Color'];
            if (fill && fill.toLive) {
              var shouldTransform = _this[prop + 'Vpt'], vpt = _this.viewportTransform,
                  object = {
                    width: _this.width / (shouldTransform ? vpt[0] : 1),
                    height: _this.height / (shouldTransform ? vpt[3] : 1)
                  };
              return fill.toSVG(
                object,
                { additionalTransform: shouldTransform ? fabric.util.matrixToSVG(vpt) : '' }
              );
            }
          });
      return markup.join('');
    },

    /**
     * Creates markup containing SVG font faces,
     * font URLs for font faces must be collected by developers
     * and are not extracted from the DOM by fabricjs
     * @param {Array} objects Array of fabric objects
     * @return {String}
     */
    createSVGFontFacesMarkup: function() {
      var markup = '', fontList = { }, obj, fontFamily,
          style, row, rowIndex, _char, charIndex, i, len,
          fontPaths = fabric.fontPaths, objects = [];

      this._objects.forEach(function add(object) {
        objects.push(object);
        if (object._objects) {
          object._objects.forEach(add);
        }
      });

      for (i = 0, len = objects.length; i < len; i++) {
        obj = objects[i];
        fontFamily = obj.fontFamily;
        if (obj.type.indexOf('text') === -1 || fontList[fontFamily] || !fontPaths[fontFamily]) {
          continue;
        }
        fontList[fontFamily] = true;
        if (!obj.styles) {
          continue;
        }
        style = obj.styles;
        for (rowIndex in style) {
          row = style[rowIndex];
          for (charIndex in row) {
            _char = row[charIndex];
            fontFamily = _char.fontFamily;
            if (!fontList[fontFamily] && fontPaths[fontFamily]) {
              fontList[fontFamily] = true;
            }
          }
        }
      }

      for (var j in fontList) {
        markup += [
          '\t\t@font-face {\n',
          '\t\t\tfont-family: \'', j, '\';\n',
          '\t\t\tsrc: url(\'', fontPaths[j], '\');\n',
          '\t\t}\n'
        ].join('');
      }

      if (markup) {
        markup = [
          '\t<style type="text/css">',
          '<![CDATA[\n',
          markup,
          ']]>',
          '</style>\n'
        ].join('');
      }

      return markup;
    },

    /**
     * @private
     */
    _setSVGObjects: function(markup, reviver) {
      var instance, i, len, objects = this._objects;
      for (i = 0, len = objects.length; i < len; i++) {
        instance = objects[i];
        if (instance.excludeFromExport) {
          continue;
        }
        this._setSVGObject(markup, instance, reviver);
      }
    },

    /**
     * @private
     */
    _setSVGObject: function(markup, instance, reviver) {
      markup.push(instance.toSVG(reviver));
    },

    /**
     * @private
     */
    _setSVGBgOverlayImage: function(markup, property, reviver) {
      if (this[property] && !this[property].excludeFromExport && this[property].toSVG) {
        markup.push(this[property].toSVG(reviver));
      }
    },

    /**
     * @private
     */
    _setSVGBgOverlayColor: function(markup, property) {
      var filler = this[property + 'Color'], vpt = this.viewportTransform, finalWidth = this.width,
          finalHeight = this.height;
      if (!filler) {
        return;
      }
      if (filler.toLive) {
        var repeat = filler.repeat, iVpt = fabric.util.invertTransform(vpt), shouldInvert = this[property + 'Vpt'],
            additionalTransform = shouldInvert ? fabric.util.matrixToSVG(iVpt) : '';
        markup.push(
          '<rect transform="' + additionalTransform + ' translate(', finalWidth / 2, ',', finalHeight / 2, ')"',
          ' x="', filler.offsetX - finalWidth / 2,
          '" y="', filler.offsetY - finalHeight / 2, '" ',
          'width="',
          (repeat === 'repeat-y' || repeat === 'no-repeat'
            ? filler.source.width
            : finalWidth ),
          '" height="',
          (repeat === 'repeat-x' || repeat === 'no-repeat'
            ? filler.source.height
            : finalHeight),
          '" fill="url(#SVGID_' + filler.id + ')"',
          '></rect>\n'
        );
      }
      else {
        markup.push(
          '<rect x="0" y="0" width="100%" height="100%" ',
          'fill="', filler, '"',
          '></rect>\n'
        );
      }
    },
    /* _TO_SVG_END_ */

    /**
     * Moves an object or the objects of a multiple selection
     * to the bottom of the stack of drawn objects
     * @param {fabric.Object} object Object to send to back
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    sendToBack: function (object) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, objs;
      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = objs.length; i--;) {
          obj = objs[i];
          removeFromArray(this._objects, obj);
          this._objects.unshift(obj);
        }
      }
      else {
        removeFromArray(this._objects, object);
        this._objects.unshift(object);
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Moves an object or the objects of a multiple selection
     * to the top of the stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    bringToFront: function (object) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, objs;
      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = 0; i < objs.length; i++) {
          obj = objs[i];
          removeFromArray(this._objects, obj);
          this._objects.push(obj);
        }
      }
      else {
        removeFromArray(this._objects, object);
        this._objects.push(object);
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * Moves an object or a selection down in stack of drawn objects
     * An optional parameter, intersecting allows to move the object in behind
     * the first intersecting object. Where intersection is calculated with
     * bounding box. If no intersection is found, there will not be change in the
     * stack.
     * @param {fabric.Object} object Object to send
     * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    sendBackwards: function (object, intersecting) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, idx, newIdx, objs, objsMoved = 0;

      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = 0; i < objs.length; i++) {
          obj = objs[i];
          idx = this._objects.indexOf(obj);
          if (idx > 0 + objsMoved) {
            newIdx = idx - 1;
            removeFromArray(this._objects, obj);
            this._objects.splice(newIdx, 0, obj);
          }
          objsMoved++;
        }
      }
      else {
        idx = this._objects.indexOf(object);
        if (idx !== 0) {
          // if object is not on the bottom of stack
          newIdx = this._findNewLowerIndex(object, idx, intersecting);
          removeFromArray(this._objects, object);
          this._objects.splice(newIdx, 0, object);
        }
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * @private
     */
    _findNewLowerIndex: function(object, idx, intersecting) {
      var newIdx, i;

      if (intersecting) {
        newIdx = idx;

        // traverse down the stack looking for the nearest intersecting object
        for (i = idx - 1; i >= 0; --i) {

          var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
                               object.isContainedWithinObject(this._objects[i]) ||
                               this._objects[i].isContainedWithinObject(object);

          if (isIntersecting) {
            newIdx = i;
            break;
          }
        }
      }
      else {
        newIdx = idx - 1;
      }

      return newIdx;
    },

    /**
     * Moves an object or a selection up in stack of drawn objects
     * An optional parameter, intersecting allows to move the object in front
     * of the first intersecting object. Where intersection is calculated with
     * bounding box. If no intersection is found, there will not be change in the
     * stack.
     * @param {fabric.Object} object Object to send
     * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    bringForward: function (object, intersecting) {
      if (!object) {
        return this;
      }
      var activeSelection = this._activeObject,
          i, obj, idx, newIdx, objs, objsMoved = 0;

      if (object === activeSelection && object.type === 'activeSelection') {
        objs = activeSelection._objects;
        for (i = objs.length; i--;) {
          obj = objs[i];
          idx = this._objects.indexOf(obj);
          if (idx < this._objects.length - 1 - objsMoved) {
            newIdx = idx + 1;
            removeFromArray(this._objects, obj);
            this._objects.splice(newIdx, 0, obj);
          }
          objsMoved++;
        }
      }
      else {
        idx = this._objects.indexOf(object);
        if (idx !== this._objects.length - 1) {
          // if object is not on top of stack (last item in an array)
          newIdx = this._findNewUpperIndex(object, idx, intersecting);
          removeFromArray(this._objects, object);
          this._objects.splice(newIdx, 0, object);
        }
      }
      this.renderOnAddRemove && this.requestRenderAll();
      return this;
    },

    /**
     * @private
     */
    _findNewUpperIndex: function(object, idx, intersecting) {
      var newIdx, i, len;

      if (intersecting) {
        newIdx = idx;

        // traverse up the stack looking for the nearest intersecting object
        for (i = idx + 1, len = this._objects.length; i < len; ++i) {

          var isIntersecting = object.intersectsWithObject(this._objects[i]) ||
                               object.isContainedWithinObject(this._objects[i]) ||
                               this._objects[i].isContainedWithinObject(object);

          if (isIntersecting) {
            newIdx = i;
            break;
          }
        }
      }
      else {
        newIdx = idx + 1;
      }

      return newIdx;
    },

    /**
     * Moves an object to specified level in stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @param {Number} index Position to move to
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    moveTo: function (object, index) {
      removeFromArray(this._objects, object);
      this._objects.splice(index, 0, object);
      return this.renderOnAddRemove && this.requestRenderAll();
    },

    /**
     * Clears a canvas element and dispose objects
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    dispose: function () {
      // cancel eventually ongoing renders
      if (this.isRendering) {
        fabric.util.cancelAnimFrame(this.isRendering);
        this.isRendering = 0;
      }
      this.forEachObject(function(object) {
        object.dispose && object.dispose();
      });
      this._objects = [];
      if (this.backgroundImage && this.backgroundImage.dispose) {
        this.backgroundImage.dispose();
      }
      this.backgroundImage = null;
      if (this.overlayImage && this.overlayImage.dispose) {
        this.overlayImage.dispose();
      }
      this.overlayImage = null;
      this._iTextInstances = null;
      this.contextContainer = null;
      // restore canvas style
      this.lowerCanvasEl.classList.remove('lower-canvas');
      this.lowerCanvasEl.style = this._originalCanvasStyle;
      delete this._originalCanvasStyle;
      // restore canvas size to original size in case retina scaling was applied
      this.lowerCanvasEl.setAttribute('width', this.width);
      this.lowerCanvasEl.setAttribute('height', this.height);
      fabric.util.cleanUpJsdomNode(this.lowerCanvasEl);
      this.lowerCanvasEl = undefined;
      return this;
    },

    /**
     * Returns a string representation of an instance
     * @return {String} string representation of an instance
     */
    toString: function () {
      return '#<fabric.Canvas (' + this.complexity() + '): ' +
               '{ objects: ' + this._objects.length + ' }>';
    }
  });

  extend(fabric.StaticCanvas.prototype, fabric.Observable);
  extend(fabric.StaticCanvas.prototype, fabric.Collection);
  extend(fabric.StaticCanvas.prototype, fabric.DataURLExporter);

  extend(fabric.StaticCanvas, /** @lends fabric.StaticCanvas */ {

    /**
     * @static
     * @type String
     * @default
     */
    EMPTY_JSON: '{"objects": [], "background": "white"}',

    /**
     * Provides a way to check support of some of the canvas methods
     * (either those of HTMLCanvasElement itself, or rendering context)
     *
     * @param {String} methodName Method to check support for;
     *                            Could be one of "setLineDash"
     * @return {Boolean | null} `true` if method is supported (or at least exists),
     *                          `null` if canvas element or context can not be initialized
     */
    supports: function (methodName) {
      var el = createCanvasElement();

      if (!el || !el.getContext) {
        return null;
      }

      var ctx = el.getContext('2d');
      if (!ctx) {
        return null;
      }

      switch (methodName) {

        case 'setLineDash':
          return typeof ctx.setLineDash !== 'undefined';

        default:
          return null;
      }
    }
  });

  /**
   * Returns Object representation of canvas
   * this alias is provided because if you call JSON.stringify on an instance,
   * the toJSON object will be invoked if it exists.
   * Having a toJSON method means you can do JSON.stringify(myCanvas)
   * @function
   * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
   * @return {Object} JSON compatible object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#serialization}
   * @see {@link http://jsfiddle.net/fabricjs/pec86/|jsFiddle demo}
   * @example <caption>JSON without additional properties</caption>
   * var json = canvas.toJSON();
   * @example <caption>JSON with additional properties included</caption>
   * var json = canvas.toJSON(['lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY']);
   * @example <caption>JSON without default values</caption>
   * canvas.includeDefaultValues = false;
   * var json = canvas.toJSON();
   */
  fabric.StaticCanvas.prototype.toJSON = fabric.StaticCanvas.prototype.toObject;

  if (fabric.isLikelyNode) {
    fabric.StaticCanvas.prototype.createPNGStream = function() {
      var impl = getNodeCanvas(this.lowerCanvasEl);
      return impl && impl.createPNGStream();
    };
    fabric.StaticCanvas.prototype.createJPEGStream = function(opts) {
      var impl = getNodeCanvas(this.lowerCanvasEl);
      return impl && impl.createJPEGStream(opts);
    };
  }
})();
