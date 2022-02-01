/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Image crop module (start cropping, end cropping)
 */
import snippet from 'tui-code-snippet';
import { fabric } from 'fabric';
import Component from '@/interface/component';
import Cropzone from '@/extension/cropzone';
import { keyCodes, componentNames, CROPZONE_DEFAULT_OPTIONS } from '@/consts';
import { clamp, fixFloatingPoint } from '@/util';

const MOUSE_MOVE_THRESHOLD = 10;
const DEFAULT_OPTION = {
  presetRatio: null,
  top: -10,
  left: -10,
  height: 1,
  width: 1,
};

/**
 * Cropper components
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @class Cropper
 * @ignore
 */
class Cropper extends Component {
  constructor(graphics) {
    super(componentNames.CROPPER, graphics);

    /**
     * Cropzone
     * @type {Cropzone}
     * @private
     */
    this._cropzone = null;

    /**
     * StartX of Cropzone
     * @type {number}
     * @private
     */
    this._startX = null;

    /**
     * StartY of Cropzone
     * @type {number}
     * @private
     */
    this._startY = null;

    /**
     * State whether shortcut key is pressed or not
     * @type {boolean}
     * @private
     */
    this._withShiftKey = false;

    /**
     * Listeners
     * @type {object.<string, function>}
     * @private
     */
    this._listeners = {
      keydown: this._onKeyDown.bind(this),
      keyup: this._onKeyUp.bind(this),
      mousedown: this._onFabricMouseDown.bind(this),
      mousemove: this._onFabricMouseMove.bind(this),
      mouseup: this._onFabricMouseUp.bind(this),
    };
  }

  /**
   * Start cropping
   */
  start() {
    if (this._cropzone) {
      return;
    }
    const canvas = this.getCanvas();

    canvas.forEachObject((obj) => {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = false;
    });

    this._cropzone = new Cropzone(
      canvas,
      snippet.extend(
        {
          left: 0,
          top: 0,
          width: 0.5,
          height: 0.5,
          strokeWidth: 0, // {@link https://github.com/kangax/fabric.js/issues/2860}
          cornerSize: 10,
          cornerColor: 'black',
          fill: 'transparent',
        },
        CROPZONE_DEFAULT_OPTIONS,
        this.graphics.cropSelectionStyle
      )
    );

    canvas.discardActiveObject();
    canvas.add(this._cropzone);
    canvas.on('mouse:down', this._listeners.mousedown);
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';

    fabric.util.addListener(document, 'keydown', this._listeners.keydown);
    fabric.util.addListener(document, 'keyup', this._listeners.keyup);
  }

  /**
   * End cropping
   */
  end() {
    const canvas = this.getCanvas();
    const cropzone = this._cropzone;

    if (!cropzone) {
      return;
    }
    canvas.remove(cropzone);
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.off('mouse:down', this._listeners.mousedown);
    canvas.forEachObject((obj) => {
      obj.evented = true;
    });

    this._cropzone = null;

    fabric.util.removeListener(document, 'keydown', this._listeners.keydown);
    fabric.util.removeListener(document, 'keyup', this._listeners.keyup);
  }

  /**
   * Change cropzone visible
   * @param {boolean} visible - cropzone visible state
   */
  changeVisibility(visible) {
    if (this._cropzone) {
      this._cropzone.set({ visible });
    }
  }

