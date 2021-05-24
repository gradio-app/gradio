/*eslint no-unused-vars: 0*/

import FabricCanvasTool from "../fabrictool";
import RectangleLabelObject from "./rectangle-label-object";

class RectangleLabel extends FabricCanvasTool {
  configureCanvas(props) {
    let canvas = this._canvas;
    canvas.isDrawingMode = canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = o.evented = false));
    this._width = props.lineWidth;
    this._color = props.lineColor;
    this._fill = props.fillColor;
    this._textString = props.text;
    this._maxFontSize = 12;
  }

  doMouseDown(o) {
    let canvas = this._canvas;
    this.isDown = true;
    let pointer = canvas.getPointer(o.e);
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.rectangleLabel = new RectangleLabelObject(
      canvas,
      "New drawing",
      {
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
      },
      {
        left: this.startX,
        top: this.startY - 12,
        originX: "left",
        originY: "top",
        width: pointer.x - this.startX - this._width,
        height: canvas.height / 3,
        fontSize: this._maxFontSize,
        noScaleCache: false,
        backgroundColor: this._color,
        transparentCorners: true,
        hasControls: false,
        angle: 0,
      }
    );

    if (this._objects && this._objects.length > 0)
      this._objects.push(this.rectangleLabel);
    else this._objects = [this.rectangleLabel];

    while (this.rectangleLabel._textObj.height > canvas.height / 3) {
      this.rectangleLabel._textObj.set({
        fontSize: this.rectangleLabel._textObj.fontSize - 1,
        top: this.startY - this.rectangleLabel._textObj.fontSize - 12,
      });
    }

    canvas.add(this.rectangleLabel._rectObj);
    canvas.add(this.rectangleLabel._textObj);
    canvas.renderAll();
  }

  doMouseMove(o) {
    if (!this.isDown) return;
    let canvas = this._canvas;
    let pointer = canvas.getPointer(o.e);
    if (this.startX > pointer.x) {
      this.rectangleLabel._rectObj.set({ left: Math.abs(pointer.x) });
      this.rectangleLabel._textObj.set({ left: Math.abs(pointer.x) });
    }
    if (this.startY > pointer.y) {
      this.rectangleLabel._rectObj.set({ left: Math.abs(pointer.x) });
      this.rectangleLabel._textObj.set({ top: Math.abs(pointer.y) });
    }
    this.rectangleLabel._textObj.setCoords();
    this.rectangleLabel._rectObj.set({
      width: Math.abs(this.startX - pointer.x),
    });
    this.rectangleLabel._textObj.set({
      width: this.rectangleLabel._rectObj.getScaledWidth(),
    });
    this.rectangleLabel._rectObj.set({
      height: Math.abs(this.startY - pointer.y),
    });
    this.rectangleLabel._rectObj.setCoords();
    canvas.renderAll();
  }

  doMouseUp(o) {
    this.isDown = false;
    let canvas = this._canvas;

    // var group = new fabric.Group([this.rectangleLabel._rectObj,this.rectangleLabel._textObj]);
    // canvas.remove(this.rectangleLabel._rectObj);
    // canvas.remove(this.rectangleLabel._textObj);
    // canvas.add(group);
    canvas.renderAll();
  }
}

export default RectangleLabel;
