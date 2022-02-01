/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Image zoom module (start zoom, end zoom)
 */
import { fabric } from 'fabric';
import Component from '@/interface/component';
import { clamp } from '@/util';
import { componentNames, eventNames, keyCodes, zoomModes } from '@/consts';

const MOUSE_MOVE_THRESHOLD = 10;
const DEFAULT_SCROLL_OPTION = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  stroke: '#000000',
  strokeWidth: 0,
  fill: '#000000',
  opacity: 0.4,
  evented: false,
  selectable: false,
  hoverCursor: 'auto',
};
const DEFAULT_VERTICAL_SCROLL_RATIO = {
  SIZE: 0.0045,
  MARGIN: 0.003,
  BORDER_RADIUS: 0.003,
};
const DEFAULT_HORIZONTAL_SCROLL_RATIO = {
  SIZE: 0.0066,
  MARGIN: 0.0044,
  BORDER_RADIUS: 0.003,
};
const DEFAULT_ZOOM_LEVEL = 1.0;
const {
  ZOOM_CHANGED,
  ADD_TEXT,
  TEXT_EDITING,
  OBJECT_MODIFIED,
  KEY_DOWN,
  KEY_UP,
  HAND_STARTED,
  HAND_STOPPED,
} = eventNames;

/**
 * Zoom components
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @class Zoom
 * @ignore
 */
class Zoom extends Component {
  constructor(graphics) {
    super(componentNames.ZOOM, graphics);

    /**
     * zoomArea
     * @type {?fabric.Rect}
     * @private
     */
    this.zoomArea = null;

    /**
     * Start point of zoom area
     * @type {?{x: number, y: number}}
     */
    this._startPoint = null;

    /**
     * Center point of every zoom
     * @type {Array.<{prevZoomLevel: number, zoomLevel: number, x: number, y: number}>}
     */
    this._centerPoints = [];

    /**
     * Zoom level (default: 100%(1.0), max: 400%(4.0))
     * @type {number}
     */
    this.zoomLevel = DEFAULT_ZOOM_LEVEL;

    /**
     * Zoom mode ('normal', 'zoom', 'hand')
     * @type {string}
     */
    this.zoomMode = zoomModes.DEFAULT;

    /**
     * Listeners
     * @type {Object.<string, Function>}
     * @private
     */
    this._listeners = {
      startZoom: this._onMouseDownWithZoomMode.bind(this),
      moveZoom: this._onMouseMoveWithZoomMode.bind(this),
      stopZoom: this._onMouseUpWithZoomMode.bind(this),
      startHand: this._onMouseDownWithHandMode.bind(this),
      moveHand: this._onMouseMoveWithHandMode.bind(this),
      stopHand: this._onMouseUpWithHandMode.bind(this),
      zoomChanged: this._changeScrollState.bind(this),
      keydown: this._startHandModeWithSpaceBar.bind(this),
      keyup: this._endHandModeWithSpaceBar.bind(this),
    };

    const canvas = this.getCanvas();

    /**
     * Width:Height ratio (ex. width=1.5, height=1 -> aspectRatio=1.5)
     * @private
     */
    this.aspectRatio = canvas.width / canvas.height;

    /**
     * vertical scroll bar
     * @type {fabric.Rect}
     * @private
     */
    this._verticalScroll = new fabric.Rect(DEFAULT_SCROLL_OPTION);

    /**
     * horizontal scroll bar
     * @type {fabric.Rect}
     * @private
     */
    this._horizontalScroll = new fabric.Rect(DEFAULT_SCROLL_OPTION);

    canvas.on(ZOOM_CHANGED, this._listeners.zoomChanged);

    this.graphics.on(ADD_TEXT, this._startTextEditingHandler.bind(this));
    this.graphics.on(TEXT_EDITING, this._startTextEditingHandler.bind(this));
    this.graphics.on(OBJECT_MODIFIED, this._stopTextEditingHandler.bind(this));
  }

  /**
   * Attach zoom keyboard events
   */
  attachKeyboardZoomEvents() {
    fabric.util.addListener(document, KEY_DOWN, this._listeners.keydown);
    fabric.util.addListener(document, KEY_UP, this._listeners.keyup);
  }

  /**
   * Detach zoom keyboard events
   */
  detachKeyboardZoomEvents() {
    fabric.util.removeListener(document, KEY_DOWN, this._listeners.keydown);
    fabric.util.removeListener(document, KEY_UP, this._listeners.keyup);
  }

  /**
   * Handler when you started editing text
   * @private
   */
  _startTextEditingHandler() {
    this.isTextEditing = true;
  }

  /**
   * Handler when you stopped editing text
   * @private
   */
  _stopTextEditingHandler() {
    this.isTextEditing = false;
  }

