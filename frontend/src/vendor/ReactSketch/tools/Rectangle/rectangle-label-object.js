/* eslint no-unused-vars: 0 */

const fabric = require("fabric").fabric;

class RectangleLabelObject {
  constructor(canvas, text, rectProps, textProps) {
    this._canvas = canvas;
    this._text = text;
    this._rectObj = new fabric.Rect(rectProps);
    this._textObj = new fabric.Textbox(text, textProps);
    canvas.on({ "object:scaling": this.update });
    canvas.on({ "object:moving": this.update });
  }

  update = (e) => {
    //e.target.set({scaleX:1, scaleY:1})
    if (!this._textObj || !this._rectObj) return;
    if (e.target === this._rectObj) {
      this._textObj.set({
        width: this._rectObj.getScaledWidth(),
        scaleX: 1,
        scaleY: 1,
        top: this._rectObj.top - this._textObj.getScaledHeight(),
        left: this._rectObj.left,
      });
    }
  };

  setText(text) {
    this._text = text;
    this._textObj.set({ text });
  }
}

export default RectangleLabelObject;
