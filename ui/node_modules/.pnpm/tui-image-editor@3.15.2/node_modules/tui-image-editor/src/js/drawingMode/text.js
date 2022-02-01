/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview TextDrawingMode class
 */
import DrawingMode from '@/interface/drawingMode';
import { drawingModes, componentNames as components } from '@/consts';

/**
 * TextDrawingMode class
 * @class
 * @ignore
 */
class TextDrawingMode extends DrawingMode {
  constructor() {
    super(drawingModes.TEXT);
  }

  /**
   * start this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  start(graphics) {
    const text = graphics.getComponent(components.TEXT);
    text.start();
  }

  /**
   * stop this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  end(graphics) {
    const text = graphics.getComponent(components.TEXT);
    text.end();
  }
}

export default TextDrawingMode;
