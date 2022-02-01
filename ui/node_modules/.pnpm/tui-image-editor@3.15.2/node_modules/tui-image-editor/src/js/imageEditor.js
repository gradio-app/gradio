/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Image-editor application class
 */
import snippet from 'tui-code-snippet';
import { fabric } from 'fabric';
import Invoker from '@/invoker';
import UI from '@/ui';
import action from '@/action';
import commandFactory from '@/factory/command';
import Graphics from '@/graphics';
import { makeSelectionUndoData, makeSelectionUndoDatum } from '@/helper/selectionModifyHelper';
import { sendHostName, getObjectType } from '@/util';
import {
  eventNames as events,
  commandNames as commands,
  keyCodes,
  rejectMessages,
  OBJ_TYPE,
} from '@/consts';

const { isUndefined, forEach, CustomEvents } = snippet;

const {
  MOUSE_DOWN,
  OBJECT_MOVED,
  OBJECT_SCALED,
  OBJECT_ACTIVATED,
  OBJECT_ROTATED,
  OBJECT_ADDED,
  OBJECT_MODIFIED,
  ADD_TEXT,
  ADD_OBJECT,
  TEXT_EDITING,
  TEXT_CHANGED,
  ICON_CREATE_RESIZE,
  ICON_CREATE_END,
  SELECTION_CLEARED,
  SELECTION_CREATED,
  ADD_OBJECT_AFTER,
} = events;

/**
 * Image filter result
 * @typedef {object} FilterResult
 * @property {string} type - filter type like 'mask', 'Grayscale' and so on
 * @property {string} action - action type like 'add', 'remove'
 */

/**
 * Flip status
 * @typedef {object} FlipStatus
 * @property {boolean} flipX - x axis
 * @property {boolean} flipY - y axis
 * @property {Number} angle - angle
 */
/**
 * Rotation status
 * @typedef {Number} RotateStatus
 * @property {Number} angle - angle
 */

/**
 * Old and new Size
 * @typedef {object} SizeChange
 * @property {Number} oldWidth - old width
 * @property {Number} oldHeight - old height
 * @property {Number} newWidth - new width
 * @property {Number} newHeight - new height
 */

/**
 * @typedef {string} ErrorMsg - {string} error message
 */

/**
 * @typedef {object} ObjectProps - graphics object properties
 * @property {number} id - object id
 * @property {string} type - object type
 * @property {string} text - text content
 * @property {(string | number)} left - Left
 * @property {(string | number)} top - Top
 * @property {(string | number)} width - Width
 * @property {(string | number)} height - Height
 * @property {string} fill - Color
 * @property {string} stroke - Stroke
 * @property {(string | number)} strokeWidth - StrokeWidth
 * @property {string} fontFamily - Font type for text
 * @property {number} fontSize - Font Size
 * @property {string} fontStyle - Type of inclination (normal / italic)
 * @property {string} fontWeight - Type of thicker or thinner looking (normal / bold)
 * @property {string} textAlign - Type of text align (left / center / right)
 * @property {string} textDecoration - Type of line (underline / line-through / overline)
 */

/**
 * Shape filter option
 * @typedef {object.<string, number>} ShapeFilterOption
 */

/**
 * Shape filter option
 * @typedef {object} ShapeFillOption - fill option of shape
 * @property {string} type - fill type ('color' or 'filter')
 * @property {Array.<ShapeFillFilterOption>} [filter] - {@link ShapeFilterOption} List.
 *  only applies to filter types
 *  (ex: \[\{pixelate: 20\}, \{blur: 0.3\}\])
 * @property {string} [color] - Shape foreground color (ex: '#fff', 'transparent')
 */

/**
 * Image editor
 * @class
 * @param {string|HTMLElement} wrapper - Wrapper's element or selector
 * @param {Object} [options] - Canvas max width & height of css
 *  @param {number} [options.includeUI] - Use the provided UI
 *    @param {Object} [options.includeUI.loadImage] - Basic editing image
 *      @param {string} options.includeUI.loadImage.path - image path
 *      @param {string} options.includeUI.loadImage.name - image name
 *    @param {Object} [options.includeUI.theme] - Theme object
 *    @param {Array} [options.includeUI.menu] - It can be selected when only specific menu is used, Default values are \['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'\].
 *    @param {string} [options.includeUI.initMenu] - The first menu to be selected and started.
 *    @param {Object} [options.includeUI.uiSize] - ui size of editor
 *      @param {string} options.includeUI.uiSize.width - width of ui
 *      @param {string} options.includeUI.uiSize.height - height of ui
 *    @param {string} [options.includeUI.menuBarPosition=bottom] - Menu bar position('top', 'bottom', 'left', 'right')
 *  @param {number} options.cssMaxWidth - Canvas css-max-width
 *  @param {number} options.cssMaxHeight - Canvas css-max-height
 *  @param {Object} [options.selectionStyle] - selection style
 *  @param {string} [options.selectionStyle.cornerStyle] - selection corner style
 *  @param {number} [options.selectionStyle.cornerSize] - selection corner size
 *  @param {string} [options.selectionStyle.cornerColor] - selection corner color
 *  @param {string} [options.selectionStyle.cornerStrokeColor] = selection corner stroke color
 *  @param {boolean} [options.selectionStyle.transparentCorners] - selection corner transparent
 *  @param {number} [options.selectionStyle.lineWidth] - selection line width
 *  @param {string} [options.selectionStyle.borderColor] - selection border color
 *  @param {number} [options.selectionStyle.rotatingPointOffset] - selection rotating point length
 *  @param {Boolean} [options.usageStatistics=true] - Let us know the hostname. If you don't want to send the hostname, please set to false.
 * @example
 * var ImageEditor = require('tui-image-editor');
 * var blackTheme = require('./js/theme/black-theme.js');
 * var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
 *   includeUI: {
 *     loadImage: {
 *       path: 'img/sampleImage.jpg',
 *       name: 'SampleImage'
 *     },
 *     theme: blackTheme, // or whiteTheme
 *     menu: ['shape', 'filter'],
 *     initMenu: 'filter',
 *     uiSize: {
 *         width: '1000px',
 *         height: '700px'
 *     },
 *     menuBarPosition: 'bottom'
 *   },
 *   cssMaxWidth: 700,
 *   cssMaxHeight: 500,
 *   selectionStyle: {
 *     cornerSize: 20,
 *     rotatingPointOffset: 70
 *   }
 * });
 */
