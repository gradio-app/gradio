import {
  EVENT_CROP,
  EVENT_CROP_END,
  EVENT_CROP_MOVE,
  EVENT_CROP_START,
  EVENT_DBLCLICK,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_RESIZE,
  EVENT_WHEEL,
  EVENT_ZOOM,
} from './constants';
import {
  addListener,
  isFunction,
  removeListener,
} from './utilities';

export default {
  bind() {
    const { element, options, cropper } = this;

    if (isFunction(options.cropstart)) {
      addListener(element, EVENT_CROP_START, options.cropstart);
    }

    if (isFunction(options.cropmove)) {
      addListener(element, EVENT_CROP_MOVE, options.cropmove);
    }

    if (isFunction(options.cropend)) {
      addListener(element, EVENT_CROP_END, options.cropend);
    }

    if (isFunction(options.crop)) {
      addListener(element, EVENT_CROP, options.crop);
    }

    if (isFunction(options.zoom)) {
      addListener(element, EVENT_ZOOM, options.zoom);
    }

    addListener(cropper, EVENT_POINTER_DOWN, (this.onCropStart = this.cropStart.bind(this)));

    if (options.zoomable && options.zoomOnWheel) {
      addListener(cropper, EVENT_WHEEL, (this.onWheel = this.wheel.bind(this)), {
        passive: false,
        capture: true,
      });
    }

    if (options.toggleDragModeOnDblclick) {
      addListener(cropper, EVENT_DBLCLICK, (this.onDblclick = this.dblclick.bind(this)));
    }

    addListener(
      element.ownerDocument,
      EVENT_POINTER_MOVE,
      (this.onCropMove = this.cropMove.bind(this)),
    );
    addListener(
      element.ownerDocument,
      EVENT_POINTER_UP,
      (this.onCropEnd = this.cropEnd.bind(this)),
    );

    if (options.responsive) {
      addListener(window, EVENT_RESIZE, (this.onResize = this.resize.bind(this)));
    }
  },

  unbind() {
    const { element, options, cropper } = this;

    if (isFunction(options.cropstart)) {
      removeListener(element, EVENT_CROP_START, options.cropstart);
    }

    if (isFunction(options.cropmove)) {
      removeListener(element, EVENT_CROP_MOVE, options.cropmove);
    }

    if (isFunction(options.cropend)) {
      removeListener(element, EVENT_CROP_END, options.cropend);
    }

    if (isFunction(options.crop)) {
      removeListener(element, EVENT_CROP, options.crop);
    }

    if (isFunction(options.zoom)) {
      removeListener(element, EVENT_ZOOM, options.zoom);
    }

    removeListener(cropper, EVENT_POINTER_DOWN, this.onCropStart);

    if (options.zoomable && options.zoomOnWheel) {
      removeListener(cropper, EVENT_WHEEL, this.onWheel, {
        passive: false,
        capture: true,
      });
    }

    if (options.toggleDragModeOnDblclick) {
      removeListener(cropper, EVENT_DBLCLICK, this.onDblclick);
    }

    removeListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove);
    removeListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd);

    if (options.responsive) {
      removeListener(window, EVENT_RESIZE, this.onResize);
    }
  },
};
