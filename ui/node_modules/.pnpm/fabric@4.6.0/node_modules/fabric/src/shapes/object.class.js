(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      extend = fabric.util.object.extend,
      clone = fabric.util.object.clone,
      toFixed = fabric.util.toFixed,
      capitalize = fabric.util.string.capitalize,
      degreesToRadians = fabric.util.degreesToRadians,
      objectCaching = !fabric.isLikelyNode,
      ALIASING_LIMIT = 2;

  if (fabric.Object) {
    return;
  }

  /**
   * Root object class from which all 2d shape classes inherit from
   * @class fabric.Object
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-1#objects}
   * @see {@link fabric.Object#initialize} for constructor definition
   *
   * @fires added
   * @fires removed
   *
   * @fires selected
   * @fires deselected
   * @fires modified
   * @fires modified
   * @fires moved
   * @fires scaled
   * @fires rotated
   * @fires skewed
   *
   * @fires rotating
   * @fires scaling
   * @fires moving
   * @fires skewing
   *
   * @fires mousedown
   * @fires mouseup
   * @fires mouseover
   * @fires mouseout
   * @fires mousewheel
   * @fires mousedblclick
   *
   * @fires dragover
   * @fires dragenter
   * @fires dragleave
   * @fires drop
   */
  fabric.Object = fabric.util.createClass(fabric.CommonMethods, /** @lends fabric.Object.prototype */ {

    /**
     * Type of an object (rect, circle, path, etc.).
     * Note that this property is meant to be read-only and not meant to be modified.
     * If you modify, certain parts of Fabric (such as JSON loading) won't work correctly.
     * @type String
     * @default
     */
    type:                     'object',

    /**
     * Horizontal origin of transformation of an object (one of "left", "right", "center")
     * See http://jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
     * @type String
     * @default
     */
    originX:                  'left',

    /**
     * Vertical origin of transformation of an object (one of "top", "bottom", "center")
     * See http://jsfiddle.net/1ow02gea/244/ on how originX/originY affect objects in groups
     * @type String
     * @default
     */
    originY:                  'top',

    /**
     * Top position of an object. Note that by default it's relative to object top. You can change this by setting originY={top/center/bottom}
     * @type Number
     * @default
     */
    top:                      0,

    /**
     * Left position of an object. Note that by default it's relative to object left. You can change this by setting originX={left/center/right}
     * @type Number
     * @default
     */
    left:                     0,

    /**
     * Object width
     * @type Number
     * @default
     */
    width:                    0,

    /**
     * Object height
     * @type Number
     * @default
     */
    height:                   0,

    /**
     * Object scale factor (horizontal)
     * @type Number
     * @default
     */
    scaleX:                   1,

    /**
     * Object scale factor (vertical)
     * @type Number
     * @default
     */
    scaleY:                   1,

    /**
     * When true, an object is rendered as flipped horizontally
     * @type Boolean
     * @default
     */
    flipX:                    false,

    /**
     * When true, an object is rendered as flipped vertically
     * @type Boolean
     * @default
     */
    flipY:                    false,

    /**
     * Opacity of an object
     * @type Number
     * @default
     */
    opacity:                  1,

    /**
     * Angle of rotation of an object (in degrees)
     * @type Number
     * @default
     */
    angle:                    0,

    /**
     * Angle of skew on x axes of an object (in degrees)
     * @type Number
     * @default
     */
    skewX:                    0,

    /**
     * Angle of skew on y axes of an object (in degrees)
     * @type Number
     * @default
     */
    skewY:                    0,

    /**
     * Size of object's controlling corners (in pixels)
     * @type Number
     * @default
     */
    cornerSize:               13,

    /**
     * Size of object's controlling corners when touch interaction is detected
     * @type Number
     * @default
     */
    touchCornerSize:               24,

    /**
     * When true, object's controlling corners are rendered as transparent inside (i.e. stroke instead of fill)
     * @type Boolean
     * @default
     */
    transparentCorners:       true,

    /**
     * Default cursor value used when hovering over this object on canvas
     * @type String
     * @default
     */
    hoverCursor:              null,

    /**
     * Default cursor value used when moving this object on canvas
     * @type String
     * @default
     */
    moveCursor:               null,

    /**
     * Padding between object and its controlling borders (in pixels)
     * @type Number
     * @default
     */
    padding:                  0,

    /**
     * Color of controlling borders of an object (when it's active)
     * @type String
     * @default
     */
    borderColor:              'rgb(178,204,255)',

    /**
     * Array specifying dash pattern of an object's borders (hasBorder must be true)
     * @since 1.6.2
     * @type Array
     */
    borderDashArray:          null,

    /**
     * Color of controlling corners of an object (when it's active)
     * @type String
     * @default
     */
    cornerColor:              'rgb(178,204,255)',

    /**
     * Color of controlling corners of an object (when it's active and transparentCorners false)
     * @since 1.6.2
     * @type String
     * @default
     */
    cornerStrokeColor:        null,

    /**
     * Specify style of control, 'rect' or 'circle'
     * @since 1.6.2
     * @type String
     */
    cornerStyle:          'rect',

    /**
     * Array specifying dash pattern of an object's control (hasBorder must be true)
     * @since 1.6.2
     * @type Array
     */
    cornerDashArray:          null,

    /**
     * When true, this object will use center point as the origin of transformation
     * when being scaled via the controls.
     * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredScaling:          false,

    /**
     * When true, this object will use center point as the origin of transformation
     * when being rotated via the controls.
     * <b>Backwards incompatibility note:</b> This property replaces "centerTransform" (Boolean).
     * @since 1.3.4
     * @type Boolean
     * @default
     */
    centeredRotation:         true,

    /**
     * Color of object's fill
     * takes css colors https://www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    fill:                     'rgb(0,0,0)',

    /**
     * Fill rule used to fill an object
     * accepted values are nonzero, evenodd
     * <b>Backwards incompatibility note:</b> This property was used for setting globalCompositeOperation until v1.4.12 (use `fabric.Object#globalCompositeOperation` instead)
     * @type String
     * @default
     */
    fillRule:                 'nonzero',

    /**
     * Composite rule used for canvas globalCompositeOperation
     * @type String
     * @default
     */
    globalCompositeOperation: 'source-over',

    /**
     * Background color of an object.
     * takes css colors https://www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    backgroundColor:          '',

    /**
     * Selection Background color of an object. colored layer behind the object when it is active.
     * does not mix good with globalCompositeOperation methods.
     * @type String
     * @default
     */
    selectionBackgroundColor:          '',

    /**
     * When defined, an object is rendered via stroke and this property specifies its color
     * takes css colors https://www.w3.org/TR/css-color-3/
     * @type String
     * @default
     */
    stroke:                   null,

    /**
     * Width of a stroke used to render this object
     * @type Number
     * @default
     */
    strokeWidth:              1,

    /**
     * Array specifying dash pattern of an object's stroke (stroke must be defined)
     * @type Array
     */
    strokeDashArray:          null,

    /**
     * Line offset of an object's stroke
     * @type Number
     * @default
     */
    strokeDashOffset: 0,

    /**
     * Line endings style of an object's stroke (one of "butt", "round", "square")
     * @type String
     * @default
     */
    strokeLineCap:            'butt',

    /**
     * Corner style of an object's stroke (one of "bevel", "round", "miter")
     * @type String
     * @default
     */
    strokeLineJoin:           'miter',

    /**
     * Maximum miter length (used for strokeLineJoin = "miter") of an object's stroke
     * @type Number
     * @default
     */
    strokeMiterLimit:         4,

    /**
     * Shadow object representing shadow of this shape
     * @type fabric.Shadow
     * @default
     */
    shadow:                   null,

    /**
     * Opacity of object's controlling borders when object is active and moving
     * @type Number
     * @default
     */
    borderOpacityWhenMoving:  0.4,

    /**
     * Scale factor of object's controlling borders
     * bigger number will make a thicker border
     * border is 1, so this is basically a border thickness
     * since there is no way to change the border itself.
     * @type Number
     * @default
     */
    borderScaleFactor:        1,

    /**
     * Minimum allowed scale value of an object
     * @type Number
     * @default
     */
    minScaleLimit:            0,

    /**
     * When set to `false`, an object can not be selected for modification (using either point-click-based or group-based selection).
     * But events still fire on it.
     * @type Boolean
     * @default
     */
    selectable:               true,

    /**
     * When set to `false`, an object can not be a target of events. All events propagate through it. Introduced in v1.3.4
     * @type Boolean
     * @default
     */
    evented:                  true,

    /**
     * When set to `false`, an object is not rendered on canvas
     * @type Boolean
     * @default
     */
    visible:                  true,

    /**
     * When set to `false`, object's controls are not displayed and can not be used to manipulate object
     * @type Boolean
     * @default
     */
    hasControls:              true,

    /**
     * When set to `false`, object's controlling borders are not rendered
     * @type Boolean
     * @default
     */
    hasBorders:               true,

    /**
     * When set to `true`, objects are "found" on canvas on per-pixel basis rather than according to bounding box
     * @type Boolean
     * @default
     */
    perPixelTargetFind:       false,

    /**
     * When `false`, default object's values are not included in its serialization
     * @type Boolean
     * @default
     */
    includeDefaultValues:     true,

    /**
     * When `true`, object horizontal movement is locked
     * @type Boolean
     * @default
     */
    lockMovementX:            false,

    /**
     * When `true`, object vertical movement is locked
     * @type Boolean
     * @default
     */
    lockMovementY:            false,

    /**
     * When `true`, object rotation is locked
     * @type Boolean
     * @default
     */
    lockRotation:             false,

    /**
     * When `true`, object horizontal scaling is locked
     * @type Boolean
     * @default
     */
    lockScalingX:             false,

    /**
     * When `true`, object vertical scaling is locked
     * @type Boolean
     * @default
     */
    lockScalingY:             false,

    /**
     * When `true`, object horizontal skewing is locked
     * @type Boolean
     * @default
     */
    lockSkewingX:             false,

    /**
     * When `true`, object vertical skewing is locked
     * @type Boolean
     * @default
     */
    lockSkewingY:             false,

    /**
     * When `true`, object cannot be flipped by scaling into negative values
     * @type Boolean
     * @default
     */
    lockScalingFlip:          false,

    /**
     * When `true`, object is not exported in OBJECT/JSON
     * @since 1.6.3
     * @type Boolean
     * @default
     */
    excludeFromExport:        false,

    /**
     * When `true`, object is cached on an additional canvas.
     * When `false`, object is not cached unless necessary ( clipPath )
     * default to true
     * @since 1.7.0
     * @type Boolean
     * @default true
     */
    objectCaching:            objectCaching,

    /**
     * When `true`, object properties are checked for cache invalidation. In some particular
     * situation you may want this to be disabled ( spray brush, very big, groups)
     * or if your application does not allow you to modify properties for groups child you want
     * to disable it for groups.
     * default to false
     * since 1.7.0
     * @type Boolean
     * @default false
     */
    statefullCache:            false,

    /**
     * When `true`, cache does not get updated during scaling. The picture will get blocky if scaled
     * too much and will be redrawn with correct details at the end of scaling.
     * this setting is performance and application dependant.
     * default to true
     * since 1.7.0
     * @type Boolean
     * @default true
     */
    noScaleCache:              true,

    /**
     * When `false`, the stoke width will scale with the object.
     * When `true`, the stroke will always match the exact pixel size entered for stroke width.
     * default to false
     * @since 2.6.0
     * @type Boolean
     * @default false
     * @type Boolean
     * @default false
     */
    strokeUniform:              false,

    /**
     * When set to `true`, object's cache will be rerendered next render call.
     * since 1.7.0
     * @type Boolean
     * @default true
     */
    dirty:                true,

    /**
     * keeps the value of the last hovered corner during mouse move.
     * 0 is no corner, or 'mt', 'ml', 'mtr' etc..
     * It should be private, but there is no harm in using it as
     * a read-only property.
     * @type number|string|any
     * @default 0
     */
    __corner: 0,

    /**
     * Determines if the fill or the stroke is drawn first (one of "fill" or "stroke")
     * @type String
     * @default
     */
    paintFirst:           'fill',

    /**
     * When 'down', object is set to active on mousedown/touchstart
     * When 'up', object is set to active on mouseup/touchend
     * Experimental. Let's see if this breaks anything before supporting officially
     * @private
     * since 4.4.0
     * @type String
     * @default 'down'
     */
    activeOn:           'down',

    /**
     * List of properties to consider when checking if state
     * of an object is changed (fabric.Object#hasStateChanged)
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties: (
      'top left width height scaleX scaleY flipX flipY originX originY transformMatrix ' +
      'stroke strokeWidth strokeDashArray strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit ' +
      'angle opacity fill globalCompositeOperation shadow visible backgroundColor ' +
      'skewX skewY fillRule paintFirst clipPath strokeUniform'
    ).split(' '),

    /**
     * List of properties to consider when checking if cache needs refresh
     * Those properties are checked by statefullCache ON ( or lazy mode if we want ) or from single
     * calls to Object.set(key, value). If the key is in this list, the object is marked as dirty
     * and refreshed at the next render
     * @type Array
     */
    cacheProperties: (
      'fill stroke strokeWidth strokeDashArray width height paintFirst strokeUniform' +
      ' strokeLineCap strokeDashOffset strokeLineJoin strokeMiterLimit backgroundColor clipPath'
    ).split(' '),

    /**
     * List of properties to consider for animating colors.
     * @type Array
     */
    colorProperties: (
      'fill stroke backgroundColor'
    ).split(' '),

    /**
     * a fabricObject that, without stroke define a clipping area with their shape. filled in black
     * the clipPath object gets used when the object has rendered, and the context is placed in the center
     * of the object cacheCanvas.
     * If you want 0,0 of a clipPath to align with an object center, use clipPath.originX/Y to 'center'
     * @type fabric.Object
     */
    clipPath: undefined,

    /**
     * Meaningful ONLY when the object is used as clipPath.
     * if true, the clipPath will make the object clip to the outside of the clipPath
     * since 2.4.0
     * @type boolean
     * @default false
     */
    inverted: false,

    /**
     * Meaningful ONLY when the object is used as clipPath.
     * if true, the clipPath will have its top and left relative to canvas, and will
     * not be influenced by the object transform. This will make the clipPath relative
     * to the canvas, but clipping just a particular object.
     * WARNING this is beta, this feature may change or be renamed.
     * since 2.4.0
     * @type boolean
     * @default false
     */
    absolutePositioned: false,

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function(options) {
      if (options) {
        this.setOptions(options);
      }
    },

    /**
     * Create a the canvas used to keep the cached copy of the object
     * @private
     */
    _createCacheCanvas: function() {
      this._cacheProperties = {};
      this._cacheCanvas = fabric.util.createCanvasElement();
      this._cacheContext = this._cacheCanvas.getContext('2d');
      this._updateCacheCanvas();
      // if canvas gets created, is empty, so dirty.
      this.dirty = true;
    },

    /**
     * Limit the cache dimensions so that X * Y do not cross fabric.perfLimitSizeTotal
     * and each side do not cross fabric.cacheSideLimit
     * those numbers are configurable so that you can get as much detail as you want
     * making bargain with performances.
     * @param {Object} dims
     * @param {Object} dims.width width of canvas
     * @param {Object} dims.height height of canvas
     * @param {Object} dims.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @param {Object} dims.zoomY zoomY zoom value to unscale the canvas before drawing cache
     * @return {Object}.width width of canvas
     * @return {Object}.height height of canvas
     * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
     */
    _limitCacheSize: function(dims) {
      var perfLimitSizeTotal = fabric.perfLimitSizeTotal,
          width = dims.width, height = dims.height,
          max = fabric.maxCacheSideLimit, min = fabric.minCacheSideLimit;
      if (width <= max && height <= max && width * height <= perfLimitSizeTotal) {
        if (width < min) {
          dims.width = min;
        }
        if (height < min) {
          dims.height = min;
        }
        return dims;
      }
      var ar = width / height, limitedDims = fabric.util.limitDimsByArea(ar, perfLimitSizeTotal),
          capValue = fabric.util.capValue,
          x = capValue(min, limitedDims.x, max),
          y = capValue(min, limitedDims.y, max);
      if (width > x) {
        dims.zoomX /= width / x;
        dims.width = x;
        dims.capped = true;
      }
      if (height > y) {
        dims.zoomY /= height / y;
        dims.height = y;
        dims.capped = true;
      }
      return dims;
    },

    /**
     * Return the dimension and the zoom level needed to create a cache canvas
     * big enough to host the object to be cached.
     * @private
     * @return {Object}.x width of object to be cached
     * @return {Object}.y height of object to be cached
     * @return {Object}.width width of canvas
     * @return {Object}.height height of canvas
     * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
     */
    _getCacheCanvasDimensions: function() {
      var objectScale = this.getTotalObjectScaling(),
          // caculate dimensions without skewing
          dim = this._getTransformedDimensions(0, 0),
          neededX = dim.x * objectScale.scaleX / this.scaleX,
          neededY = dim.y * objectScale.scaleY / this.scaleY;
      return {
        // for sure this ALIASING_LIMIT is slightly creating problem
        // in situation in which the cache canvas gets an upper limit
        // also objectScale contains already scaleX and scaleY
        width: neededX + ALIASING_LIMIT,
        height: neededY + ALIASING_LIMIT,
        zoomX: objectScale.scaleX,
        zoomY: objectScale.scaleY,
        x: neededX,
        y: neededY
      };
    },

    /**
     * Update width and height of the canvas for cache
     * returns true or false if canvas needed resize.
     * @private
     * @return {Boolean} true if the canvas has been resized
     */
    _updateCacheCanvas: function() {
      var targetCanvas = this.canvas;
      if (this.noScaleCache && targetCanvas && targetCanvas._currentTransform) {
        var target = targetCanvas._currentTransform.target,
            action = targetCanvas._currentTransform.action;
        if (this === target && action.slice && action.slice(0, 5) === 'scale') {
          return false;
        }
      }
      var canvas = this._cacheCanvas,
          dims = this._limitCacheSize(this._getCacheCanvasDimensions()),
          minCacheSize = fabric.minCacheSideLimit,
          width = dims.width, height = dims.height, drawingWidth, drawingHeight,
          zoomX = dims.zoomX, zoomY = dims.zoomY,
          dimensionsChanged = width !== this.cacheWidth || height !== this.cacheHeight,
          zoomChanged = this.zoomX !== zoomX || this.zoomY !== zoomY,
          shouldRedraw = dimensionsChanged || zoomChanged,
          additionalWidth = 0, additionalHeight = 0, shouldResizeCanvas = false;
      if (dimensionsChanged) {
        var canvasWidth = this._cacheCanvas.width,
            canvasHeight = this._cacheCanvas.height,
            sizeGrowing = width > canvasWidth || height > canvasHeight,
            sizeShrinking = (width < canvasWidth * 0.9 || height < canvasHeight * 0.9) &&
              canvasWidth > minCacheSize && canvasHeight > minCacheSize;
        shouldResizeCanvas = sizeGrowing || sizeShrinking;
        if (sizeGrowing && !dims.capped && (width > minCacheSize || height > minCacheSize)) {
          additionalWidth = width * 0.1;
          additionalHeight = height * 0.1;
        }
      }
      if (this instanceof fabric.Text && this.path) {
        shouldRedraw = true;
        shouldResizeCanvas = true;
        additionalWidth += this.getHeightOfLine(0) * this.zoomX;
        additionalHeight += this.getHeightOfLine(0) * this.zoomY;
      }
      if (shouldRedraw) {
        if (shouldResizeCanvas) {
          canvas.width = Math.ceil(width + additionalWidth);
          canvas.height = Math.ceil(height + additionalHeight);
        }
        else {
          this._cacheContext.setTransform(1, 0, 0, 1, 0, 0);
          this._cacheContext.clearRect(0, 0, canvas.width, canvas.height);
        }
        drawingWidth = dims.x / 2;
        drawingHeight = dims.y / 2;
        this.cacheTranslationX = Math.round(canvas.width / 2 - drawingWidth) + drawingWidth;
        this.cacheTranslationY = Math.round(canvas.height / 2 - drawingHeight) + drawingHeight;
        this.cacheWidth = width;
        this.cacheHeight = height;
        this._cacheContext.translate(this.cacheTranslationX, this.cacheTranslationY);
        this._cacheContext.scale(zoomX, zoomY);
        this.zoomX = zoomX;
        this.zoomY = zoomY;
        return true;
      }
      return false;
    },

    /**
     * Sets object's properties from options
     * @param {Object} [options] Options object
     */
    setOptions: function(options) {
      this._setOptions(options);
      this._initGradient(options.fill, 'fill');
      this._initGradient(options.stroke, 'stroke');
      this._initPattern(options.fill, 'fill');
      this._initPattern(options.stroke, 'stroke');
    },

    /**
     * Transforms context when rendering an object
     * @param {CanvasRenderingContext2D} ctx Context
     */
    transform: function(ctx) {
      var needFullTransform = (this.group && !this.group._transformDone) ||
         (this.group && this.canvas && ctx === this.canvas.contextTop);
      var m = this.calcTransformMatrix(!needFullTransform);
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    },

    /**
     * Returns an object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,

          object = {
            type:                     this.type,
            version:                  fabric.version,
            originX:                  this.originX,
            originY:                  this.originY,
            left:                     toFixed(this.left, NUM_FRACTION_DIGITS),
            top:                      toFixed(this.top, NUM_FRACTION_DIGITS),
            width:                    toFixed(this.width, NUM_FRACTION_DIGITS),
            height:                   toFixed(this.height, NUM_FRACTION_DIGITS),
            fill:                     (this.fill && this.fill.toObject) ? this.fill.toObject() : this.fill,
            stroke:                   (this.stroke && this.stroke.toObject) ? this.stroke.toObject() : this.stroke,
            strokeWidth:              toFixed(this.strokeWidth, NUM_FRACTION_DIGITS),
            strokeDashArray:          this.strokeDashArray ? this.strokeDashArray.concat() : this.strokeDashArray,
            strokeLineCap:            this.strokeLineCap,
            strokeDashOffset:         this.strokeDashOffset,
            strokeLineJoin:           this.strokeLineJoin,
            strokeUniform:            this.strokeUniform,
            strokeMiterLimit:         toFixed(this.strokeMiterLimit, NUM_FRACTION_DIGITS),
            scaleX:                   toFixed(this.scaleX, NUM_FRACTION_DIGITS),
            scaleY:                   toFixed(this.scaleY, NUM_FRACTION_DIGITS),
            angle:                    toFixed(this.angle, NUM_FRACTION_DIGITS),
            flipX:                    this.flipX,
            flipY:                    this.flipY,
            opacity:                  toFixed(this.opacity, NUM_FRACTION_DIGITS),
            shadow:                   (this.shadow && this.shadow.toObject) ? this.shadow.toObject() : this.shadow,
            visible:                  this.visible,
            backgroundColor:          this.backgroundColor,
            fillRule:                 this.fillRule,
            paintFirst:               this.paintFirst,
            globalCompositeOperation: this.globalCompositeOperation,
            skewX:                    toFixed(this.skewX, NUM_FRACTION_DIGITS),
            skewY:                    toFixed(this.skewY, NUM_FRACTION_DIGITS),
          };

      if (this.clipPath && !this.clipPath.excludeFromExport) {
        object.clipPath = this.clipPath.toObject(propertiesToInclude);
        object.clipPath.inverted = this.clipPath.inverted;
        object.clipPath.absolutePositioned = this.clipPath.absolutePositioned;
      }

      fabric.util.populateWithProperties(this, object, propertiesToInclude);
      if (!this.includeDefaultValues) {
        object = this._removeDefaultValues(object);
      }

      return object;
    },

    /**
     * Returns (dataless) object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toDatalessObject: function(propertiesToInclude) {
      // will be overwritten by subclasses
      return this.toObject(propertiesToInclude);
    },

    /**
     * @private
     * @param {Object} object
     */
    _removeDefaultValues: function(object) {
      var prototype = fabric.util.getKlass(object.type).prototype,
          stateProperties = prototype.stateProperties;
      stateProperties.forEach(function(prop) {
        if (prop === 'left' || prop === 'top') {
          return;
        }
        if (object[prop] === prototype[prop]) {
          delete object[prop];
        }
        var isArray = Object.prototype.toString.call(object[prop]) === '[object Array]' &&
                      Object.prototype.toString.call(prototype[prop]) === '[object Array]';

        // basically a check for [] === []
        if (isArray && object[prop].length === 0 && prototype[prop].length === 0) {
          delete object[prop];
        }
      });

      return object;
    },

    /**
     * Returns a string representation of an instance
     * @return {String}
     */
    toString: function() {
      return '#<fabric.' + capitalize(this.type) + '>';
    },

    /**
     * Return the object scale factor counting also the group scaling
     * @return {Object} object with scaleX and scaleY properties
     */
    getObjectScaling: function() {
      // if the object is a top level one, on the canvas, we go for simple aritmetic
      // otherwise the complex method with angles will return approximations and decimals
      // and will likely kill the cache when not needed
      // https://github.com/fabricjs/fabric.js/issues/7157
      if (!this.group) {
        return {
          scaleX: this.scaleX,
          scaleY: this.scaleY,
        };
      }
      // if we are inside a group total zoom calculation is complex, we defer to generic matrices
      var options = fabric.util.qrDecompose(this.calcTransformMatrix());
      return { scaleX: Math.abs(options.scaleX), scaleY: Math.abs(options.scaleY) };
    },

    /**
     * Return the object scale factor counting also the group scaling, zoom and retina
     * @return {Object} object with scaleX and scaleY properties
     */
    getTotalObjectScaling: function() {
      var scale = this.getObjectScaling(), scaleX = scale.scaleX, scaleY = scale.scaleY;
      if (this.canvas) {
        var zoom = this.canvas.getZoom();
        var retina = this.canvas.getRetinaScaling();
        scaleX *= zoom * retina;
        scaleY *= zoom * retina;
      }
      return { scaleX: scaleX, scaleY: scaleY };
    },

    /**
     * Return the object opacity counting also the group property
     * @return {Number}
     */
    getObjectOpacity: function() {
      var opacity = this.opacity;
      if (this.group) {
        opacity *= this.group.getObjectOpacity();
      }
      return opacity;
    },

    /**
     * @private
     * @param {String} key
     * @param {*} value
     * @return {fabric.Object} thisArg
     */
    _set: function(key, value) {
      var shouldConstrainValue = (key === 'scaleX' || key === 'scaleY'),
          isChanged = this[key] !== value, groupNeedsUpdate = false;

      if (shouldConstrainValue) {
        value = this._constrainScale(value);
      }
      if (key === 'scaleX' && value < 0) {
        this.flipX = !this.flipX;
        value *= -1;
      }
      else if (key === 'scaleY' && value < 0) {
        this.flipY = !this.flipY;
        value *= -1;
      }
      else if (key === 'shadow' && value && !(value instanceof fabric.Shadow)) {
        value = new fabric.Shadow(value);
      }
      else if (key === 'dirty' && this.group) {
        this.group.set('dirty', value);
      }

      this[key] = value;

      if (isChanged) {
        groupNeedsUpdate = this.group && this.group.isOnACache();
        if (this.cacheProperties.indexOf(key) > -1) {
          this.dirty = true;
          groupNeedsUpdate && this.group.set('dirty', true);
        }
        else if (groupNeedsUpdate && this.stateProperties.indexOf(key) > -1) {
          this.group.set('dirty', true);
        }
      }
      return this;
    },

    /**
     * This callback function is called by the parent group of an object every
     * time a non-delegated property changes on the group. It is passed the key
     * and value as parameters. Not adding in this function's signature to avoid
     * Travis build error about unused variables.
     */
    setOnGroup: function() {
      // implemented by sub-classes, as needed.
    },

    /**
     * Retrieves viewportTransform from Object's canvas if possible
     * @method getViewportTransform
     * @memberOf fabric.Object.prototype
     * @return {Array}
     */
    getViewportTransform: function() {
      if (this.canvas && this.canvas.viewportTransform) {
        return this.canvas.viewportTransform;
      }
      return fabric.iMatrix.concat();
    },

    /*
     * @private
     * return if the object would be visible in rendering
     * @memberOf fabric.Object.prototype
     * @return {Boolean}
     */
    isNotVisible: function() {
      return this.opacity === 0 ||
        (!this.width && !this.height && this.strokeWidth === 0) ||
        !this.visible;
    },

    /**
     * Renders an object on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    render: function(ctx) {
      // do not render if width/height are zeros or object is not visible
      if (this.isNotVisible()) {
        return;
      }
      if (this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen()) {
        return;
      }
      ctx.save();
      this._setupCompositeOperation(ctx);
      this.drawSelectionBackground(ctx);
      this.transform(ctx);
      this._setOpacity(ctx);
      this._setShadow(ctx, this);
      if (this.shouldCache()) {
        this.renderCache();
        this.drawCacheOnCanvas(ctx);
      }
      else {
        this._removeCacheCanvas();
        this.dirty = false;
        this.drawObject(ctx);
        if (this.objectCaching && this.statefullCache) {
          this.saveState({ propertySet: 'cacheProperties' });
        }
      }
      ctx.restore();
    },

    renderCache: function(options) {
      options = options || {};
      if (!this._cacheCanvas) {
        this._createCacheCanvas();
      }
      if (this.isCacheDirty()) {
        this.statefullCache && this.saveState({ propertySet: 'cacheProperties' });
        this.drawObject(this._cacheContext, options.forClipping);
        this.dirty = false;
      }
    },

    /**
     * Remove cacheCanvas and its dimensions from the objects
     */
    _removeCacheCanvas: function() {
      this._cacheCanvas = null;
      this.cacheWidth = 0;
      this.cacheHeight = 0;
    },

    /**
     * return true if the object will draw a stroke
     * Does not consider text styles. This is just a shortcut used at rendering time
     * We want it to be an approximation and be fast.
     * wrote to avoid extra caching, it has to return true when stroke happens,
     * can guess when it will not happen at 100% chance, does not matter if it misses
     * some use case where the stroke is invisible.
     * @since 3.0.0
     * @returns Boolean
     */
    hasStroke: function() {
      return this.stroke && this.stroke !== 'transparent' && this.strokeWidth !== 0;
    },

    /**
     * return true if the object will draw a fill
     * Does not consider text styles. This is just a shortcut used at rendering time
     * We want it to be an approximation and be fast.
     * wrote to avoid extra caching, it has to return true when fill happens,
     * can guess when it will not happen at 100% chance, does not matter if it misses
     * some use case where the fill is invisible.
     * @since 3.0.0
     * @returns Boolean
     */
    hasFill: function() {
      return this.fill && this.fill !== 'transparent';
    },

    /**
     * When set to `true`, force the object to have its own cache, even if it is inside a group
     * it may be needed when your object behave in a particular way on the cache and always needs
     * its own isolated canvas to render correctly.
     * Created to be overridden
     * since 1.7.12
     * @returns Boolean
     */
    needsItsOwnCache: function() {
      if (this.paintFirst === 'stroke' &&
        this.hasFill() && this.hasStroke() && typeof this.shadow === 'object') {
        return true;
      }
      if (this.clipPath) {
        return true;
      }
      return false;
    },

    /**
     * Decide if the object should cache or not. Create its own cache level
     * objectCaching is a global flag, wins over everything
     * needsItsOwnCache should be used when the object drawing method requires
     * a cache step. None of the fabric classes requires it.
     * Generally you do not cache objects in groups because the group outside is cached.
     * Read as: cache if is needed, or if the feature is enabled but we are not already caching.
     * @return {Boolean}
     */
    shouldCache: function() {
      this.ownCaching = this.needsItsOwnCache() || (
        this.objectCaching &&
        (!this.group || !this.group.isOnACache())
      );
      return this.ownCaching;
    },

    /**
     * Check if this object or a child object will cast a shadow
     * used by Group.shouldCache to know if child has a shadow recursively
     * @return {Boolean}
     */
    willDrawShadow: function() {
      return !!this.shadow && (this.shadow.offsetX !== 0 || this.shadow.offsetY !== 0);
    },

    /**
     * Execute the drawing operation for an object clipPath
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawClipPathOnCache: function(ctx) {
      var path = this.clipPath;
      ctx.save();
      // DEBUG: uncomment this line, comment the following
      // ctx.globalAlpha = 0.4
      if (path.inverted) {
        ctx.globalCompositeOperation = 'destination-out';
      }
      else {
        ctx.globalCompositeOperation = 'destination-in';
      }
      //ctx.scale(1 / 2, 1 / 2);
      if (path.absolutePositioned) {
        var m = fabric.util.invertTransform(this.calcTransformMatrix());
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      }
      path.transform(ctx);
      ctx.scale(1 / path.zoomX, 1 / path.zoomY);
      ctx.drawImage(path._cacheCanvas, -path.cacheTranslationX, -path.cacheTranslationY);
      ctx.restore();
    },

    /**
     * Execute the drawing operation for an object on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawObject: function(ctx, forClipping) {
      var originalFill = this.fill, originalStroke = this.stroke;
      if (forClipping) {
        this.fill = 'black';
        this.stroke = '';
        this._setClippingProperties(ctx);
      }
      else {
        this._renderBackground(ctx);
      }
      this._render(ctx);
      this._drawClipPath(ctx);
      this.fill = originalFill;
      this.stroke = originalStroke;
    },

    _drawClipPath: function(ctx) {
      var path = this.clipPath;
      if (!path) { return; }
      // needed to setup a couple of variables
      // path canvas gets overridden with this one.
      // TODO find a better solution?
      path.canvas = this.canvas;
      path.shouldCache();
      path._transformDone = true;
      path.renderCache({ forClipping: true });
      this.drawClipPathOnCache(ctx);
    },

    /**
     * Paint the cached copy of the object on the target context.
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawCacheOnCanvas: function(ctx) {
      ctx.scale(1 / this.zoomX, 1 / this.zoomY);
      ctx.drawImage(this._cacheCanvas, -this.cacheTranslationX, -this.cacheTranslationY);
    },

    /**
     * Check if cache is dirty
     * @param {Boolean} skipCanvas skip canvas checks because this object is painted
     * on parent canvas.
     */
    isCacheDirty: function(skipCanvas) {
      if (this.isNotVisible()) {
        return false;
      }
      if (this._cacheCanvas && !skipCanvas && this._updateCacheCanvas()) {
        // in this case the context is already cleared.
        return true;
      }
      else {
        if (this.dirty ||
          (this.clipPath && this.clipPath.absolutePositioned) ||
          (this.statefullCache && this.hasStateChanged('cacheProperties'))
        ) {
          if (this._cacheCanvas && !skipCanvas) {
            var width = this.cacheWidth / this.zoomX;
            var height = this.cacheHeight / this.zoomY;
            this._cacheContext.clearRect(-width / 2, -height / 2, width, height);
          }
          return true;
        }
      }
      return false;
    },

    /**
     * Draws a background for the object big as its untransformed dimensions
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderBackground: function(ctx) {
      if (!this.backgroundColor) {
        return;
      }
      var dim = this._getNonTransformedDimensions();
      ctx.fillStyle = this.backgroundColor;

      ctx.fillRect(
        -dim.x / 2,
        -dim.y / 2,
        dim.x,
        dim.y
      );
      // if there is background color no other shadows
      // should be casted
      this._removeShadow(ctx);
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _setOpacity: function(ctx) {
      if (this.group && !this.group._transformDone) {
        ctx.globalAlpha = this.getObjectOpacity();
      }
      else {
        ctx.globalAlpha *= this.opacity;
      }
    },

    _setStrokeStyles: function(ctx, decl) {
      var stroke = decl.stroke;
      if (stroke) {
        ctx.lineWidth = decl.strokeWidth;
        ctx.lineCap = decl.strokeLineCap;
        ctx.lineDashOffset = decl.strokeDashOffset;
        ctx.lineJoin = decl.strokeLineJoin;
        ctx.miterLimit = decl.strokeMiterLimit;
        if (stroke.toLive) {
          if (stroke.gradientUnits === 'percentage' || stroke.gradientTransform || stroke.patternTransform) {
            // need to transform gradient in a pattern.
            // this is a slow process. If you are hitting this codepath, and the object
            // is not using caching, you should consider switching it on.
            // we need a canvas as big as the current object caching canvas.
            this._applyPatternForTransformedGradient(ctx, stroke);
          }
          else {
            // is a simple gradient or pattern
            ctx.strokeStyle = stroke.toLive(ctx, this);
            this._applyPatternGradientTransform(ctx, stroke);
          }
        }
        else {
          // is a color
          ctx.strokeStyle = decl.stroke;
        }
      }
    },

    _setFillStyles: function(ctx, decl) {
      var fill = decl.fill;
      if (fill) {
        if (fill.toLive) {
          ctx.fillStyle = fill.toLive(ctx, this);
          this._applyPatternGradientTransform(ctx, decl.fill);
        }
        else {
          ctx.fillStyle = fill;
        }
      }
    },

    _setClippingProperties: function(ctx) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'transparent';
      ctx.fillStyle = '#000000';
    },

    /**
     * @private
     * Sets line dash
     * @param {CanvasRenderingContext2D} ctx Context to set the dash line on
     * @param {Array} dashArray array representing dashes
     */
    _setLineDash: function(ctx, dashArray) {
      if (!dashArray || dashArray.length === 0) {
        return;
      }
      // Spec requires the concatenation of two copies the dash list when the number of elements is odd
      if (1 & dashArray.length) {
        dashArray.push.apply(dashArray, dashArray);
      }
      ctx.setLineDash(dashArray);
    },

    /**
     * Renders controls and borders for the object
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} [styleOverride] properties to override the object style
     */
    _renderControls: function(ctx, styleOverride) {
      var vpt = this.getViewportTransform(),
          matrix = this.calcTransformMatrix(),
          options, drawBorders, drawControls;
      styleOverride = styleOverride || { };
      drawBorders = typeof styleOverride.hasBorders !== 'undefined' ? styleOverride.hasBorders : this.hasBorders;
      drawControls = typeof styleOverride.hasControls !== 'undefined' ? styleOverride.hasControls : this.hasControls;
      matrix = fabric.util.multiplyTransformMatrices(vpt, matrix);
      options = fabric.util.qrDecompose(matrix);
      ctx.save();
      ctx.translate(options.translateX, options.translateY);
      ctx.lineWidth = 1 * this.borderScaleFactor;
      if (!this.group) {
        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
      }
      ctx.rotate(degreesToRadians(options.angle));
      if (styleOverride.forActiveSelection || this.group) {
        drawBorders && this.drawBordersInGroup(ctx, options, styleOverride);
      }
      else {
        drawBorders && this.drawBorders(ctx, styleOverride);
      }
      drawControls && this.drawControls(ctx, styleOverride);
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _setShadow: function(ctx) {
      if (!this.shadow) {
        return;
      }

      var shadow = this.shadow, canvas = this.canvas, scaling,
          multX = (canvas && canvas.viewportTransform[0]) || 1,
          multY = (canvas && canvas.viewportTransform[3]) || 1;
      if (shadow.nonScaling) {
        scaling = { scaleX: 1, scaleY: 1 };
      }
      else {
        scaling = this.getObjectScaling();
      }
      if (canvas && canvas._isRetinaScaling()) {
        multX *= fabric.devicePixelRatio;
        multY *= fabric.devicePixelRatio;
      }
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur * fabric.browserShadowBlurConstant *
        (multX + multY) * (scaling.scaleX + scaling.scaleY) / 4;
      ctx.shadowOffsetX = shadow.offsetX * multX * scaling.scaleX;
      ctx.shadowOffsetY = shadow.offsetY * multY * scaling.scaleY;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _removeShadow: function(ctx) {
      if (!this.shadow) {
        return;
      }

      ctx.shadowColor = '';
      ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} filler fabric.Pattern or fabric.Gradient
     * @return {Object} offset.offsetX offset for text rendering
     * @return {Object} offset.offsetY offset for text rendering
     */
    _applyPatternGradientTransform: function(ctx, filler) {
      if (!filler || !filler.toLive) {
        return { offsetX: 0, offsetY: 0 };
      }
      var t = filler.gradientTransform || filler.patternTransform;
      var offsetX = -this.width / 2 + filler.offsetX || 0,
          offsetY = -this.height / 2 + filler.offsetY || 0;

      if (filler.gradientUnits === 'percentage') {
        ctx.transform(this.width, 0, 0, this.height, offsetX, offsetY);
      }
      else {
        ctx.transform(1, 0, 0, 1, offsetX, offsetY);
      }
      if (t) {
        ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
      }
      return { offsetX: offsetX, offsetY: offsetY };
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderPaintInOrder: function(ctx) {
      if (this.paintFirst === 'stroke') {
        this._renderStroke(ctx);
        this._renderFill(ctx);
      }
      else {
        this._renderFill(ctx);
        this._renderStroke(ctx);
      }
    },

    /**
     * @private
     * function that actually render something on the context.
     * empty here to allow Obects to work on tests to benchmark fabric functionalites
     * not related to rendering
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function(/* ctx */) {

    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderFill: function(ctx) {
      if (!this.fill) {
        return;
      }

      ctx.save();
      this._setFillStyles(ctx, this);
      if (this.fillRule === 'evenodd') {
        ctx.fill('evenodd');
      }
      else {
        ctx.fill();
      }
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderStroke: function(ctx) {
      if (!this.stroke || this.strokeWidth === 0) {
        return;
      }

      if (this.shadow && !this.shadow.affectStroke) {
        this._removeShadow(ctx);
      }

      ctx.save();
      if (this.strokeUniform && this.group) {
        var scaling = this.getObjectScaling();
        ctx.scale(1 / scaling.scaleX, 1 / scaling.scaleY);
      }
      else if (this.strokeUniform) {
        ctx.scale(1 / this.scaleX, 1 / this.scaleY);
      }
      this._setLineDash(ctx, this.strokeDashArray);
      this._setStrokeStyles(ctx, this);
      ctx.stroke();
      ctx.restore();
    },

    /**
     * This function try to patch the missing gradientTransform on canvas gradients.
     * transforming a context to transform the gradient, is going to transform the stroke too.
     * we want to transform the gradient but not the stroke operation, so we create
     * a transformed gradient on a pattern and then we use the pattern instead of the gradient.
     * this method has drwabacks: is slow, is in low resolution, needs a patch for when the size
     * is limited.
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {fabric.Gradient} filler a fabric gradient instance
     */
    _applyPatternForTransformedGradient: function(ctx, filler) {
      var dims = this._limitCacheSize(this._getCacheCanvasDimensions()),
          pCanvas = fabric.util.createCanvasElement(), pCtx, retinaScaling = this.canvas.getRetinaScaling(),
          width = dims.x / this.scaleX / retinaScaling, height = dims.y / this.scaleY / retinaScaling;
      pCanvas.width = width;
      pCanvas.height = height;
      pCtx = pCanvas.getContext('2d');
      pCtx.beginPath(); pCtx.moveTo(0, 0); pCtx.lineTo(width, 0); pCtx.lineTo(width, height);
      pCtx.lineTo(0, height); pCtx.closePath();
      pCtx.translate(width / 2, height / 2);
      pCtx.scale(
        dims.zoomX / this.scaleX / retinaScaling,
        dims.zoomY / this.scaleY / retinaScaling
      );
      this._applyPatternGradientTransform(pCtx, filler);
      pCtx.fillStyle = filler.toLive(ctx);
      pCtx.fill();
      ctx.translate(-this.width / 2 - this.strokeWidth / 2, -this.height / 2 - this.strokeWidth / 2);
      ctx.scale(
        retinaScaling * this.scaleX / dims.zoomX,
        retinaScaling * this.scaleY / dims.zoomY
      );
      ctx.strokeStyle = pCtx.createPattern(pCanvas, 'no-repeat');
    },

    /**
     * This function is an helper for svg import. it returns the center of the object in the svg
     * untransformed coordinates
     * @private
     * @return {Object} center point from element coordinates
     */
    _findCenterFromElement: function() {
      return { x: this.left + this.width / 2, y: this.top + this.height / 2 };
    },

    /**
     * This function is an helper for svg import. it decompose the transformMatrix
     * and assign properties to object.
     * untransformed coordinates
     * @private
     * @chainable
     */
    _assignTransformMatrixProps: function() {
      if (this.transformMatrix) {
        var options = fabric.util.qrDecompose(this.transformMatrix);
        this.flipX = false;
        this.flipY = false;
        this.set('scaleX', options.scaleX);
        this.set('scaleY', options.scaleY);
        this.angle = options.angle;
        this.skewX = options.skewX;
        this.skewY = 0;
      }
    },

    /**
     * This function is an helper for svg import. it removes the transform matrix
     * and set to object properties that fabricjs can handle
     * @private
     * @param {Object} preserveAspectRatioOptions
     * @return {thisArg}
     */
    _removeTransformMatrix: function(preserveAspectRatioOptions) {
      var center = this._findCenterFromElement();
      if (this.transformMatrix) {
        this._assignTransformMatrixProps();
        center = fabric.util.transformPoint(center, this.transformMatrix);
      }
      this.transformMatrix = null;
      if (preserveAspectRatioOptions) {
        this.scaleX *= preserveAspectRatioOptions.scaleX;
        this.scaleY *= preserveAspectRatioOptions.scaleY;
        this.cropX = preserveAspectRatioOptions.cropX;
        this.cropY = preserveAspectRatioOptions.cropY;
        center.x += preserveAspectRatioOptions.offsetLeft;
        center.y += preserveAspectRatioOptions.offsetTop;
        this.width = preserveAspectRatioOptions.width;
        this.height = preserveAspectRatioOptions.height;
      }
      this.setPositionByOrigin(center, 'center', 'center');
    },

    /**
     * Clones an instance, using a callback method will work for every object.
     * @param {Function} callback Callback is invoked with a clone as a first argument
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     */
    clone: function(callback, propertiesToInclude) {
      var objectForm = this.toObject(propertiesToInclude);
      if (this.constructor.fromObject) {
        this.constructor.fromObject(objectForm, callback);
      }
      else {
        fabric.Object._fromObject('Object', objectForm, callback);
      }
    },

    /**
     * Creates an instance of fabric.Image out of an object
     * makes use of toCanvasElement.
     * Once this method was based on toDataUrl and loadImage, so it also had a quality
     * and format option. toCanvasElement is faster and produce no loss of quality.
     * If you need to get a real Jpeg or Png from an object, using toDataURL is the right way to do it.
     * toCanvasElement and then toBlob from the obtained canvas is also a good option.
     * This method is sync now, but still support the callback because we did not want to break.
     * When fabricJS 5.0 will be planned, this will probably be changed to not have a callback.
     * @param {Function} callback callback, invoked with an instance as a first argument
     * @param {Object} [options] for clone as image, passed to toDataURL
     * @param {Number} [options.multiplier=1] Multiplier to scale by
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
     * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
     * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
     * @return {fabric.Object} thisArg
     */
    cloneAsImage: function(callback, options) {
      var canvasEl = this.toCanvasElement(options);
      if (callback) {
        callback(new fabric.Image(canvasEl));
      }
      return this;
    },

    /**
     * Converts an object into a HTMLCanvas element
     * @param {Object} options Options object
     * @param {Number} [options.multiplier=1] Multiplier to scale by
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
     * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
     * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
     * @return {HTMLCanvasElement} Returns DOM element <canvas> with the fabric.Object
     */
    toCanvasElement: function(options) {
      options || (options = { });

      var utils = fabric.util, origParams = utils.saveObjectTransform(this),
          originalGroup = this.group,
          originalShadow = this.shadow, abs = Math.abs,
          multiplier = (options.multiplier || 1) * (options.enableRetinaScaling ? fabric.devicePixelRatio : 1);
      delete this.group;
      if (options.withoutTransform) {
        utils.resetObjectTransform(this);
      }
      if (options.withoutShadow) {
        this.shadow = null;
      }

      var el = fabric.util.createCanvasElement(),
          // skip canvas zoom and calculate with setCoords now.
          boundingRect = this.getBoundingRect(true, true),
          shadow = this.shadow, scaling,
          shadowOffset = { x: 0, y: 0 }, shadowBlur,
          width, height;

      if (shadow) {
        shadowBlur = shadow.blur;
        if (shadow.nonScaling) {
          scaling = { scaleX: 1, scaleY: 1 };
        }
        else {
          scaling = this.getObjectScaling();
        }
        // consider non scaling shadow.
        shadowOffset.x = 2 * Math.round(abs(shadow.offsetX) + shadowBlur) * (abs(scaling.scaleX));
        shadowOffset.y = 2 * Math.round(abs(shadow.offsetY) + shadowBlur) * (abs(scaling.scaleY));
      }
      width = boundingRect.width + shadowOffset.x;
      height = boundingRect.height + shadowOffset.y;
      // if the current width/height is not an integer
      // we need to make it so.
      el.width = Math.ceil(width);
      el.height = Math.ceil(height);
      var canvas = new fabric.StaticCanvas(el, {
        enableRetinaScaling: false,
        renderOnAddRemove: false,
        skipOffscreen: false,
      });
      if (options.format === 'jpeg') {
        canvas.backgroundColor = '#fff';
      }
      this.setPositionByOrigin(new fabric.Point(canvas.width / 2, canvas.height / 2), 'center', 'center');

      var originalCanvas = this.canvas;
      canvas.add(this);
      var canvasEl = canvas.toCanvasElement(multiplier || 1, options);
      this.shadow = originalShadow;
      this.set('canvas', originalCanvas);
      if (originalGroup) {
        this.group = originalGroup;
      }
      this.set(origParams).setCoords();
      // canvas.dispose will call image.dispose that will nullify the elements
      // since this canvas is a simple element for the process, we remove references
      // to objects in this way in order to avoid object trashing.
      canvas._objects = [];
      canvas.dispose();
      canvas = null;

      return canvasEl;
    },

    /**
     * Converts an object into a data-url-like string
     * @param {Object} options Options object
     * @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
     * @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
     * @param {Number} [options.multiplier=1] Multiplier to scale by
     * @param {Number} [options.left] Cropping left offset. Introduced in v1.2.14
     * @param {Number} [options.top] Cropping top offset. Introduced in v1.2.14
     * @param {Number} [options.width] Cropping width. Introduced in v1.2.14
     * @param {Number} [options.height] Cropping height. Introduced in v1.2.14
     * @param {Boolean} [options.enableRetinaScaling] Enable retina scaling for clone image. Introduce in 1.6.4
     * @param {Boolean} [options.withoutTransform] Remove current object transform ( no scale , no angle, no flip, no skew ). Introduced in 2.3.4
     * @param {Boolean} [options.withoutShadow] Remove current object shadow. Introduced in 2.4.2
     * @return {String} Returns a data: URL containing a representation of the object in the format specified by options.format
     */
    toDataURL: function(options) {
      options || (options = { });
      return fabric.util.toDataURL(this.toCanvasElement(options), options.format || 'png', options.quality || 1);
    },

    /**
     * Returns true if specified type is identical to the type of an instance
     * @param {String} type Type to check against
     * @return {Boolean}
     */
    isType: function(type) {
      return this.type === type;
    },

    /**
     * Returns complexity of an instance
     * @return {Number} complexity of this instance (is 1 unless subclassed)
     */
    complexity: function() {
      return 1;
    },

    /**
     * Returns a JSON representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} JSON
     */
    toJSON: function(propertiesToInclude) {
      // delegate, not alias
      return this.toObject(propertiesToInclude);
    },

    /**
     * Sets "angle" of an instance with centered rotation
     * @param {Number} angle Angle value (in degrees)
     * @return {fabric.Object} thisArg
     * @chainable
     */
    rotate: function(angle) {
      var shouldCenterOrigin = (this.originX !== 'center' || this.originY !== 'center') && this.centeredRotation;

      if (shouldCenterOrigin) {
        this._setOriginToCenter();
      }

      this.set('angle', angle);

      if (shouldCenterOrigin) {
        this._resetOrigin();
      }

      return this;
    },

    /**
     * Centers object horizontally on canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    centerH: function () {
      this.canvas && this.canvas.centerObjectH(this);
      return this;
    },

    /**
     * Centers object horizontally on current viewport of canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    viewportCenterH: function () {
      this.canvas && this.canvas.viewportCenterObjectH(this);
      return this;
    },

    /**
     * Centers object vertically on canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    centerV: function () {
      this.canvas && this.canvas.centerObjectV(this);
      return this;
    },

    /**
     * Centers object vertically on current viewport of canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    viewportCenterV: function () {
      this.canvas && this.canvas.viewportCenterObjectV(this);
      return this;
    },

    /**
     * Centers object vertically and horizontally on canvas to which is was added last
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    center: function () {
      this.canvas && this.canvas.centerObject(this);
      return this;
    },

    /**
     * Centers object on current viewport of canvas to which it was added last.
     * You might need to call `setCoords` on an object after centering, to update controls area.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    viewportCenter: function () {
      this.canvas && this.canvas.viewportCenterObject(this);
      return this;
    },

    /**
     * Returns coordinates of a pointer relative to an object
     * @param {Event} e Event to operate upon
     * @param {Object} [pointer] Pointer to operate upon (instead of event)
     * @return {Object} Coordinates of a pointer (x, y)
     */
    getLocalPointer: function(e, pointer) {
      pointer = pointer || this.canvas.getPointer(e);
      var pClicked = new fabric.Point(pointer.x, pointer.y),
          objectLeftTop = this._getLeftTopCoords();
      if (this.angle) {
        pClicked = fabric.util.rotatePoint(
          pClicked, objectLeftTop, degreesToRadians(-this.angle));
      }
      return {
        x: pClicked.x - objectLeftTop.x,
        y: pClicked.y - objectLeftTop.y
      };
    },

    /**
     * Sets canvas globalCompositeOperation for specific object
     * custom composition operation for the particular object can be specified using globalCompositeOperation property
     * @param {CanvasRenderingContext2D} ctx Rendering canvas context
     */
    _setupCompositeOperation: function (ctx) {
      if (this.globalCompositeOperation) {
        ctx.globalCompositeOperation = this.globalCompositeOperation;
      }
    }
  });

  fabric.util.createAccessors && fabric.util.createAccessors(fabric.Object);

  extend(fabric.Object.prototype, fabric.Observable);

  /**
   * Defines the number of fraction digits to use when serializing object values.
   * You can use it to increase/decrease precision of such values like left, top, scaleX, scaleY, etc.
   * @static
   * @memberOf fabric.Object
   * @constant
   * @type Number
   */
  fabric.Object.NUM_FRACTION_DIGITS = 2;

  fabric.Object._fromObject = function(className, object, callback, extraParam) {
    var klass = fabric[className];
    object = clone(object, true);
    fabric.util.enlivenPatterns([object.fill, object.stroke], function(patterns) {
      if (typeof patterns[0] !== 'undefined') {
        object.fill = patterns[0];
      }
      if (typeof patterns[1] !== 'undefined') {
        object.stroke = patterns[1];
      }
      fabric.util.enlivenObjects([object.clipPath], function(enlivedProps) {
        object.clipPath = enlivedProps[0];
        var instance = extraParam ? new klass(object[extraParam], object) : new klass(object);
        callback && callback(instance);
      });
    });
  };

  /**
   * Unique id used internally when creating SVG elements
   * @static
   * @memberOf fabric.Object
   * @type Number
   */
  fabric.Object.__uid = 0;
})(typeof exports !== 'undefined' ? exports : this);
