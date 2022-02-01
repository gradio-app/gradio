fabric.util.object.extend(fabric.StaticCanvas.prototype, /** @lends fabric.StaticCanvas.prototype */ {
  /**
   * Populates canvas with data from the specified JSON.
   * JSON format must conform to the one of {@link fabric.Canvas#toJSON}
   * @param {String|Object} json JSON string or object
   * @param {Function} callback Callback, invoked when json is parsed
   *                            and corresponding objects (e.g: {@link fabric.Image})
   *                            are initialized
   * @param {Function} [reviver] Method for further parsing of JSON elements, called after each fabric object created.
   * @return {fabric.Canvas} instance
   * @chainable
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-3#deserialization}
   * @see {@link http://jsfiddle.net/fabricjs/fmgXt/|jsFiddle demo}
   * @example <caption>loadFromJSON</caption>
   * canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
   * @example <caption>loadFromJSON with reviver</caption>
   * canvas.loadFromJSON(json, canvas.renderAll.bind(canvas), function(o, object) {
   *   // `o` = json object
   *   // `object` = fabric.Object instance
   *   // ... do some stuff ...
   * });
   */
  loadFromJSON: function (json, callback, reviver) {
    if (!json) {
      return;
    }

    // serialize if it wasn't already
    var serialized = (typeof json === 'string')
      ? JSON.parse(json)
      : fabric.util.object.clone(json);

    var _this = this,
        clipPath = serialized.clipPath,
        renderOnAddRemove = this.renderOnAddRemove;

    this.renderOnAddRemove = false;

    delete serialized.clipPath;

    this._enlivenObjects(serialized.objects, function (enlivenedObjects) {
      _this.clear();
      _this._setBgOverlay(serialized, function () {
        if (clipPath) {
          _this._enlivenObjects([clipPath], function (enlivenedCanvasClip) {
            _this.clipPath = enlivenedCanvasClip[0];
            _this.__setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove, callback);
          });
        }
        else {
          _this.__setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove, callback);
        }
      });
    }, reviver);
    return this;
  },

  /**
   * @private
   * @param {Object} serialized Object with background and overlay information
   * @param {Array} restored canvas objects
   * @param {Function} cached renderOnAddRemove callback
   * @param {Function} callback Invoked after all background and overlay images/patterns loaded
   */
  __setupCanvas: function(serialized, enlivenedObjects, renderOnAddRemove, callback) {
    var _this = this;
    enlivenedObjects.forEach(function(obj, index) {
      // we splice the array just in case some custom classes restored from JSON
      // will add more object to canvas at canvas init.
      _this.insertAt(obj, index);
    });
    this.renderOnAddRemove = renderOnAddRemove;
    // remove parts i cannot set as options
    delete serialized.objects;
    delete serialized.backgroundImage;
    delete serialized.overlayImage;
    delete serialized.background;
    delete serialized.overlay;
    // this._initOptions does too many things to just
    // call it. Normally loading an Object from JSON
    // create the Object instance. Here the Canvas is
    // already an instance and we are just loading things over it
    this._setOptions(serialized);
    this.renderAll();
    callback && callback();
  },

  /**
   * @private
   * @param {Object} serialized Object with background and overlay information
   * @param {Function} callback Invoked after all background and overlay images/patterns loaded
   */
  _setBgOverlay: function(serialized, callback) {
    var loaded = {
      backgroundColor: false,
      overlayColor: false,
      backgroundImage: false,
      overlayImage: false
    };

    if (!serialized.backgroundImage && !serialized.overlayImage && !serialized.background && !serialized.overlay) {
      callback && callback();
      return;
    }

    var cbIfLoaded = function () {
      if (loaded.backgroundImage && loaded.overlayImage && loaded.backgroundColor && loaded.overlayColor) {
        callback && callback();
      }
    };

    this.__setBgOverlay('backgroundImage', serialized.backgroundImage, loaded, cbIfLoaded);
    this.__setBgOverlay('overlayImage', serialized.overlayImage, loaded, cbIfLoaded);
    this.__setBgOverlay('backgroundColor', serialized.background, loaded, cbIfLoaded);
    this.__setBgOverlay('overlayColor', serialized.overlay, loaded, cbIfLoaded);
  },

  /**
   * @private
   * @param {String} property Property to set (backgroundImage, overlayImage, backgroundColor, overlayColor)
   * @param {(Object|String)} value Value to set
   * @param {Object} loaded Set loaded property to true if property is set
   * @param {Object} callback Callback function to invoke after property is set
   */
  __setBgOverlay: function(property, value, loaded, callback) {
    var _this = this;

    if (!value) {
      loaded[property] = true;
      callback && callback();
      return;
    }

    if (property === 'backgroundImage' || property === 'overlayImage') {
      fabric.util.enlivenObjects([value], function(enlivedObject){
        _this[property] = enlivedObject[0];
        loaded[property] = true;
        callback && callback();
      });
    }
    else {
      this['set' + fabric.util.string.capitalize(property, true)](value, function() {
        loaded[property] = true;
        callback && callback();
      });
    }
  },

  /**
   * @private
   * @param {Array} objects
   * @param {Function} callback
   * @param {Function} [reviver]
   */
  _enlivenObjects: function (objects, callback, reviver) {
    if (!objects || objects.length === 0) {
      callback && callback([]);
      return;
    }

    fabric.util.enlivenObjects(objects, function(enlivenedObjects) {
      callback && callback(enlivenedObjects);
    }, null, reviver);
  },

  /**
   * @private
   * @param {String} format
   * @param {Function} callback
   */
  _toDataURL: function (format, callback) {
    this.clone(function (clone) {
      callback(clone.toDataURL(format));
    });
  },

  /**
   * @private
   * @param {String} format
   * @param {Number} multiplier
   * @param {Function} callback
   */
  _toDataURLWithMultiplier: function (format, multiplier, callback) {
    this.clone(function (clone) {
      callback(clone.toDataURLWithMultiplier(format, multiplier));
    });
  },

  /**
   * Clones canvas instance
   * @param {Object} [callback] Receives cloned instance as a first argument
   * @param {Array} [properties] Array of properties to include in the cloned canvas and children
   */
  clone: function (callback, properties) {
    var data = JSON.stringify(this.toJSON(properties));
    this.cloneWithoutData(function(clone) {
      clone.loadFromJSON(data, function() {
        callback && callback(clone);
      });
    });
  },

  /**
   * Clones canvas instance without cloning existing data.
   * This essentially copies canvas dimensions, clipping properties, etc.
   * but leaves data empty (so that you can populate it with your own)
   * @param {Object} [callback] Receives cloned instance as a first argument
   */
  cloneWithoutData: function(callback) {
    var el = fabric.util.createCanvasElement();

    el.width = this.width;
    el.height = this.height;

    var clone = new fabric.Canvas(el);
    if (this.backgroundImage) {
      clone.setBackgroundImage(this.backgroundImage.src, function() {
        clone.renderAll();
        callback && callback(clone);
      });
      clone.backgroundImageOpacity = this.backgroundImageOpacity;
      clone.backgroundImageStretch = this.backgroundImageStretch;
    }
    else {
      callback && callback(clone);
    }
  }
});
