/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Graphics module
 */
import snippet from 'tui-code-snippet';
import { fabric } from 'fabric';
import ImageLoader from '@/component/imageLoader';
import Cropper from '@/component/cropper';
import Flip from '@/component/flip';
import Rotation from '@/component/rotation';
import FreeDrawing from '@/component/freeDrawing';
import Line from '@/component/line';
import Text from '@/component/text';
import Icon from '@/component/icon';
import Filter from '@/component/filter';
import Shape from '@/component/shape';
import Zoom from '@/component/zoom';
import CropperDrawingMode from '@/drawingMode/cropper';
import FreeDrawingMode from '@/drawingMode/freeDrawing';
import LineDrawingMode from '@/drawingMode/lineDrawing';
import ShapeDrawingMode from '@/drawingMode/shape';
import TextDrawingMode from '@/drawingMode/text';
import IconDrawingMode from '@/drawingMode/icon';
import ZoomDrawingMode from '@/drawingMode/zoom';
import {
  makeSelectionUndoData,
  makeSelectionUndoDatum,
  setCachedUndoDataForDimension,
} from '@/helper/selectionModifyHelper';
import { getProperties, includes, isShape } from '@/util';
import {
  componentNames as components,
  eventNames as events,
  drawingModes,
  fObjectOptions,
} from '@/consts';
import Resize from '@/component/resize';
import ResizeDrawingMode from '@/drawingMode/resize';

const { extend, stamp, isArray, isString, forEachArray, forEachOwnProperties, CustomEvents } =
  snippet;
const DEFAULT_CSS_MAX_WIDTH = 1000;
const DEFAULT_CSS_MAX_HEIGHT = 800;
const EXTRA_PX_FOR_PASTE = 10;

const cssOnly = {
  cssOnly: true,
};
const backstoreOnly = {
  backstoreOnly: true,
};

/**
 * Graphics class
 * @class
 * @param {string|HTMLElement} wrapper - Wrapper's element or selector
 * @param {Object} [option] - Canvas max width & height of css
 *  @param {number} option.cssMaxWidth - Canvas css-max-width
 *  @param {number} option.cssMaxHeight - Canvas css-max-height
 * @ignore
 */
class Graphics {
  constructor(element, { cssMaxWidth, cssMaxHeight } = {}) {
    /**
     * Fabric image instance
     * @type {fabric.Image}
     */
    this.canvasImage = null;

    /**
     * Max width of canvas elements
     * @type {number}
     */
    this.cssMaxWidth = cssMaxWidth || DEFAULT_CSS_MAX_WIDTH;

    /**
     * Max height of canvas elements
     * @type {number}
     */
    this.cssMaxHeight = cssMaxHeight || DEFAULT_CSS_MAX_HEIGHT;

    /**
     * cropper Selection Style
     * @type {Object}
     */
    this.cropSelectionStyle = {};

    /**
     * target fabric object for copy paste feature
     * @type {fabric.Object}
     * @private
     */
    this.targetObjectForCopyPaste = null;

    /**
     * Image name
     * @type {string}
     */
    this.imageName = '';

    /**
     * Object Map
     * @type {Object}
     * @private
     */
    this._objects = {};

    /**
     * Fabric-Canvas instance
     * @type {fabric.Canvas}
     * @private
     */
    this._canvas = null;

    /**
     * Drawing mode
     * @type {string}
     * @private
     */
    this._drawingMode = drawingModes.NORMAL;

    /**
     * DrawingMode map
     * @type {Object.<string, DrawingMode>}
     * @private
     */
    this._drawingModeMap = {};

    /**
     * Component map
     * @type {Object.<string, Component>}
     * @private
     */
    this._componentMap = {};

    /**
     * fabric event handlers
     * @type {Object.<string, function>}
     * @private
     */
    this._handler = {
      onMouseDown: this._onMouseDown.bind(this),
      onObjectAdded: this._onObjectAdded.bind(this),
      onObjectRemoved: this._onObjectRemoved.bind(this),
      onObjectMoved: this._onObjectMoved.bind(this),
      onObjectScaled: this._onObjectScaled.bind(this),
      onObjectModified: this._onObjectModified.bind(this),
      onObjectRotated: this._onObjectRotated.bind(this),
      onObjectSelected: this._onObjectSelected.bind(this),
      onPathCreated: this._onPathCreated.bind(this),
      onSelectionCleared: this._onSelectionCleared.bind(this),
      onSelectionCreated: this._onSelectionCreated.bind(this),
    };

    this._setObjectCachingToFalse();
    this._setCanvasElement(element);
    this._createDrawingModeInstances();
    this._createComponents();
    this._attachCanvasEvents();
    this._attachZoomEvents();
  }