class ImageEditor {
  constructor(wrapper, options) {
    options = snippet.extend(
      {
        includeUI: false,
        usageStatistics: true,
      },
      options
    );

    this.mode = null;

    this.activeObjectId = null;

    /**
     * UI instance
     * @type {Ui}
     */
    if (options.includeUI) {
      const UIOption = options.includeUI;
      UIOption.usageStatistics = options.usageStatistics;

      this.ui = new UI(wrapper, UIOption, this.getActions());
      options = this.ui.setUiDefaultSelectionStyle(options);
    }

    /**
     * Invoker
     * @type {Invoker}
     * @private
     */
    this._invoker = new Invoker();

    /**
     * Graphics instance
     * @type {Graphics}
     * @private
     */
    this._graphics = new Graphics(this.ui ? this.ui.getEditorArea() : wrapper, {
      cssMaxWidth: options.cssMaxWidth,
      cssMaxHeight: options.cssMaxHeight,
    });

    /**
     * Event handler list
     * @type {Object}
     * @private
     */
    this._handlers = {
      keydown: this._onKeyDown.bind(this),
      mousedown: this._onMouseDown.bind(this),
      objectActivated: this._onObjectActivated.bind(this),
      objectMoved: this._onObjectMoved.bind(this),
      objectScaled: this._onObjectScaled.bind(this),
      objectRotated: this._onObjectRotated.bind(this),
      objectAdded: this._onObjectAdded.bind(this),
      objectModified: this._onObjectModified.bind(this),
      createdPath: this._onCreatedPath,
      addText: this._onAddText.bind(this),
      addObject: this._onAddObject.bind(this),
      textEditing: this._onTextEditing.bind(this),
      textChanged: this._onTextChanged.bind(this),
      iconCreateResize: this._onIconCreateResize.bind(this),
      iconCreateEnd: this._onIconCreateEnd.bind(this),
      selectionCleared: this._selectionCleared.bind(this),
      selectionCreated: this._selectionCreated.bind(this),
    };

    this._attachInvokerEvents();
    this._attachGraphicsEvents();
    this._attachDomEvents();
    this._setSelectionStyle(options.selectionStyle, {
      applyCropSelectionStyle: options.applyCropSelectionStyle,
      applyGroupSelectionStyle: options.applyGroupSelectionStyle,
    });

    if (options.usageStatistics) {
      sendHostName();
    }

    if (this.ui) {
      this.ui.initCanvas();
      this.setReAction();
      this._attachColorPickerInputBoxEvents();
    }
    fabric.enableGLFiltering = false;
  }

  _attachColorPickerInputBoxEvents() {
    this.ui.on(events.INPUT_BOX_EDITING_STARTED, () => {
      this.isColorPickerInputBoxEditing = true;
    });
    this.ui.on(events.INPUT_BOX_EDITING_STOPPED, () => {
      this.isColorPickerInputBoxEditing = false;
    });
  }

  _detachColorPickerInputBoxEvents() {
    this.ui.off(events.INPUT_BOX_EDITING_STARTED);
    this.ui.off(events.INPUT_BOX_EDITING_STOPPED);
  }

  /**
   * Set selection style by init option
   * @param {Object} selectionStyle - Selection styles
   * @param {Object} applyTargets - Selection apply targets
   *   @param {boolean} applyCropSelectionStyle - whether apply with crop selection style or not
   *   @param {boolean} applyGroupSelectionStyle - whether apply with group selection style or not
   * @private
   */
  _setSelectionStyle(selectionStyle, { applyCropSelectionStyle, applyGroupSelectionStyle }) {
    if (selectionStyle) {
      this._graphics.setSelectionStyle(selectionStyle);
    }

    if (applyCropSelectionStyle) {
      this._graphics.setCropSelectionStyle(selectionStyle);
    }

    if (applyGroupSelectionStyle) {
      this.on('selectionCreated', (eventTarget) => {
        if (eventTarget.type === 'activeSelection') {
          eventTarget.set(selectionStyle);
        }
      });
    }
  }

  /**
   * Attach invoker events
   * @private
   */
  _attachInvokerEvents() {
    const {
      UNDO_STACK_CHANGED,
      REDO_STACK_CHANGED,
      EXECUTE_COMMAND,
      AFTER_UNDO,
      AFTER_REDO,
      HAND_STARTED,
      HAND_STOPPED,
    } = events;

    /**
     * Undo stack changed event
     * @event ImageEditor#undoStackChanged
     * @param {Number} length - undo stack length
     * @example
     * imageEditor.on('undoStackChanged', function(length) {
     *     console.log(length);
     * });
     */
    this._invoker.on(UNDO_STACK_CHANGED, this.fire.bind(this, UNDO_STACK_CHANGED));
    /**
     * Redo stack changed event
     * @event ImageEditor#redoStackChanged
     * @param {Number} length - redo stack length
     * @example
     * imageEditor.on('redoStackChanged', function(length) {
     *     console.log(length);
     * });
     */
    this._invoker.on(REDO_STACK_CHANGED, this.fire.bind(this, REDO_STACK_CHANGED));

    if (this.ui) {
      const canvas = this._graphics.getCanvas();

      this._invoker.on(EXECUTE_COMMAND, (command) => this.ui.fire(EXECUTE_COMMAND, command));
      this._invoker.on(AFTER_UNDO, (command) => this.ui.fire(AFTER_UNDO, command));
      this._invoker.on(AFTER_REDO, (command) => this.ui.fire(AFTER_REDO, command));

      canvas.on(HAND_STARTED, () => this.ui.fire(HAND_STARTED));
      canvas.on(HAND_STOPPED, () => this.ui.fire(HAND_STOPPED));
    }
  }

  /**
   * Attach canvas events
   * @private
   */
  _attachGraphicsEvents() {
    this._graphics.on({
      [MOUSE_DOWN]: this._handlers.mousedown,
      [OBJECT_MOVED]: this._handlers.objectMoved,
      [OBJECT_SCALED]: this._handlers.objectScaled,
      [OBJECT_ROTATED]: this._handlers.objectRotated,
      [OBJECT_ACTIVATED]: this._handlers.objectActivated,
      [OBJECT_ADDED]: this._handlers.objectAdded,
      [OBJECT_MODIFIED]: this._handlers.objectModified,
      [ADD_TEXT]: this._handlers.addText,
      [ADD_OBJECT]: this._handlers.addObject,
      [TEXT_EDITING]: this._handlers.textEditing,
      [TEXT_CHANGED]: this._handlers.textChanged,
      [ICON_CREATE_RESIZE]: this._handlers.iconCreateResize,
      [ICON_CREATE_END]: this._handlers.iconCreateEnd,
      [SELECTION_CLEARED]: this._handlers.selectionCleared,
      [SELECTION_CREATED]: this._handlers.selectionCreated,
    });
  }

