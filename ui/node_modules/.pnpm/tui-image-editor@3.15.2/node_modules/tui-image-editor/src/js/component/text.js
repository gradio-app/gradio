/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Text module
 */
import snippet from 'tui-code-snippet';
import { fabric } from 'fabric';
import Component from '@/interface/component';
import { componentNames, eventNames as events, fObjectOptions } from '@/consts';

const defaultStyles = {
  fill: '#000000',
  left: 0,
  top: 0,
};
const resetStyles = {
  fill: '#000000',
  fontStyle: 'normal',
  fontWeight: 'normal',
  textAlign: 'tie-text-align-left',
  underline: false,
};
const DBCLICK_TIME = 500;

/**
 * Text
 * @class Text
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Text extends Component {
  constructor(graphics) {
    super(componentNames.TEXT, graphics);

    /**
     * Default text style
     * @type {Object}
     */
    this._defaultStyles = defaultStyles;

    /**
     * Selected state
     * @type {boolean}
     */
    this._isSelected = false;

    /**
     * Selected text object
     * @type {Object}
     */
    this._selectedObj = {};

    /**
     * Editing text object
     * @type {Object}
     */
    this._editingObj = {};

    /**
     * Listeners for fabric event
     * @type {Object}
     */
    this._listeners = {
      mousedown: this._onFabricMouseDown.bind(this),
      select: this._onFabricSelect.bind(this),
      selectClear: this._onFabricSelectClear.bind(this),
      scaling: this._onFabricScaling.bind(this),
      textChanged: this._onFabricTextChanged.bind(this),
    };

    /**
     * Textarea element for editing
     * @type {HTMLElement}
     */
    this._textarea = null;

    /**
     * Ratio of current canvas
     * @type {number}
     */
    this._ratio = 1;

    /**
     * Last click time
     * @type {Date}
     */
    this._lastClickTime = new Date().getTime();

    /**
     * Text object infos before editing
     * @type {Object}
     */
    this._editingObjInfos = {};

    /**
     * Previous state of editing
     * @type {boolean}
     */
    this.isPrevEditing = false;
  }

  /**
   * Start input text mode
   */
  start() {
    const canvas = this.getCanvas();

    canvas.selection = false;
    canvas.defaultCursor = 'text';
    canvas.on({
      'mouse:down': this._listeners.mousedown,
      'selection:created': this._listeners.select,
      'selection:updated': this._listeners.select,
      'before:selection:cleared': this._listeners.selectClear,
      'object:scaling': this._listeners.scaling,
      'text:changed': this._listeners.textChanged,
    });

    canvas.forEachObject((obj) => {
      if (obj.type === 'i-text') {
        this.adjustOriginPosition(obj, 'start');
      }
    });

    this.setCanvasRatio();
  }

  /**
   * End input text mode
   */
  end() {
    const canvas = this.getCanvas();

    canvas.selection = true;
    canvas.defaultCursor = 'default';

    canvas.forEachObject((obj) => {
      if (obj.type === 'i-text') {
        if (obj.text === '') {
          canvas.remove(obj);
        } else {
          this.adjustOriginPosition(obj, 'end');
        }
      }
    });

    canvas.off({
      'mouse:down': this._listeners.mousedown,
      'selection:created': this._listeners.select,
      'selection:updated': this._listeners.select,
      'before:selection:cleared': this._listeners.selectClear,
      'object:selected': this._listeners.select,
      'object:scaling': this._listeners.scaling,
      'text:changed': this._listeners.textChanged,
    });
  }

  /**
   * Adjust the origin position
   * @param {fabric.Object} text - text object
   * @param {string} editStatus - 'start' or 'end'
   */
  adjustOriginPosition(text, editStatus) {
    let [originX, originY] = ['center', 'center'];
    if (editStatus === 'start') {
      [originX, originY] = ['left', 'top'];
    }

    const { x: left, y: top } = text.getPointByOrigin(originX, originY);
    text.set({
      left,
      top,
      originX,
      originY,
    });
    text.setCoords();
  }

  /**
   * Add new text on canvas image
   * @param {string} text - Initial input text
   * @param {Object} options - Options for generating text
   *     @param {Object} [options.styles] Initial styles
   *         @param {string} [options.styles.fill] Color
   *         @param {string} [options.styles.fontFamily] Font type for text
   *         @param {number} [options.styles.fontSize] Size
   *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
   *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
   *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
   *         @param {string} [options.styles.textDecoration] Type of line (underline / line-through / overline)
   *     @param {{x: number, y: number}} [options.position] - Initial position
   * @returns {Promise}
   */
  add(text, options) {
    return new Promise((resolve) => {
      const canvas = this.getCanvas();
      let newText = null;
      let selectionStyle = fObjectOptions.SELECTION_STYLE;
      let styles = this._defaultStyles;

      this._setInitPos(options.position);

      if (options.styles) {
        styles = snippet.extend(styles, options.styles);
      }

      if (!snippet.isExisty(options.autofocus)) {
        options.autofocus = true;
      }

      newText = new fabric.IText(text, styles);
      selectionStyle = snippet.extend({}, selectionStyle, {
        originX: 'left',
        originY: 'top',
      });

      newText.set(selectionStyle);
      newText.on({
        mouseup: this._onFabricMouseUp.bind(this),
      });

      canvas.add(newText);

      if (options.autofocus) {
        newText.enterEditing();
        newText.selectAll();
      }

      if (!canvas.getActiveObject()) {
        canvas.setActiveObject(newText);
      }

      this.isPrevEditing = true;
      resolve(this.graphics.createObjectProperties(newText));
    });
  }

  /**
   * Change text of activate object on canvas image
   * @param {Object} activeObj - Current selected text object
   * @param {string} text - Changed text
   * @returns {Promise}
   */
  change(activeObj, text) {
    return new Promise((resolve) => {
      activeObj.set('text', text);

      this.getCanvas().renderAll();
      resolve();
    });
  }

  /**
   * Set style
   * @param {Object} activeObj - Current selected text object
   * @param {Object} styleObj - Initial styles
   *     @param {string} [styleObj.fill] Color
   *     @param {string} [styleObj.fontFamily] Font type for text
   *     @param {number} [styleObj.fontSize] Size
   *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
   *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
   *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
   *     @param {string} [styleObj.textDecoration] Type of line (underline / line-through / overline)
   * @returns {Promise}
   */
  setStyle(activeObj, styleObj) {
    return new Promise((resolve) => {
      snippet.forEach(
        styleObj,
        (val, key) => {
          if (activeObj[key] === val && key !== 'fontSize') {
            styleObj[key] = resetStyles[key] || '';
          }
        },
        this
      );

      if ('textDecoration' in styleObj) {
        snippet.extend(styleObj, this._getTextDecorationAdaptObject(styleObj.textDecoration));
      }

      activeObj.set(styleObj);

      this.getCanvas().renderAll();
      resolve();
    });
  }

  /**
   * Get the text
   * @param {Object} activeObj - Current selected text object
   * @returns {String} text
   */
  getText(activeObj) {
    return activeObj.text;
  }

  /**
   * Set infos of the current selected object
   * @param {fabric.Text} obj - Current selected text object
   * @param {boolean} state - State of selecting
   */
  setSelectedInfo(obj, state) {
    this._selectedObj = obj;
    this._isSelected = state;
  }

  /**
   * Whether object is selected or not
   * @returns {boolean} State of selecting
   */
  isSelected() {
    return this._isSelected;
  }

  /**
   * Get current selected text object
   * @returns {fabric.Text} Current selected text object
   */
  getSelectedObj() {
    return this._selectedObj;
  }

  /**
   * Set ratio value of canvas
   */
  setCanvasRatio() {
    const canvasElement = this.getCanvasElement();
    const cssWidth = parseInt(canvasElement.style.maxWidth, 10);
    const originWidth = canvasElement.width;

    this._ratio = originWidth / cssWidth;
  }

  /**
   * Get ratio value of canvas
   * @returns {number} Ratio value
   */
  getCanvasRatio() {
    return this._ratio;
  }

  /**
   * Get text decoration adapt object
   * @param {string} textDecoration - text decoration option string
   * @returns {object} adapt object for override
   */
  _getTextDecorationAdaptObject(textDecoration) {
    return {
      underline: textDecoration === 'underline',
      linethrough: textDecoration === 'line-through',
      overline: textDecoration === 'overline',
    };
  }

  /**
   * Set initial position on canvas image
   * @param {{x: number, y: number}} [position] - Selected position
   * @private
   */
  _setInitPos(position) {
    position = position || this.getCanvasImage().getCenterPoint();

    this._defaultStyles.left = position.x;
    this._defaultStyles.top = position.y;
  }

  /**
   * Input event handler
   * @private
   */
  _onInput() {
    const ratio = this.getCanvasRatio();
    const obj = this._editingObj;
    const textareaStyle = this._textarea.style;

    textareaStyle.width = `${Math.ceil(obj.width / ratio)}px`;
    textareaStyle.height = `${Math.ceil(obj.height / ratio)}px`;
  }

  /**
   * Keydown event handler
   * @private
   */
  _onKeyDown() {
    const ratio = this.getCanvasRatio();
    const obj = this._editingObj;
    const textareaStyle = this._textarea.style;

    setTimeout(() => {
      obj.text(this._textarea.value);

      textareaStyle.width = `${Math.ceil(obj.width / ratio)}px`;
      textareaStyle.height = `${Math.ceil(obj.height / ratio)}px`;
    }, 0);
  }

  /**
   * Blur event handler
   * @private
   */
  _onBlur() {
    const ratio = this.getCanvasRatio();
    const editingObj = this._editingObj;
    const editingObjInfos = this._editingObjInfos;
    const textContent = this._textarea.value;
    let transWidth = editingObj.width / ratio - editingObjInfos.width / ratio;
    let transHeight = editingObj.height / ratio - editingObjInfos.height / ratio;

    if (ratio === 1) {
      transWidth /= 2;
      transHeight /= 2;
    }

    this._textarea.style.display = 'none';

    editingObj.set({
      left: editingObjInfos.left + transWidth,
      top: editingObjInfos.top + transHeight,
    });

    if (textContent.length) {
      this.getCanvas().add(editingObj);

      const params = {
        id: snippet.stamp(editingObj),
        type: editingObj.type,
        text: textContent,
      };

      this.fire(events.TEXT_CHANGED, params);
    }
  }

  /**
   * Scroll event handler
   * @private
   */
  _onScroll() {
    this._textarea.scrollLeft = 0;
    this._textarea.scrollTop = 0;
  }

  /**
   * Fabric scaling event handler
   * @param {fabric.Event} fEvent - Current scaling event on selected object
   * @private
   */
  _onFabricScaling(fEvent) {
    const obj = fEvent.target;

    obj.fontSize = obj.fontSize * obj.scaleY;
    obj.scaleX = 1;
    obj.scaleY = 1;
  }

  /**
   * textChanged event handler
   * @param {{target: fabric.Object}} props - changed text object
   * @private
   */
  _onFabricTextChanged(props) {
    this.fire(events.TEXT_CHANGED, props.target);
  }

  /**
   * onSelectClear handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onFabricSelectClear(fEvent) {
    const obj = this.getSelectedObj();

    this.isPrevEditing = true;

    this.setSelectedInfo(fEvent.target, false);

    if (obj) {
      // obj is empty object at initial time, will be set fabric object
      if (obj.text === '') {
        this.getCanvas().remove(obj);
      }
    }
  }

  /**
   * onSelect handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onFabricSelect(fEvent) {
    this.isPrevEditing = true;

    this.setSelectedInfo(fEvent.target, true);
  }

  /**
   * Fabric 'mousedown' event handler
   * @param {fabric.Event} fEvent - Current mousedown event on selected object
   * @private
   */
  _onFabricMouseDown(fEvent) {
    const obj = fEvent.target;

    if (obj && !obj.isType('text')) {
      return;
    }

    if (this.isPrevEditing) {
      this.isPrevEditing = false;

      return;
    }

    this._fireAddText(fEvent);
  }

  /**
   * Fire 'addText' event if object is not selected.
   * @param {fabric.Event} fEvent - Current mousedown event on selected object
   * @private
   */
  _fireAddText(fEvent) {
    const obj = fEvent.target;
    const e = fEvent.e || {};
    const originPointer = this.getCanvas().getPointer(e);

    if (!obj) {
      this.fire(events.ADD_TEXT, {
        originPosition: {
          x: originPointer.x,
          y: originPointer.y,
        },
        clientPosition: {
          x: e.clientX || 0,
          y: e.clientY || 0,
        },
      });
    }
  }

  /**
   * Fabric mouseup event handler
   * @param {fabric.Event} fEvent - Current mousedown event on selected object
   * @private
   */
  _onFabricMouseUp(fEvent) {
    const { target } = fEvent;
    const newClickTime = new Date().getTime();

    if (this._isDoubleClick(newClickTime) && !target.isEditing) {
      target.enterEditing();
    }

    if (target.isEditing) {
      this.fire(events.TEXT_EDITING); // fire editing text event
    }

    this._lastClickTime = newClickTime;
  }

  /**
   * Get state of firing double click event
   * @param {Date} newClickTime - Current clicked time
   * @returns {boolean} Whether double clicked or not
   * @private
   */
  _isDoubleClick(newClickTime) {
    return newClickTime - this._lastClickTime < DBCLICK_TIME;
  }
}

export default Text;
