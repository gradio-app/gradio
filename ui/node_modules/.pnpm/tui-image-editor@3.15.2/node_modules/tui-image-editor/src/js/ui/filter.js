import snippet from 'tui-code-snippet';
import Colorpicker from '@/ui/tools/colorpicker';
import Range from '@/ui/tools/range';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/filter';
import { toInteger, toCamelCase, assignmentForDestroy } from '@/util';
import { defaultFilterRangeValues as FILTER_RANGE, eventNames, selectorNames } from '@/consts';

const PICKER_CONTROL_HEIGHT = '130px';
const BLEND_OPTIONS = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken'];
const FILTER_OPTIONS = [
  'grayscale',
  'invert',
  'sepia',
  'vintage',
  'blur',
  'sharpen',
  'emboss',
  'remove-white',
  'brightness',
  'noise',
  'pixelate',
  'color-filter',
  'tint',
  'multiply',
  'blend',
];
const filterNameMap = {
  grayscale: 'grayscale',
  invert: 'invert',
  sepia: 'sepia',
  blur: 'blur',
  sharpen: 'sharpen',
  emboss: 'emboss',
  removeWhite: 'removeColor',
  brightness: 'brightness',
  contrast: 'contrast',
  saturation: 'saturation',
  vintage: 'vintage',
  polaroid: 'polaroid',
  noise: 'noise',
  pixelate: 'pixelate',
  colorFilter: 'removeColor',
  tint: 'blendColor',
  multiply: 'blendColor',
  blend: 'blendColor',
  hue: 'hue',
  gamma: 'gamma',
};
const RANGE_INSTANCE_NAMES = [
  'removewhiteDistanceRange',
  'colorfilterThresholdRange',
  'pixelateRange',
  'noiseRange',
  'brightnessRange',
  'tintOpacity',
];
const COLORPICKER_INSTANCE_NAMES = ['filterBlendColor', 'filterMultiplyColor', 'filterTintColor'];

/**
 * Filter ui class
 * @class
 * @ignore
 */
