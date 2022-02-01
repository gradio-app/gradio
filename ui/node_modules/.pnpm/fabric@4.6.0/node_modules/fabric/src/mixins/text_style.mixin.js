(function() {
  fabric.util.object.extend(fabric.Text.prototype, /** @lends fabric.Text.prototype */ {
    /**
     * Returns true if object has no styling or no styling in a line
     * @param {Number} lineIndex , lineIndex is on wrapped lines.
     * @return {Boolean}
     */
    isEmptyStyles: function(lineIndex) {
      if (!this.styles) {
        return true;
      }
      if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
        return true;
      }
      var obj = typeof lineIndex === 'undefined' ? this.styles : { line: this.styles[lineIndex] };
      for (var p1 in obj) {
        for (var p2 in obj[p1]) {
          // eslint-disable-next-line no-unused-vars
          for (var p3 in obj[p1][p2]) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * Returns true if object has a style property or has it ina specified line
     * This function is used to detect if a text will use a particular property or not.
     * @param {String} property to check for
     * @param {Number} lineIndex to check the style on
     * @return {Boolean}
     */
    styleHas: function(property, lineIndex) {
      if (!this.styles || !property || property === '') {
        return false;
      }
      if (typeof lineIndex !== 'undefined' && !this.styles[lineIndex]) {
        return false;
      }
      var obj = typeof lineIndex === 'undefined' ? this.styles : { 0: this.styles[lineIndex] };
      // eslint-disable-next-line
      for (var p1 in obj) {
        // eslint-disable-next-line
        for (var p2 in obj[p1]) {
          if (typeof obj[p1][p2][property] !== 'undefined') {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Check if characters in a text have a value for a property
     * whose value matches the textbox's value for that property.  If so,
     * the character-level property is deleted.  If the character
     * has no other properties, then it is also deleted.  Finally,
     * if the line containing that character has no other characters
     * then it also is deleted.
     *
     * @param {string} property The property to compare between characters and text.
     */
    cleanStyle: function(property) {
      if (!this.styles || !property || property === '') {
        return false;
      }
      var obj = this.styles, stylesCount = 0, letterCount, stylePropertyValue,
          allStyleObjectPropertiesMatch = true, graphemeCount = 0, styleObject;
      // eslint-disable-next-line
      for (var p1 in obj) {
        letterCount = 0;
        // eslint-disable-next-line
        for (var p2 in obj[p1]) {
          var styleObject = obj[p1][p2],
              stylePropertyHasBeenSet = styleObject.hasOwnProperty(property);

          stylesCount++;

          if (stylePropertyHasBeenSet) {
            if (!stylePropertyValue) {
              stylePropertyValue = styleObject[property];
            }
            else if (styleObject[property] !== stylePropertyValue) {
              allStyleObjectPropertiesMatch = false;
            }

            if (styleObject[property] === this[property]) {
              delete styleObject[property];
            }
          }
          else {
            allStyleObjectPropertiesMatch = false;
          }

          if (Object.keys(styleObject).length !== 0) {
            letterCount++;
          }
          else {
            delete obj[p1][p2];
          }
        }

        if (letterCount === 0) {
          delete obj[p1];
        }
      }
      // if every grapheme has the same style set then
      // delete those styles and set it on the parent
      for (var i = 0; i < this._textLines.length; i++) {
        graphemeCount += this._textLines[i].length;
      }
      if (allStyleObjectPropertiesMatch && stylesCount === graphemeCount) {
        this[property] = stylePropertyValue;
        this.removeStyle(property);
      }
    },

    /**
     * Remove a style property or properties from all individual character styles
     * in a text object.  Deletes the character style object if it contains no other style
     * props.  Deletes a line style object if it contains no other character styles.
     *
     * @param {String} props The property to remove from character styles.
     */
    removeStyle: function(property) {
      if (!this.styles || !property || property === '') {
        return;
      }
      var obj = this.styles, line, lineNum, charNum;
      for (lineNum in obj) {
        line = obj[lineNum];
        for (charNum in line) {
          delete line[charNum][property];
          if (Object.keys(line[charNum]).length === 0) {
            delete line[charNum];
          }
        }
        if (Object.keys(line).length === 0) {
          delete obj[lineNum];
        }
      }
    },

    /**
     * @private
     */
    _extendStyles: function(index, styles) {
      var loc = this.get2DCursorLocation(index);

      if (!this._getLineStyle(loc.lineIndex)) {
        this._setLineStyle(loc.lineIndex);
      }

      if (!this._getStyleDeclaration(loc.lineIndex, loc.charIndex)) {
        this._setStyleDeclaration(loc.lineIndex, loc.charIndex, {});
      }

      fabric.util.object.extend(this._getStyleDeclaration(loc.lineIndex, loc.charIndex), styles);
    },

    /**
     * Returns 2d representation (lineIndex and charIndex) of cursor (or selection start)
     * @param {Number} [selectionStart] Optional index. When not given, current selectionStart is used.
     * @param {Boolean} [skipWrapping] consider the location for unwrapped lines. useful to manage styles.
     */
    get2DCursorLocation: function(selectionStart, skipWrapping) {
      if (typeof selectionStart === 'undefined') {
        selectionStart = this.selectionStart;
      }
      var lines = skipWrapping ? this._unwrappedTextLines : this._textLines,
          len = lines.length;
      for (var i = 0; i < len; i++) {
        if (selectionStart <= lines[i].length) {
          return {
            lineIndex: i,
            charIndex: selectionStart
          };
        }
        selectionStart -= lines[i].length + this.missingNewlineOffset(i);
      }
      return {
        lineIndex: i - 1,
        charIndex: lines[i - 1].length < selectionStart ? lines[i - 1].length : selectionStart
      };
    },

    /**
     * Gets style of a current selection/cursor (at the start position)
     * if startIndex or endIndex are not provided, selectionStart or selectionEnd will be used.
     * @param {Number} [startIndex] Start index to get styles at
     * @param {Number} [endIndex] End index to get styles at, if not specified selectionEnd or startIndex + 1
     * @param {Boolean} [complete] get full style or not
     * @return {Array} styles an array with one, zero or more Style objects
     */
    getSelectionStyles: function(startIndex, endIndex, complete) {
      if (typeof startIndex === 'undefined') {
        startIndex = this.selectionStart || 0;
      }
      if (typeof endIndex === 'undefined') {
        endIndex = this.selectionEnd || startIndex;
      }
      var styles = [];
      for (var i = startIndex; i < endIndex; i++) {
        styles.push(this.getStyleAtPosition(i, complete));
      }
      return styles;
    },

    /**
     * Gets style of a current selection/cursor position
     * @param {Number} position  to get styles at
     * @param {Boolean} [complete] full style if true
     * @return {Object} style Style object at a specified index
     * @private
     */
    getStyleAtPosition: function(position, complete) {
      var loc = this.get2DCursorLocation(position),
          style = complete ? this.getCompleteStyleDeclaration(loc.lineIndex, loc.charIndex) :
            this._getStyleDeclaration(loc.lineIndex, loc.charIndex);
      return style || {};
    },

    /**
     * Sets style of a current selection, if no selection exist, do not set anything.
     * @param {Object} [styles] Styles object
     * @param {Number} [startIndex] Start index to get styles at
     * @param {Number} [endIndex] End index to get styles at, if not specified selectionEnd or startIndex + 1
     * @return {fabric.IText} thisArg
     * @chainable
     */
    setSelectionStyles: function(styles, startIndex, endIndex) {
      if (typeof startIndex === 'undefined') {
        startIndex = this.selectionStart || 0;
      }
      if (typeof endIndex === 'undefined') {
        endIndex = this.selectionEnd || startIndex;
      }
      for (var i = startIndex; i < endIndex; i++) {
        this._extendStyles(i, styles);
      }
      /* not included in _extendStyles to avoid clearing cache more than once */
      this._forceClearCache = true;
      return this;
    },

    /**
     * get the reference, not a clone, of the style object for a given character
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @return {Object} style object
     */
    _getStyleDeclaration: function(lineIndex, charIndex) {
      var lineStyle = this.styles && this.styles[lineIndex];
      if (!lineStyle) {
        return null;
      }
      return lineStyle[charIndex];
    },

    /**
     * return a new object that contains all the style property for a character
     * the object returned is newly created
     * @param {Number} lineIndex of the line where the character is
     * @param {Number} charIndex position of the character on the line
     * @return {Object} style object
     */
    getCompleteStyleDeclaration: function(lineIndex, charIndex) {
      var style = this._getStyleDeclaration(lineIndex, charIndex) || { },
          styleObject = { }, prop;
      for (var i = 0; i < this._styleProperties.length; i++) {
        prop = this._styleProperties[i];
        styleObject[prop] = typeof style[prop] === 'undefined' ? this[prop] : style[prop];
      }
      return styleObject;
    },

    /**
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @param {Object} style
     * @private
     */
    _setStyleDeclaration: function(lineIndex, charIndex, style) {
      this.styles[lineIndex][charIndex] = style;
    },

    /**
     *
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @private
     */
    _deleteStyleDeclaration: function(lineIndex, charIndex) {
      delete this.styles[lineIndex][charIndex];
    },

    /**
     * @param {Number} lineIndex
     * @return {Boolean} if the line exists or not
     * @private
     */
    _getLineStyle: function(lineIndex) {
      return !!this.styles[lineIndex];
    },

    /**
     * Set the line style to an empty object so that is initialized
     * @param {Number} lineIndex
     * @private
     */
    _setLineStyle: function(lineIndex) {
      this.styles[lineIndex] = {};
    },

    /**
     * @param {Number} lineIndex
     * @private
     */
    _deleteLineStyle: function(lineIndex) {
      delete this.styles[lineIndex];
    }
  });
})();