  /**
   * Attach dom events
   * @private
   */
  _attachDomEvents() {
    // ImageEditor supports IE 9 higher
    document.addEventListener('keydown', this._handlers.keydown);
  }

  /**
   * Detach dom events
   * @private
   */
  _detachDomEvents() {
    // ImageEditor supports IE 9 higher
    document.removeEventListener('keydown', this._handlers.keydown);
  }

  /**
   * Keydown event handler
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  /* eslint-disable complexity */
  _onKeyDown(e) {
    const { ctrlKey, keyCode, metaKey } = e;
    const isModifierKey = ctrlKey || metaKey;

    if (isModifierKey) {
      if (keyCode === keyCodes.C) {
        this._graphics.resetTargetObjectForCopyPaste();
      } else if (keyCode === keyCodes.V) {
        this._graphics.pasteObject();
        this.clearRedoStack();
      } else if (keyCode === keyCodes.Z) {
        // There is no error message on shortcut when it's empty
        this.undo()['catch'](() => {});
      } else if (keyCode === keyCodes.Y) {
        // There is no error message on shortcut when it's empty
        this.redo()['catch'](() => {});
      }
    }

    const isDeleteKey = keyCode === keyCodes.BACKSPACE || keyCode === keyCodes.DEL;
    const isRemoveReady = this._graphics.isReadyRemoveObject();

    if (!this.isColorPickerInputBoxEditing && isRemoveReady && isDeleteKey) {
      e.preventDefault();
      this.removeActiveObject();
    }
  }

  /**
   * Remove Active Object
   */
  removeActiveObject() {
    const activeObjectId = this._graphics.getActiveObjectIdForRemove();

    this.removeObject(activeObjectId);
  }

  /**
   * mouse down event handler
   * @param {Event} event - mouse down event
   * @param {Object} originPointer - origin pointer
   *  @param {Number} originPointer.x x position
   *  @param {Number} originPointer.y y position
   * @private
   */
  _onMouseDown(event, originPointer) {
    /**
     * The mouse down event with position x, y on canvas
     * @event ImageEditor#mousedown
     * @param {Object} event - browser mouse event object
     * @param {Object} originPointer origin pointer
     *  @param {Number} originPointer.x x position
     *  @param {Number} originPointer.y y position
     * @example
     * imageEditor.on('mousedown', function(event, originPointer) {
     *     console.log(event);
     *     console.log(originPointer);
     *     if (imageEditor.hasFilter('colorFilter')) {
     *         imageEditor.applyFilter('colorFilter', {
     *             x: parseInt(originPointer.x, 10),
     *             y: parseInt(originPointer.y, 10)
     *         });
     *     }
     * });
     */

    this.fire(events.MOUSE_DOWN, event, originPointer);
  }

  /**
   * Add a 'addObject' command
   * @param {Object} obj - Fabric object
   * @private
   */
  _pushAddObjectCommand(obj) {
    const command = commandFactory.create(commands.ADD_OBJECT, this._graphics, obj);
    this._invoker.pushUndoStack(command);
  }

  /**
   * Add a 'changeSelection' command
   * @param {fabric.Object} obj - selection object
   * @private
   */
  _pushModifyObjectCommand(obj) {
    const { type } = obj;
    const props = makeSelectionUndoData(obj, (item) =>
      makeSelectionUndoDatum(this._graphics.getObjectId(item), item, type === 'activeSelection')
    );
    const command = commandFactory.create(commands.CHANGE_SELECTION, this._graphics, props);
    command.execute(this._graphics, props);

    this._invoker.pushUndoStack(command);
  }

