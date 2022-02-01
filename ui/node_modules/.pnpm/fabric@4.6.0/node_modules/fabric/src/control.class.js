(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  function Control(options) {
    for (var i in options) {
      this[i] = options[i];
    }
  }

  fabric.Control = Control;

  fabric.Control.prototype = /** @lends fabric.Control.prototype */ {

    /**
     * keep track of control visibility.
     * mainly for backward compatibility.
     * if you do not want to see a control, you can remove it
     * from the controlset.
     * @type {Boolean}
     * @default true
     */
    visible: true,

    /**
     * Name of the action that the control will likely execute.
     * This is optional. FabricJS uses to identify what the user is doing for some
     * extra optimizations. If you are writing a custom control and you want to know
     * somewhere else in the code what is going on, you can use this string here.
     * you can also provide a custom getActionName if your control run multiple actions
     * depending on some external state.
     * default to scale since is the most common, used on 4 corners by default
     * @type {String}
     * @default 'scale'
     */
    actionName: 'scale',

    /**
     * Drawing angle of the control.
     * NOT used for now, but name marked as needed for internal logic
     * example: to reuse the same drawing function for different rotated controls
     * @type {Number}
     * @default 0
     */
    angle: 0,

    /**
     * Relative position of the control. X
     * 0,0 is the center of the Object, while -0.5 (left) or 0.5 (right) are the extremities
     * of the bounding box.
     * @type {Number}
     * @default 0
     */
    x: 0,

    /**
     * Relative position of the control. Y
     * 0,0 is the center of the Object, while -0.5 (top) or 0.5 (bottom) are the extremities
     * of the bounding box.
     * @type {Number}
     * @default 0
     */
    y: 0,

    /**
     * Horizontal offset of the control from the defined position. In pixels
     * Positive offset moves the control to the right, negative to the left.
     * It used when you want to have position of control that does not scale with
     * the bounding box. Example: rotation control is placed at x:0, y: 0.5 on
     * the boundindbox, with an offset of 30 pixels vertically. Those 30 pixels will
     * stay 30 pixels no matter how the object is big. Another example is having 2
     * controls in the corner, that stay in the same position when the object scale.
     * of the bounding box.
     * @type {Number}
     * @default 0
     */
    offsetX: 0,

    /**
     * Vertical offset of the control from the defined position. In pixels
     * Positive offset moves the control to the bottom, negative to the top.
     * @type {Number}
     * @default 0
     */
    offsetY: 0,

    /**
     * Sets the length of the control. If null, defaults to object's cornerSize.
     * Expects both sizeX and sizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    sizeX: null,

    /**
     * Sets the height of the control. If null, defaults to object's cornerSize.
     * Expects both sizeX and sizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    sizeY: null,

    /**
     * Sets the length of the touch area of the control. If null, defaults to object's touchCornerSize.
     * Expects both touchSizeX and touchSizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    touchSizeX: null,

    /**
     * Sets the height of the touch area of the control. If null, defaults to object's touchCornerSize.
     * Expects both touchSizeX and touchSizeY to be set when set.
     * @type {?Number}
     * @default null
     */
    touchSizeY: null,

    /**
     * Css cursor style to display when the control is hovered.
     * if the method `cursorStyleHandler` is provided, this property is ignored.
     * @type {String}
     * @default 'crosshair'
     */
    cursorStyle: 'crosshair',

    /**
     * If controls has an offsetY or offsetX, draw a line that connects
     * the control to the bounding box
     * @type {Boolean}
     * @default false
     */
    withConnection: false,

    /**
     * The control actionHandler, provide one to handle action ( control being moved )
     * @param {Event} eventData the native mouse event
     * @param {Object} transformData properties of the current transform
     * @param {Number} x x position of the cursor
     * @param {Number} y y position of the cursor
     * @return {Boolean} true if the action/event modified the object
     */
    actionHandler: function(/* eventData, transformData, x, y */) { },

    /**
     * The control handler for mouse down, provide one to handle mouse down on control
     * @param {Event} eventData the native mouse event
     * @param {Object} transformData properties of the current transform
     * @param {Number} x x position of the cursor
     * @param {Number} y y position of the cursor
     * @return {Boolean} true if the action/event modified the object
     */
    mouseDownHandler: function(/* eventData, transformData, x, y */) { },

    /**
     * The control mouseUpHandler, provide one to handle an effect on mouse up.
     * @param {Event} eventData the native mouse event
     * @param {Object} transformData properties of the current transform
     * @param {Number} x x position of the cursor
     * @param {Number} y y position of the cursor
     * @return {Boolean} true if the action/event modified the object
     */
    mouseUpHandler: function(/* eventData, transformData, x, y */) { },

    /**
     * Returns control actionHandler
     * @param {Event} eventData the native mouse event
     * @param {fabric.Object} fabricObject on which the control is displayed
     * @param {fabric.Control} control control for which the action handler is being asked
     * @return {Function} the action handler
     */
    getActionHandler: function(/* eventData, fabricObject, control */) {
      return this.actionHandler;
    },

    /**
     * Returns control mouseDown handler
     * @param {Event} eventData the native mouse event
     * @param {fabric.Object} fabricObject on which the control is displayed
     * @param {fabric.Control} control control for which the action handler is being asked
     * @return {Function} the action handler
     */
    getMouseDownHandler: function(/* eventData, fabricObject, control */) {
      return this.mouseDownHandler;
    },

    /**
     * Returns control mouseUp handler
     * @param {Event} eventData the native mouse event
     * @param {fabric.Object} fabricObject on which the control is displayed
     * @param {fabric.Control} control control for which the action handler is being asked
     * @return {Function} the action handler
     */
    getMouseUpHandler: function(/* eventData, fabricObject, control */) {
      return this.mouseUpHandler;
    },

    /**
     * Returns control cursorStyle for css using cursorStyle. If you need a more elaborate
     * function you can pass one in the constructor
     * the cursorStyle property
     * @param {Event} eventData the native mouse event
     * @param {fabric.Control} control the current control ( likely this)
     * @param {fabric.Object} object on which the control is displayed
     * @return {String}
     */
    cursorStyleHandler: function(eventData, control /* fabricObject */) {
      return control.cursorStyle;
    },

    /**
     * Returns the action name. The basic implementation just return the actionName property.
     * @param {Event} eventData the native mouse event
     * @param {fabric.Control} control the current control ( likely this)
     * @param {fabric.Object} object on which the control is displayed
     * @return {String}
     */
    getActionName: function(eventData, control /* fabricObject */) {
      return control.actionName;
    },

    /**
     * Returns controls visibility
     * @param {fabric.Object} object on which the control is displayed
     * @param {String} controlKey key where the control is memorized on the
     * @return {Boolean}
     */
    getVisibility: function(fabricObject, controlKey) {
      var objectVisibility = fabricObject._controlsVisibility;
      if (objectVisibility && typeof objectVisibility[controlKey] !== 'undefined') {
        return objectVisibility[controlKey];
      }
      return this.visible;
    },

    /**
     * Sets controls visibility
     * @param {Boolean} visibility for the object
     * @return {Void}
     */
    setVisibility: function(visibility /* name, fabricObject */) {
      this.visible = visibility;
    },


    positionHandler: function(dim, finalMatrix /*, fabricObject, currentControl */) {
      var point = fabric.util.transformPoint({
        x: this.x * dim.x + this.offsetX,
        y: this.y * dim.y + this.offsetY }, finalMatrix);
      return point;
    },

    /**
     * Returns the coords for this control based on object values.
     * @param {Number} objectAngle angle from the fabric object holding the control
     * @param {Number} objectCornerSize cornerSize from the fabric object holding the control (or touchCornerSize if
     *   isTouch is true)
     * @param {Number} centerX x coordinate where the control center should be
     * @param {Number} centerY y coordinate where the control center should be
     * @param {boolean} isTouch true if touch corner, false if normal corner
     */
    calcCornerCoords: function(objectAngle, objectCornerSize, centerX, centerY, isTouch) {
      var cosHalfOffset,
          sinHalfOffset,
          cosHalfOffsetComp,
          sinHalfOffsetComp,
          xSize = (isTouch) ? this.touchSizeX : this.sizeX,
          ySize = (isTouch) ? this.touchSizeY : this.sizeY;
      if (xSize && ySize && xSize !== ySize) {
        // handle rectangular corners
        var controlTriangleAngle = Math.atan2(ySize, xSize);
        var cornerHypotenuse = Math.sqrt(xSize * xSize + ySize * ySize) / 2;
        var newTheta = controlTriangleAngle - fabric.util.degreesToRadians(objectAngle);
        var newThetaComp = Math.PI / 2 - controlTriangleAngle - fabric.util.degreesToRadians(objectAngle);
        cosHalfOffset = cornerHypotenuse * fabric.util.cos(newTheta);
        sinHalfOffset = cornerHypotenuse * fabric.util.sin(newTheta);
        // use complementary angle for two corners
        cosHalfOffsetComp = cornerHypotenuse * fabric.util.cos(newThetaComp);
        sinHalfOffsetComp = cornerHypotenuse * fabric.util.sin(newThetaComp);
      }
      else {
        // handle square corners
        // use default object corner size unless size is defined
        var cornerSize = (xSize && ySize) ? xSize : objectCornerSize;
        /* 0.7071067812 stands for sqrt(2)/2 */
        cornerHypotenuse = cornerSize * 0.7071067812;
        // complementary angles are equal since they're both 45 degrees
        var newTheta = fabric.util.degreesToRadians(45 - objectAngle);
        cosHalfOffset = cosHalfOffsetComp = cornerHypotenuse * fabric.util.cos(newTheta);
        sinHalfOffset = sinHalfOffsetComp = cornerHypotenuse * fabric.util.sin(newTheta);
      }

      return {
        tl: {
          x: centerX - sinHalfOffsetComp,
          y: centerY - cosHalfOffsetComp,
        },
        tr: {
          x: centerX + cosHalfOffset,
          y: centerY - sinHalfOffset,
        },
        bl: {
          x: centerX - cosHalfOffset,
          y: centerY + sinHalfOffset,
        },
        br: {
          x: centerX + sinHalfOffsetComp,
          y: centerY + cosHalfOffsetComp,
        },
      };
    },

    /**
    * Render function for the control.
    * When this function runs the context is unscaled. unrotate. Just retina scaled.
    * all the functions will have to translate to the point left,top before starting Drawing
    * if they want to draw a control where the position is detected.
    * left and top are the result of the positionHandler function
    * @param {RenderingContext2D} ctx the context where the control will be drawn
    * @param {Number} left position of the canvas where we are about to render the control.
    * @param {Number} top position of the canvas where we are about to render the control.
    * @param {Object} styleOverride
    * @param {fabric.Object} fabricObject the object where the control is about to be rendered
    */
    render: function(ctx, left, top, styleOverride, fabricObject) {
      styleOverride = styleOverride || {};
      switch (styleOverride.cornerStyle || fabricObject.cornerStyle) {
        case 'circle':
          fabric.controlsUtils.renderCircleControl.call(this, ctx, left, top, styleOverride, fabricObject);
          break;
        default:
          fabric.controlsUtils.renderSquareControl.call(this, ctx, left, top, styleOverride, fabricObject);
      }
    },
  };

})(typeof exports !== 'undefined' ? exports : this);
