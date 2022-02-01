import snippet from 'tui-code-snippet';
import { toInteger, clamp } from '@/util';
import { keyCodes } from '@/consts';

const INPUT_FILTER_REGEXP = /(-?)([0-9]*)[^0-9]*([0-9]*)/g;

/**
 * Range control class
 * @class
 * @ignore
 */
class Range {
  /**
   * @constructor
   * @extends {View}
   * @param {Object} rangeElements - Html resources for creating sliders
   *  @param {HTMLElement} rangeElements.slider - b
   *  @param {HTMLElement} [rangeElements.input] - c
   * @param {Object} options - Slider make options
   *  @param {number} options.min - min value
   *  @param {number} options.max - max value
   *  @param {number} options.value - default value
   *  @param {number} [options.useDecimal] - Decimal point processing.
   *  @param {boolean} [options.realTimeEvent] - Reflect live events.
   */
  constructor(rangeElements, options = {}) {
    this._value = options.value || 0;

    this.rangeElement = rangeElements.slider;
    this.rangeInputElement = rangeElements.input;

    this._drawRangeElement();

    this.rangeWidth = this._getRangeWidth();
    this._min = options.min || 0;
    this._max = options.max || 100;
    this._useDecimal = options.useDecimal;
    this._absMax = this._min * -1 + this._max;
    this.realTimeEvent = options.realTimeEvent || false;

    this.eventHandler = {
      startChangingSlide: this._startChangingSlide.bind(this),
      stopChangingSlide: this._stopChangingSlide.bind(this),
      changeSlide: this._changeSlide.bind(this),
      changeSlideFinally: this._changeSlideFinally.bind(this),
      changeInput: this._changeValueWithInput.bind(this, false),
      changeInputFinally: this._changeValueWithInput.bind(this, true),
      changeInputWithArrow: this._changeValueWithInputKeyEvent.bind(this),
    };

    this._addClickEvent();
    this._addDragEvent();
    this._addInputEvent();
    this.value = options.value;
    this.trigger('change');
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeClickEvent();
    this._removeDragEvent();
    this._removeInputEvent();
    this.rangeElement.innerHTML = '';
    snippet.forEach(this, (value, key) => {
      this[key] = null;
    });
  }

  get max() {
    return this._max;
  }

  /**
   * Set range max value and re position cursor
   * @param {number} maxValue - max value
   */
  set max(maxValue) {
    this._max = maxValue;
    this._absMax = this._min * -1 + this._max;
    this.value = this._value;
  }

  get min() {
    return this._min;
  }

  /**
   * Set range min value and re position cursor
   * @param {number} minValue - min value
   */
  set min(minValue) {
    this._min = minValue;
    this.max = this._max;
  }

  /**
   * Get range value
   * @returns {Number} range value
   */
  get value() {
    return this._value;
  }

  /**
   * Set range value
   * @param {Number} value range value
   */
  set value(value) {
    value = this._useDecimal ? value : toInteger(value);

    const absValue = value - this._min;
    let leftPosition = (absValue * this.rangeWidth) / this._absMax;

    if (this.rangeWidth < leftPosition) {
      leftPosition = this.rangeWidth;
    }

    this.pointer.style.left = `${leftPosition}px`;
    this.subbar.style.right = `${this.rangeWidth - leftPosition}px`;

    this._value = value;
    if (this.rangeInputElement) {
      this.rangeInputElement.value = value;
    }
  }

  /**
   * event trigger
   * @param {string} type - type
   */
  trigger(type) {
    this.fire(type, this._value);
  }

  /**
   * Calculate slider width
   * @returns {number} - slider width
   */
  _getRangeWidth() {
    const getElementWidth = (element) => toInteger(window.getComputedStyle(element, null).width);

    return getElementWidth(this.rangeElement) - getElementWidth(this.pointer);
  }

  /**
   * Make range element
   * @private
   */
  _drawRangeElement() {
    this.rangeElement.classList.add('tui-image-editor-range');

    this.bar = document.createElement('div');
    this.bar.className = 'tui-image-editor-virtual-range-bar';

    this.subbar = document.createElement('div');
    this.subbar.className = 'tui-image-editor-virtual-range-subbar';

    this.pointer = document.createElement('div');
    this.pointer.className = 'tui-image-editor-virtual-range-pointer';

    this.bar.appendChild(this.subbar);
    this.bar.appendChild(this.pointer);
    this.rangeElement.appendChild(this.bar);
  }

  /**
   * Add range input editing event
   * @private
   */
  _addInputEvent() {
    if (this.rangeInputElement) {
      this.rangeInputElement.addEventListener('keydown', this.eventHandler.changeInputWithArrow);
      this.rangeInputElement.addEventListener('keyup', this.eventHandler.changeInput);
      this.rangeInputElement.addEventListener('blur', this.eventHandler.changeInputFinally);
    }
  }

  /**
   * Remove range input editing event
   * @private
   */
  _removeInputEvent() {
    if (this.rangeInputElement) {
      this.rangeInputElement.removeEventListener('keydown', this.eventHandler.changeInputWithArrow);
      this.rangeInputElement.removeEventListener('keyup', this.eventHandler.changeInput);
      this.rangeInputElement.removeEventListener('blur', this.eventHandler.changeInputFinally);
    }
  }

