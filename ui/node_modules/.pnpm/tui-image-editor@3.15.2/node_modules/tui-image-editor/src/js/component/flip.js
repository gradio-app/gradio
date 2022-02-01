/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Image flip module
 */
import snippet from 'tui-code-snippet';
import Component from '@/interface/component';
import { componentNames, rejectMessages } from '@/consts';

/**
 * Flip
 * @class Flip
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Flip extends Component {
  constructor(graphics) {
    super(componentNames.FLIP, graphics);
  }

  /**
   * Get current flip settings
   * @returns {{flipX: Boolean, flipY: Boolean}}
   */
  getCurrentSetting() {
    const canvasImage = this.getCanvasImage();

    return {
      flipX: canvasImage.flipX,
      flipY: canvasImage.flipY,
    };
  }

  /**
   * Set flipX, flipY
   * @param {{flipX: Boolean, flipY: Boolean}} newSetting - Flip setting
   * @returns {Promise}
   */
  set(newSetting) {
    const setting = this.getCurrentSetting();
    const isChangingFlipX = setting.flipX !== newSetting.flipX;
    const isChangingFlipY = setting.flipY !== newSetting.flipY;

    if (!isChangingFlipX && !isChangingFlipY) {
      return Promise.reject(rejectMessages.flip);
    }

    snippet.extend(setting, newSetting);
    this.setImageProperties(setting, true);
    this._invertAngle(isChangingFlipX, isChangingFlipY);
    this._flipObjects(isChangingFlipX, isChangingFlipY);

    return Promise.resolve({
      flipX: setting.flipX,
      flipY: setting.flipY,
      angle: this.getCanvasImage().angle,
    });
  }

  /**
   * Invert image angle for flip
   * @param {boolean} isChangingFlipX - Change flipX
   * @param {boolean} isChangingFlipY - Change flipY
   */
  _invertAngle(isChangingFlipX, isChangingFlipY) {
    const canvasImage = this.getCanvasImage();
    let { angle } = canvasImage;

    if (isChangingFlipX) {
      angle *= -1;
    }
    if (isChangingFlipY) {
      angle *= -1;
    }
    canvasImage.rotate(parseFloat(angle)).setCoords(); // parseFloat for -0 to 0
  }

  /**
   * Flip objects
   * @param {boolean} isChangingFlipX - Change flipX
   * @param {boolean} isChangingFlipY - Change flipY
   * @private
   */
  _flipObjects(isChangingFlipX, isChangingFlipY) {
    const canvas = this.getCanvas();

    if (isChangingFlipX) {
      canvas.forEachObject((obj) => {
        obj
          .set({
            angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
            flipX: !obj.flipX,
            left: canvas.width - obj.left,
          })
          .setCoords();
      });
    }
    if (isChangingFlipY) {
      canvas.forEachObject((obj) => {
        obj
          .set({
            angle: parseFloat(obj.angle * -1), // parseFloat for -0 to 0
            flipY: !obj.flipY,
            top: canvas.height - obj.top,
          })
          .setCoords();
      });
    }
    canvas.renderAll();
  }

  /**
   * Reset flip settings
   * @returns {Promise}
   */
  reset() {
    return this.set({
      flipX: false,
      flipY: false,
    });
  }

  /**
   * Flip x
   * @returns {Promise}
   */
  flipX() {
    const current = this.getCurrentSetting();

    return this.set({
      flipX: !current.flipX,
      flipY: current.flipY,
    });
  }

  /**
   * Flip y
   * @returns {Promise}
   */
  flipY() {
    const current = this.getCurrentSetting();

    return this.set({
      flipX: current.flipX,
      flipY: !current.flipY,
    });
  }
}

export default Flip;