  /**
   * onMousedown handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onFabricMouseDown(fEvent) {
    const canvas = this.getCanvas();

    if (fEvent.target) {
      return;
    }

    canvas.selection = false;
    const coord = canvas.getPointer(fEvent.e);

    this._startX = coord.x;
    this._startY = coord.y;

    canvas.on({
      'mouse:move': this._listeners.mousemove,
      'mouse:up': this._listeners.mouseup,
    });
  }

  /**
   * onMousemove handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onFabricMouseMove(fEvent) {
    const canvas = this.getCanvas();
    const pointer = canvas.getPointer(fEvent.e);
    const { x, y } = pointer;
    const cropzone = this._cropzone;

    if (Math.abs(x - this._startX) + Math.abs(y - this._startY) > MOUSE_MOVE_THRESHOLD) {
      canvas.remove(cropzone);
      cropzone.set(this._calcRectDimensionFromPoint(x, y));

      canvas.add(cropzone);
      canvas.setActiveObject(cropzone);
    }
  }

  /**
   * Get rect dimension setting from Canvas-Mouse-Position(x, y)
   * @param {number} x - Canvas-Mouse-Position x
   * @param {number} y - Canvas-Mouse-Position Y
   * @returns {{left: number, top: number, width: number, height: number}}
   * @private
   */
  _calcRectDimensionFromPoint(x, y) {
    const canvas = this.getCanvas();
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const startX = this._startX;
    const startY = this._startY;
    let left = clamp(x, 0, startX);
    let top = clamp(y, 0, startY);
    let width = clamp(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
    let height = clamp(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

    if (this._withShiftKey) {
      // make fixed ratio cropzone
      if (width > height) {
        height = width;
      } else if (height > width) {
        width = height;
      }

      if (startX >= x) {
        left = startX - width;
      }

      if (startY >= y) {
        top = startY - height;
      }
    }

    return {
      left,
      top,
      width,
      height,
    };
  }

  /**
   * onMouseup handler in fabric canvas
   * @private
   */
  _onFabricMouseUp() {
    const cropzone = this._cropzone;
    const listeners = this._listeners;
    const canvas = this.getCanvas();

    canvas.setActiveObject(cropzone);
    canvas.off({
      'mouse:move': listeners.mousemove,
      'mouse:up': listeners.mouseup,
    });
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
    const canvas = this.getCanvas();
    const containsCropzone = canvas.contains(this._cropzone);
    if (!cropRect) {
      return null;
    }

    if (containsCropzone) {
      canvas.remove(this._cropzone);
    }

    const imageData = {
      imageName: this.getImageName(),
      url: canvas.toDataURL(cropRect),
    };

    if (containsCropzone) {
      canvas.add(this._cropzone);
    }

    return imageData;
  }

  /**
   * Get cropped rect
   * @returns {Object} rect
   */
  getCropzoneRect() {
    const cropzone = this._cropzone;

    if (!cropzone.isValid()) {
      return null;
    }

    return {
      left: cropzone.left,
      top: cropzone.top,
      width: cropzone.width,
      height: cropzone.height,
    };
  }

  /**
   * Set a cropzone square
   * @param {number} [presetRatio] - preset ratio
   */
  setCropzoneRect(presetRatio) {
    const canvas = this.getCanvas();
    const cropzone = this._cropzone;

    canvas.discardActiveObject();
    canvas.selection = false;
    canvas.remove(cropzone);

    cropzone.set(presetRatio ? this._getPresetPropertiesForCropSize(presetRatio) : DEFAULT_OPTION);

    canvas.add(cropzone);
    canvas.selection = true;

    if (presetRatio) {
      canvas.setActiveObject(cropzone);
    }
  }

  /**
   * get a cropzone square info
   * @param {number} presetRatio - preset ratio
   * @returns {{presetRatio: number, left: number, top: number, width: number, height: number}}
   * @private
   */
  _getPresetPropertiesForCropSize(presetRatio) {
    const canvas = this.getCanvas();
    const originalWidth = canvas.getWidth();
    const originalHeight = canvas.getHeight();

    const standardSize = originalWidth >= originalHeight ? originalWidth : originalHeight;
    const getScale = (value, orignalValue) => (value > orignalValue ? orignalValue / value : 1);

    let width = standardSize * presetRatio;
    let height = standardSize;

    const scaleWidth = getScale(width, originalWidth);
    [width, height] = snippet.map([width, height], (sizeValue) => sizeValue * scaleWidth);

    const scaleHeight = getScale(height, originalHeight);
    [width, height] = snippet.map([width, height], (sizeValue) =>
      fixFloatingPoint(sizeValue * scaleHeight)
    );

    return {
      presetRatio,
      top: (originalHeight - height) / 2,
      left: (originalWidth - width) / 2,
      width,
      height,
    };
  }

  /**
   * Keydown event handler
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  _onKeyDown(e) {
    if (e.keyCode === keyCodes.SHIFT) {
      this._withShiftKey = true;
    }
  }

  /**
   * Keyup event handler
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  _onKeyUp(e) {
    if (e.keyCode === keyCodes.SHIFT) {
      this._withShiftKey = false;
    }
  }
}

export default Cropper;