class Filter extends Submenu {
  constructor(subMenuElement, { locale, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'filter',
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this.selectBoxShow = false;

    this.checkedMap = {};
    this._makeControlElement();
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._destroyToolInstance();

    assignmentForDestroy(this);
  }

  /**
   * Remove event for filter
   */
  _removeEvent() {
    snippet.forEach(FILTER_OPTIONS, (filter) => {
      const filterCheckElement = this.selector(`.tie-${filter}`);
      const filterNameCamelCase = toCamelCase(filter);

      filterCheckElement.removeEventListener('change', this.eventHandler[filterNameCamelCase]);
    });

    snippet.forEach([...RANGE_INSTANCE_NAMES, ...COLORPICKER_INSTANCE_NAMES], (instanceName) => {
      this._els[instanceName].off();
    });

    this._els.blendType.removeEventListener('change', this.eventHandler.changeBlendFilter);
    this._els.blendType.removeEventListener('click', this.eventHandler.changeBlendFilter);

    snippet.forEachArray(
      this.colorPickerInputBoxes,
      (inputBox) => {
        inputBox.removeEventListener(eventNames.FOCUS, this._onStartEditingInputBox.bind(this));
        inputBox.removeEventListener(eventNames.BLUR, this._onStopEditingInputBox.bind(this));
      },
      this
    );
  }

  _destroyToolInstance() {
    snippet.forEach([...RANGE_INSTANCE_NAMES, ...COLORPICKER_INSTANCE_NAMES], (instanceName) => {
      this._els[instanceName].destroy();
    });
  }

  /**
   * Add event for filter
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.applyFilter - apply filter option
   */
  addEvent({ applyFilter }) {
    const changeFilterState = (filterName) =>
      this._changeFilterState.bind(this, applyFilter, filterName);
    const changeFilterStateForRange = (filterName) => (value, isLast) =>
      this._changeFilterState(applyFilter, filterName, isLast);

    this.eventHandler = {
      changeBlendFilter: changeFilterState('blend'),
      blandTypeClick: (event) => event.stopPropagation(),
    };

    snippet.forEach(FILTER_OPTIONS, (filter) => {
      const filterCheckElement = this.selector(`.tie-${filter}`);
      const filterNameCamelCase = toCamelCase(filter);
      this.checkedMap[filterNameCamelCase] = filterCheckElement;
      this.eventHandler[filterNameCamelCase] = changeFilterState(filterNameCamelCase);

      filterCheckElement.addEventListener('change', this.eventHandler[filterNameCamelCase]);
    });

    this._els.removewhiteDistanceRange.on('change', changeFilterStateForRange('removeWhite'));
    this._els.colorfilterThresholdRange.on('change', changeFilterStateForRange('colorFilter'));
    this._els.pixelateRange.on('change', changeFilterStateForRange('pixelate'));
    this._els.noiseRange.on('change', changeFilterStateForRange('noise'));
    this._els.brightnessRange.on('change', changeFilterStateForRange('brightness'));

    this._els.filterBlendColor.on('change', this.eventHandler.changeBlendFilter);
    this._els.filterMultiplyColor.on('change', changeFilterState('multiply'));
    this._els.filterTintColor.on('change', changeFilterState('tint'));
    this._els.tintOpacity.on('change', changeFilterStateForRange('tint'));
    this._els.filterMultiplyColor.on('changeShow', this.colorPickerChangeShow.bind(this));
    this._els.filterTintColor.on('changeShow', this.colorPickerChangeShow.bind(this));
    this._els.filterBlendColor.on('changeShow', this.colorPickerChangeShow.bind(this));

    this._els.blendType.addEventListener('change', this.eventHandler.changeBlendFilter);
    this._els.blendType.addEventListener('click', this.eventHandler.blandTypeClick);

    snippet.forEachArray(
      this.colorPickerInputBoxes,
      (inputBox) => {
        inputBox.addEventListener(eventNames.FOCUS, this._onStartEditingInputBox.bind(this));
        inputBox.addEventListener(eventNames.BLUR, this._onStopEditingInputBox.bind(this));
      },
      this
    );
  }

  /**
   * Set filter for undo changed
   * @param {Object} changedFilterInfos - changed command infos
   *   @param {string} type - filter type
   *   @param {string} action - add or remove
   *   @param {Object} options - filter options
   */
  setFilterState(changedFilterInfos) {
    const { type, options, action } = changedFilterInfos;
    const filterName = this._getFilterNameFromOptions(type, options);
    const isRemove = action === 'remove';

    if (!isRemove) {
      this._setFilterState(filterName, options);
    }

    this.checkedMap[filterName].checked = !isRemove;
  }

  /**
   * Init all filter's checkbox to unchecked state
   */
  initFilterCheckBoxState() {
    snippet.forEach(
      this.checkedMap,
      (filter) => {
        filter.checked = false;
      },
      this
    );
  }

  /**
   * Set filter for undo changed
   * @param {string} filterName - filter name
   * @param {Object} options - filter options
   * @private
   */
  // eslint-disable-next-line complexity
  _setFilterState(filterName, options) {
    if (filterName === 'colorFilter') {
      this._els.colorfilterThresholdRange.value = options.distance;
    } else if (filterName === 'removeWhite') {
      this._els.removewhiteDistanceRange.value = options.distance;
    } else if (filterName === 'pixelate') {
      this._els.pixelateRange.value = options.blocksize;
    } else if (filterName === 'brightness') {
      this._els.brightnessRange.value = options.brightness;
    } else if (filterName === 'noise') {
      this._els.noiseRange.value = options.noise;
    } else if (filterName === 'tint') {
      this._els.tintOpacity.value = options.alpha;
      this._els.filterTintColor.color = options.color;
    } else if (filterName === 'blend') {
      this._els.filterBlendColor.color = options.color;
    } else if (filterName === 'multiply') {
      this._els.filterMultiplyColor.color = options.color;
    }
  }

  /**
   * Get filter name
   * @param {string} type - filter type
   * @param {Object} options - filter options
   * @returns {string} filter name
   * @private
   */
  _getFilterNameFromOptions(type, options) {
    let filterName = type;

    if (type === 'removeColor') {
      filterName = snippet.isExisty(options.useAlpha) ? 'removeWhite' : 'colorFilter';
    } else if (type === 'blendColor') {
      filterName = {
        add: 'blend',
        multiply: 'multiply',
        tint: 'tint',
      }[options.mode];
    }

    return filterName;
  }

  /**
   * Add event for filter
   * @param {Function} applyFilter - actions for firter
   * @param {string} filterName - filter name
   * @param {boolean} [isLast] - Is last change
   */
  _changeFilterState(applyFilter, filterName, isLast = true) {
    const apply = this.checkedMap[filterName].checked;
    const type = filterNameMap[filterName];

    const checkboxGroup = this.checkedMap[filterName].closest('.tui-image-editor-checkbox-group');
    if (checkboxGroup) {
      if (apply) {
        checkboxGroup.classList.remove('tui-image-editor-disabled');
      } else {
        checkboxGroup.classList.add('tui-image-editor-disabled');
      }
    }
    applyFilter(apply, type, this._getFilterOption(filterName), !isLast);
  }

  /**
   * Get filter option
   * @param {String} type - filter type
   * @returns {Object} filter option object
   * @private
   */
  // eslint-disable-next-line complexity
  _getFilterOption(type) {
    const option = {};
    switch (type) {
      case 'removeWhite':
        option.color = '#FFFFFF';
        option.useAlpha = false;
        option.distance = parseFloat(this._els.removewhiteDistanceRange.value);
        break;
      case 'colorFilter':
        option.color = '#FFFFFF';
        option.distance = parseFloat(this._els.colorfilterThresholdRange.value);
        break;
      case 'pixelate':
        option.blocksize = toInteger(this._els.pixelateRange.value);
        break;
      case 'noise':
        option.noise = toInteger(this._els.noiseRange.value);
        break;
      case 'brightness':
        option.brightness = parseFloat(this._els.brightnessRange.value);
        break;
      case 'blend':
        option.mode = 'add';
        option.color = this._els.filterBlendColor.color;
        option.mode = this._els.blendType.value;
        break;
      case 'multiply':
        option.mode = 'multiply';
        option.color = this._els.filterMultiplyColor.color;
        break;
      case 'tint':
        option.mode = 'tint';
        option.color = this._els.filterTintColor.color;
        option.alpha = this._els.tintOpacity.value;
        break;
      case 'blur':
        option.blur = this._els.blurRange.value;
        break;
      default:
        break;
    }

    return option;
  }

  /**
   * Make submenu range and colorpicker control
   * @private
   */
  _makeControlElement() {
    this._els = {
      removewhiteDistanceRange: new Range(
        { slider: this.selector('.tie-removewhite-distance-range') },
        FILTER_RANGE.removewhiteDistanceRange
      ),
      brightnessRange: new Range(
        { slider: this.selector('.tie-brightness-range') },
        FILTER_RANGE.brightnessRange
      ),
      noiseRange: new Range({ slider: this.selector('.tie-noise-range') }, FILTER_RANGE.noiseRange),
      pixelateRange: new Range(
        { slider: this.selector('.tie-pixelate-range') },
        FILTER_RANGE.pixelateRange
      ),
      colorfilterThresholdRange: new Range(
        { slider: this.selector('.tie-colorfilter-threshold-range') },
        FILTER_RANGE.colorfilterThresholdRange
      ),
      filterTintColor: new Colorpicker(this.selector('.tie-filter-tint-color'), {
        defaultColor: '#03bd9e',
        toggleDirection: this.toggleDirection,
        usageStatistics: this.usageStatistics,
      }),
      filterMultiplyColor: new Colorpicker(this.selector('.tie-filter-multiply-color'), {
        defaultColor: '#515ce6',
        toggleDirection: this.toggleDirection,
        usageStatistics: this.usageStatistics,
      }),
      filterBlendColor: new Colorpicker(this.selector('.tie-filter-blend-color'), {
        defaultColor: '#ffbb3b',
        toggleDirection: this.toggleDirection,
        usageStatistics: this.usageStatistics,
      }),
      blurRange: FILTER_RANGE.blurFilterRange,
    };

    this._els.tintOpacity = this._pickerWithRange(this._els.filterTintColor.pickerControl);
    this._els.blendType = this._pickerWithSelectbox(this._els.filterBlendColor.pickerControl);

    this.colorPickerControls.push(this._els.filterTintColor);
    this.colorPickerControls.push(this._els.filterMultiplyColor);
    this.colorPickerControls.push(this._els.filterBlendColor);

    this.colorPickerInputBoxes = [];
    this.colorPickerInputBoxes.push(
      this._els.filterTintColor.colorpickerElement.querySelector(
        selectorNames.COLOR_PICKER_INPUT_BOX
      )
    );
    this.colorPickerInputBoxes.push(
      this._els.filterMultiplyColor.colorpickerElement.querySelector(
        selectorNames.COLOR_PICKER_INPUT_BOX
      )
    );
    this.colorPickerInputBoxes.push(
      this._els.filterBlendColor.colorpickerElement.querySelector(
        selectorNames.COLOR_PICKER_INPUT_BOX
      )
    );
  }

  /**
   * Make submenu control for picker & range mixin
   * @param {HTMLElement} pickerControl - pickerControl dom element
   * @returns {Range}
   * @private
   */
  _pickerWithRange(pickerControl) {
    const rangeWrap = document.createElement('div');
    const rangeLabel = document.createElement('label');
    const slider = document.createElement('div');

    slider.id = 'tie-filter-tint-opacity';
    rangeLabel.innerHTML = 'Opacity';
    rangeWrap.appendChild(rangeLabel);
    rangeWrap.appendChild(slider);
    pickerControl.appendChild(rangeWrap);
    pickerControl.style.height = PICKER_CONTROL_HEIGHT;

    return new Range({ slider }, FILTER_RANGE.tintOpacityRange);
  }

  /**
   * Make submenu control for picker & selectbox
   * @param {HTMLElement} pickerControl - pickerControl dom element
   * @returns {HTMLElement}
   * @private
   */
  _pickerWithSelectbox(pickerControl) {
    const selectlistWrap = document.createElement('div');
    const selectlist = document.createElement('select');
    const optionlist = document.createElement('ul');

    selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
    optionlist.className = 'tui-image-editor-selectlist';

    selectlistWrap.appendChild(selectlist);
    selectlistWrap.appendChild(optionlist);

    this._makeSelectOptionList(selectlist);

    pickerControl.appendChild(selectlistWrap);
    pickerControl.style.height = PICKER_CONTROL_HEIGHT;

    this._drawSelectOptionList(selectlist, optionlist);
    this._pickerWithSelectboxForAddEvent(selectlist, optionlist);

    return selectlist;
  }

  /**
   * Make selectbox option list custom style
   * @param {HTMLElement} selectlist - selectbox element
   * @param {HTMLElement} optionlist - custom option list item element
   * @private
   */
  _drawSelectOptionList(selectlist, optionlist) {
    const options = selectlist.querySelectorAll('option');
    snippet.forEach(options, (option) => {
      const optionElement = document.createElement('li');
      optionElement.innerHTML = option.innerHTML;
      optionElement.setAttribute('data-item', option.value);
      optionlist.appendChild(optionElement);
    });
  }

  /**
   * custom selectbox custom event
   * @param {HTMLElement} selectlist - selectbox element
   * @param {HTMLElement} optionlist - custom option list item element
   * @private
   */
  _pickerWithSelectboxForAddEvent(selectlist, optionlist) {
    optionlist.addEventListener('click', (event) => {
      const optionValue = event.target.getAttribute('data-item');
      const fireEvent = document.createEvent('HTMLEvents');

      selectlist.querySelector(`[value="${optionValue}"]`).selected = true;
      fireEvent.initEvent('change', true, true);

      selectlist.dispatchEvent(fireEvent);

      this.selectBoxShow = false;
      optionlist.style.display = 'none';
    });

    selectlist.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this.selectBoxShow = !this.selectBoxShow;
      optionlist.style.display = this.selectBoxShow ? 'block' : 'none';
      optionlist.setAttribute('data-selectitem', selectlist.value);
      optionlist.querySelector(`[data-item='${selectlist.value}']`).classList.add('active');
    });
  }

  /**
   * Make option list for select control
   * @param {HTMLElement} selectlist - blend option select list element
   * @private
   */
  _makeSelectOptionList(selectlist) {
    snippet.forEach(BLEND_OPTIONS, (option) => {
      const selectOption = document.createElement('option');
      selectOption.setAttribute('value', option);
      selectOption.innerHTML = option.replace(/^[a-z]/, ($0) => $0.toUpperCase());
      selectlist.appendChild(selectOption);
    });
  }
}

export default Filter;