  /**
   * change angle event
   * @param {object} event - key event
   * @private
   */
  _changeValueWithInputKeyEvent(event) {
    const { keyCode, target } = event;

    if ([keyCodes.ARROW_UP, keyCodes.ARROW_DOWN].indexOf(keyCode) < 0) {
      return;
    }

    let value = Number(target.value);

    value = this._valueUpDownForKeyEvent(value, keyCode);

    const unChanged = value < this._min || value > this._max;

    if (!unChanged) {
      const clampValue = clamp(value, this._min, this.max);
      this.value = clampValue;
      this.fire('change', clampValue, false);
    }
  }

  /**
   * value up down for input
   * @param {number} value - original value number
   * @param {number} keyCode - input event key code
   * @returns {number} value - changed value
   * @private
   */
  _valueUpDownForKeyEvent(value, keyCode) {
    const step = this._useDecimal ? 0.1 : 1;

    if (keyCode === keyCodes.ARROW_UP) {
      value += step;
    } else if (keyCode === keyCodes.ARROW_DOWN) {
      value -= step;
    }

    return value;
  }

  /**
   * change angle event
   * @param {boolean} isLast - Is last change
   * @param {object} event - key event
   * @private
   */
  _changeValueWithInput(isLast, event) {
    const { keyCode, target } = event;

    if ([keyCodes.ARROW_UP, keyCodes.ARROW_DOWN].indexOf(keyCode) >= 0) {
      return;
    }

    const stringValue = this._filterForInputText(target.value);
    const waitForChange = !stringValue || isNaN(stringValue);
    target.value = stringValue;

    if (!waitForChange) {
      let value = this._useDecimal ? Number(stringValue) : toInteger(stringValue);
      value = clamp(value, this._min, this.max);

      this.value = value;
      this.fire('change', value, isLast);
    }
  }

  /**
   * Add Range click event
   * @private
   */
  _addClickEvent() {
    this.rangeElement.addEventListener('click', this.eventHandler.changeSlideFinally);
  }

  /**
   * Remove Range click event
   * @private
   */
  _removeClickEvent() {
    this.rangeElement.removeEventListener('click', this.eventHandler.changeSlideFinally);
  }

  /**
   * Add Range drag event
   * @private
   */
  _addDragEvent() {
    this.pointer.addEventListener('mousedown', this.eventHandler.startChangingSlide);
  }

  /**
   * Remove Range drag event
   * @private
   */
  _removeDragEvent() {
    this.pointer.removeEventListener('mousedown', this.eventHandler.startChangingSlide);
  }

  /**
   * change angle event
   * @param {object} event - change event
   * @private
   */
  _changeSlide(event) {
    const changePosition = event.screenX;
    const diffPosition = changePosition - this.firstPosition;
    let touchPx = this.firstLeft + diffPosition;
    touchPx = touchPx > this.rangeWidth ? this.rangeWidth : touchPx;
    touchPx = touchPx < 0 ? 0 : touchPx;

    this.pointer.style.left = `${touchPx}px`;
    this.subbar.style.right = `${this.rangeWidth - touchPx}px`;

    const ratio = touchPx / this.rangeWidth;
    const resultValue = this._absMax * ratio + this._min;
    const value = this._useDecimal ? resultValue : toInteger(resultValue);
    const isValueChanged = this.value !== value;

    if (isValueChanged) {
      this.value = value;
      if (this.realTimeEvent) {
        this.fire('change', this._value, false);
      }
    }
  }

  _changeSlideFinally(event) {
    event.stopPropagation();
    if (event.target.className !== 'tui-image-editor-range') {
      return;
    }
    const touchPx = event.offsetX;
    const ratio = touchPx / this.rangeWidth;
    const value = this._absMax * ratio + this._min;
    this.pointer.style.left = `${ratio * this.rangeWidth}px`;
    this.subbar.style.right = `${(1 - ratio) * this.rangeWidth}px`;
    this.value = value;

    this.fire('change', value, true);
  }

  _startChangingSlide(event) {
    this.firstPosition = event.screenX;
    this.firstLeft = toInteger(this.pointer.style.left) || 0;

    document.addEventListener('mousemove', this.eventHandler.changeSlide);
    document.addEventListener('mouseup', this.eventHandler.stopChangingSlide);
  }

  /**
   * stop change angle event
   * @private
   */
  _stopChangingSlide() {
    this.fire('change', this._value, true);

    document.removeEventListener('mousemove', this.eventHandler.changeSlide);
    document.removeEventListener('mouseup', this.eventHandler.stopChangingSlide);
  }

  /**
   * Unnecessary string filtering.
   * @param {string} inputValue - origin string of input
   * @returns {string} filtered string
   * @private
   */
  _filterForInputText(inputValue) {
    return inputValue.replace(INPUT_FILTER_REGEXP, '$1$2$3');
  }
}

snippet.CustomEvents.mixin(Range);

export default Range;