  /**
   * 'objectActivated' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectActivated(props) {
    /**
     * The event when object is selected(aka activated).
     * @event ImageEditor#objectActivated
     * @param {ObjectProps} objectProps - object properties
     * @example
     * imageEditor.on('objectActivated', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     *     console.log(props.id);
     * });
     */
    this.fire(events.OBJECT_ACTIVATED, props);
  }

  /**
   * 'objectMoved' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectMoved(props) {
    /**
     * The event when object is moved
     * @event ImageEditor#objectMoved
     * @param {ObjectProps} props - object properties
     * @example
     * imageEditor.on('objectMoved', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     * });
     */
    this.fire(events.OBJECT_MOVED, props);
  }

  /**
   * 'objectScaled' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectScaled(props) {
    /**
     * The event when scale factor is changed
     * @event ImageEditor#objectScaled
     * @param {ObjectProps} props - object properties
     * @example
     * imageEditor.on('objectScaled', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     * });
     */
    this.fire(events.OBJECT_SCALED, props);
  }

  /**
   * 'objectRotated' event handler
   * @param {ObjectProps} props - object properties
   * @private
   */
  _onObjectRotated(props) {
    /**
     * The event when object angle is changed
     * @event ImageEditor#objectRotated
     * @param {ObjectProps} props - object properties
     * @example
     * imageEditor.on('objectRotated', function(props) {
     *     console.log(props);
     *     console.log(props.type);
     * });
     */
    this.fire(events.OBJECT_ROTATED, props);
  }

  /**
   * Get current drawing mode
   * @returns {string}
   * @example
   * // Image editor drawing mode
   * //
   * //    NORMAL: 'NORMAL'
   * //    CROPPER: 'CROPPER'
   * //    FREE_DRAWING: 'FREE_DRAWING'
   * //    LINE_DRAWING: 'LINE_DRAWING'
   * //    TEXT: 'TEXT'
   * //
   * if (imageEditor.getDrawingMode() === 'FREE_DRAWING') {
   *     imageEditor.stopDrawingMode();
   * }
   */
  getDrawingMode() {
    return this._graphics.getDrawingMode();
  }

  /**
   * Clear all objects
   * @returns {Promise}
   * @example
   * imageEditor.clearObjects();
   */
  clearObjects() {
    return this.execute(commands.CLEAR_OBJECTS);
  }

  /**
   * Deactivate all objects
   * @example
   * imageEditor.deactivateAll();
   */
  deactivateAll() {
    this._graphics.deactivateAll();
    this._graphics.renderAll();
  }

  /**
   * discard selction
   * @example
   * imageEditor.discardSelection();
   */
  discardSelection() {
    this._graphics.discardSelection();
  }

  /**
   * selectable status change
   * @param {boolean} selectable - selectable status
   * @example
   * imageEditor.changeSelectableAll(false); // or true
   */
  changeSelectableAll(selectable) {
    this._graphics.changeSelectableAll(selectable);
  }

  /**
   * Init history
   */
  _initHistory() {
    if (this.ui) {
      this.ui.initHistory();
    }
  }

  /**
   * Clear history
   */
  _clearHistory() {
    if (this.ui) {
      this.ui.clearHistory();
    }
  }

  /**
   * Invoke command
   * @param {String} commandName - Command name
   * @param {...*} args - Arguments for creating command
   * @returns {Promise}
   * @private
   */
  execute(commandName, ...args) {
    // Inject an Graphics instance as first parameter
    const theArgs = [this._graphics].concat(args);

    return this._invoker.execute(commandName, ...theArgs);
  }

  /**
   * Invoke command
   * @param {String} commandName - Command name
   * @param {...*} args - Arguments for creating command
   * @returns {Promise}
   * @private
   */
  executeSilent(commandName, ...args) {
    // Inject an Graphics instance as first parameter
    const theArgs = [this._graphics].concat(args);

    return this._invoker.executeSilent(commandName, ...theArgs);
  }

  /**
   * Undo
   * @param {number} [iterationCount=1] - Iteration count of undo
   * @returns {Promise}
   * @example
   * imageEditor.undo();
   */
  undo(iterationCount = 1) {
    let promise = Promise.resolve();

    for (let i = 0; i < iterationCount; i += 1) {
      promise = promise.then(() => this._invoker.undo());
    }

    return promise;
  }

  /**
   * Redo
   * @param {number} [iterationCount=1] - Iteration count of redo
   * @returns {Promise}
   * @example
   * imageEditor.redo();
   */
  redo(iterationCount = 1) {
    let promise = Promise.resolve();

    for (let i = 0; i < iterationCount; i += 1) {
      promise = promise.then(() => this._invoker.redo());
    }

    return promise;
  }

  /**
   * Zoom
   * @param {number} x - x axis of center point for zoom
   * @param {number} y - y axis of center point for zoom
   * @param {number} zoomLevel - level of zoom(1.0 ~ 5.0)
   */
  zoom({ x, y, zoomLevel }) {
    this._graphics.zoom({ x, y }, zoomLevel);
  }

  /**
   * Reset zoom. Change zoom level to 1.0
   */
  resetZoom() {
    this._graphics.resetZoom();
  }

  /**
   * Load image from file
   * @param {File} imgFile - Image file
   * @param {string} [imageName] - imageName
   * @returns {Promise<SizeChange, ErrorMsg>}
   * @example
   * imageEditor.loadImageFromFile(file).then(result => {
   *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
   *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
   * });
   */
  loadImageFromFile(imgFile, imageName) {
    if (!imgFile) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    const imgUrl = URL.createObjectURL(imgFile);
    imageName = imageName || imgFile.name;

    return this.loadImageFromURL(imgUrl, imageName).then((value) => {
      URL.revokeObjectURL(imgFile);

      return value;
    });
  }

  /**
   * Load image from url
   * @param {string} url - File url
   * @param {string} imageName - imageName
   * @returns {Promise<SizeChange, ErrorMsg>}
   * @example
   * imageEditor.loadImageFromURL('http://url/testImage.png', 'lena').then(result => {
   *      console.log('old : ' + result.oldWidth + ', ' + result.oldHeight);
   *      console.log('new : ' + result.newWidth + ', ' + result.newHeight);
   * });
   */
  loadImageFromURL(url, imageName) {
    if (!imageName || !url) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    return this.execute(commands.LOAD_IMAGE, imageName, url);
  }

  /**
   * Add image object on canvas
   * @param {string} imgUrl - Image url to make object
   * @returns {Promise<ObjectProps, ErrorMsg>}
   * @example
   * imageEditor.addImageObject('path/fileName.jpg').then(objectProps => {
   *     console.log(ojectProps.id);
   * });
   */
  addImageObject(imgUrl) {
    if (!imgUrl) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    return this.execute(commands.ADD_IMAGE_OBJECT, imgUrl);
  }

  /**
   * Start a drawing mode. If the current mode is not 'NORMAL', 'stopDrawingMode()' will be called first.
   * @param {String} mode Can be one of <I>'CROPPER', 'FREE_DRAWING', 'LINE_DRAWING', 'TEXT', 'SHAPE'</I>
   * @param {Object} [option] parameters of drawing mode, it's available with 'FREE_DRAWING', 'LINE_DRAWING'
   *  @param {Number} [option.width] brush width
   *  @param {String} [option.color] brush color
   *  @param {Object} [option.arrowType] arrow decorate
   *    @param {string} [option.arrowType.tail] arrow decorate for tail. 'chevron' or 'triangle'
   *    @param {string} [option.arrowType.head] arrow decorate for head. 'chevron' or 'triangle'
   * @returns {boolean} true if success or false
   * @example
   * imageEditor.startDrawingMode('FREE_DRAWING', {
   *      width: 10,
   *      color: 'rgba(255,0,0,0.5)'
   * });
   * imageEditor.startDrawingMode('LINE_DRAWING', {
   *      width: 10,
   *      color: 'rgba(255,0,0,0.5)',
   *      arrowType: {
   *          tail: 'chevron' // triangle
   *      }
   * });
   *
   */
  startDrawingMode(mode, option) {
    return this._graphics.startDrawingMode(mode, option);
  }

  /**
   * Stop the current drawing mode and back to the 'NORMAL' mode
   * @example
   * imageEditor.stopDrawingMode();
   */
  stopDrawingMode() {
    this._graphics.stopDrawingMode();
  }

  /**
   * Crop this image with rect
   * @param {Object} rect crop rect
   *  @param {Number} rect.left left position
   *  @param {Number} rect.top top position
   *  @param {Number} rect.width width
   *  @param {Number} rect.height height
   * @returns {Promise}
   * @example
   * imageEditor.crop(imageEditor.getCropzoneRect());
   */
  crop(rect) {
    const data = this._graphics.getCroppedImageData(rect);
    if (!data) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    return this.loadImageFromURL(data.url, data.imageName);
  }

  /**
   * Get the cropping rect
   * @returns {Object}  {{left: number, top: number, width: number, height: number}} rect
   */
  getCropzoneRect() {
    return this._graphics.getCropzoneRect();
  }

  /**
   * Set the cropping rect
   * @param {number} [mode] crop rect mode [1, 1.5, 1.3333333333333333, 1.25, 1.7777777777777777]
   */
  setCropzoneRect(mode) {
    this._graphics.setCropzoneRect(mode);
  }

  /**
   * Flip
   * @returns {Promise}
   * @param {string} type - 'flipX' or 'flipY' or 'reset'
   * @returns {Promise<FlipStatus, ErrorMsg>}
   * @private
   */
  _flip(type) {
    return this.execute(commands.FLIP_IMAGE, type);
  }

  /**
   * Flip x
   * @returns {Promise<FlipStatus, ErrorMsg>}
   * @example
   * imageEditor.flipX().then((status => {
   *     console.log('flipX: ', status.flipX);
   *     console.log('flipY: ', status.flipY);
   *     console.log('angle: ', status.angle);
   * }).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  flipX() {
    return this._flip('flipX');
  }

  /**
   * Flip y
   * @returns {Promise<FlipStatus, ErrorMsg>}
   * @example
   * imageEditor.flipY().then(status => {
   *     console.log('flipX: ', status.flipX);
   *     console.log('flipY: ', status.flipY);
   *     console.log('angle: ', status.angle);
   * }).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  flipY() {
    return this._flip('flipY');
  }

  /**
   * Reset flip
   * @returns {Promise<FlipStatus, ErrorMsg>}
   * @example
   * imageEditor.resetFlip().then(status => {
   *     console.log('flipX: ', status.flipX);
   *     console.log('flipY: ', status.flipY);
   *     console.log('angle: ', status.angle);
   * }).catch(message => {
   *     console.log('error: ', message);
   * });;
   */
  resetFlip() {
    return this._flip('reset');
  }

  /**
   * @param {string} type - 'rotate' or 'setAngle'
   * @param {number} angle - angle value (degree)
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise<RotateStatus, ErrorMsg>}
   * @private
   */
  _rotate(type, angle, isSilent) {
    let result = null;

    if (isSilent) {
      result = this.executeSilent(commands.ROTATE_IMAGE, type, angle);
    } else {
      result = this.execute(commands.ROTATE_IMAGE, type, angle);
    }

    return result;
  }

  /**
   * Rotate image
   * @returns {Promise}
   * @param {number} angle - Additional angle to rotate image
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise<RotateStatus, ErrorMsg>}
   * @example
   * imageEditor.rotate(10); // angle = 10
   * imageEditor.rotate(10); // angle = 20
   * imageEditor.rotate(5); // angle = 5
   * imageEditor.rotate(-95); // angle = -90
   * imageEditor.rotate(10).then(status => {
   *     console.log('angle: ', status.angle);
   * })).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  rotate(angle, isSilent) {
    return this._rotate('rotate', angle, isSilent);
  }

  /**
   * Set angle
   * @param {number} angle - Angle of image
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise<RotateStatus, ErrorMsg>}
   * @example
   * imageEditor.setAngle(10); // angle = 10
   * imageEditor.rotate(10); // angle = 20
   * imageEditor.setAngle(5); // angle = 5
   * imageEditor.rotate(50); // angle = 55
   * imageEditor.setAngle(-40); // angle = -40
   * imageEditor.setAngle(10).then(status => {
   *     console.log('angle: ', status.angle);
   * })).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  setAngle(angle, isSilent) {
    return this._rotate('setAngle', angle, isSilent);
  }

  /**
   * Set drawing brush
   * @param {Object} option brush option
   *  @param {Number} option.width width
   *  @param {String} option.color color like 'FFFFFF', 'rgba(0, 0, 0, 0.5)'
   * @example
   * imageEditor.startDrawingMode('FREE_DRAWING');
   * imageEditor.setBrush({
   *     width: 12,
   *     color: 'rgba(0, 0, 0, 0.5)'
   * });
   * imageEditor.setBrush({
   *     width: 8,
   *     color: 'FFFFFF'
   * });
   */
  setBrush(option) {
    this._graphics.setBrush(option);
  }

  /**
   * Set states of current drawing shape
   * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
   * @param {Object} [options] - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - {@link ShapeFillOption} or
   *        Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stoke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
   * @example
   * imageEditor.setDrawingShape('rect', {
   *     fill: 'red',
   *     width: 100,
   *     height: 200
   * });
   * @example
   * imageEditor.setDrawingShape('rect', {
   *     fill: {
   *         type: 'filter',
   *         filter: [{blur: 0.3}, {pixelate: 20}]
   *     },
   *     width: 100,
   *     height: 200
   * });
   * @example
   * imageEditor.setDrawingShape('circle', {
   *     fill: 'transparent',
   *     stroke: 'blue',
   *     strokeWidth: 3,
   *     rx: 10,
   *     ry: 100
   * });
   * @example
   * imageEditor.setDrawingShape('triangle', { // When resizing, the shape keep the 1:1 ratio
   *     width: 1,
   *     height: 1,
   *     isRegular: true
   * });
   * @example
   * imageEditor.setDrawingShape('circle', { // When resizing, the shape keep the 1:1 ratio
   *     rx: 10,
   *     ry: 10,
   *     isRegular: true
   * });
   */
  setDrawingShape(type, options) {
    this._graphics.setDrawingShape(type, options);
  }

  setDrawingIcon(type, iconColor) {
    this._graphics.setIconStyle(type, iconColor);
  }

  /**
   * Add shape
   * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
   * @param {Object} options - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - {@link ShapeFillOption} or
   *        Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stroke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {number} [options.left] - Shape x position
   *      @param {number} [options.top] - Shape y position
   *      @param {boolean} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
   * @returns {Promise<ObjectProps, ErrorMsg>}
   * @example
   * imageEditor.addShape('rect', {
   *     fill: 'red',
   *     stroke: 'blue',
   *     strokeWidth: 3,
   *     width: 100,
   *     height: 200,
   *     left: 10,
   *     top: 10,
   *     isRegular: true
   * });
   * @example
   * imageEditor.addShape('circle', {
   *     fill: 'red',
   *     stroke: 'blue',
   *     strokeWidth: 3,
   *     rx: 10,
   *     ry: 100,
   *     isRegular: false
   * }).then(objectProps => {
   *     console.log(objectProps.id);
   * });
   * @example
   * imageEditor.addShape('rect', {
   *     fill: {
   *         type: 'filter',
   *         filter: [{blur: 0.3}, {pixelate: 20}]
   *     },
   *     stroke: 'blue',
   *     strokeWidth: 3,
   *     rx: 10,
   *     ry: 100,
   *     isRegular: false
   * }).then(objectProps => {
   *     console.log(objectProps.id);
   * });
   */
  addShape(type, options) {
    options = options || {};

    this._setPositions(options);

    return this.execute(commands.ADD_SHAPE, type, options);
  }

  /**
   * Change shape
   * @param {number} id - object id
   * @param {Object} options - Shape options
   *      @param {(ShapeFillOption | string)} [options.fill] - {@link ShapeFillOption} or
   *        Shape foreground color (ex: '#fff', 'transparent')
   *      @param {string} [options.stroke] - Shape outline color
   *      @param {number} [options.strokeWidth] - Shape outline width
   *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
   *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
   *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
   *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
   *      @param {boolean} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   * @example
   * // call after selecting shape object on canvas
   * imageEditor.changeShape(id, { // change rectagle or triangle
   *     fill: 'red',
   *     stroke: 'blue',
   *     strokeWidth: 3,
   *     width: 100,
   *     height: 200
   * });
   * @example
   * // call after selecting shape object on canvas
   * imageEditor.changeShape(id, { // change circle
   *     fill: 'red',
   *     stroke: 'blue',
   *     strokeWidth: 3,
   *     rx: 10,
   *     ry: 100
   * });
   */
  changeShape(id, options, isSilent) {
    const executeMethodName = isSilent ? 'executeSilent' : 'execute';

    return this[executeMethodName](commands.CHANGE_SHAPE, id, options);
  }

  /**
   * Add text on image
   * @param {string} text - Initial input text
   * @param {Object} [options] Options for generating text
   *     @param {Object} [options.styles] Initial styles
   *         @param {string} [options.styles.fill] Color
   *         @param {string} [options.styles.fontFamily] Font type for text
   *         @param {number} [options.styles.fontSize] Size
   *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
   *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
   *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
   *         @param {string} [options.styles.textDecoration] Type of line (underline / line-through / overline)
   *     @param {{x: number, y: number}} [options.position] - Initial position
   *     @param {boolean} [options.autofocus] - text autofocus, default is true
   * @returns {Promise}
   * @example
   * imageEditor.addText('init text');
   * @example
   * imageEditor.addText('init text', {
   *     styles: {
   *         fill: '#000',
   *         fontSize: 20,
   *         fontWeight: 'bold'
   *     },
   *     position: {
   *         x: 10,
   *         y: 10
   *     }
   * }).then(objectProps => {
   *     console.log(objectProps.id);
   * });
   */
  addText(text, options) {
    text = text || '';
    options = options || {};

    return this.execute(commands.ADD_TEXT, text, options);
  }

  /**
   * Change contents of selected text object on image
   * @param {number} id - object id
   * @param {string} text - Changing text
   * @returns {Promise<ObjectProps, ErrorMsg>}
   * @example
   * imageEditor.changeText(id, 'change text');
   */
  changeText(id, text) {
    text = text || '';

    return this.execute(commands.CHANGE_TEXT, id, text);
  }

  /**
   * Set style
   * @param {number} id - object id
   * @param {Object} styleObj - text styles
   *     @param {string} [styleObj.fill] Color
   *     @param {string} [styleObj.fontFamily] Font type for text
   *     @param {number} [styleObj.fontSize] Size
   *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
   *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
   *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
   *     @param {string} [styleObj.textDecoration] Type of line (underline / line-through / overline)
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise}
   * @example
   * imageEditor.changeTextStyle(id, {
   *     fontStyle: 'italic'
   * });
   */
  changeTextStyle(id, styleObj, isSilent) {
    const executeMethodName = isSilent ? 'executeSilent' : 'execute';

    return this[executeMethodName](commands.CHANGE_TEXT_STYLE, id, styleObj);
  }

  /**
   * change text mode
   * @param {string} type - change type
   * @private
   */
  _changeActivateMode(type) {
    if (type !== 'ICON' && this.getDrawingMode() !== type) {
      this.startDrawingMode(type);
    }
  }

  /**
   * 'textChanged' event handler
   * @param {Object} target - changed text object
   * @private
   */
  _onTextChanged(target) {
    this.fire(events.TEXT_CHANGED, target);
  }

  /**
   * 'iconCreateResize' event handler
   * @param {Object} originPointer origin pointer
   *  @param {Number} originPointer.x x position
   *  @param {Number} originPointer.y y position
   * @private
   */
  _onIconCreateResize(originPointer) {
    this.fire(events.ICON_CREATE_RESIZE, originPointer);
  }

  /**
   * 'iconCreateEnd' event handler
   * @param {Object} originPointer origin pointer
   *  @param {Number} originPointer.x x position
   *  @param {Number} originPointer.y y position
   * @private
   */
  _onIconCreateEnd(originPointer) {
    this.fire(events.ICON_CREATE_END, originPointer);
  }

  /**
   * 'textEditing' event handler
   * @private
   */
  _onTextEditing() {
    /**
     * The event which starts to edit text object
     * @event ImageEditor#textEditing
     * @example
     * imageEditor.on('textEditing', function() {
     *     console.log('text editing');
     * });
     */

    this.fire(events.TEXT_EDITING);
  }

  /**
   * Mousedown event handler in case of 'TEXT' drawing mode
   * @param {fabric.Event} event - Current mousedown event object
   * @private
   */
  _onAddText(event) {
    /**
     * The event when 'TEXT' drawing mode is enabled and click non-object area.
     * @event ImageEditor#addText
     * @param {Object} pos
     *  @param {Object} pos.originPosition - Current position on origin canvas
     *      @param {Number} pos.originPosition.x - x
     *      @param {Number} pos.originPosition.y - y
     *  @param {Object} pos.clientPosition - Current position on client area
     *      @param {Number} pos.clientPosition.x - x
     *      @param {Number} pos.clientPosition.y - y
     * @example
     * imageEditor.on('addText', function(pos) {
     *     console.log('text position on canvas: ' + pos.originPosition);
     *     console.log('text position on brwoser: ' + pos.clientPosition);
     * });
     */

    this.fire(events.ADD_TEXT, {
      originPosition: event.originPosition,
      clientPosition: event.clientPosition,
    });
  }

  /**
   * 'addObject' event handler
   * @param {Object} objectProps added object properties
   * @private
   */
  _onAddObject(objectProps) {
    const obj = this._graphics.getObject(objectProps.id);
    this._invoker.fire(events.EXECUTE_COMMAND, getObjectType(obj.type));
    this._pushAddObjectCommand(obj);
  }

  /**
   * 'objectAdded' event handler
   * @param {Object} objectProps added object properties
   * @private
   */
  _onObjectAdded(objectProps) {
    /**
     * The event when object added
     * @event ImageEditor#objectAdded
     * @param {ObjectProps} props - object properties
     * @example
     * imageEditor.on('objectAdded', function(props) {
     *     console.log(props);
     * });
     */
    this.fire(OBJECT_ADDED, objectProps);

    /**
     * The event when object added (deprecated)
     * @event ImageEditor#addObjectAfter
     * @param {ObjectProps} props - object properties
     * @deprecated
     */
    this.fire(ADD_OBJECT_AFTER, objectProps);
  }

  /**
   * 'objectModified' event handler
   * @param {fabric.Object} obj - selection object
   * @private
   */
  _onObjectModified(obj) {
    if (obj.type !== OBJ_TYPE.CROPZONE) {
      this._invoker.fire(events.EXECUTE_COMMAND, getObjectType(obj.type));
      this._pushModifyObjectCommand(obj);
    }
  }

  /**
   * 'selectionCleared' event handler
   * @private
   */
  _selectionCleared() {
    this.fire(SELECTION_CLEARED);
  }

  /**
   * 'selectionCreated' event handler
   * @param {Object} eventTarget - Fabric object
   * @private
   */
  _selectionCreated(eventTarget) {
    this.fire(SELECTION_CREATED, eventTarget);
  }

  /**
   * Register custom icons
   * @param {{iconType: string, pathValue: string}} infos - Infos to register icons
   * @example
   * imageEditor.registerIcons({
   *     customIcon: 'M 0 0 L 20 20 L 10 10 Z',
   *     customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
   * });
   */
  registerIcons(infos) {
    this._graphics.registerPaths(infos);
  }

  /**
   * Change canvas cursor type
   * @param {string} cursorType - cursor type
   * @example
   * imageEditor.changeCursor('crosshair');
   */
  changeCursor(cursorType) {
    this._graphics.changeCursor(cursorType);
  }

  /**
   * Add icon on canvas
   * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
   * @param {Object} options - Icon options
   *      @param {string} [options.fill] - Icon foreground color
   *      @param {number} [options.left] - Icon x position
   *      @param {number} [options.top] - Icon y position
   * @returns {Promise<ObjectProps, ErrorMsg>}
   * @example
   * imageEditor.addIcon('arrow'); // The position is center on canvas
   * @example
   * imageEditor.addIcon('arrow', {
   *     left: 100,
   *     top: 100
   * }).then(objectProps => {
   *     console.log(objectProps.id);
   * });
   */
  addIcon(type, options) {
    options = options || {};

    this._setPositions(options);

    return this.execute(commands.ADD_ICON, type, options);
  }

  /**
   * Change icon color
   * @param {number} id - object id
   * @param {string} color - Color for icon
   * @returns {Promise}
   * @example
   * imageEditor.changeIconColor(id, '#000000');
   */
  changeIconColor(id, color) {
    return this.execute(commands.CHANGE_ICON_COLOR, id, color);
  }

  /**
   * Remove an object or group by id
   * @param {number} id - object id
   * @returns {Promise}
   * @example
   * imageEditor.removeObject(id);
   */
  removeObject(id) {
    const { type } = this._graphics.getObject(id);

    return this.execute(commands.REMOVE_OBJECT, id, getObjectType(type));
  }

  /**
   * Whether it has the filter or not
   * @param {string} type - Filter type
   * @returns {boolean} true if it has the filter
   */
  hasFilter(type) {
    return this._graphics.hasFilter(type);
  }

  /**
   * Remove filter on canvas image
   * @param {string} type - Filter type
   * @returns {Promise<FilterResult, ErrorMsg>}
   * @example
   * imageEditor.removeFilter('Grayscale').then(obj => {
   *     console.log('filterType: ', obj.type);
   *     console.log('actType: ', obj.action);
   * }).catch(message => {
   *     console.log('error: ', message);
   * });
   */
  removeFilter(type) {
    return this.execute(commands.REMOVE_FILTER, type);
  }

  /**
   * Apply filter on canvas image
   * @param {string} type - Filter type
   * @param {object} options - Options to apply filter
   * @param {boolean} isSilent - is silent execution or not
   * @returns {Promise<FilterResult, ErrorMsg>}
   * @example
   * imageEditor.applyFilter('Grayscale');
   * @example
   * imageEditor.applyFilter('mask', {maskObjId: id}).then(obj => {
   *     console.log('filterType: ', obj.type);
   *     console.log('actType: ', obj.action);
   * }).catch(message => {
   *     console.log('error: ', message);
   * });;
   */
  applyFilter(type, options, isSilent) {
    const executeMethodName = isSilent ? 'executeSilent' : 'execute';

    return this[executeMethodName](commands.APPLY_FILTER, type, options);
  }

  /**
   * Get data url
   * @param {Object} options - options for toDataURL
   *   @param {String} [options.format=png] The format of the output image. Either "jpeg" or "png"
   *   @param {Number} [options.quality=1] Quality level (0..1). Only used for jpeg.
   *   @param {Number} [options.multiplier=1] Multiplier to scale by
   *   @param {Number} [options.left] Cropping left offset. Introduced in fabric v1.2.14
   *   @param {Number} [options.top] Cropping top offset. Introduced in fabric v1.2.14
   *   @param {Number} [options.width] Cropping width. Introduced in fabric v1.2.14
   *   @param {Number} [options.height] Cropping height. Introduced in fabric v1.2.14
   * @returns {string} A DOMString containing the requested data URI
   * @example
   * imgEl.src = imageEditor.toDataURL();
   *
   * imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage').then(() => {
   *      imageEditor.addImageObject(imgUrl);
   * });
   */
  toDataURL(options) {
    return this._graphics.toDataURL(options);
  }

  /**
   * Get image name
   * @returns {string} image name
   * @example
   * console.log(imageEditor.getImageName());
   */
  getImageName() {
    return this._graphics.getImageName();
  }

  /**
   * Clear undoStack
   * @example
   * imageEditor.clearUndoStack();
   */
  clearUndoStack() {
    this._invoker.clearUndoStack();
  }

  /**
   * Clear redoStack
   * @example
   * imageEditor.clearRedoStack();
   */
  clearRedoStack() {
    this._invoker.clearRedoStack();
  }

  /**
   * Whehter the undo stack is empty or not
   * @returns {boolean}
   * imageEditor.isEmptyUndoStack();
   */
  isEmptyUndoStack() {
    return this._invoker.isEmptyUndoStack();
  }

  /**
   * Whehter the redo stack is empty or not
   * @returns {boolean}
   * imageEditor.isEmptyRedoStack();
   */
  isEmptyRedoStack() {
    return this._invoker.isEmptyRedoStack();
  }

  /**
   * Resize canvas dimension
   * @param {{width: number, height: number}} dimension - Max width & height
   * @returns {Promise}
   */
  resizeCanvasDimension(dimension) {
    if (!dimension) {
      return Promise.reject(rejectMessages.invalidParameters);
    }

    return this.execute(commands.RESIZE_CANVAS_DIMENSION, dimension);
  }

  /**
   * Destroy
   */
  destroy() {
    this.stopDrawingMode();
    this._detachDomEvents();
    this._graphics.destroy();
    this._graphics = null;

    if (this.ui) {
      this._detachColorPickerInputBoxEvents();
      this.ui.destroy();
    }

    forEach(
      this,
      (value, key) => {
        this[key] = null;
      },
      this
    );
  }

  /**
   * Set position
   * @param {Object} options - Position options (left or top)
   * @private
   */
  _setPositions(options) {
    const centerPosition = this._graphics.getCenter();

    if (isUndefined(options.left)) {
      options.left = centerPosition.left;
    }

    if (isUndefined(options.top)) {
      options.top = centerPosition.top;
    }
  }

  /**
   * Set properties of active object
   * @param {number} id - object id
   * @param {Object} keyValue - key & value
   * @returns {Promise}
   * @example
   * imageEditor.setObjectProperties(id, {
   *     left:100,
   *     top:100,
   *     width: 200,
   *     height: 200,
   *     opacity: 0.5
   * });
   */
  setObjectProperties(id, keyValue) {
    return this.execute(commands.SET_OBJECT_PROPERTIES, id, keyValue);
  }

  /**
   * Set properties of active object, Do not leave an invoke history.
   * @param {number} id - object id
   * @param {Object} keyValue - key & value
   * @example
   * imageEditor.setObjectPropertiesQuietly(id, {
   *     left:100,
   *     top:100,
   *     width: 200,
   *     height: 200,
   *     opacity: 0.5
   * });
   */
  setObjectPropertiesQuietly(id, keyValue) {
    this._graphics.setObjectProperties(id, keyValue);
  }

  /**
   * Get properties of active object corresponding key
   * @param {number} id - object id
   * @param {Array<string>|ObjectProps|string} keys - property's key
   * @returns {ObjectProps} properties if id is valid or null
   * @example
   * var props = imageEditor.getObjectProperties(id, 'left');
   * console.log(props);
   * @example
   * var props = imageEditor.getObjectProperties(id, ['left', 'top', 'width', 'height']);
   * console.log(props);
   * @example
   * var props = imageEditor.getObjectProperties(id, {
   *     left: null,
   *     top: null,
   *     width: null,
   *     height: null,
   *     opacity: null
   * });
   * console.log(props);
   */
  getObjectProperties(id, keys) {
    const object = this._graphics.getObject(id);
    if (!object) {
      return null;
    }

    return this._graphics.getObjectProperties(id, keys);
  }

  /**
   * Get the canvas size
   * @returns {Object} {{width: number, height: number}} canvas size
   * @example
   * var canvasSize = imageEditor.getCanvasSize();
   * console.log(canvasSize.width);
   * console.height(canvasSize.height);
   */
  getCanvasSize() {
    return this._graphics.getCanvasSize();
  }

  /**
   * Get object position by originX, originY
   * @param {number} id - object id
   * @param {string} originX - can be 'left', 'center', 'right'
   * @param {string} originY - can be 'top', 'center', 'bottom'
   * @returns {Object} {{x:number, y: number}} position by origin if id is valid, or null
   * @example
   * var position = imageEditor.getObjectPosition(id, 'left', 'top');
   * console.log(position);
   */
  getObjectPosition(id, originX, originY) {
    return this._graphics.getObjectPosition(id, originX, originY);
  }

  /**
   * Set object position  by originX, originY
   * @param {number} id - object id
   * @param {Object} posInfo - position object
   *  @param {number} posInfo.x - x position
   *  @param {number} posInfo.y - y position
   *  @param {string} posInfo.originX - can be 'left', 'center', 'right'
   *  @param {string} posInfo.originY - can be 'top', 'center', 'bottom'
   * @returns {Promise}
   * @example
   * // align the object to 'left', 'top'
   * imageEditor.setObjectPosition(id, {
   *     x: 0,
   *     y: 0,
   *     originX: 'left',
   *     originY: 'top'
   * });
   * @example
   * // align the object to 'right', 'top'
   * var canvasSize = imageEditor.getCanvasSize();
   * imageEditor.setObjectPosition(id, {
   *     x: canvasSize.width,
   *     y: 0,
   *     originX: 'right',
   *     originY: 'top'
   * });
   * @example
   * // align the object to 'left', 'bottom'
   * var canvasSize = imageEditor.getCanvasSize();
   * imageEditor.setObjectPosition(id, {
   *     x: 0,
   *     y: canvasSize.height,
   *     originX: 'left',
   *     originY: 'bottom'
   * });
   * @example
   * // align the object to 'right', 'bottom'
   * var canvasSize = imageEditor.getCanvasSize();
   * imageEditor.setObjectPosition(id, {
   *     x: canvasSize.width,
   *     y: canvasSize.height,
   *     originX: 'right',
   *     originY: 'bottom'
   * });
   */
  setObjectPosition(id, posInfo) {
    return this.execute(commands.SET_OBJECT_POSITION, id, posInfo);
  }

  /**
   * @param {object} dimensions - Image Dimensions
   * @returns {Promise<ErrorMsg>}
   */
  resize(dimensions) {
    return this.execute(commands.RESIZE_IMAGE, dimensions);
  }
}

action.mixin(ImageEditor);
CustomEvents.mixin(ImageEditor);

export default ImageEditor;