  /**
   * Destroy canvas element
   */
  destroy() {
    const { wrapperEl } = this._canvas;

    this._canvas.clear();

    wrapperEl.parentNode.removeChild(wrapperEl);

    this._detachZoomEvents();
  }

  /**
   * Attach zoom events
   */
  _attachZoomEvents() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.attachKeyboardZoomEvents();
  }

  /**
   * Detach zoom events
   */
  _detachZoomEvents() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.detachKeyboardZoomEvents();
  }

  /**
   * Deactivates all objects on canvas
   * @returns {Graphics} this
   */
  deactivateAll() {
    this._canvas.discardActiveObject();

    return this;
  }

  /**
   * Renders all objects on canvas
   * @returns {Graphics} this
   */
  renderAll() {
    this._canvas.renderAll();

    return this;
  }

  /**
   * Adds objects on canvas
   * @param {Object|Array} objects - objects
   */
  add(objects) {
    let theArgs = [];
    if (isArray(objects)) {
      theArgs = objects;
    } else {
      theArgs.push(objects);
    }

    this._canvas.add(...theArgs);
  }

  /**
   * Removes the object or group
   * @param {Object} target - graphics object or group
   * @returns {boolean} true if contains or false
   */
  contains(target) {
    return this._canvas.contains(target);
  }

  /**
   * Gets all objects or group
   * @returns {Array} all objects, shallow copy
   */
  getObjects() {
    return this._canvas.getObjects().slice();
  }

  /**
   * Get an object by id
   * @param {number} id - object id
   * @returns {fabric.Object} object corresponding id
   */
  getObject(id) {
    return this._objects[id];
  }

  /**
   * Removes the object or group
   * @param {Object} target - graphics object or group
   */
  remove(target) {
    this._canvas.remove(target);
  }

  /**
   * Removes all object or group
   * @param {boolean} includesBackground - remove the background image or not
   * @returns {Array} all objects array which is removed
   */
  removeAll(includesBackground) {
    const canvas = this._canvas;
    const objects = canvas.getObjects().slice();
    canvas.remove(...this._canvas.getObjects());

    if (includesBackground) {
      canvas.clear();
    }

    return objects;
  }

  /**
   * Removes an object or group by id
   * @param {number} id - object id
   * @returns {Array} removed objects
   */
  removeObjectById(id) {
    const objects = [];
    const canvas = this._canvas;
    const target = this.getObject(id);
    const isValidGroup = target && target.isType('group') && !target.isEmpty();

    if (isValidGroup) {
      canvas.discardActiveObject(); // restore states for each objects
      target.forEachObject((obj) => {
        objects.push(obj);
        canvas.remove(obj);
      });
    } else if (canvas.contains(target)) {
      objects.push(target);
      canvas.remove(target);
    }

    return objects;
  }

  /**
   * Get an id by object instance
   * @param {fabric.Object} object object
   * @returns {number} object id if it exists or null
   */
  getObjectId(object) {
    let key = null;
    for (key in this._objects) {
      if (this._objects.hasOwnProperty(key)) {
        if (object === this._objects[key]) {
          return key;
        }
      }
    }

    return null;
  }

  /**
   * Gets an active object or group
   * @returns {Object} active object or group instance
   */
  getActiveObject() {
    return this._canvas._activeObject;
  }

  /**
   * Returns the object ID to delete the object.
   * @returns {number} object id for remove
   */
  getActiveObjectIdForRemove() {
    const activeObject = this.getActiveObject();
    const { type, left, top } = activeObject;
    const isSelection = type === 'activeSelection';

    if (isSelection) {
      const group = new fabric.Group([...activeObject.getObjects()], {
        left,
        top,
      });

      return this._addFabricObject(group);
    }

    return this.getObjectId(activeObject);
  }

  /**
   * Verify that you are ready to erase the object.
   * @returns {boolean} ready for object remove
   */
  isReadyRemoveObject() {
    const activeObject = this.getActiveObject();

    return activeObject && !activeObject.isEditing;
  }

  /**
   * Gets an active group object
   * @returns {Object} active group object instance
   */
  getActiveObjects() {
    const activeObject = this._canvas._activeObject;

    return activeObject && activeObject.type === 'activeSelection' ? activeObject : null;
  }

  /**
   * Get Active object Selection from object ids
   * @param {Array.<Object>} objects - fabric objects
   * @returns {Object} target - target object group
   */
  getActiveSelectionFromObjects(objects) {
    const canvas = this.getCanvas();

    return new fabric.ActiveSelection(objects, { canvas });
  }

  /**
   * Activates an object or group
   * @param {Object} target - target object or group
   */
  setActiveObject(target) {
    this._canvas.setActiveObject(target);
  }

  /**
   * Set Crop selection style
   * @param {Object} style - Selection styles
   */
  setCropSelectionStyle(style) {
    this.cropSelectionStyle = style;
  }

  /**
   * Get component
   * @param {string} name - Component name
   * @returns {Component}
   */
  getComponent(name) {
    return this._componentMap[name];
  }

  /**
   * Get current drawing mode
   * @returns {string}
   */
  getDrawingMode() {
    return this._drawingMode;
  }

  /**
   * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
   * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE', 'TEXT', 'SHAPE'</I>
   * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
   *  @param {Number} [option.width] brush width
   *  @param {String} [option.color] brush color
   * @returns {boolean} true if success or false
   */
  startDrawingMode(mode, option) {
    if (this._isSameDrawingMode(mode)) {
      return true;
    }

    // If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
    this.stopDrawingMode();

    const drawingModeInstance = this._getDrawingModeInstance(mode);
    if (drawingModeInstance && drawingModeInstance.start) {
      drawingModeInstance.start(this, option);

      this._drawingMode = mode;
    }

    return !!drawingModeInstance;
  }

  /**
   * Stop the current drawing mode and back to the 'NORMAL' mode
   */
  stopDrawingMode() {
    if (this._isSameDrawingMode(drawingModes.NORMAL)) {
      return;
    }

    const drawingModeInstance = this._getDrawingModeInstance(this.getDrawingMode());
    if (drawingModeInstance && drawingModeInstance.end) {
      drawingModeInstance.end(this);
    }
    this._drawingMode = drawingModes.NORMAL;
  }

  /**
   * Change zoom of canvas
   * @param {{x: number, y: number}} center - center of zoom
   * @param {number} zoomLevel - zoom level
   */
  zoom({ x, y }, zoomLevel) {
    const zoom = this.getComponent(components.ZOOM);

    zoom.zoom({ x, y }, zoomLevel);
  }

  /**
   * Get zoom mode
   * @returns {string}
   */
  getZoomMode() {
    const zoom = this.getComponent(components.ZOOM);

    return zoom.mode;
  }

  /**
   * Start zoom-in mode
   */
  startZoomInMode() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.startZoomInMode();
  }

  /**
   * Stop zoom-in mode
   */
  endZoomInMode() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.endZoomInMode();
  }

  /**
   * Zoom out one step
   */
  zoomOut() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.zoomOut();
  }

  /**
   * Start hand mode
   */
  startHandMode() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.startHandMode();
  }

  /**
   * Stop hand mode
   */
  endHandMode() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.endHandMode();
  }

  /**
   * Zoom reset
   */
  resetZoom() {
    const zoom = this.getComponent(components.ZOOM);

    zoom.resetZoom();
  }

  /**
   * To data url from canvas
   * @param {Object} options - options for toDataURL
   *   @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
   *   @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
   *   @param {Number} [options.multiplier=1] Multiplier to scale by
   *   @param {Number} [options.left] Cropping left offset. Introduced in fabric v1.2.14
   *   @param {Number} [options.top] Cropping top offset. Introduced in fabric v1.2.14
   *   @param {Number} [options.width] Cropping width. Introduced in fabric v1.2.14
   *   @param {Number} [options.height] Cropping height. Introduced in fabric v1.2.14
   * @returns {string} A DOMString containing the requested data URI.
   */
  toDataURL(options) {
    const cropper = this.getComponent(components.CROPPER);
    cropper.changeVisibility(false);

    const dataUrl = this._canvas && this._canvas.toDataURL(options);
    cropper.changeVisibility(true);

    return dataUrl;
  }

  /**
   * Save image(background) of canvas
   * @param {string} name - Name of image
   * @param {?fabric.Image} canvasImage - Fabric image instance
   */
  setCanvasImage(name, canvasImage) {
    if (canvasImage) {
      stamp(canvasImage);
    }
    this.imageName = name;
    this.canvasImage = canvasImage;
  }

  /**
   * Set css max dimension
   * @param {{width: number, height: number}} maxDimension - Max width & Max height
   */
  setCssMaxDimension(maxDimension) {
    this.cssMaxWidth = maxDimension.width || this.cssMaxWidth;
    this.cssMaxHeight = maxDimension.height || this.cssMaxHeight;
  }

  /**
   * Adjust canvas dimension with scaling image
   */
  adjustCanvasDimension() {
    this.adjustCanvasDimensionBase(this.canvasImage.scale(1));
  }

  adjustCanvasDimensionBase(canvasImage = null) {
    if (!canvasImage) {
      canvasImage = this.canvasImage;
    }

    const { width, height } = canvasImage.getBoundingRect();
    const maxDimension = this._calcMaxDimension(width, height);

    this.setCanvasCssDimension({
      width: '100%',
      height: '100%', // Set height '' for IE9
      'max-width': `${maxDimension.width}px`,
      'max-height': `${maxDimension.height}px`,
    });

    this.setCanvasBackstoreDimension({
      width,
      height,
    });
    this._canvas.centerObject(canvasImage);
  }

  /**
   * Set canvas dimension - css only
   *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
   * @param {Object} dimension - Canvas css dimension
   */
  setCanvasCssDimension(dimension) {
    this._canvas.setDimensions(dimension, cssOnly);
  }

  /**
   * Set canvas dimension - backstore only
   *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
   * @param {Object} dimension - Canvas backstore dimension
   */
  setCanvasBackstoreDimension(dimension) {
    this._canvas.setDimensions(dimension, backstoreOnly);
  }

  /**
   * Set image properties
   * {@link http://fabricjs.com/docs/fabric.Image.html#set}
   * @param {Object} setting - Image properties
   * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
   */
  setImageProperties(setting, withRendering) {
    const { canvasImage } = this;

    if (!canvasImage) {
      return;
    }

    canvasImage.set(setting).setCoords();
    if (withRendering) {
      this._canvas.renderAll();
    }
  }

  /**
   * Returns canvas element of fabric.Canvas[[lower-canvas]]
   * @returns {HTMLCanvasElement}
   */
  getCanvasElement() {
    return this._canvas.getElement();
  }

  /**
   * Get fabric.Canvas instance
   * @returns {fabric.Canvas}
   */
  getCanvas() {
    return this._canvas;
  }

  /**
   * Get canvasImage (fabric.Image instance)
   * @returns {fabric.Image}
   */
  getCanvasImage() {
    return this.canvasImage;
  }

  /**
   * Get image name
   * @returns {string}
   */
  getImageName() {
    return this.imageName;
  }

  /**
   * Add image object on canvas
   * @param {string} imgUrl - Image url to make object
   * @returns {Promise}
   */
  addImageObject(imgUrl) {
    const callback = this._callbackAfterLoadingImageObject.bind(this);

    return new Promise((resolve) => {
      fabric.Image.fromURL(
        imgUrl,
        (image) => {
          callback(image);
          resolve(this.createObjectProperties(image));
        },
        {
          crossOrigin: 'Anonymous',
        }
      );
    });
  }

  /**
   * Get center position of canvas
   * @returns {Object} {left, top}
   */
  getCenter() {
    return this._canvas.getCenter();
  }

  /**
   * Get cropped rect
   * @returns {Object} rect
   */
  getCropzoneRect() {
    return this.getComponent(components.CROPPER).getCropzoneRect();
  }

  /**
   * Get cropped rect
   * @param {number} [mode] cropzone rect mode
   */
  setCropzoneRect(mode) {
    this.getComponent(components.CROPPER).setCropzoneRect(mode);
  }

  /**
   * Get cropped image data
   * @param {Object} cropRect cropzone rect
   *  @param {Number} cropRect.left left position
   *  @param {Number} cropRect.top top position
   *  @param {Number} cropRect.width width
   *  @param {Number} cropRect.height height
   * @returns {?{imageName: string, url: string}} cropped Image data
   */
  getCroppedImageData(cropRect) {
    return this.getComponent(components.CROPPER).getCroppedImageData(cropRect);
  }

  /**
   * Set brush option
   * @param {Object} option brush option
   *  @param {Number} option.width width
   *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
   */
  setBrush(option) {
    const drawingMode = this._drawingMode;
    let compName = components.FREE_DRAWING;

    if (drawingMode === drawingModes.LINE_DRAWING) {
      compName = components.LINE;
    }

    this.getComponent(compName).setBrush(option);
  }

  /**
   * Set states of current drawing shape
   * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
   * @param {Object} [options] - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - {@link ShapeFillOption} or
   *        Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stoke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
   */
  setDrawingShape(type, options) {
    this.getComponent(components.SHAPE).setStates(type, options);
  }

  /**
   * Set style of current drawing icon
   * @param {string} type - icon type (ex: 'icon-arrow', 'icon-star')
   * @param {Object} [iconColor] - Icon color
   */
  setIconStyle(type, iconColor) {
    this.getComponent(components.ICON).setStates(type, iconColor);
  }

  /**
   * Register icon paths
   * @param {Object} pathInfos - Path infos
   *  @param {string} pathInfos.key - key
   *  @param {string} pathInfos.value - value
   */
  registerPaths(pathInfos) {
    this.getComponent(components.ICON).registerPaths(pathInfos);
  }

  /**
   * Change cursor style
   * @param {string} cursorType - cursor type
   */
  changeCursor(cursorType) {
    const canvas = this.getCanvas();
    canvas.defaultCursor = cursorType;
    canvas.renderAll();
  }

  /**
   * Whether it has the filter or not
   * @param {string} type - Filter type
   * @returns {boolean} true if it has the filter
   */
  hasFilter(type) {
    return this.getComponent(components.FILTER).hasFilter(type);
  }

  /**
   * Set selection style of fabric object by init option
   * @param {Object} styles - Selection styles
   */
  setSelectionStyle(styles) {
    extend(fObjectOptions.SELECTION_STYLE, styles);
  }

  /**
   * Set object properties
   * @param {number} id - object id
   * @param {Object} props - props
   *     @param {string} [props.fill] Color
   *     @param {string} [props.fontFamily] Font type for text
   *     @param {number} [props.fontSize] Size
   *     @param {string} [props.fontStyle] Type of inclination (normal / italic)
   *     @param {string} [props.fontWeight] Type of thicker or thinner looking (normal / bold)
   *     @param {string} [props.textAlign] Type of text align (left / center / right)
   *     @param {string} [props.textDecoration] Type of line (underline / line-through / overline)
   * @returns {Object} applied properties
   */
  setObjectProperties(id, props) {
    const object = this.getObject(id);
    const clone = extend({}, props);

    object.set(clone);

    object.setCoords();

    this.getCanvas().renderAll();

    return clone;
  }

  /**
   * Get object properties corresponding key
   * @param {number} id - object id
   * @param {Array<string>|ObjectProps|string} keys - property's key
   * @returns {Object} properties
   */
  getObjectProperties(id, keys) {
    const object = this.getObject(id);
    const props = {};

    if (isString(keys)) {
      props[keys] = object[keys];
    } else if (isArray(keys)) {
      forEachArray(keys, (value) => {
        props[value] = object[value];
      });
    } else {
      forEachOwnProperties(keys, (value, key) => {
        props[key] = object[key];
      });
    }

    return props;
  }

  /**
   * Get object position by originX, originY
   * @param {number} id - object id
   * @param {string} originX - can be 'left', 'center', 'right'
   * @param {string} originY - can be 'top', 'center', 'bottom'
   * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
   */
  getObjectPosition(id, originX, originY) {
    const targetObj = this.getObject(id);
    if (!targetObj) {
      return null;
    }

    return targetObj.getPointByOrigin(originX, originY);
  }

  /**
   * Set object position  by originX, originY
   * @param {number} id - object id
   * @param {Object} posInfo - position object
   *  @param {number} posInfo.x - x position
   *  @param {number} posInfo.y - y position
   *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
   *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
   * @returns {boolean} true if target id is valid or false
   */
  setObjectPosition(id, posInfo) {
    const targetObj = this.getObject(id);
    const { x, y, originX, originY } = posInfo;
    if (!targetObj) {
      return false;
    }

    const targetOrigin = targetObj.getPointByOrigin(originX, originY);
    const centerOrigin = targetObj.getPointByOrigin('center', 'center');
    const diffX = centerOrigin.x - targetOrigin.x;
    const diffY = centerOrigin.y - targetOrigin.y;

    targetObj.set({
      left: x + diffX,
      top: y + diffY,
    });

    targetObj.setCoords();

    return true;
  }

  /**
   * Get the canvas size
   * @returns {Object} {{width: number, height: number}} image size
   */
  getCanvasSize() {
    const image = this.getCanvasImage();

    return {
      width: image ? image.width : 0,
      height: image ? image.height : 0,
    };
  }

  /**
   * Create fabric static canvas
   * @returns {Object} {{width: number, height: number}} image size
   */
  createStaticCanvas() {
    const staticCanvas = new fabric.StaticCanvas();

    staticCanvas.set({
      enableRetinaScaling: false,
    });

    return staticCanvas;
  }

  /**
   * Get a DrawingMode instance
   * @param {string} modeName - DrawingMode Class Name
   * @returns {DrawingMode} DrawingMode instance
   * @private
   */
  _getDrawingModeInstance(modeName) {
    return this._drawingModeMap[modeName];
  }

  /**
   * Set object caching to false. This brought many bugs when draw Shape & cropzone
   * @see http://fabricjs.com/fabric-object-caching
   * @private
   */
  _setObjectCachingToFalse() {
    fabric.Object.prototype.objectCaching = false;
  }

  /**
   * Set canvas element to fabric.Canvas
   * @param {Element|string} element - Wrapper or canvas element or selector
   * @private
   */
  _setCanvasElement(element) {
    let selectedElement;
    let canvasElement;

    if (element.nodeType) {
      selectedElement = element;
    } else {
      selectedElement = document.querySelector(element);
    }

    if (selectedElement.nodeName.toUpperCase() !== 'CANVAS') {
      canvasElement = document.createElement('canvas');
      selectedElement.appendChild(canvasElement);
    }

    this._canvas = new fabric.Canvas(canvasElement, {
      containerClass: 'tui-image-editor-canvas-container',
      enableRetinaScaling: false,
    });
  }

  /**
   * Creates DrawingMode instances
   * @private
   */
  _createDrawingModeInstances() {
    this._register(this._drawingModeMap, new CropperDrawingMode());
    this._register(this._drawingModeMap, new FreeDrawingMode());
    this._register(this._drawingModeMap, new LineDrawingMode());
    this._register(this._drawingModeMap, new ShapeDrawingMode());
    this._register(this._drawingModeMap, new TextDrawingMode());
    this._register(this._drawingModeMap, new IconDrawingMode());
    this._register(this._drawingModeMap, new ZoomDrawingMode());
    this._register(this._drawingModeMap, new ResizeDrawingMode());
  }

  /**
   * Create components
   * @private
   */
  _createComponents() {
    this._register(this._componentMap, new ImageLoader(this));
    this._register(this._componentMap, new Cropper(this));
    this._register(this._componentMap, new Flip(this));
    this._register(this._componentMap, new Rotation(this));
    this._register(this._componentMap, new FreeDrawing(this));
    this._register(this._componentMap, new Line(this));
    this._register(this._componentMap, new Text(this));
    this._register(this._componentMap, new Icon(this));
    this._register(this._componentMap, new Filter(this));
    this._register(this._componentMap, new Shape(this));
    this._register(this._componentMap, new Zoom(this));
    this._register(this._componentMap, new Resize(this));
  }

  /**
   * Register component
   * @param {Object} map - map object
   * @param {Object} module - module which has getName method
   * @private
   */
  _register(map, module) {
    map[module.getName()] = module;
  }

  /**
   * Get the current drawing mode is same with given mode
   * @param {string} mode drawing mode
   * @returns {boolean} true if same or false
   */
  _isSameDrawingMode(mode) {
    return this.getDrawingMode() === mode;
  }

  /**
   * Calculate max dimension of canvas
   * The css-max dimension is dynamically decided with maintaining image ratio
   * The css-max dimension is lower than canvas dimension (attribute of canvas, not css)
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @returns {{width: number, height: number}} - Max width & Max height
   * @private
   */
  _calcMaxDimension(width, height) {
    const wScaleFactor = this.cssMaxWidth / width;
    const hScaleFactor = this.cssMaxHeight / height;
    let cssMaxWidth = Math.min(width, this.cssMaxWidth);
    let cssMaxHeight = Math.min(height, this.cssMaxHeight);

    if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
      cssMaxWidth = width * wScaleFactor;
      cssMaxHeight = height * wScaleFactor;
    } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
      cssMaxWidth = width * hScaleFactor;
      cssMaxHeight = height * hScaleFactor;
    }

    return {
      width: Math.floor(cssMaxWidth),
      height: Math.floor(cssMaxHeight),
    };
  }

  /**
   * Callback function after loading image
   * @param {fabric.Image} obj - Fabric image object
   * @private
   */
  _callbackAfterLoadingImageObject(obj) {
    const centerPos = this.getCanvasImage().getCenterPoint();

    obj.set(fObjectOptions.SELECTION_STYLE);
    obj.set({
      left: centerPos.x,
      top: centerPos.y,
      crossOrigin: 'Anonymous',
    });

    this.getCanvas().add(obj).setActiveObject(obj);
  }

  /**
   * Attach canvas's events
   */
  _attachCanvasEvents() {
    const canvas = this._canvas;
    const handler = this._handler;
    canvas.on({
      'mouse:down': handler.onMouseDown,
      'object:added': handler.onObjectAdded,
      'object:removed': handler.onObjectRemoved,
      'object:moving': handler.onObjectMoved,
      'object:scaling': handler.onObjectScaled,
      'object:modified': handler.onObjectModified,
      'object:rotating': handler.onObjectRotated,
      'path:created': handler.onPathCreated,
      'selection:cleared': handler.onSelectionCleared,
      'selection:created': handler.onSelectionCreated,
      'selection:updated': handler.onObjectSelected,
    });
  }

  /**
   * "mouse:down" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onMouseDown(fEvent) {
    const { e: event, target } = fEvent;
    const originPointer = this._canvas.getPointer(event);

    if (target) {
      const { type } = target;
      const undoData = makeSelectionUndoData(target, (item) =>
        makeSelectionUndoDatum(this.getObjectId(item), item, type === 'activeSelection')
      );

      setCachedUndoDataForDimension(undoData);
    }

    this.fire(events.MOUSE_DOWN, event, originPointer);
  }

  /**
   * "object:added" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectAdded(fEvent) {
    const obj = fEvent.target;
    if (obj.isType('cropzone')) {
      return;
    }

    this._addFabricObject(obj);
  }

  /**
   * "object:removed" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectRemoved(fEvent) {
    const obj = fEvent.target;

    this._removeFabricObject(stamp(obj));
  }

  /**
   * "object:moving" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectMoved(fEvent) {
    this._lazyFire(
      events.OBJECT_MOVED,
      (object) => this.createObjectProperties(object),
      fEvent.target
    );
  }

  /**
   * "object:scaling" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectScaled(fEvent) {
    this._lazyFire(
      events.OBJECT_SCALED,
      (object) => this.createObjectProperties(object),
      fEvent.target
    );
  }

  /**
   * "object:modified" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectModified(fEvent) {
    const { target } = fEvent;
    if (target.type === 'activeSelection') {
      const items = target.getObjects();

      items.forEach((item) => item.fire('modifiedInGroup', target));
    }

    this.fire(events.OBJECT_MODIFIED, target, this.getObjectId(target));
  }

  /**
   * "object:rotating" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectRotated(fEvent) {
    this._lazyFire(
      events.OBJECT_ROTATED,
      (object) => this.createObjectProperties(object),
      fEvent.target
    );
  }

  /**
   * Lazy event emitter
   * @param {string} eventName - event name
   * @param {Function} paramsMaker - make param function
   * @param {Object} [target] - Object of the event owner.
   * @private
   */
  _lazyFire(eventName, paramsMaker, target) {
    const existEventDelegation = target && target.canvasEventDelegation;
    const delegationState = existEventDelegation ? target.canvasEventDelegation(eventName) : 'none';

    if (delegationState === 'unregistered') {
      target.canvasEventRegister(eventName, (object) => {
        this.fire(eventName, paramsMaker(object));
      });
    }

    if (delegationState === 'none') {
      this.fire(eventName, paramsMaker(target));
    }
  }

  /**
   * "object:selected" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onObjectSelected(fEvent) {
    const { target } = fEvent;
    const params = this.createObjectProperties(target);

    this.fire(events.OBJECT_ACTIVATED, params);
  }

  /**
   * "path:created" canvas event handler
   * @param {{path: fabric.Path}} obj - Path object
   * @private
   */
  _onPathCreated(obj) {
    const { x: left, y: top } = obj.path.getCenterPoint();
    obj.path.set(
      extend(
        {
          left,
          top,
        },
        fObjectOptions.SELECTION_STYLE
      )
    );

    const params = this.createObjectProperties(obj.path);

    this.fire(events.ADD_OBJECT, params);
  }

  /**
   * "selction:cleared" canvas event handler
   * @private
   */
  _onSelectionCleared() {
    this.fire(events.SELECTION_CLEARED);
  }

  /**
   * "selction:created" canvas event handler
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onSelectionCreated(fEvent) {
    const { target } = fEvent;
    const params = this.createObjectProperties(target);

    this.fire(events.OBJECT_ACTIVATED, params);
    this.fire(events.SELECTION_CREATED, fEvent.target);
  }

  /**
   * Canvas discard selection all
   */
  discardSelection() {
    this._canvas.discardActiveObject();
    this._canvas.renderAll();
  }

  /**
   * Canvas Selectable status change
   * @param {boolean} selectable - expect status
   */
  changeSelectableAll(selectable) {
    this._canvas.forEachObject((obj) => {
      obj.selectable = selectable;
      obj.hoverCursor = selectable ? 'move' : 'crosshair';
    });
  }

  /**
   * Return object's properties
   * @param {fabric.Object} obj - fabric object
   * @returns {Object} properties object
   */
  createObjectProperties(obj) {
    const predefinedKeys = [
      'left',
      'top',
      'width',
      'height',
      'fill',
      'stroke',
      'strokeWidth',
      'opacity',
      'angle',
    ];
    const props = {
      id: stamp(obj),
      type: obj.type,
    };

    extend(props, getProperties(obj, predefinedKeys));

    if (includes(['i-text', 'text'], obj.type)) {
      extend(props, this._createTextProperties(obj, props));
    } else if (includes(['rect', 'triangle', 'circle'], obj.type)) {
      const shapeComp = this.getComponent(components.SHAPE);
      extend(props, {
        fill: shapeComp.makeFillPropertyForUserEvent(obj),
      });
    }

    return props;
  }

  /**
   * Get text object's properties
   * @param {fabric.Object} obj - fabric text object
   * @param {Object} props - properties
   * @returns {Object} properties object
   */
  _createTextProperties(obj) {
    const predefinedKeys = [
      'text',
      'fontFamily',
      'fontSize',
      'fontStyle',
      'textAlign',
      'textDecoration',
      'fontWeight',
    ];
    const props = {};
    extend(props, getProperties(obj, predefinedKeys));

    return props;
  }

  /**
   * Add object array by id
   * @param {fabric.Object} obj - fabric object
   * @returns {number} object id
   */
  _addFabricObject(obj) {
    const id = stamp(obj);
    this._objects[id] = obj;

    return id;
  }

  /**
   * Remove an object in array yb id
   * @param {number} id - object id
   */
  _removeFabricObject(id) {
    delete this._objects[id];
  }

  /**
   * Reset targetObjectForCopyPaste value from activeObject
   */
  resetTargetObjectForCopyPaste() {
    const activeObject = this.getActiveObject();

    if (activeObject) {
      this.targetObjectForCopyPaste = activeObject;
    }
  }

  /**
   * Paste fabric object
   * @returns {Promise}
   */
  pasteObject() {
    if (!this.targetObjectForCopyPaste) {
      return Promise.resolve([]);
    }

    const targetObject = this.targetObjectForCopyPaste;
    const isGroupSelect = targetObject.type === 'activeSelection';
    const targetObjects = isGroupSelect ? targetObject.getObjects() : [targetObject];
    let newTargetObject = null;

    this.discardSelection();

    return this._cloneObject(targetObjects).then((addedObjects) => {
      if (addedObjects.length > 1) {
        newTargetObject = this.getActiveSelectionFromObjects(addedObjects);
      } else {
        [newTargetObject] = addedObjects;
      }
      this.targetObjectForCopyPaste = newTargetObject;
      this.setActiveObject(newTargetObject);
    });
  }

  /**
   * Clone object
   * @param {fabric.Object} targetObjects - fabric object
   * @returns {Promise}
   * @private
   */
  _cloneObject(targetObjects) {
    const addedObjects = snippet.map(targetObjects, (targetObject) =>
      this._cloneObjectItem(targetObject)
    );

    return Promise.all(addedObjects);
  }

  /**
   * Clone object one item
   * @param {fabric.Object} targetObject - fabric object
   * @returns {Promise}
   * @private
   */
  _cloneObjectItem(targetObject) {
    return this._copyFabricObjectForPaste(targetObject).then((clonedObject) => {
      const objectProperties = this.createObjectProperties(clonedObject);
      this.add(clonedObject);

      this.fire(events.ADD_OBJECT, objectProperties);

      return clonedObject;
    });
  }

  /**
   * Copy fabric object with Changed position for copy and paste
   * @param {fabric.Object} targetObject - fabric object
   * @returns {Promise}
   * @private
   */
  _copyFabricObjectForPaste(targetObject) {
    const addExtraPx = (value, isReverse) =>
      isReverse ? value - EXTRA_PX_FOR_PASTE : value + EXTRA_PX_FOR_PASTE;

    return this._copyFabricObject(targetObject).then((clonedObject) => {
      const { left, top, width, height } = clonedObject;
      const { width: canvasWidth, height: canvasHeight } = this.getCanvasSize();
      const rightEdge = left + width / 2;
      const bottomEdge = top + height / 2;

      clonedObject.set(
        snippet.extend(
          {
            left: addExtraPx(left, rightEdge + EXTRA_PX_FOR_PASTE > canvasWidth),
            top: addExtraPx(top, bottomEdge + EXTRA_PX_FOR_PASTE > canvasHeight),
          },
          fObjectOptions.SELECTION_STYLE
        )
      );

      return clonedObject;
    });
  }

  /**
   * Copy fabric object
   * @param {fabric.Object} targetObject - fabric object
   * @returns {Promise}
   * @private
   */
  _copyFabricObject(targetObject) {
    return new Promise((resolve) => {
      targetObject.clone((cloned) => {
        const shapeComp = this.getComponent(components.SHAPE);
        if (isShape(cloned)) {
          shapeComp.processForCopiedObject(cloned, targetObject);
        }

        resolve(cloned);
      });
    });
  }

  /**
   * Get current dimensions
   * @returns {object}
   */
  getCurrentDimensions() {
    const resize = this.getComponent(components.RESIZE);

    return resize.getCurrentDimensions();
  }

  /**
   * Get original dimensions
   * @returns {object}
   */
  getOriginalDimensions() {
    const resize = this.getComponent(components.RESIZE);

    return resize.getOriginalDimensions();
  }

  /**
   * Set original dimensions
   * @param {object} dimensions - Dimensions
   */
  setOriginalDimensions(dimensions) {
    const resize = this.getComponent(components.RESIZE);
    resize.setOriginalDimensions(dimensions);
  }

  /**
   * Resize Image
   * @param {Object} dimensions - Resize dimensions
   * @returns {Promise}
   */
  resize(dimensions) {
    const resize = this.getComponent(components.RESIZE);

    return resize.resize(dimensions);
  }
}

CustomEvents.mixin(Graphics);

export default Graphics;
