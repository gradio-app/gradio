import Range from '@/ui/tools/range';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/rotate';
import { toInteger, assignmentForDestroy } from '@/util';
import { defaultRotateRangeValues } from '@/consts';

const CLOCKWISE = 30;
const COUNTERCLOCKWISE = -30;

/**
 * Rotate ui class
 * @class
 * @ignore
 */
class Rotate extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'rotate',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });
    this._value = 0;

    this._els = {
      rotateButton: this.selector('.tie-rotate-button'),
      rotateRange: new Range(
        {
          slider: this.selector('.tie-rotate-range'),
          input: this.selector('.tie-rotate-range-value'),
        },
        defaultRotateRangeValues
      ),
    };
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._els.rotateRange.destroy();

    assignmentForDestroy(this);
  }

  setRangeBarAngle(type, angle) {
    let resultAngle = angle;

    if (type === 'rotate') {
      resultAngle = parseInt(this._els.rotateRange.value, 10) + angle;
    }

    this._setRangeBarRatio(resultAngle);
  }

  _setRangeBarRatio(angle) {
    this._els.rotateRange.value = angle;
  }

  /**
   * Add event for rotate
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.rotate - rotate action
   *   @param {Function} actions.setAngle - set angle action
   */
  addEvent(actions) {
    this.eventHandler.rotationAngleChanged = this._changeRotateForButton.bind(this);

    // {rotate, setAngle}
    this.actions = actions;
    this._els.rotateButton.addEventListener('click', this.eventHandler.rotationAngleChanged);
    this._els.rotateRange.on('change', this._changeRotateForRange.bind(this));
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.rotateButton.removeEventListener('click', this.eventHandler.rotationAngleChanged);
    this._els.rotateRange.off();
  }

  /**
   * Change rotate for range
   * @param {number} value - angle value
   * @param {boolean} isLast - Is last change
   * @private
   */
  _changeRotateForRange(value, isLast) {
    const angle = toInteger(value);
    this.actions.setAngle(angle, !isLast);
    this._value = angle;
  }

  /**
   * Change rotate for button
   * @param {object} event - add button event object
   * @private
   */
  _changeRotateForButton(event) {
    const button = event.target.closest('.tui-image-editor-button');
    const angle = this._els.rotateRange.value;

    if (button) {
      const rotateType = this.getButtonType(button, ['counterclockwise', 'clockwise']);
      const rotateAngle = {
        clockwise: CLOCKWISE,
        counterclockwise: COUNTERCLOCKWISE,
      }[rotateType];
      const newAngle = parseInt(angle, 10) + rotateAngle;
      const isRotatable = newAngle >= -360 && newAngle <= 360;
      if (isRotatable) {
        this.actions.rotate(rotateAngle);
      }
    }
  }
}

export default Rotate;
