(function() {

  /**
   * Creates accessors (getXXX, setXXX) for a "class", based on "stateProperties" array
   * @static
   * @memberOf fabric.util
   * @param {Object} klass "Class" to create accessors for
   */
  fabric.util.createAccessors = function(klass) {
    var proto = klass.prototype, i, propName,
        capitalizedPropName, setterName, getterName;

    for (i = proto.stateProperties.length; i--; ) {

      propName = proto.stateProperties[i];
      capitalizedPropName = propName.charAt(0).toUpperCase() + propName.slice(1);
      setterName = 'set' + capitalizedPropName;
      getterName = 'get' + capitalizedPropName;

      // using `new Function` for better introspection
      if (!proto[getterName]) {
        proto[getterName] = (function(property) {
          return new Function('return this.get("' + property + '")');
        })(propName);
      }
      if (!proto[setterName]) {
        proto[setterName] = (function(property) {
          return new Function('value', 'return this.set("' + property + '", value)');
        })(propName);
      }
    }
  };

  /** @lends fabric.Text.Prototype */
  /**
   * Retrieves object's fontSize
   * @method getFontSize
   * @memberOf fabric.Text.prototype
   * @return {String} Font size (in pixels)
   */

  /**
   * Sets object's fontSize
   * Does not update the object .width and .height,
   * call .initDimensions() to update the values.
   * @method setFontSize
   * @memberOf fabric.Text.prototype
   * @param {Number} fontSize Font size (in pixels)
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's fontWeight
   * @method getFontWeight
   * @memberOf fabric.Text.prototype
   * @return {(String|Number)} Font weight
   */

  /**
   * Sets object's fontWeight
   * Does not update the object .width and .height,
   * call .initDimensions() to update the values.
   * @method setFontWeight
   * @memberOf fabric.Text.prototype
   * @param {(Number|String)} fontWeight Font weight
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's fontFamily
   * @method getFontFamily
   * @memberOf fabric.Text.prototype
   * @return {String} Font family
   */

  /**
   * Sets object's fontFamily
   * Does not update the object .width and .height,
   * call .initDimensions() to update the values.
   * @method setFontFamily
   * @memberOf fabric.Text.prototype
   * @param {String} fontFamily Font family
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's text
   * @method getText
   * @memberOf fabric.Text.prototype
   * @return {String} text
   */

  /**
   * Sets object's text
   * Does not update the object .width and .height,
   * call .initDimensions() to update the values.
   * @method setText
   * @memberOf fabric.Text.prototype
   * @param {String} text Text
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's underline
   * @method getUnderline
   * @memberOf fabric.Text.prototype
   * @return {Boolean} underline enabled or disabled
   */

  /**
   * Sets object's underline
   * @method setUnderline
   * @memberOf fabric.Text.prototype
   * @param {Boolean} underline Text decoration
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's fontStyle
   * @method getFontStyle
   * @memberOf fabric.Text.prototype
   * @return {String} Font style
   */

  /**
   * Sets object's fontStyle
   * Does not update the object .width and .height,
   * call .initDimensions() to update the values.
   * @method setFontStyle
   * @memberOf fabric.Text.prototype
   * @param {String} fontStyle Font style
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's lineHeight
   * @method getLineHeight
   * @memberOf fabric.Text.prototype
   * @return {Number} Line height
   */

  /**
   * Sets object's lineHeight
   * @method setLineHeight
   * @memberOf fabric.Text.prototype
   * @param {Number} lineHeight Line height
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's textAlign
   * @method getTextAlign
   * @memberOf fabric.Text.prototype
   * @return {String} Text alignment
   */

  /**
   * Sets object's textAlign
   * @method setTextAlign
   * @memberOf fabric.Text.prototype
   * @param {String} textAlign Text alignment
   * @return {fabric.Text}
   * @chainable
   */

  /**
   * Retrieves object's textBackgroundColor
   * @method getTextBackgroundColor
   * @memberOf fabric.Text.prototype
   * @return {String} Text background color
   */

  /**
   * Sets object's textBackgroundColor
   * @method setTextBackgroundColor
   * @memberOf fabric.Text.prototype
   * @param {String} textBackgroundColor Text background color
   * @return {fabric.Text}
   * @chainable
   */

  /** @lends fabric.Object.Prototype */
  /**
   * Retrieves object's {@link fabric.Object#transformMatrix|transformMatrix}
   * @method getTransformMatrix
   * @memberOf fabric.Object.prototype
   * @return {Array} transformMatrix
   */

  /**
   * Sets object's {@link fabric.Object#transformMatrix|transformMatrix}
   * @method setTransformMatrix
   * @memberOf fabric.Object.prototype
   * @param {Array} transformMatrix
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#visible|visible} state
   * @method getVisible
   * @memberOf fabric.Object.prototype
   * @return {Boolean} True if visible
   */

  /**
   * Sets object's {@link fabric.Object#visible|visible} state
   * @method setVisible
   * @memberOf fabric.Object.prototype
   * @param {Boolean} value visible value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#shadow|shadow}
   * @method getShadow
   * @memberOf fabric.Object.prototype
   * @return {Object} Shadow instance
   */

  /**
   * Retrieves object's {@link fabric.Object#stroke|stroke}
   * @method getStroke
   * @memberOf fabric.Object.prototype
   * @return {String} stroke value
   */

  /**
   * Sets object's {@link fabric.Object#stroke|stroke}
   * @method setStroke
   * @memberOf fabric.Object.prototype
   * @param {String} value stroke value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#strokeWidth|strokeWidth}
   * @method getStrokeWidth
   * @memberOf fabric.Object.prototype
   * @return {Number} strokeWidth value
   */

  /**
   * Sets object's {@link fabric.Object#strokeWidth|strokeWidth}
   * @method setStrokeWidth
   * @memberOf fabric.Object.prototype
   * @param {Number} value strokeWidth value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#originX|originX}
   * @method getOriginX
   * @memberOf fabric.Object.prototype
   * @return {String} originX value
   */

  /**
   * Sets object's {@link fabric.Object#originX|originX}
   * @method setOriginX
   * @memberOf fabric.Object.prototype
   * @param {String} value originX value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#originY|originY}
   * @method getOriginY
   * @memberOf fabric.Object.prototype
   * @return {String} originY value
   */

  /**
   * Sets object's {@link fabric.Object#originY|originY}
   * @method setOriginY
   * @memberOf fabric.Object.prototype
   * @param {String} value originY value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#fill|fill}
   * @method getFill
   * @memberOf fabric.Object.prototype
   * @return {String} Fill value
   */

  /**
   * Sets object's {@link fabric.Object#fill|fill}
   * @method setFill
   * @memberOf fabric.Object.prototype
   * @param {String} value Fill value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#opacity|opacity}
   * @method getOpacity
   * @memberOf fabric.Object.prototype
   * @return {Number} Opacity value (0-1)
   */

  /**
   * Sets object's {@link fabric.Object#opacity|opacity}
   * @method setOpacity
   * @memberOf fabric.Object.prototype
   * @param {Number} value Opacity value (0-1)
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#angle|angle} (in degrees)
   * @method getAngle
   * @memberOf fabric.Object.prototype
   * @return {Number}
   */

  /**
   * Retrieves object's {@link fabric.Object#top|top position}
   * @method getTop
   * @memberOf fabric.Object.prototype
   * @return {Number} Top value (in pixels)
   */

  /**
   * Sets object's {@link fabric.Object#top|top position}
   * @method setTop
   * @memberOf fabric.Object.prototype
   * @param {Number} value Top value (in pixels)
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#left|left position}
   * @method getLeft
   * @memberOf fabric.Object.prototype
   * @return {Number} Left value (in pixels)
   */

  /**
   * Sets object's {@link fabric.Object#left|left position}
   * @method setLeft
   * @memberOf fabric.Object.prototype
   * @param {Number} value Left value (in pixels)
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#scaleX|scaleX} value
   * @method getScaleX
   * @memberOf fabric.Object.prototype
   * @return {Number} scaleX value
   */

  /**
   * Sets object's {@link fabric.Object#scaleX|scaleX} value
   * @method setScaleX
   * @memberOf fabric.Object.prototype
   * @param {Number} value scaleX value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#scaleY|scaleY} value
   * @method getScaleY
   * @memberOf fabric.Object.prototype
   * @return {Number} scaleY value
   */

  /**
   * Sets object's {@link fabric.Object#scaleY|scaleY} value
   * @method setScaleY
   * @memberOf fabric.Object.prototype
   * @param {Number} value scaleY value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#flipX|flipX} value
   * @method getFlipX
   * @memberOf fabric.Object.prototype
   * @return {Boolean} flipX value
   */

  /**
   * Sets object's {@link fabric.Object#flipX|flipX} value
   * @method setFlipX
   * @memberOf fabric.Object.prototype
   * @param {Boolean} value flipX value
   * @return {fabric.Object} thisArg
   * @chainable
   */

  /**
   * Retrieves object's {@link fabric.Object#flipY|flipY} value
   * @method getFlipY
   * @memberOf fabric.Object.prototype
   * @return {Boolean} flipY value
   */

  /**
   * Sets object's {@link fabric.Object#flipY|flipY} value
   * @method setFlipY
   * @memberOf fabric.Object.prototype
   * @param {Boolean} value flipY value
   * @return {fabric.Object} thisArg
   * @chainable
   */

})(typeof exports !== 'undefined' ? exports : this);
