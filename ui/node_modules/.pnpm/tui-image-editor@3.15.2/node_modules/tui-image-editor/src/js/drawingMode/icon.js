/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview IconDrawingMode class
 */
import DrawingMode from '@/interface/drawingMode';
import { drawingModes, componentNames as components } from '@/consts';

/**
 * IconDrawingMode class
 * @class
 * @ignore
 */
class IconDrawingMode extends DrawingMode {
  constructor() {
    super(drawingModes.ICON);
  }

  /**
   * start this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  start(graphics) {
    const icon = graphics.getComponent(components.ICON);
    icon.start();
  }

  /**
   * stop this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  end(graphics) {
    const icon = graphics.getComponent(components.ICON);
    icon.end();
  }
}

export default IconDrawingMode;
