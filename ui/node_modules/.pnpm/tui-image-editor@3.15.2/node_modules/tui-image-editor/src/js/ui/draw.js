import Colorpicker from '@/ui/tools/colorpicker';
import Range from '@/ui/tools/range';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/draw';
import { assignmentForDestroy, getRgb } from '@/util';
import { defaultDrawRangeValues, eventNames, selectorNames } from '@/consts';

const DRAW_OPACITY = 0.7;

/**
 * Draw ui class
 * @class
 * @ignore
 */
class Draw extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'draw',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this._els = {
      lineSelectButton: this.selector('.tie-draw-line-select-button'),
      drawColorPicker: new Colorpicker(this.selector('.tie-draw-color'), {
        defaultColor: '#00a9ff',
        toggleDirection: this.toggleDirection,
        usageStatistics: this.usageStatistics,
      }),
      drawRange: new Range(
        {
          slider: this.selector('.tie-draw-range'),
          input: this.selector('.tie-draw-range-value'),
        },
        defaultDrawRangeValues
      ),
    };

    this.type = null;
    this.color = this._els.drawColorPicker.color;
    this.width = this._els.drawRange.value;

    this.colorPickerInputBox = this._els.drawColorPicker.colorpickerElement.querySelector(
      selectorNames.COLOR_PICKER_INPUT_BOX
    );
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._els.drawColorPicker.destroy();
    this._els.drawRange.destroy();

    assignmentForDestroy(this);
  }

  /**
   * Add event for draw
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.setDrawMode - set draw mode
   */
  addEvent(actions) {
    this.eventHandler.changeDrawType = this._changeDrawType.bind(this);

    this.actions = actions;
    this._els.lineSelectButton.addEventListener('click', this.eventHandler.changeDrawType);
    this._els.drawColorPicker.on('change', this._changeDrawColor.bind(this));
    this._els.drawRange.on('change', this._changeDrawRange.bind(this));

    this.colorPickerInputBox.addEventListener(
      eventNames.FOCUS,
      this._onStartEditingInputBox.bind(this)
    );
    this.colorPickerInputBox.addEventListener(
      eventNames.BLUR,
      this._onStopEditingInputBox.bind(this)
    );
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.lineSelectButton.removeEventListener('click', this.eventHandler.changeDrawType);
    this._els.drawColorPicker.off();
    this._els.drawRange.off();

    this.colorPickerInputBox.removeEventListener(
      eventNames.FOCUS,
      this._onStartEditingInputBox.bind(this)
    );
    this.colorPickerInputBox.removeEventListener(
      eventNames.BLUR,
      this._onStopEditingInputBox.bind(this)
    );
  }

  /**
   * set draw mode - action runner
   */
  setDrawMode() {
    this.actions.setDrawMode(this.type, {
      width: this.width,
      color: getRgb(this.color, DRAW_OPACITY),
    });
  }

  /**
   * Returns the menu to its default state.
   */
  changeStandbyMode() {
    this.type = null;
    this.actions.stopDrawingMode();
    this.actions.changeSelectableAll(true);
    this._els.lineSelectButton.classList.remove('free');
    this._els.lineSelectButton.classList.remove('line');
  }

  /**
   * Executed when the menu starts.
   */
  changeStartMode() {
    this.type = 'free';
    this._els.lineSelectButton.classList.add('free');
    this.setDrawMode();
  }

  /**
   * Change draw type event
   * @param {object} event - line select event
   * @private
   */
  _changeDrawType(event) {
    const button = event.target.closest('.tui-image-editor-button');
    if (button) {
      const lineType = this.getButtonType(button, ['free', 'line']);
      this.actions.discardSelection();

      if (this.type === lineType) {
        this.changeStandbyMode();

        return;
      }

      this.changeStandbyMode();
      this.type = lineType;
      this._els.lineSelectButton.classList.add(lineType);
      this.setDrawMode();
    }
  }

  /**
   * Change drawing color
   * @param {string} color - select drawing color
   * @private
   */
  _changeDrawColor(color) {
    this.color = color || 'transparent';
    if (!this.type) {
      this.changeStartMode();
    } else {
      this.setDrawMode();
    }
  }

  /**
   * Change drawing Range
   * @param {number} value - select drawing range
   * @private
   */
  _changeDrawRange(value) {
    this.width = value;
    if (!this.type) {
      this.changeStartMode();
    } else {
      this.setDrawMode();
    }
  }
}

export default Draw;