  /**
   * Handler who turns on hand mode when the space bar is down
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  _startHandModeWithSpaceBar(e) {
    if (this.withSpace || this.isTextEditing) {
      return;
    }

    if (e.keyCode === keyCodes.SPACE) {
      this.withSpace = true;
      this.startHandMode();
    }
  }

  /**
   * Handler who turns off hand mode when space bar is up
   * @param {KeyboardEvent} e - Event object
   * @private
   */
  _endHandModeWithSpaceBar(e) {
    if (e.keyCode === keyCodes.SPACE) {
      this.withSpace = false;
      this.endHandMode();
    }
  }

  /**
   * Start zoom-in mode
   */
  startZoomInMode() {
    if (this.zoomArea) {
      return;
    }
    this.endHandMode();
    this.zoomMode = zoomModes.ZOOM;

    const canvas = this.getCanvas();

    this._changeObjectsEventedState(false);

    this.zoomArea = new fabric.Rect({
      left: 0,
      top: 0,
      width: 0.5,
      height: 0.5,
      stroke: 'black',
      strokeWidth: 1,
      fill: 'transparent',
      hoverCursor: 'zoom-in',
    });

    canvas.discardActiveObject();
    canvas.add(this.zoomArea);
    canvas.on('mouse:down', this._listeners.startZoom);
    canvas.selection = false;
    canvas.defaultCursor = 'zoom-in';
  }

  /**
   * End zoom-in mode
   */
  endZoomInMode() {
    this.zoomMode = zoomModes.DEFAULT;

    const canvas = this.getCanvas();
    const { startZoom, moveZoom, stopZoom } = this._listeners;

    canvas.selection = true;
    canvas.defaultCursor = 'auto';
    canvas.off({
      'mouse:down': startZoom,
      'mouse:move': moveZoom,
      'mouse:up': stopZoom,
    });

    this._changeObjectsEventedState(true);

    canvas.remove(this.zoomArea);
    this.zoomArea = null;
  }

  /**
   * Start zoom drawing mode
   */
  start() {
    this.zoomArea = null;
    this._startPoint = null;
    this._startHandPoint = null;
  }

  /**
   * Stop zoom drawing mode
   */
  end() {
    this.endZoomInMode();
    this.endHandMode();
  }

  /**
   * Start hand mode
   */
  startHandMode() {
    this.endZoomInMode();
    this.zoomMode = zoomModes.HAND;

    const canvas = this.getCanvas();

    this._changeObjectsEventedState(false);

    canvas.discardActiveObject();
    canvas.off('mouse:down', this._listeners.startHand);
    canvas.on('mouse:down', this._listeners.startHand);
    canvas.selection = false;
    canvas.defaultCursor = 'grab';

    canvas.fire(HAND_STARTED);
  }

  /**
   * Stop hand mode
   */
  endHandMode() {
    this.zoomMode = zoomModes.DEFAULT;
    const canvas = this.getCanvas();

    this._changeObjectsEventedState(true);

    canvas.off('mouse:down', this._listeners.startHand);
    canvas.selection = true;
    canvas.defaultCursor = 'auto';

    this._startHandPoint = null;

    canvas.fire(HAND_STOPPED);
  }

  /**
   * onMousedown handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onMouseDownWithZoomMode({ target, e }) {
    if (target) {
      return;
    }

    const canvas = this.getCanvas();

    canvas.selection = false;

    this._startPoint = canvas.getPointer(e);
    this.zoomArea.set({ width: 0, height: 0 });

    const { moveZoom, stopZoom } = this._listeners;
    canvas.on({
      'mouse:move': moveZoom,
      'mouse:up': stopZoom,
    });
  }

  /**
   * onMousemove handler in fabric canvas
   * @param {{e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onMouseMoveWithZoomMode({ e }) {
    const canvas = this.getCanvas();
    const pointer = canvas.getPointer(e);
    const { x, y } = pointer;
    const { zoomArea, _startPoint } = this;
    const deltaX = Math.abs(x - _startPoint.x);
    const deltaY = Math.abs(y - _startPoint.y);

    if (deltaX + deltaY > MOUSE_MOVE_THRESHOLD) {
      canvas.remove(zoomArea);
      zoomArea.set(this._calcRectDimensionFromPoint(x, y));
      canvas.add(zoomArea);
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
    const { x: startX, y: startY } = this._startPoint;
    const { min } = Math;

    const left = min(startX, x);
    const top = min(startY, y);
    const width = clamp(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
    const height = clamp(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

    return { left, top, width, height };
  }

  /**
   * onMouseup handler in fabric canvas
   * @private
   */
  _onMouseUpWithZoomMode() {
    let { zoomLevel } = this;
    const { zoomArea } = this;
    const { moveZoom, stopZoom } = this._listeners;
    const canvas = this.getCanvas();
    const center = this._getCenterPoint();
    const { x, y } = center;

    if (!this._isMaxZoomLevel()) {
      this._centerPoints.push({
        x,
        y,
        prevZoomLevel: zoomLevel,
        zoomLevel: zoomLevel + 1,
      });
      zoomLevel += 1;
      canvas.zoomToPoint({ x, y }, zoomLevel);

      this._fireZoomChanged(canvas, zoomLevel);

      this.zoomLevel = zoomLevel;
    }

    canvas.off({
      'mouse:move': moveZoom,
      'mouse:up': stopZoom,
    });

    canvas.remove(zoomArea);
    this._startPoint = null;
  }

