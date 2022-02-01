/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape component
 */
import { extend } from 'tui-code-snippet';
import { fabric } from 'fabric';
import Component from '@/interface/component';
import resizeHelper from '@/helper/shapeResizeHelper';
import {
  getFillImageFromShape,
  rePositionFilterTypeFillImage,
  reMakePatternImageSource,
  makeFillPatternForFilter,
  makeFilterOptionFromFabricImage,
  resetFillPatternCanvas,
} from '@/helper/shapeFilterFillHelper';
import {
  changeOrigin,
  getCustomProperty,
  getFillTypeFromOption,
  getFillTypeFromObject,
  isShape,
} from '@/util';
import {
  rejectMessages,
  eventNames,
  keyCodes as KEY_CODES,
  componentNames,
  fObjectOptions,
  SHAPE_DEFAULT_OPTIONS,
  SHAPE_FILL_TYPE,
} from '@/consts';

const SHAPE_INIT_OPTIONS = extend(
  {
    strokeWidth: 1,
    stroke: '#000000',
    fill: '#ffffff',
    width: 1,
    height: 1,
    rx: 0,
    ry: 0,
  },
  SHAPE_DEFAULT_OPTIONS
);
const DEFAULT_TYPE = 'rect';
const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;

/**
 * Make fill option
 * @param {Object} options - Options to create the shape
 * @param {Object.Image} canvasImage - canvas background image
 * @param {Function} createStaticCanvas - static canvas creater
 * @returns {Object} - shape option
 * @private
 */
function makeFabricFillOption(options, canvasImage, createStaticCanvas) {
  const fillOption = options.fill;
  const fillType = getFillTypeFromOption(options.fill);
  let fill = fillOption;

  if (fillOption.color) {
    fill = fillOption.color;
  }

  let extOption = null;
  if (fillType === 'filter') {
    const newStaticCanvas = createStaticCanvas();
    extOption = makeFillPatternForFilter(canvasImage, fillOption.filter, newStaticCanvas);
  } else {
    extOption = { fill };
  }

  return extend({}, options, extOption);
}

