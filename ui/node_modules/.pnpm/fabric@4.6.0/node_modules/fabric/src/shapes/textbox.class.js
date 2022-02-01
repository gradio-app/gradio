(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {});

  /**
   * Textbox class, based on IText, allows the user to resize the text rectangle
   * and wraps lines automatically. Textboxes have their Y scaling locked, the
   * user can only change width. Height is adjusted automatically based on the
   * wrapping of lines.
   * @class fabric.Textbox
   * @extends fabric.IText
   * @mixes fabric.Observable
   * @return {fabric.Textbox} thisArg
   * @see {@link fabric.Textbox#initialize} for constructor definition
   */
  fabric.Textbox = fabric.util.createClass(fabric.IText, fabric.Observable, {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'textbox',

    /**
     * Minimum width of textbox, in pixels.
     * @type Number
     * @default
     */
    minWidth: 20,

    /**
     * Minimum calculated width of a textbox, in pixels.
     * fixed to 2 so that an empty textbox cannot go to 0
     * and is still selectable without text.
     * @type Number
     * @default
     */
    dynamicMinWidth: 2,

    /**
     * Cached array of text wrapping.
     * @type Array
     */
    __cachedLines: null,

    /**
     * Override standard Object class values
     */
    lockScalingFlip: true,

    /**
     * Override standard Object class values
     * Textbox needs this on false
     */
    noScaleCache: false,

    /**
     * Properties which when set cause object to change dimensions
     * @type Object
     * @private
     */
    _dimensionAffectingProps: fabric.Text.prototype._dimensionAffectingProps.concat('width'),

    /**
     * Use this regular expression to split strings in breakable lines
     * @private
     */
    _wordJoiners: /[ \t\r]/,

    /**
     * Use this boolean property in order to split strings that have no white space concept.
     * this is a cheap way to help with chinese/japanese
     * @type Boolean
     * @since 2.6.0
     */
    splitByGrapheme: false,

    /**
     * Unlike superclass's version of this function, Textbox does not update
     * its width.
     * @private
     * @override
     */
    initDimensions: function() {
      if (this.__skipDimension) {
        return;
      }
      this.isEditing && this.initDelayedCursor();
      this.clearContextTop();
      this._clearCache();
      // clear dynamicMinWidth as it will be different after we re-wrap line
      this.dynamicMinWidth = 0;
      // wrap lines
      this._styleMap = this._generateStyleMap(this._splitText());
      // if after wrapping, the width is smaller than dynamicMinWidth, change the width and re-wrap
      if (this.dynamicMinWidth > this.width) {
        this._set('width', this.dynamicMinWidth);
      }
      if (this.textAlign.indexOf('justify') !== -1) {
        // once text is measured we need to make space fatter to make justified text.
        this.enlargeSpaces();
      }
      // clear cache and re-calculate height
      this.height = this.calcTextHeight();
      this.saveState({ propertySet: '_dimensionAffectingProps' });
    },

    /**
     * Generate an object that translates the style object so that it is
     * broken up by visual lines (new lines and automatic wrapping).
     * The original text styles object is broken up by actual lines (new lines only),
     * which is only sufficient for Text / IText
     * @private
     */
    _generateStyleMap: function(textInfo) {
      var realLineCount     = 0,
          realLineCharCount = 0,
          charCount         = 0,
          map               = {};

      for (var i = 0; i < textInfo.graphemeLines.length; i++) {
        if (textInfo.graphemeText[charCount] === '\n' && i > 0) {
          realLineCharCount = 0;
          charCount++;
          realLineCount++;
        }
        else if (!this.splitByGrapheme && this._reSpaceAndTab.test(textInfo.graphemeText[charCount]) && i > 0) {
          // this case deals with space's that are removed from end of lines when wrapping
          realLineCharCount++;
          charCount++;
        }

        map[i] = { line: realLineCount, offset: realLineCharCount };

        charCount += textInfo.graphemeLines[i].length;
        realLineCharCount += textInfo.graphemeLines[i].length;
      }

      return map;
    },

    /**
     * Returns true if object has a style property or has it on a specified line
     * @param {Number} lineIndex
     * @return {Boolean}
     */
    styleHas: function(property, lineIndex) {
      if (this._styleMap && !this.isWrapping) {
        var map = this._styleMap[lineIndex];
        if (map) {
          lineIndex = map.line;
        }
      }
      return fabric.Text.prototype.styleHas.call(this, property, lineIndex);
    },

    /**
     * Returns true if object has no styling or no styling in a line
     * @param {Number} lineIndex , lineIndex is on wrapped lines.
     * @return {Boolean}
     */
    isEmptyStyles: function(lineIndex) {
      if (!this.styles) {
        return true;
      }
      var offset = 0, nextLineIndex = lineIndex + 1, nextOffset, obj, shouldLimit = false,
          map = this._styleMap[lineIndex], mapNextLine = this._styleMap[lineIndex + 1];
      if (map) {
        lineIndex = map.line;
        offset = map.offset;
      }
      if (mapNextLine) {
        nextLineIndex = mapNextLine.line;
        shouldLimit = nextLineIndex === lineIndex;
        nextOffset = mapNextLine.offset;
      }
      obj = typeof lineIndex === 'undefined' ? this.styles : { line: this.styles[lineIndex] };
      for (var p1 in obj) {
        for (var p2 in obj[p1]) {
          if (p2 >= offset && (!shouldLimit || p2 < nextOffset)) {
            // eslint-disable-next-line no-unused-vars
            for (var p3 in obj[p1][p2]) {
              return false;
            }
          }
        }
      }
      return true;
    },

    /**
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @private
     */
    _getStyleDeclaration: function(lineIndex, charIndex) {
      if (this._styleMap && !this.isWrapping) {
        var map = this._styleMap[lineIndex];
        if (!map) {
          return null;
        }
        lineIndex = map.line;
        charIndex = map.offset + charIndex;
      }
      return this.callSuper('_getStyleDeclaration', lineIndex, charIndex);
    },

    /**
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @param {Object} style
     * @private
     */
    _setStyleDeclaration: function(lineIndex, charIndex, style) {
      var map = this._styleMap[lineIndex];
      lineIndex = map.line;
      charIndex = map.offset + charIndex;

      this.styles[lineIndex][charIndex] = style;
    },

    /**
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @private
     */
    _deleteStyleDeclaration: function(lineIndex, charIndex) {
      var map = this._styleMap[lineIndex];
      lineIndex = map.line;
      charIndex = map.offset + charIndex;
      delete this.styles[lineIndex][charIndex];
    },

    /**
     * probably broken need a fix
     * Returns the real style line that correspond to the wrapped lineIndex line
     * Used just to verify if the line does exist or not.
     * @param {Number} lineIndex
     * @returns {Boolean} if the line exists or not
     * @private
     */
    _getLineStyle: function(lineIndex) {
      var map = this._styleMap[lineIndex];
      return !!this.styles[map.line];
    },

    /**
     * Set the line style to an empty object so that is initialized
     * @param {Number} lineIndex
     * @param {Object} style
     * @private
     */
    _setLineStyle: function(lineIndex) {
      var map = this._styleMap[lineIndex];
      this.styles[map.line] = {};
    },

    /**
     * Wraps text using the 'width' property of Textbox. First this function
     * splits text on newlines, so we preserve newlines entered by the user.
     * Then it wraps each line using the width of the Textbox by calling
     * _wrapLine().
     * @param {Array} lines The string array of text that is split into lines
     * @param {Number} desiredWidth width you want to wrap to
     * @returns {Array} Array of lines
     */
    _wrapText: function(lines, desiredWidth) {
      var wrapped = [], i;
      this.isWrapping = true;
      for (i = 0; i < lines.length; i++) {
        wrapped = wrapped.concat(this._wrapLine(lines[i], i, desiredWidth));
      }
      this.isWrapping = false;
      return wrapped;
    },

    /**
     * Helper function to measure a string of text, given its lineIndex and charIndex offset
     * it gets called when charBounds are not available yet.
     * @param {CanvasRenderingContext2D} ctx
     * @param {String} text
     * @param {number} lineIndex
     * @param {number} charOffset
     * @returns {number}
     * @private
     */
    _measureWord: function(word, lineIndex, charOffset) {
      var width = 0, prevGrapheme, skipLeft = true;
      charOffset = charOffset || 0;
      for (var i = 0, len = word.length; i < len; i++) {
        var box = this._getGraphemeBox(word[i], lineIndex, i + charOffset, prevGrapheme, skipLeft);
        width += box.kernedWidth;
        prevGrapheme = word[i];
      }
      return width;
    },

    /**
     * Wraps a line of text using the width of the Textbox and a context.
     * @param {Array} line The grapheme array that represent the line
     * @param {Number} lineIndex
     * @param {Number} desiredWidth width you want to wrap the line to
     * @param {Number} reservedSpace space to remove from wrapping for custom functionalities
     * @returns {Array} Array of line(s) into which the given text is wrapped
     * to.
     */
    _wrapLine: function(_line, lineIndex, desiredWidth, reservedSpace) {
      var lineWidth = 0,
          splitByGrapheme = this.splitByGrapheme,
          graphemeLines = [],
          line = [],
          // spaces in different languages?
          words = splitByGrapheme ? fabric.util.string.graphemeSplit(_line) : _line.split(this._wordJoiners),
          word = '',
          offset = 0,
          infix = splitByGrapheme ? '' : ' ',
          wordWidth = 0,
          infixWidth = 0,
          largestWordWidth = 0,
          lineJustStarted = true,
          additionalSpace = this._getWidthOfCharSpacing(),
          reservedSpace = reservedSpace || 0;
      // fix a difference between split and graphemeSplit
      if (words.length === 0) {
        words.push([]);
      }
      desiredWidth -= reservedSpace;
      for (var i = 0; i < words.length; i++) {
        // if using splitByGrapheme words are already in graphemes.
        word = splitByGrapheme ? words[i] : fabric.util.string.graphemeSplit(words[i]);
        wordWidth = this._measureWord(word, lineIndex, offset);
        offset += word.length;

        lineWidth += infixWidth + wordWidth - additionalSpace;
        if (lineWidth > desiredWidth && !lineJustStarted) {
          graphemeLines.push(line);
          line = [];
          lineWidth = wordWidth;
          lineJustStarted = true;
        }
        else {
          lineWidth += additionalSpace;
        }

        if (!lineJustStarted && !splitByGrapheme) {
          line.push(infix);
        }
        line = line.concat(word);

        infixWidth = splitByGrapheme ? 0 : this._measureWord([infix], lineIndex, offset);
        offset++;
        lineJustStarted = false;
        // keep track of largest word
        if (wordWidth > largestWordWidth) {
          largestWordWidth = wordWidth;
        }
      }

      i && graphemeLines.push(line);

      if (largestWordWidth + reservedSpace > this.dynamicMinWidth) {
        this.dynamicMinWidth = largestWordWidth - additionalSpace + reservedSpace;
      }
      return graphemeLines;
    },

    /**
     * Detect if the text line is ended with an hard break
     * text and itext do not have wrapping, return false
     * @param {Number} lineIndex text to split
     * @return {Boolean}
     */
    isEndOfWrapping: function(lineIndex) {
      if (!this._styleMap[lineIndex + 1]) {
        // is last line, return true;
        return true;
      }
      if (this._styleMap[lineIndex + 1].line !== this._styleMap[lineIndex].line) {
        // this is last line before a line break, return true;
        return true;
      }
      return false;
    },

    /**
     * Detect if a line has a linebreak and so we need to account for it when moving
     * and counting style.
     * @return Number
     */
    missingNewlineOffset: function(lineIndex) {
      if (this.splitByGrapheme) {
        return this.isEndOfWrapping(lineIndex) ? 1 : 0;
      }
      return 1;
    },

    /**
    * Gets lines of text to render in the Textbox. This function calculates
    * text wrapping on the fly every time it is called.
    * @param {String} text text to split
    * @returns {Array} Array of lines in the Textbox.
    * @override
    */
    _splitTextIntoLines: function(text) {
      var newText = fabric.Text.prototype._splitTextIntoLines.call(this, text),
          graphemeLines = this._wrapText(newText.lines, this.width),
          lines = new Array(graphemeLines.length);
      for (var i = 0; i < graphemeLines.length; i++) {
        lines[i] = graphemeLines[i].join('');
      }
      newText.lines = lines;
      newText.graphemeLines = graphemeLines;
      return newText;
    },

    getMinWidth: function() {
      return Math.max(this.minWidth, this.dynamicMinWidth);
    },

    _removeExtraneousStyles: function() {
      var linesToKeep = {};
      for (var prop in this._styleMap) {
        if (this._textLines[prop]) {
          linesToKeep[this._styleMap[prop].line] = 1;
        }
      }
      for (var prop in this.styles) {
        if (!linesToKeep[prop]) {
          delete this.styles[prop];
        }
      }
    },

    /**
     * Returns object representation of an instance
     * @method toObject
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      return this.callSuper('toObject', ['minWidth', 'splitByGrapheme'].concat(propertiesToInclude));
    }
  });

  /**
   * Returns fabric.Textbox instance from an object representation
   * @static
   * @memberOf fabric.Textbox
   * @param {Object} object Object to create an instance from
   * @param {Function} [callback] Callback to invoke when an fabric.Textbox instance is created
   */
  fabric.Textbox.fromObject = function(object, callback) {
    return fabric.Object._fromObject('Textbox', object, callback, 'text');
  };
})(typeof exports !== 'undefined' ? exports : this);
