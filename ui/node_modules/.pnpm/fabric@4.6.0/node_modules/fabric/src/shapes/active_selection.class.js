(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { });

  if (fabric.ActiveSelection) {
    return;
  }

  /**
   * Group class
   * @class fabric.ActiveSelection
   * @extends fabric.Group
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#groups}
   * @see {@link fabric.ActiveSelection#initialize} for constructor definition
   */
  fabric.ActiveSelection = fabric.util.createClass(fabric.Group, /** @lends fabric.ActiveSelection.prototype */ {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'activeSelection',

    /**
     * Constructor
     * @param {Object} objects ActiveSelection objects
     * @param {Object} [options] Options object
     * @return {Object} thisArg
     */
    initialize: function(objects, options) {
      options = options || {};
      this._objects = objects || [];
      for (var i = this._objects.length; i--; ) {
        this._objects[i].group = this;
      }

      if (options.originX) {
        this.originX = options.originX;
      }
      if (options.originY) {
        this.originY = options.originY;
      }
      this._calcBounds();
      this._updateObjectsCoords();
      fabric.Object.prototype.initialize.call(this, options);
      this.setCoords();
    },

    /**
     * Change te activeSelection to a normal group,
     * High level function that automatically adds it to canvas as
     * active object. no events fired.
     * @since 2.0.0
     * @return {fabric.Group}
     */
    toGroup: function() {
      var objects = this._objects.concat();
      this._objects = [];
      var options = fabric.Object.prototype.toObject.call(this);
      var newGroup = new fabric.Group([]);
      delete options.type;
      newGroup.set(options);
      objects.forEach(function(object) {
        object.canvas.remove(object);
        object.group = newGroup;
      });
      newGroup._objects = objects;
      if (!this.canvas) {
        return newGroup;
      }
      var canvas = this.canvas;
      canvas.add(newGroup);
      canvas._activeObject = newGroup;
      newGroup.setCoords();
      return newGroup;
    },

    /**
     * If returns true, deselection is cancelled.
     * @since 2.0.0
     * @return {Boolean} [cancel]
     */
    onDeselect: function() {
      this.destroy();
      return false;
    },

    /**
     * Returns string representation of a group
     * @return {String}
     */
    toString: function() {
      return '#<fabric.ActiveSelection: (' + this.complexity() + ')>';
    },

    /**
     * Decide if the object should cache or not. Create its own cache level
     * objectCaching is a global flag, wins over everything
     * needsItsOwnCache should be used when the object drawing method requires
     * a cache step. None of the fabric classes requires it.
     * Generally you do not cache objects in groups because the group outside is cached.
     * @return {Boolean}
     */
    shouldCache: function() {
      return false;
    },

    /**
     * Check if this group or its parent group are caching, recursively up
     * @return {Boolean}
     */
    isOnACache: function() {
      return false;
    },

    /**
     * Renders controls and borders for the object
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} [styleOverride] properties to override the object style
     * @param {Object} [childrenOverride] properties to override the children overrides
     */
    _renderControls: function(ctx, styleOverride, childrenOverride) {
      ctx.save();
      ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
      this.callSuper('_renderControls', ctx, styleOverride);
      childrenOverride = childrenOverride || { };
      if (typeof childrenOverride.hasControls === 'undefined') {
        childrenOverride.hasControls = false;
      }
      childrenOverride.forActiveSelection = true;
      for (var i = 0, len = this._objects.length; i < len; i++) {
        this._objects[i]._renderControls(ctx, childrenOverride);
      }
      ctx.restore();
    },
  });

  /**
   * Returns {@link fabric.ActiveSelection} instance from an object representation
   * @static
   * @memberOf fabric.ActiveSelection
   * @param {Object} object Object to create a group from
   * @param {Function} [callback] Callback to invoke when an ActiveSelection instance is created
   */
  fabric.ActiveSelection.fromObject = function(object, callback) {
    fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
      delete object.objects;
      callback && callback(new fabric.ActiveSelection(enlivenedObjects, object, true));
    });
  };

})(typeof exports !== 'undefined' ? exports : this);