/**
 * Shape
 * @class Shape
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
export default class Shape extends Component {
  constructor(graphics) {
    super(componentNames.SHAPE, graphics);

    /**
     * Object of The drawing shape
     * @type {fabric.Object}
     * @private
     */
    this._shapeObj = null;

    /**
     * Type of the drawing shape
     * @type {string}
     * @private
     */
    this._type = DEFAULT_TYPE;

    /**
     * Options to draw the shape
     * @type {Object}
     * @private
     */
    this._options = extend({}, SHAPE_INIT_OPTIONS);

    /**
     * Whether the shape object is selected or not
     * @type {boolean}
     * @private
     */
    this._isSelected = false;

    /**
     * Pointer for drawing shape (x, y)
     * @type {Object}
     * @private
     */
    this._startPoint = {};

    /**
     * Using shortcut on drawing shape
     * @type {boolean}
     * @private
     */
    this._withShiftKey = false;

    /**
     * Event handler list
     * @type {Object}
     * @private
     */
    this._handlers = {
      mousedown: this._onFabricMouseDown.bind(this),
      mousemove: this._onFabricMouseMove.bind(this),
      mouseup: this._onFabricMouseUp.bind(this),
      keydown: this._onKeyDown.bind(this),
      keyup: this._onKeyUp.bind(this),
    };
  }

  /**
   * Start to draw the shape on canvas
   * @ignore
   */
  start() {
    const canvas = this.getCanvas();

    this._isSelected = false;

    canvas.defaultCursor = 'crosshair';
    canvas.selection = false;
    canvas.uniformScaling = true;
    canvas.on({
      'mouse:down': this._handlers.mousedown,
    });

    fabric.util.addListener(document, 'keydown', this._handlers.keydown);
    fabric.util.addListener(document, 'keyup', this._handlers.keyup);
  }

  /**
   * End to draw the shape on canvas
   * @ignore
   */
  end() {
    const canvas = this.getCanvas();

    this._isSelected = false;

    canvas.defaultCursor = 'default';

    canvas.selection = true;
    canvas.uniformScaling = false;
    canvas.off({
      'mouse:down': this._handlers.mousedown,
    });

    fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
    fabric.util.removeListener(document, 'keyup', this._handlers.keyup);
  }

  /**
   * Set states of the current drawing shape
   * @ignore
   * @param {string} type - Shape type (ex: 'rect', 'circle')
   * @param {Object} [options] - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - {@link ShapeFillOption} or
   *        Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stoke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   */
  setStates(type, options) {
    this._type = type;

    if (options) {
      this._options = extend(this._options, options);
    }
  }

  /**
   * Add the shape
   * @ignore
   * @param {string} type - Shape type (ex: 'rect', 'circle')
   * @param {Object} options - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - ShapeFillOption or Shape foreground color (ex: '#fff', 'transparent') or ShapeFillOption object
   *      @param {string} [options.stroke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
   * @returns {Promise}
   */
  add(type, options) {
    return new Promise((resolve) => {
      const canvas = this.getCanvas();
      const extendOption = this._extendOptions(options);

      const shapeObj = this._createInstance(type, extendOption);
      const objectProperties = this.graphics.createObjectProperties(shapeObj);

      this._bindEventOnShape(shapeObj);

      canvas.add(shapeObj).setActiveObject(shapeObj);

      this._resetPositionFillFilter(shapeObj);

      resolve(objectProperties);
    });
  }

  /**
   * Change the shape
   * @ignore
   * @param {fabric.Object} shapeObj - Selected shape object on canvas
   * @param {Object} options - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - {@link ShapeFillOption} or
   *        Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stroke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
   * @returns {Promise}
   */
  change(shapeObj, options) {
    return new Promise((resolve, reject) => {
      if (!isShape(shapeObj)) {
        reject(rejectMessages.unsupportedType);
      }
      const hasFillOption = getFillTypeFromOption(options.fill) === 'filter';
      const { canvasImage, createStaticCanvas } = this.graphics;

      shapeObj.set(
        hasFillOption ? makeFabricFillOption(options, canvasImage, createStaticCanvas) : options
      );

      if (hasFillOption) {
        this._resetPositionFillFilter(shapeObj);
      }

      this.getCanvas().renderAll();
      resolve();
    });
  }

  /**
   * make fill property for user event
   * @param {fabric.Object} shapeObj - fabric object
   * @returns {Object}
   */
  makeFillPropertyForUserEvent(shapeObj) {
    const fillType = getFillTypeFromObject(shapeObj);
    const fillProp = {};

    if (fillType === SHAPE_FILL_TYPE.FILTER) {
      const fillImage = getFillImageFromShape(shapeObj);
      const filterOption = makeFilterOptionFromFabricImage(fillImage);

      fillProp.type = fillType;
      fillProp.filter = filterOption;
    } else {
      fillProp.type = SHAPE_FILL_TYPE.COLOR;
      fillProp.color = shapeObj.fill || 'transparent';
    }

    return fillProp;
  }

  /**
   * Copy object handling.
   * @param {fabric.Object} shapeObj - Shape object
   * @param {fabric.Object} originalShapeObj - Shape object
   */
  processForCopiedObject(shapeObj, originalShapeObj) {
    this._bindEventOnShape(shapeObj);

    if (getFillTypeFromObject(shapeObj) === 'filter') {
      const fillImage = getFillImageFromShape(originalShapeObj);
      const filterOption = makeFilterOptionFromFabricImage(fillImage);
      const newStaticCanvas = this.graphics.createStaticCanvas();

      shapeObj.set(
        makeFillPatternForFilter(this.graphics.canvasImage, filterOption, newStaticCanvas)
      );
      this._resetPositionFillFilter(shapeObj);
    }
  }

  /**
   * Create the instance of shape
   * @param {string} type - Shape type
   * @param {Object} options - Options to creat the shape
   * @returns {fabric.Object} Shape instance
   * @private
   */
  _createInstance(type, options) {
    let instance;

    switch (type) {
      case 'rect':
        instance = new fabric.Rect(options);
        break;
      case 'circle':
        instance = new fabric.Ellipse(
          extend(
            {
              type: 'circle',
            },
            options
          )
        );
        break;
      case 'triangle':
        instance = new fabric.Triangle(options);
        break;
      default:
        instance = {};
    }

    return instance;
  }

  /**
   * Get the options to create the shape
   * @param {Object} options - Options to creat the shape
   * @returns {Object} Shape options
   * @private
   */
  _extendOptions(options) {
    const selectionStyles = fObjectOptions.SELECTION_STYLE;
    const { canvasImage, createStaticCanvas } = this.graphics;

    options = extend({}, SHAPE_INIT_OPTIONS, this._options, selectionStyles, options);

    return makeFabricFillOption(options, canvasImage, createStaticCanvas);
  }

  /**
   * Bind fabric events on the creating shape object
   * @param {fabric.Object} shapeObj - Shape object
   * @private
   */
  _bindEventOnShape(shapeObj) {
    const self = this;
    const canvas = this.getCanvas();

    shapeObj.on({
      added() {
        self._shapeObj = this;
        resizeHelper.setOrigins(self._shapeObj);
      },
      selected() {
        self._isSelected = true;
        self._shapeObj = this;
        canvas.uniformScaling = true;
        canvas.defaultCursor = 'default';
        resizeHelper.setOrigins(self._shapeObj);
      },
      deselected() {
        self._isSelected = false;
        self._shapeObj = null;
        canvas.defaultCursor = 'crosshair';
        canvas.uniformScaling = false;
      },
      modified() {
        const currentObj = self._shapeObj;

        resizeHelper.adjustOriginToCenter(currentObj);
        resizeHelper.setOrigins(currentObj);
      },
      modifiedInGroup(activeSelection) {
        self._fillFilterRePositionInGroupSelection(shapeObj, activeSelection);
      },
      moving() {
        self._resetPositionFillFilter(this);
      },
      rotating() {
        self._resetPositionFillFilter(this);
      },
      scaling(fEvent) {
        const pointer = canvas.getPointer(fEvent.e);
        const currentObj = self._shapeObj;

        canvas.setCursor('crosshair');
        resizeHelper.resize(currentObj, pointer, true);

        self._resetPositionFillFilter(this);
      },
    });
  }

  /**
   * MouseDown event handler on canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
   * @private
   */
  _onFabricMouseDown(fEvent) {
    if (!fEvent.target) {
      this._isSelected = false;
      this._shapeObj = false;
    }

    if (!this._isSelected && !this._shapeObj) {
      const canvas = this.getCanvas();
      this._startPoint = canvas.getPointer(fEvent.e);

      canvas.on({
        'mouse:move': this._handlers.mousemove,
        'mouse:up': this._handlers.mouseup,
      });
    }
  }

  /**
   * MouseDown event handler on canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
   * @private
   */
  _onFabricMouseMove(fEvent) {
    const canvas = this.getCanvas();
    const pointer = canvas.getPointer(fEvent.e);
    const startPointX = this._startPoint.x;
    const startPointY = this._startPoint.y;
    const width = startPointX - pointer.x;
    const height = startPointY - pointer.y;
    const shape = this._shapeObj;

    if (!shape) {
      this.add(this._type, {
        left: startPointX,
        top: startPointY,
        width,
        height,
      }).then((objectProps) => {
        this.fire(eventNames.ADD_OBJECT, objectProps);
      });
    } else {
      this._shapeObj.set({
        isRegular: this._withShiftKey,
      });

      resizeHelper.resize(shape, pointer);
      canvas.renderAll();

      this._resetPositionFillFilter(shape);
    }
  }

  /**
   * MouseUp event handler on canvas
   * @private
   */
  _onFabricMouseUp() {
    const canvas = this.getCanvas();
    const startPointX = this._startPoint.x;
    const startPointY = this._startPoint.y;
    const shape = this._shapeObj;

    if (!shape) {
      this.add(this._type, {
        left: startPointX,
        top: startPointY,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      }).then((objectProps) => {
        this.fire(eventNames.ADD_OBJECT, objectProps);
      });
    } else if (shape) {
      resizeHelper.adjustOriginToCenter(shape);
      this.fire(eventNames.OBJECT_ADDED, this.graphics.createObjectProperties(shape));
    }

    canvas.off({
      'mouse:move': this._handlers.mousemove,
      'mouse:up': this._handlers.mouseup,
    });
  }

  /**
   * Keydown event handler on document
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  _onKeyDown(e) {
    if (e.keyCode === KEY_CODES.SHIFT) {
      this._withShiftKey = true;

      if (this._shapeObj) {
        this._shapeObj.isRegular = true;
      }
    }
  }

  /**
   * Keyup event handler on document
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  _onKeyUp(e) {
    if (e.keyCode === KEY_CODES.SHIFT) {
      this._withShiftKey = false;

      if (this._shapeObj) {
        this._shapeObj.isRegular = false;
      }
    }
  }

  /**
   * Reset shape position and internal proportions in the filter type fill area.
   * @param {fabric.Object} shapeObj - Shape object
   * @private
   */
  _resetPositionFillFilter(shapeObj) {
    if (getFillTypeFromObject(shapeObj) !== 'filter') {
      return;
    }

    const { patternSourceCanvas } = getCustomProperty(shapeObj, 'patternSourceCanvas');

    const fillImage = getFillImageFromShape(shapeObj);
    const { originalAngle } = getCustomProperty(fillImage, 'originalAngle');

    if (this.graphics.canvasImage.angle !== originalAngle) {
      reMakePatternImageSource(shapeObj, this.graphics.canvasImage);
    }
    const { originX, originY } = shapeObj;

    resizeHelper.adjustOriginToCenter(shapeObj);

    shapeObj.width *= shapeObj.scaleX;
    shapeObj.height *= shapeObj.scaleY;
    shapeObj.rx *= shapeObj.scaleX;
    shapeObj.ry *= shapeObj.scaleY;
    shapeObj.scaleX = 1;
    shapeObj.scaleY = 1;

    rePositionFilterTypeFillImage(shapeObj);

    changeOrigin(shapeObj, {
      originX,
      originY,
    });

    resetFillPatternCanvas(patternSourceCanvas);
  }

  /**
   * Reset filter area position within group selection.
   * @param {fabric.Object} shapeObj - Shape object
   * @param {fabric.ActiveSelection} activeSelection - Shape object
   * @private
   */
  _fillFilterRePositionInGroupSelection(shapeObj, activeSelection) {
    if (activeSelection.scaleX !== 1 || activeSelection.scaleY !== 1) {
      // This is necessary because the group's scale transition state affects the relative size of the fill area.
      // The only way to reset the object transformation scale state to neutral.
      // {@link https://github.com/fabricjs/fabric.js/issues/5372}
      activeSelection.addWithUpdate();
    }

    const { angle, left, top } = shapeObj;

    fabric.util.addTransformToObject(shapeObj, activeSelection.calcTransformMatrix());
    this._resetPositionFillFilter(shapeObj);

    shapeObj.set({
      angle,
      left,
      top,
    });
  }
}
