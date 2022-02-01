(function() {

  var degreesToRadians = fabric.util.degreesToRadians;

  fabric.util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {
    /**
     * Determines which corner has been clicked
     * @private
     * @param {Object} pointer The pointer indicating the mouse position
     * @return {String|Boolean} corner code (tl, tr, bl, br, etc.), or false if nothing is found
     */
    _findTargetCorner: function(pointer, forTouch) {
      // objects in group, anykind, are not self modificable,
      // must not return an hovered corner.
      if (!this.hasControls || this.group || (!this.canvas || this.canvas._activeObject !== this)) {
        return false;
      }

      var ex = pointer.x,
          ey = pointer.y,
          xPoints,
          lines, keys = Object.keys(this.oCoords),
          j = keys.length - 1, i;
      this.__corner = 0;

      // cycle in reverse order so we pick first the one on top
      for (; j >= 0; j--) {
        i = keys[j];
        if (!this.isControlVisible(i)) {
          continue;
        }

        lines = this._getImageLines(forTouch ? this.oCoords[i].touchCorner : this.oCoords[i].corner);
        // // debugging
        //
        // this.canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);
        //
        // this.canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);
        //
        // this.canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);
        //
        // this.canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
        // this.canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);

        xPoints = this._findCrossPoints({ x: ex, y: ey }, lines);
        if (xPoints !== 0 && xPoints % 2 === 1) {
          this.__corner = i;
          return i;
        }
      }
      return false;
    },

    /**
     * Calls a function for each control. The function gets called,
     * with the control, the object that is calling the iterator and the control's key
     * @param {Function} fn function to iterate over the controls over
     */
    forEachControl: function(fn) {
      for (var i in this.controls) {
        fn(this.controls[i], i, this);
      };
    },

    /**
     * Sets the coordinates of the draggable boxes in the corners of
     * the image used to scale/rotate it.
     * note: if we would switch to ROUND corner area, all of this would disappear.
     * everything would resolve to a single point and a pythagorean theorem for the distance
     * @private
     */
    _setCornerCoords: function() {
      var coords = this.oCoords;

      for (var control in coords) {
        var controlObject = this.controls[control];
        coords[control].corner = controlObject.calcCornerCoords(
          this.angle, this.cornerSize, coords[control].x, coords[control].y, false);
        coords[control].touchCorner = controlObject.calcCornerCoords(
          this.angle, this.touchCornerSize, coords[control].x, coords[control].y, true);
      }
    },

    /**
     * Draws a colored layer behind the object, inside its selection borders.
     * Requires public options: padding, selectionBackgroundColor
     * this function is called when the context is transformed
     * has checks to be skipped when the object is on a staticCanvas
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawSelectionBackground: function(ctx) {
      if (!this.selectionBackgroundColor ||
        (this.canvas && !this.canvas.interactive) ||
        (this.canvas && this.canvas._activeObject !== this)
      ) {
        return this;
      }
      ctx.save();
      var center = this.getCenterPoint(), wh = this._calculateCurrentDimensions(),
          vpt = this.canvas.viewportTransform;
      ctx.translate(center.x, center.y);
      ctx.scale(1 / vpt[0], 1 / vpt[3]);
      ctx.rotate(degreesToRadians(this.angle));
      ctx.fillStyle = this.selectionBackgroundColor;
      ctx.fillRect(-wh.x / 2, -wh.y / 2, wh.x, wh.y);
      ctx.restore();
      return this;
    },

    /**
     * Draws borders of an object's bounding box.
     * Requires public properties: width, height
     * Requires public options: padding, borderColor
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @param {Object} styleOverride object to override the object style
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawBorders: function(ctx, styleOverride) {
      styleOverride = styleOverride || {};
      var wh = this._calculateCurrentDimensions(),
          strokeWidth = this.borderScaleFactor,
          width = wh.x + strokeWidth,
          height = wh.y + strokeWidth,
          hasControls = typeof styleOverride.hasControls !== 'undefined' ?
            styleOverride.hasControls : this.hasControls,
          shouldStroke = false;

      ctx.save();
      ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
      this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray);

      ctx.strokeRect(
        -width / 2,
        -height / 2,
        width,
        height
      );

      if (hasControls) {
        ctx.beginPath();
        this.forEachControl(function(control, key, fabricObject) {
          // in this moment, the ctx is centered on the object.
          // width and height of the above function are the size of the bbox.
          if (control.withConnection && control.getVisibility(fabricObject, key)) {
            // reset movement for each control
            shouldStroke = true;
            ctx.moveTo(control.x * width, control.y * height);
            ctx.lineTo(
              control.x * width + control.offsetX,
              control.y * height + control.offsetY
            );
          }
        });
        if (shouldStroke) {
          ctx.stroke();
        }
      }
      ctx.restore();
      return this;
    },

    /**
     * Draws borders of an object's bounding box when it is inside a group.
     * Requires public properties: width, height
     * Requires public options: padding, borderColor
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @param {object} options object representing current object parameters
     * @param {Object} styleOverride object to override the object style
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawBordersInGroup: function(ctx, options, styleOverride) {
      styleOverride = styleOverride || {};
      var bbox = fabric.util.sizeAfterTransform(this.width, this.height, options),
          strokeWidth = this.strokeWidth,
          strokeUniform = this.strokeUniform,
          borderScaleFactor = this.borderScaleFactor,
          width =
            bbox.x + strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleX) + borderScaleFactor,
          height =
            bbox.y + strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleY) + borderScaleFactor;
      ctx.save();
      this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray);
      ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
      ctx.strokeRect(
        -width / 2,
        -height / 2,
        width,
        height
      );

      ctx.restore();
      return this;
    },

    /**
     * Draws corners of an object's bounding box.
     * Requires public properties: width, height
     * Requires public options: cornerSize, padding
     * @param {CanvasRenderingContext2D} ctx Context to draw on
     * @param {Object} styleOverride object to override the object style
     * @return {fabric.Object} thisArg
     * @chainable
     */
    drawControls: function(ctx, styleOverride) {
      styleOverride = styleOverride || {};
      ctx.save();
      var retinaScaling = this.canvas.getRetinaScaling(), matrix, p;
      ctx.setTransform(retinaScaling, 0, 0, retinaScaling, 0, 0);
      ctx.strokeStyle = ctx.fillStyle = styleOverride.cornerColor || this.cornerColor;
      if (!this.transparentCorners) {
        ctx.strokeStyle = styleOverride.cornerStrokeColor || this.cornerStrokeColor;
      }
      this._setLineDash(ctx, styleOverride.cornerDashArray || this.cornerDashArray);
      this.setCoords();
      if (this.group) {
        // fabricJS does not really support drawing controls inside groups,
        // this piece of code here helps having at least the control in places.
        // If an application needs to show some objects as selected because of some UI state
        // can still call Object._renderControls() on any object they desire, independently of groups.
        // using no padding, circular controls and hiding the rotating cursor is higly suggested,
        matrix = this.group.calcTransformMatrix();
      }
      this.forEachControl(function(control, key, fabricObject) {
        p = fabricObject.oCoords[key];
        if (control.getVisibility(fabricObject, key)) {
          if (matrix) {
            p = fabric.util.transformPoint(p, matrix);
          }
          control.render(ctx, p.x, p.y, styleOverride, fabricObject);
        }
      });
      ctx.restore();

      return this;
    },

    /**
     * Returns true if the specified control is visible, false otherwise.
     * @param {String} controlKey The key of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @returns {Boolean} true if the specified control is visible, false otherwise
     */
    isControlVisible: function(controlKey) {
      return this.controls[controlKey] && this.controls[controlKey].getVisibility(this, controlKey);
    },

    /**
     * Sets the visibility of the specified control.
     * @param {String} controlKey The key of the control. Possible values are 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
     * @param {Boolean} visible true to set the specified control visible, false otherwise
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setControlVisible: function(controlKey, visible) {
      if (!this._controlsVisibility) {
        this._controlsVisibility = {};
      }
      this._controlsVisibility[controlKey] = visible;
      return this;
    },

    /**
     * Sets the visibility state of object controls.
     * @param {Object} [options] Options object
     * @param {Boolean} [options.bl] true to enable the bottom-left control, false to disable it
     * @param {Boolean} [options.br] true to enable the bottom-right control, false to disable it
     * @param {Boolean} [options.mb] true to enable the middle-bottom control, false to disable it
     * @param {Boolean} [options.ml] true to enable the middle-left control, false to disable it
     * @param {Boolean} [options.mr] true to enable the middle-right control, false to disable it
     * @param {Boolean} [options.mt] true to enable the middle-top control, false to disable it
     * @param {Boolean} [options.tl] true to enable the top-left control, false to disable it
     * @param {Boolean} [options.tr] true to enable the top-right control, false to disable it
     * @param {Boolean} [options.mtr] true to enable the middle-top-rotate control, false to disable it
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setControlsVisibility: function(options) {
      options || (options = { });

      for (var p in options) {
        this.setControlVisible(p, options[p]);
      }
      return this;
    },


    /**
     * This callback function is called every time _discardActiveObject or _setActiveObject
     * try to to deselect this object. If the function returns true, the process is cancelled
     * @param {Object} [options] options sent from the upper functions
     * @param {Event} [options.e] event if the process is generated by an event
     */
    onDeselect: function() {
      // implemented by sub-classes, as needed.
    },


    /**
     * This callback function is called every time _discardActiveObject or _setActiveObject
     * try to to select this object. If the function returns true, the process is cancelled
     * @param {Object} [options] options sent from the upper functions
     * @param {Event} [options.e] event if the process is generated by an event
     */
    onSelect: function() {
      // implemented by sub-classes, as needed.
    }
  });
})();
