/*eslint no-unused-vars: 0*/

import FabricCanvasTool from "../fabrictool";

const fabric = require("fabric").fabric;

class Rectangle extends FabricCanvasTool {
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
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.rect = new fabric.Rect({
      left: this.startX,
      top: this.startY,
      originX: "left",
      originY: "top",
      width: pointer.x - this.startX,
      height: pointer.y - this.startY,
      stroke: this._color,
      strokeWidth: this._width,
      fill: this._fill,
      transparentCorners: false,
      selectable: false,
      evented: false,
      strokeUniform: true,
      noScaleCache: false,
      angle: 0,
    });
    canvas.add(this.rect);
  }

  doMouseMove(o) {
    if (!this.isDown) return;
    let canvas = this._canvas;
    let pointer = canvas.getPointer(o.e);
    if (this.startX > pointer.x) {
      this.rect.set({ left: Math.abs(pointer.x) });
    }
    if (this.startY > pointer.y) {
      this.rect.set({ top: Math.abs(pointer.y) });
    }
    this.rect.set({ width: Math.abs(this.startX - pointer.x) });
    this.rect.set({ height: Math.abs(this.startY - pointer.y) });
    this.rect.setCoords();
    canvas.renderAll();
  }

  doMouseUp(o) {
    this.isDown = false;
  }
}

export default Rectangle;
