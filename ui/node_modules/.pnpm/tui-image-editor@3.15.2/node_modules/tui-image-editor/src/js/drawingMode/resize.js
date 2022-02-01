import DrawingMode from '@/interface/drawingMode';
import { drawingModes, componentNames as components } from '@/consts';

/**
 * ResizeDrawingMode class
 * @class
 * @ignore
 */
class ResizeDrawingMode extends DrawingMode {
  constructor() {
    super(drawingModes.RESIZE);
  }

  /**
   * start this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  start(graphics) {
    const resize = graphics.getComponent(components.RESIZE);
    resize.start();
  }

  /**
   * stop this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  end(graphics) {
    const resize = graphics.getComponent(components.RESIZE);
    resize.end();
  }
}

export default ResizeDrawingMode;
