/*eslint no-unused-vars: 0*/

import FabricCanvasTool from "./fabrictool";

const fabric = require("fabric").fabric;

class DefaultTool extends FabricCanvasTool {
  configureCanvas(props) {
    let canvas = this._canvas;
    canvas.isDrawingMode = canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = o.evented = false));
    canvas.discardActiveObject();
    canvas.defaultCursor = "pointer";
    canvas.renderAll();
  }
}

export default DefaultTool;
