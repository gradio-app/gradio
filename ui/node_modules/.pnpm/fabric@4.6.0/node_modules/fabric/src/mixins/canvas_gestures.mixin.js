/**
 * Adds support for multi-touch gestures using the Event.js library.
 * Fires the following custom events:
 * - touch:gesture
 * - touch:drag
 * - touch:orientation
 * - touch:shake
 * - touch:longpress
 */
(function() {

  var degreesToRadians = fabric.util.degreesToRadians,
      radiansToDegrees = fabric.util.radiansToDegrees;

  fabric.util.object.extend(fabric.Canvas.prototype, /** @lends fabric.Canvas.prototype */ {
    /**
     * Method that defines actions when an Event.js gesture is detected on an object. Currently only supports
     * 2 finger gestures.
     * @param {Event} e Event object by Event.js
     * @param {Event} self Event proxy object by Event.js
     */
    __onTransformGesture: function(e, self) {

      if (this.isDrawingMode || !e.touches || e.touches.length !== 2 || 'gesture' !== self.gesture) {
        return;
      }

      var target = this.findTarget(e);
      if ('undefined' !== typeof target) {
        this.__gesturesParams = {
          e: e,
          self: self,
          target: target
        };

        this.__gesturesRenderer();
      }

      this.fire('touch:gesture', {
        target: target, e: e, self: self
      });
    },
    __gesturesParams: null,
    __gesturesRenderer: function() {

      if (this.__gesturesParams === null || this._currentTransform === null) {
        return;
      }

      var self = this.__gesturesParams.self,
          t = this._currentTransform,
          e = this.__gesturesParams.e;

      t.action = 'scale';
      t.originX = t.originY = 'center';

      this._scaleObjectBy(self.scale, e);

      if (self.rotation !== 0) {
        t.action = 'rotate';
        this._rotateObjectByAngle(self.rotation, e);
      }

      this.requestRenderAll();

      t.action = 'drag';
    },

    /**
     * Method that defines actions when an Event.js drag is detected.
     *
     * @param {Event} e Event object by Event.js
     * @param {Event} self Event proxy object by Event.js
     */
    __onDrag: function(e, self) {
      this.fire('touch:drag', {
        e: e, self: self
      });
    },

    /**
     * Method that defines actions when an Event.js orientation event is detected.
     *
     * @param {Event} e Event object by Event.js
     * @param {Event} self Event proxy object by Event.js
     */
    __onOrientationChange: function(e, self) {
      this.fire('touch:orientation', {
        e: e, self: self
      });
    },

    /**
     * Method that defines actions when an Event.js shake event is detected.
     *
     * @param {Event} e Event object by Event.js
     * @param {Event} self Event proxy object by Event.js
     */
    __onShake: function(e, self) {
      this.fire('touch:shake', {
        e: e, self: self
      });
    },

    /**
     * Method that defines actions when an Event.js longpress event is detected.
     *
     * @param {Event} e Event object by Event.js
     * @param {Event} self Event proxy object by Event.js
     */
    __onLongPress: function(e, self) {
      this.fire('touch:longpress', {
        e: e, self: self
      });
    },

    /**
     * Scales an object by a factor
     * @param {Number} s The scale factor to apply to the current scale level
     * @param {Event} e Event object by Event.js
     */
    _scaleObjectBy: function(s, e) {
      var t = this._currentTransform,
          target = t.target;
      t.gestureScale = s;
      target._scaling = true;
      return fabric.controlsUtils.scalingEqually(e, t, 0, 0);
    },

    /**
     * Rotates object by an angle
     * @param {Number} curAngle The angle of rotation in degrees
     * @param {Event} e Event object by Event.js
     */
    _rotateObjectByAngle: function(curAngle, e) {
      var t = this._currentTransform;

      if (t.target.get('lockRotation')) {
        return;
      }
      t.target.rotate(radiansToDegrees(degreesToRadians(curAngle) + t.theta));
      this._fire('rotating', {
        target: t.target,
        e: e,
        transform: t,
      });
    }
  });
})();
