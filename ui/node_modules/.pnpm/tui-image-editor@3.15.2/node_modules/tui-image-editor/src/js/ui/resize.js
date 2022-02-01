import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/resize';
import { assignmentForDestroy, toInteger } from '@/util';
import Range from '@/ui/tools/range';
import { defaultResizePixelValues } from '@/consts';

/**
 * Resize ui class
 * @class
 * @ignore
 */
class Resize extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'resize',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this.status = 'active';

    this._lockState = false;

    /**
     * Original dimensions
     * @type {Object}
     * @private
     */
    this._originalDimensions = null;

    this._els = {
      widthRange: new Range(
        {
          slider: this.selector('.tie-width-range'),
          input: this.selector('.tie-width-range-value'),
        },
        defaultResizePixelValues
      ),
      heightRange: new Range(
        {
          slider: this.selector('.tie-height-range'),
          input: this.selector('.tie-height-range-value'),
        },
        defaultResizePixelValues
      ),
      lockAspectRatio: this.selector('.tie-lock-aspect-ratio'),
      apply: this.selector('.tie-resize-button .apply'),
      cancel: this.selector('.tie-resize-button .cancel'),
    };
  }

  /**
   * Executed when the menu starts.
   */
  changeStartMode() {
    this.actions.modeChange('resize');
    const dimensions = this.actions.getCurrentDimensions();

    this._originalDimensions = dimensions;

    this.setWidthValue(dimensions.width);
    this.setHeightValue(dimensions.height);
  }

  /**
   * Returns the menu to its default state.
   */
  changeStandbyMode() {
    this.actions.stopDrawingMode();
    this.actions.reset(true);
  }

  /**
   * Set dimension limits
   * @param {object} limits - expect dimension limits for change
   */
  setLimit(limits) {
    this._els.widthRange.min = this.calcMinValue(limits.minWidth);
    this._els.heightRange.min = this.calcMinValue(limits.minHeight);
    this._els.widthRange.max = this.calcMaxValue(limits.maxWidth);
    this._els.heightRange.max = this.calcMaxValue(limits.maxHeight);
  }

  /**
   * Calculate max value
   * @param {number} maxValue - max value
   * @returns {number}
   */
  calcMaxValue(maxValue) {
    if (maxValue <= 0) {
      maxValue = defaultResizePixelValues.max;
    }

    return maxValue;
  }

  /**
   * Calculate min value
   * @param {number} minValue - min value
   * @returns {number}
   */
  calcMinValue(minValue) {
    if (minValue <= 0) {
      minValue = defaultResizePixelValues.min;
    }

    return minValue;
  }

  /**
   * Set width value
   * @param {number} value - expect value for widthRange change
   * @param {boolean} trigger - fire change event control
   */
  setWidthValue(value, trigger = false) {
    this._els.widthRange.value = value;
    if (trigger) {
      this._els.widthRange.trigger('change');
    }
  }

  /**
   * Set height value
   * @param {number} value - expect value for heightRange change
   * @param {boolean} trigger - fire change event control
   */
  setHeightValue(value, trigger = false) {
    this._els.heightRange.value = value;
    if (trigger) {
      this._els.heightRange.trigger('change');
    }
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();

    assignmentForDestroy(this);
  }

  /**
   * Add event for resize
   * @param {Object} actions - actions for resize
   *   @param {Function} actions.resize - resize action
   *   @param {Function} actions.preview - preview action
   *   @param {Function} actions.getCurrentDimensions - Get current dimensions action
   *   @param {Function} actions.modeChange - change mode
   *   @param {Function} actions.stopDrawingMode - stop drawing mode
   *   @param {Function} actions.lockAspectRatio - lock aspect ratio
   *   @param {Function} actions.reset - reset action
   */
  addEvent(actions) {
    this._els.widthRange.on('change', this._changeWidthRangeHandler.bind(this));
    this._els.heightRange.on('change', this._changeHeightRangeHandler.bind(this));
    this._els.lockAspectRatio.addEventListener('change', this._changeLockAspectRatio.bind(this));

    const apply = this._applyEventHandler.bind(this);
    const cancel = this._cancelEventHandler.bind(this);

    this.eventHandler = {
      apply,
      cancel,
    };

    this.actions = actions;
    this._els.apply.addEventListener('click', apply);
    this._els.cancel.addEventListener('click', cancel);
  }

  /**
   * Change width
   * @param {number} value - width range value
   * @private
   */
  _changeWidthRangeHandler(value) {
    this.actions.preview('width', toInteger(value), this._lockState);
  }

  /**
   * Change height
   * @param {number} value - height range value
   * @private
   */
  _changeHeightRangeHandler(value) {
    this.actions.preview('height', toInteger(value), this._lockState);
  }

  /**
   * Change lock aspect ratio state
   * @param {Event} event - aspect ratio check event
   * @private
   */
  _changeLockAspectRatio(event) {
    this._lockState = event.target.checked;
    this.actions.lockAspectRatio(
      this._lockState,
      defaultResizePixelValues.min,
      defaultResizePixelValues.max
    );
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.apply.removeEventListener('click', this.eventHandler.apply);
    this._els.cancel.removeEventListener('click', this.eventHandler.cancel);
  }

  _applyEventHandler() {
    this.actions.resize();
    this._els.apply.classList.remove('active');
  }

  _cancelEventHandler() {
    this.actions.reset();
    this._els.cancel.classList.remove('active');
  }

  /**
   * Change apply button status
   * @param {Boolean} enableStatus - apply button status
   */
  changeApplyButtonStatus(enableStatus) {
    if (enableStatus) {
      this._els.apply.classList.add('active');
    } else {
      this._els.apply.classList.remove('active');
    }
  }
}

export default Resize;
