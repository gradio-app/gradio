/* eslint no-unused-vars: 0 */

/**
 * "Abstract" like base class for a Canvas tool
 */
class FabricCanvasTool {
  constructor(canvas) {
    this._canvas = canvas;
  }

  configureCanvas(props) {}

  doMouseUp(event) {}

  doMouseDown(event) {}

  doMouseMove(event) {}

  doMouseOut(event) {}
}

export default FabricCanvasTool;