  /**
   * Get center point
   * @returns {{x: number, y: number}}
   * @private
   */
  _getCenterPoint() {
    const { left, top, width, height } = this.zoomArea;
    const { x, y } = this._startPoint;
    const { aspectRatio } = this;

    if (width < MOUSE_MOVE_THRESHOLD && height < MOUSE_MOVE_THRESHOLD) {
      return { x, y };
    }

    return width > height
      ? { x: left + (aspectRatio * height) / 2, y: top + height / 2 }
      : { x: left + width / 2, y: top + width / aspectRatio / 2 };
  }

  /**
   * Zoom the canvas
   * @param {{x: number, y: number}} center - center of zoom
   * @param {?number} zoomLevel - zoom level
   */
  zoom({ x, y }, zoomLevel = this.zoomLevel) {
    const canvas = this.getCanvas();
    const centerPoints = this._centerPoints;

    for (let i = centerPoints.length - 1; i >= 0; i -= 1) {
      if (centerPoints[i].zoomLevel < zoomLevel) {
        break;
      }

      const { x: prevX, y: prevY, prevZoomLevel } = centerPoints.pop();

      canvas.zoomToPoint({ x: prevX, y: prevY }, prevZoomLevel);
      this.zoomLevel = prevZoomLevel;
    }

    canvas.zoomToPoint({ x, y }, zoomLevel);
    if (!this._isDefaultZoomLevel(zoomLevel)) {
      this._centerPoints.push({
        x,
        y,
        zoomLevel,
        prevZoomLevel: this.zoomLevel,
      });
    }
    this.zoomLevel = zoomLevel;

    this._fireZoomChanged(canvas, zoomLevel);
  }

  /**
   * Zoom out one step
   */
  zoomOut() {
    const centerPoints = this._centerPoints;

    if (!centerPoints.length) {
      return;
    }

    const canvas = this.getCanvas();
    const point = centerPoints.pop();
    const { x, y, prevZoomLevel } = point;

    if (this._isDefaultZoomLevel(prevZoomLevel)) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    } else {
      canvas.zoomToPoint({ x, y }, prevZoomLevel);
    }

    this.zoomLevel = prevZoomLevel;

