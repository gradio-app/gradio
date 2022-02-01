import snippet from 'tui-code-snippet';
import tuiColorPicker from 'tui-color-picker';

const PICKER_COLOR = [
  '#000000',
  '#2a2a2a',
  '#545454',
  '#7e7e7e',
  '#a8a8a8',
  '#d2d2d2',
  '#ffffff',
  '',
  '#ff4040',
  '#ff6518',
  '#ffbb3b',
  '#03bd9e',
  '#00a9ff',
  '#515ce6',
  '#9e5fff',
  '#ff5583',
];

/**
 * Colorpicker control class
 * @class
 * @ignore
 */
class Colorpicker {
  constructor(
    colorpickerElement,
    { defaultColor = '#7e7e7e', toggleDirection = 'up', usageStatistics }
  ) {
    this.colorpickerElement = colorpickerElement;
    this.usageStatistics = usageStatistics;

    this._show = false;

    this._colorpickerElement = colorpickerElement;
    this._toggleDirection = toggleDirection;
    this._makePickerButtonElement(defaultColor);
    this._makePickerLayerElement(colorpickerElement, colorpickerElement.getAttribute('title'));
    this._color = defaultColor;
    this.picker = tuiColorPicker.create({
      container: this.pickerElement,
      preset: PICKER_COLOR,
      color: defaultColor,
      usageStatistics: this.usageStatistics,
    });

    this._addEvent();
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this.picker.destroy();
    this.colorpickerElement.innerHTML = '';
    snippet.forEach(this, (value, key) => {
      this[key] = null;
    });
  }

  /**
   * Get color
   * @returns {Number} color value
   */
  get color() {
    return this._color;
  }

  /**
   * Set color
   * @param {string} color color value
   */
  set color(color) {
    this._color = color;
    this._changeColorElement(color);
  }

  /**
   * Change color element
   * @param {string} color color value
   * #private
   */
  _changeColorElement(color) {
    if (color) {
      this.colorElement.classList.remove('transparent');
      this.colorElement.style.backgroundColor = color;
    } else {
      this.colorElement.style.backgroundColor = '#fff';
      this.colorElement.classList.add('transparent');
    }
  }

  /**
   * Make picker button element
   * @param {string} defaultColor color value
   * @private
   */
  _makePickerButtonElement(defaultColor) {
    this.colorpickerElement.classList.add('tui-image-editor-button');

    this.colorElement = document.createElement('div');
    this.colorElement.className = 'color-picker-value';
    if (defaultColor) {
      this.colorElement.style.backgroundColor = defaultColor;
    } else {
      this.colorElement.classList.add('transparent');
    }
  }

  /**
   * Make picker layer element
   * @param {HTMLElement} colorpickerElement color picker element
   * @param {string} title picker title
   * @private
   */
  _makePickerLayerElement(colorpickerElement, title) {
    const label = document.createElement('label');
    const triangle = document.createElement('div');

    this.pickerControl = document.createElement('div');
    this.pickerControl.className = 'color-picker-control';

    this.pickerElement = document.createElement('div');
    this.pickerElement.className = 'color-picker';

    label.innerHTML = title;
    triangle.className = 'triangle';

    this.pickerControl.appendChild(this.pickerElement);
    this.pickerControl.appendChild(triangle);

    colorpickerElement.appendChild(this.pickerControl);
    colorpickerElement.appendChild(this.colorElement);
    colorpickerElement.appendChild(label);
  }

  /**
   * Add event
   * @private
   */
  _addEvent() {
    this.picker.on('selectColor', (value) => {
      this._changeColorElement(value.color);
      this._color = value.color;
      this.fire('change', value.color);
    });

    this.eventHandler = {
      pickerToggle: this._pickerToggleEventHandler.bind(this),
      pickerHide: () => this.hide(),
    };

    this.colorpickerElement.addEventListener('click', this.eventHandler.pickerToggle);
    document.body.addEventListener('click', this.eventHandler.pickerHide);
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this.colorpickerElement.removeEventListener('click', this.eventHandler.pickerToggle);
    document.body.removeEventListener('click', this.eventHandler.pickerHide);
    this.picker.off();
  }

  /**
   * Picker toggle event handler
   * @param {object} event - change event
   * @private
   */
  _pickerToggleEventHandler(event) {
    const { target } = event;
    const isInPickerControl = target && this._isElementInColorPickerControl(target);

    if (!isInPickerControl || (isInPickerControl && this._isPaletteButton(target))) {
      this._show = !this._show;
      this.pickerControl.style.display = this._show ? 'block' : 'none';
      this._setPickerControlPosition();
      this.fire('changeShow', this);
    }
    event.stopPropagation();
  }

  /**
   * Check hex input or not
   * @param {Element} target - Event target element
   * @returns {boolean}
   * @private
   */
  _isPaletteButton(target) {
    return target.className === 'tui-colorpicker-palette-button';
  }

  /**
   * Check given element is in pickerControl element
   * @param {Element} element - element to check
   * @returns {boolean}
   * @private
   */
  _isElementInColorPickerControl(element) {
    let parentNode = element;

    while (parentNode !== document.body) {
      if (!parentNode) {
        break;
      }

      if (parentNode === this.pickerControl) {
        return true;
      }

      parentNode = parentNode.parentNode;
    }

    return false;
  }

  hide() {
    this._show = false;
    this.pickerControl.style.display = 'none';
  }

  /**
   * Set picker control position
   * @private
   */
  _setPickerControlPosition() {
    const controlStyle = this.pickerControl.style;
    const halfPickerWidth = this._colorpickerElement.clientWidth / 2 + 2;
    const left = this.pickerControl.offsetWidth / 2 - halfPickerWidth;
    let top = (this.pickerControl.offsetHeight + 10) * -1;

    if (this._toggleDirection === 'down') {
      top = 30;
    }

    controlStyle.top = `${top}px`;
    controlStyle.left = `-${left}px`;
  }
}

snippet.CustomEvents.mixin(Colorpicker);

export default Colorpicker;
