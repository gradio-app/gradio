(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      degreesToRadians = fabric.util.degreesToRadians,
      controls = fabric.controlsUtils;

  /**
   * Render a round control, as per fabric features.
   * This function is written to respect object properties like transparentCorners, cornerSize
   * cornerColor, cornerStrokeColor
   * plus the addition of offsetY and offsetX.
   * @param {CanvasRenderingContext2D} ctx context to render on
   * @param {Number} left x coordinate where the control center should be
   * @param {Number} top y coordinate where the control center should be
   * @param {Object} styleOverride override for fabric.Object controls style
   * @param {fabric.Object} fabricObject the fabric object for which we are rendering controls
   */
  function renderCircleControl (ctx, left, top, styleOverride, fabricObject) {
    styleOverride = styleOverride || {};
    var xSize = this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
        ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
        transparentCorners = typeof styleOverride.transparentCorners !== 'undefined' ?
          styleOverride.transparentCorners : fabricObject.transparentCorners,
        methodName = transparentCorners ? 'stroke' : 'fill',
        stroke = !transparentCorners && (styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor),
        myLeft = left,
        myTop = top, size;
    ctx.save();
    ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
    ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
    // as soon as fabric react v5, remove ie11, use proper ellipse code.
    if (xSize > ySize) {
      size = xSize;
      ctx.scale(1.0, ySize / xSize);
      myTop = top * xSize / ySize;
    }
    else if (ySize > xSize) {
      size = ySize;
      ctx.scale(xSize / ySize, 1.0);
      myLeft = left * ySize / xSize;
    }
    else {
      size = xSize;
    }
    // this is still wrong
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(myLeft, myTop, size / 2, 0, 2 * Math.PI, false);
    ctx[methodName]();
    if (stroke) {
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Render a square control, as per fabric features.
   * This function is written to respect object properties like transparentCorners, cornerSize
   * cornerColor, cornerStrokeColor
   * plus the addition of offsetY and offsetX.
   * @param {CanvasRenderingContext2D} ctx context to render on
   * @param {Number} left x coordinate where the control center should be
   * @param {Number} top y coordinate where the control center should be
   * @param {Object} styleOverride override for fabric.Object controls style
   * @param {fabric.Object} fabricObject the fabric object for which we are rendering controls
   */
  function renderSquareControl(ctx, left, top, styleOverride, fabricObject) {
    styleOverride = styleOverride || {};
    var xSize = this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize,
        ySize = this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize,
        transparentCorners = typeof styleOverride.transparentCorners !== 'undefined' ?
          styleOverride.transparentCorners : fabricObject.transparentCorners,
        methodName = transparentCorners ? 'stroke' : 'fill',
        stroke = !transparentCorners && (
          styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor
        ), xSizeBy2 = xSize / 2, ySizeBy2 = ySize / 2;
    ctx.save();
    ctx.fillStyle = styleOverride.cornerColor || fabricObject.cornerColor;
    ctx.strokeStyle = styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
    // this is still wrong
    ctx.lineWidth = 1;
    ctx.translate(left, top);
    ctx.rotate(degreesToRadians(fabricObject.angle));
    // this does not work, and fixed with ( && ) does not make sense.
    // to have real transparent corners we need the controls on upperCanvas
    // transparentCorners || ctx.clearRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
    ctx[methodName + 'Rect'](-xSizeBy2, -ySizeBy2, xSize, ySize);
    if (stroke) {
      ctx.strokeRect(-xSizeBy2, -ySizeBy2, xSize, ySize);
    }
    ctx.restore();
  }

  controls.renderCircleControl = renderCircleControl;
  controls.renderSquareControl = renderSquareControl;

})(typeof exports !== 'undefined' ? exports : this);