    this._fireZoomChanged(canvas, this.zoomLevel);
  }

  /**
   * Zoom reset
   */
  resetZoom() {
    const canvas = this.getCanvas();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    this.zoomLevel = DEFAULT_ZOOM_LEVEL;
    this._centerPoints = [];

    this._fireZoomChanged(canvas, this.zoomLevel);
  }

  /**
   * Whether zoom level is max (5.0)
   * @returns {boolean}
   * @private
   */
  _isMaxZoomLevel() {
    return this.zoomLevel >= 5.0;
  }

  /**
   * Move point of zoom
   * @param {{x: number, y: number}} delta - move amount
   * @private
   */
  _movePointOfZoom({ x: deltaX, y: deltaY }) {
    const centerPoints = this._centerPoints;

    if (!centerPoints.length) {
      return;
    }

    const canvas = this.getCanvas();
    const { zoomLevel } = this;

    const point = centerPoints.pop();
    const { x: originX, y: originY, prevZoomLevel } = point;
    const x = originX - deltaX;
    const y = originY - deltaY;

    canvas.zoomToPoint({ x: originX, y: originY }, prevZoomLevel);
    canvas.zoomToPoint({ x, y }, zoomLevel);
    centerPoints.push({ x, y, prevZoomLevel, zoomLevel });

    this._fireZoomChanged(canvas, zoomLevel);
  }

  /**
   * onMouseDown handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onMouseDownWithHandMode({ target, e }) {
    if (target) {
      return;
    }

    const canvas = this.getCanvas();

    if (this.zoomLevel <= DEFAULT_ZOOM_LEVEL) {
      return;
    }

    canvas.selection = false;

    this._startHandPoint = canvas.getPointer(e);

    const { moveHand, stopHand } = this._listeners;
    canvas.on({
      'mouse:move': moveHand,
      'mouse:up': stopHand,
    });
  }

  /**
   * onMouseMove handler in fabric canvas
   * @param {{e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _onMouseMoveWithHandMode({ e }) {
    const canvas = this.getCanvas();
    const { x, y } = canvas.getPointer(e);
    const deltaX = x - this._startHandPoint.x;
    const deltaY = y - this._startHandPoint.y;

    this._movePointOfZoom({ x: deltaX, y: deltaY });
  }

  /**
   * onMouseUp handler in fabric canvas
   * @private
   */
  _onMouseUpWithHandMode() {
    const canvas = this.getCanvas();
    const { moveHand, stopHand } = this._listeners;

    canvas.off({
      'mouse:move': moveHand,
      'mouse:up': stopHand,
    });

    this._startHandPoint = null;
  }

  /**
   * onChangeZoom handler in fabric canvas
   * @private
   */
  _changeScrollState({ viewport, zoomLevel }) {
    const canvas = this.getCanvas();

    canvas.remove(this._verticalScroll);
    canvas.remove(this._horizontalScroll);

    if (this._isDefaultZoomLevel(zoomLevel)) {
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const { tl, tr, bl } = viewport;
    const viewportWidth = tr.x - tl.x;
    const viewportHeight = bl.y - tl.y;

    const horizontalScrollWidth = (viewportWidth * viewportWidth) / canvasWidth;
    const horizontalScrollHeight = viewportHeight * DEFAULT_HORIZONTAL_SCROLL_RATIO.SIZE;
    const horizontalScrollLeft = clamp(
      tl.x + (tl.x / canvasWidth) * viewportWidth,
      tl.x,
      tr.x - horizontalScrollWidth
    );
    const horizontalScrollMargin = viewportHeight * DEFAULT_HORIZONTAL_SCROLL_RATIO.MARGIN;
    const horizontalScrollBorderRadius =
      viewportHeight * DEFAULT_HORIZONTAL_SCROLL_RATIO.BORDER_RADIUS;

    this._horizontalScroll.set({
      left: horizontalScrollLeft,
      top: bl.y - horizontalScrollHeight - horizontalScrollMargin,
      width: horizontalScrollWidth,
      height: horizontalScrollHeight,
      rx: horizontalScrollBorderRadius,
      ry: horizontalScrollBorderRadius,
    });

    const verticalScrollWidth = viewportWidth * DEFAULT_VERTICAL_SCROLL_RATIO.SIZE;
    const verticalScrollHeight = (viewportHeight * viewportHeight) / canvasHeight;
    const verticalScrollTop = clamp(
      tl.y + (tl.y / canvasHeight) * viewportHeight,
      tr.y,
      bl.y - verticalScrollHeight
    );
    const verticalScrollMargin = viewportWidth * DEFAULT_VERTICAL_SCROLL_RATIO.MARGIN;
    const verticalScrollBorderRadius = viewportWidth * DEFAULT_VERTICAL_SCROLL_RATIO.BORDER_RADIUS;

    this._verticalScroll.set({
      left: tr.x - verticalScrollWidth - verticalScrollMargin,
      top: verticalScrollTop,
      width: verticalScrollWidth,
      height: verticalScrollHeight,
      rx: verticalScrollBorderRadius,
      ry: verticalScrollBorderRadius,
    });

    this._addScrollBar();
  }

  /**
   * Change objects 'evented' state
   * @param {boolean} [evented=true] - objects 'evented' state
   */
  _changeObjectsEventedState(evented = true) {
    const canvas = this.getCanvas();

    canvas.forEachObject((obj) => {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = evented;
    });
  }

  /**
   * Add scroll bar and set remove timer
   */
  _addScrollBar() {
    const canvas = this.getCanvas();

    canvas.add(this._horizontalScroll);
    canvas.add(this._verticalScroll);

    if (this.scrollBarTid) {
      clearTimeout(this.scrollBarTid);
    }

    this.scrollBarTid = setTimeout(() => {
      canvas.remove(this._horizontalScroll);
      canvas.remove(this._verticalScroll);
    }, 3000);
  }

  /**
   * Check zoom level is default zoom level (1.0)
   * @param {number} zoomLevel - zoom level
   * @returns {boolean} - whether zoom level is 1.0
   */
  _isDefaultZoomLevel(zoomLevel) {
    return zoomLevel === DEFAULT_ZOOM_LEVEL;
  }

  /**
   * Fire 'zoomChanged' event
   * @param {fabric.Canvas} canvas - fabric canvas
   * @param {number} zoomLevel - 'zoomChanged' event params
   */
  _fireZoomChanged(canvas, zoomLevel) {
    canvas.fire(ZOOM_CHANGED, { viewport: canvas.calcViewportBoundaries(), zoomLevel });
  }

  /**
   * Get zoom mode
   */
  get mode() {
    return this.zoomMode;
  }
}

export default Zoom;
