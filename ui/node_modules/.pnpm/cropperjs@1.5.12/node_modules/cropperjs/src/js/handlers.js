import {
  ACTION_CROP,
  ACTION_ZOOM,
  CLASS_CROP,
  CLASS_MODAL,
  DATA_ACTION,
  DRAG_MODE_CROP,
  DRAG_MODE_MOVE,
  DRAG_MODE_NONE,
  EVENT_CROP_END,
  EVENT_CROP_MOVE,
  EVENT_CROP_START,
  REGEXP_ACTIONS,
} from './constants';
import {
  addClass,
  assign,
  dispatchEvent,
  forEach,
  getData,
  getPointer,
  hasClass,
  isNumber,
  toggleClass,
} from './utilities';

export default {
  resize() {
    if (this.disabled) {
      return;
    }

    const { options, container, containerData } = this;
    const ratioX = container.offsetWidth / containerData.width;
    const ratioY = container.offsetHeight / containerData.height;
    const ratio = Math.abs(ratioX - 1) > Math.abs(ratioY - 1) ? ratioX : ratioY;

    // Resize when width changed or height changed
    if (ratio !== 1) {
      let canvasData;
      let cropBoxData;

      if (options.restore) {
        canvasData = this.getCanvasData();
        cropBoxData = this.getCropBoxData();
      }

      this.render();

      if (options.restore) {
        this.setCanvasData(forEach(canvasData, (n, i) => {
          canvasData[i] = n * ratio;
        }));
        this.setCropBoxData(forEach(cropBoxData, (n, i) => {
          cropBoxData[i] = n * ratio;
        }));
      }
    }
  },

  dblclick() {
    if (this.disabled || this.options.dragMode === DRAG_MODE_NONE) {
      return;
    }

    this.setDragMode(hasClass(this.dragBox, CLASS_CROP) ? DRAG_MODE_MOVE : DRAG_MODE_CROP);
  },

  wheel(event) {
    const ratio = Number(this.options.wheelZoomRatio) || 0.1;
    let delta = 1;

    if (this.disabled) {
      return;
    }

    event.preventDefault();

    // Limit wheel speed to prevent zoom too fast (#21)
    if (this.wheeling) {
      return;
    }

    this.wheeling = true;

    setTimeout(() => {
      this.wheeling = false;
    }, 50);

    if (event.deltaY) {
      delta = event.deltaY > 0 ? 1 : -1;
    } else if (event.wheelDelta) {
      delta = -event.wheelDelta / 120;
    } else if (event.detail) {
      delta = event.detail > 0 ? 1 : -1;
    }

    this.zoom(-delta * ratio, event);
  },

  cropStart(event) {
    const { buttons, button } = event;

    if (
      this.disabled

      // Handle mouse event and pointer event and ignore touch event
      || ((
        event.type === 'mousedown'
        || (event.type === 'pointerdown' && event.pointerType === 'mouse')
      ) && (
        // No primary button (Usually the left button)
        (isNumber(buttons) && buttons !== 1)
        || (isNumber(button) && button !== 0)

        // Open context menu
        || event.ctrlKey
      ))
    ) {
      return;
    }

    const { options, pointers } = this;
    let action;

    if (event.changedTouches) {
      // Handle touch event
      forEach(event.changedTouches, (touch) => {
        pointers[touch.identifier] = getPointer(touch);
      });
    } else {
      // Handle mouse event and pointer event
      pointers[event.pointerId || 0] = getPointer(event);
    }

    if (Object.keys(pointers).length > 1 && options.zoomable && options.zoomOnTouch) {
      action = ACTION_ZOOM;
    } else {
      action = getData(event.target, DATA_ACTION);
    }

    if (!REGEXP_ACTIONS.test(action)) {
      return;
    }

    if (dispatchEvent(this.element, EVENT_CROP_START, {
      originalEvent: event,
      action,
    }) === false) {
      return;
    }

    // This line is required for preventing page zooming in iOS browsers
    event.preventDefault();

    this.action = action;
    this.cropping = false;

    if (action === ACTION_CROP) {
      this.cropping = true;
      addClass(this.dragBox, CLASS_MODAL);
    }
  },

  cropMove(event) {
    const { action } = this;

    if (this.disabled || !action) {
      return;
    }

    const { pointers } = this;

    event.preventDefault();

    if (dispatchEvent(this.element, EVENT_CROP_MOVE, {
      originalEvent: event,
      action,
    }) === false) {
      return;
    }

    if (event.changedTouches) {
      forEach(event.changedTouches, (touch) => {
        // The first parameter should not be undefined (#432)
        assign(pointers[touch.identifier] || {}, getPointer(touch, true));
      });
    } else {
      assign(pointers[event.pointerId || 0] || {}, getPointer(event, true));
    }

    this.change(event);
  },

  cropEnd(event) {
    if (this.disabled) {
      return;
    }

    const { action, pointers } = this;

    if (event.changedTouches) {
      forEach(event.changedTouches, (touch) => {
        delete pointers[touch.identifier];
      });
    } else {
      delete pointers[event.pointerId || 0];
    }

    if (!action) {
      return;
    }

    event.preventDefault();

    if (!Object.keys(pointers).length) {
      this.action = '';
    }

    if (this.cropping) {
      this.cropping = false;
      toggleClass(this.dragBox, CLASS_MODAL, this.cropped && this.options.modal);
    }

    dispatchEvent(this.element, EVENT_CROP_END, {
      originalEvent: event,
      action,
    });
  },
};
