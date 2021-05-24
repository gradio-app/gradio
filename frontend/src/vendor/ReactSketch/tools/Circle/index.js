/*eslint no-unused-vars: 0*/

import FabricCanvasTool from "../fabrictool";
import { linearDistance } from "../../utils";

const fabric = require("fabric").fabric;

class Circle extends FabricCanvasTool {
  configureCanvas(props) {
    let canvas = this._canvas;
    canvas.isDrawingMode = canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = o.evented = false));
    this._width = props.lineWidth;
    this._color = props.lineColor;
    this._fill = props.fillColor;
  }

  doMouseDown(o) {
    let canvas = this._canvas;
    this.isDown = true;
    let pointer = canvas.getPointer(o.e);
    [this.startX, this.startY] = [pointer.x, pointer.y];
    this.circle = new fabric.Circle({
      left: this.startX,
      top: this.startY,
      originX: "left",
      originY: "center",
      strokeWidth: this._width,
      stroke: this._color,
      fill: this._fill,
      selectable: false,
      evented: false,
      radius: 1,
    });
    canvas.add(this.circle);
  }

  doMouseMove(o) {
    if (!this.isDown) return;
    let canvas = this._canvas;
    let pointer = canvas.getPointer(o.e);
    this.circle.set({
      radius:
        linearDistance(
          { x: this.startX, y: this.startY },
          { x: pointer.x, y: pointer.y }
        ) / 2,
      angle:
        (Math.atan2(pointer.y - this.startY, pointer.x - this.startX) * 180) /
        Math.PI,
    });
    this.circle.setCoords();
    canvas.renderAll();
  }

  doMouseUp(o) {
    this.isDown = false;
  }
}

export default Circle;
