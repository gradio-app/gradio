(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = { }),
      clone = fabric.util.object.clone;

  if (fabric.Text) {
    fabric.warn('fabric.Text is already defined');
    return;
  }

  var additionalProps =
    ('fontFamily fontWeight fontSize text underline overline linethrough' +
    ' textAlign fontStyle lineHeight textBackgroundColor charSpacing styles' +
    ' direction path pathStartOffset pathSide').split(' ');

  /**
   * Text class
   * @class fabric.Text
   * @extends fabric.Object
   * @return {fabric.Text} thisArg
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#text}
   * @see {@link fabric.Text#initialize} for constructor definition
   */
  fabric.Text = fabric.util.createClass(fabric.Object, /** @lends fabric.Text.prototype */ {

    /**
     * Properties which when set cause object to change dimensions
     * @type Array
     * @private
     */
    _dimensionAffectingProps: [
      'fontSize',
      'fontWeight',
      'fontFamily',
      'fontStyle',
      'lineHeight',
      'text',
      'charSpacing',
      'textAlign',
      'styles',
      'path',
      'pathStartOffset',
      'pathSide'
    ],

    /**
     * @private
     */
    _reNewline: /\r?\n/,

    /**
     * Use this regular expression to filter for whitespaces that is not a new line.
     * Mostly used when text is 'justify' aligned.
     * @private
     */
    _reSpacesAndTabs: /[ \t\r]/g,

    /**
     * Use this regular expression to filter for whitespace that is not a new line.
     * Mostly used when text is 'justify' aligned.
     * @private
     */
    _reSpaceAndTab: /[ \t\r]/,

    /**
     * Use this regular expression to filter consecutive groups of non spaces.
     * Mostly used when text is 'justify' aligned.
     * @private
     */
    _reWords: /\S+/g,

    /**
     * Type of an object
     * @type String
     * @default
     */
    type:                 'text',

    /**
     * Font size (in pixels)
     * @type Number
     * @default
     */
    fontSize:             40,

    /**
     * Font weight (e.g. bold, normal, 400, 600, 800)
     * @type {(Number|String)}
     * @default
     */
    fontWeight:           'normal',

    /**
     * Font family
     * @type String
     * @default
     */
    fontFamily:           'Times New Roman',

    /**
     * Text decoration underline.
     * @type Boolean
     * @default
     */
    underline:       false,

    /**
     * Text decoration overline.
     * @type Boolean
     * @default
     */
    overline:       false,

    /**
     * Text decoration linethrough.
     * @type Boolean
     * @default
     */
    linethrough:       false,

    /**
     * Text alignment. Possible values: "left", "center", "right", "justify",
     * "justify-left", "justify-center" or "justify-right".
     * @type String
     * @default
     */
    textAlign:            'left',

    /**
     * Font style . Possible values: "", "normal", "italic" or "oblique".
     * @type String
     * @default
     */
    fontStyle:            'normal',

    /**
     * Line height
     * @type Number
     * @default
     */
    lineHeight:           1.16,

    /**
     * Superscript schema object (minimum overlap)
     * @type {Object}
     * @default
     */
    superscript: {
      size:      0.60, // fontSize factor
      baseline: -0.35  // baseline-shift factor (upwards)
    },

    /**
     * Subscript schema object (minimum overlap)
     * @type {Object}
     * @default
     */
    subscript: {
      size:      0.60, // fontSize factor
      baseline:  0.11  // baseline-shift factor (downwards)
    },

    /**
     * Background color of text lines
     * @type String
     * @default
     */
    textBackgroundColor:  '',

    /**
     * List of properties to consider when checking if
     * state of an object is changed ({@link fabric.Object#hasStateChanged})
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties: fabric.Object.prototype.stateProperties.concat(additionalProps),

    /**
     * List of properties to consider when checking if cache needs refresh
     * @type Array
     */
    cacheProperties: fabric.Object.prototype.cacheProperties.concat(additionalProps),

    /**
     * When defined, an object is rendered via stroke and this property specifies its color.
     * <b>Backwards incompatibility note:</b> This property was named "strokeStyle" until v1.1.6
     * @type String
     * @default
     */
    stroke:               null,

    /**
     * Shadow object representing shadow of this shape.
     * <b>Backwards incompatibility note:</b> This property was named "textShadow" (String) until v1.2.11
     * @type fabric.Shadow
     * @default
     */
    shadow:               null,

    /**
     * fabric.Path that the text should follow.
     * since 4.6.0 the path will be drawn automatically.
     * if you want to make the path visible, give it a stroke and strokeWidth or fill value
     * if you want it to be hidden, assign visible = false to the path.
     * This feature is in BETA, and SVG import/export is not yet supported.
     * @type fabric.Path
     * @example
     * var textPath = new fabric.Text('Text on a path', {
     *     top: 150,
     *     left: 150,
     *     textAlign: 'center',
     *     charSpacing: -50,
     *     path: new fabric.Path('M 0 0 C 50 -100 150 -100 200 0', {
     *         strokeWidth: 1,
     *         visible: false
     *     }),
     *     pathSide: 'left',
     *     pathStartOffset: 0
     * });
     * @default
     */
    path:               null,

    /**
     * Offset amount for text path starting position
     * Only used when text has a path
     * @type Number
     * @default
     */
    pathStartOffset:               0,

    /**
     * Which side of the path the text should be drawn on.
     * Only used when text has a path
     * @type {String} 'left|right'
     * @default
     */
    pathSide:               'left',

    /**
     * @private
     */
    _fontSizeFraction: 0.222,

    /**
     * @private
     */
    offsets: {
      underline: 0.10,
      linethrough: -0.315,
      overline: -0.88
    },

    /**
     * Text Line proportion to font Size (in pixels)
     * @type Number
     * @default
     */
    _fontSizeMult:             1.13,

    /**
     * additional space between characters
     * expressed in thousands of em unit
     * @type Number
     * @default
     */
    charSpacing:             0,

    /**
     * Object containing character styles - top-level properties -> line numbers,
     * 2nd-level properties - character numbers
     * @type Object
     * @default
     */
    styles: null,

    /**
     * Reference to a context to measure text char or couple of chars
     * the cacheContext of the canvas will be used or a freshly created one if the object is not on canvas
     * once created it will be referenced on fabric._measuringContext to avoid creating a canvas for every
     * text object created.
     * @type {CanvasRenderingContext2D}
     * @default
     */
    _measuringContext: null,

    /**
     * Baseline shift, styles only, keep at 0 for the main text object
     * @type {Number}
     * @default
     */
    deltaY: 0,

    /**
     * WARNING: EXPERIMENTAL. NOT SUPPORTED YET
     * determine the direction of the text.
     * This has to be set manually together with textAlign and originX for proper
     * experience.
     * some interesting link for the future
     * https://www.w3.org/International/questions/qa-bidi-unicode-controls
     * @since 4.5.0
     * @type {String} 'ltr|rtl'
     * @default
     */
    direction: 'ltr',

    /**
     * Array of properties that define a style unit (of 'styles').
     * @type {Array}
     * @default
     */
    _styleProperties: [
      'stroke',
      'strokeWidth',
      'fill',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'fontStyle',
      'underline',
      'overline',
      'linethrough',
      'deltaY',
      'textBackgroundColor',
    ],

    /**
     * contains characters bounding boxes
     */
    __charBounds: [],

    /**
     * use this size when measuring text. To avoid IE11 rounding errors
     * @type {Number}
     * @default
     * @readonly
     * @private
     */
    CACHE_FONT_SIZE: 400,

    /**
     * contains the min text width to avoid getting 0
     * @type {Number}
     * @default
     */
    MIN_TEXT_WIDTH: 2,

    /**
     * Constructor
     * @param {String} text Text string
     * @param {Object} [options] Options object
     * @return {fabric.Text} thisArg
     */
    initialize: function(text, options) {
      this.styles = options ? (options.styles || { }) : { };
      this.text = text;
      this.__skipDimension = true;
      this.callSuper('initialize', options);
      if (this.path) {
        this.setPathInfo();
      }
      this.__skipDimension = false;
      this.initDimensions();
      this.setCoords();
      this.setupState({ propertySet: '_dimensionAffectingProps' });
    },

    /**
     * If text has a path, it will add the extra information needed
     * for path and text calculations
     * @return {fabric.Text} thisArg
     */
    setPathInfo: function() {
      var path = this.path;
      if (path) {
        path.segmentsInfo = fabric.util.getPathSegmentsInfo(path.path);
      }
    },

    /**
     * Return a context for measurement of text string.
     * if created it gets stored for reuse
     * @param {String} text Text string
     * @param {Object} [options] Options object
     * @return {fabric.Text} thisArg
     */
    getMeasuringContext: function() {
      // if we did not return we have to measure something.
      if (!fabric._measuringContext) {
        fabric._measuringContext = this.canvas && this.canvas.contextCache ||
          fabric.util.createCanvasElement().getContext('2d');
      }
      return fabric._measuringContext;
    },

    /**
     * @private
     * Divides text into lines of text and lines of graphemes.
     */
    _splitText: function() {
      var newLines = this._splitTextIntoLines(this.text);
      this.textLines = newLines.lines;
      this._textLines = newLines.graphemeLines;
      this._unwrappedTextLines = newLines._unwrappedLines;
      this._text = newLines.graphemeText;
      return newLines;
    },

    /**
     * Initialize or update text dimensions.
     * Updates this.width and this.height with the proper values.
     * Does not return dimensions.
     */
    initDimensions: function() {
      if (this.__skipDimension) {
        return;
      }
      this._splitText();
      this._clearCache();
      if (this.path) {
        this.width = this.path.width;
        this.height = this.path.height;
      }
      else {
        this.width = this.calcTextWidth() || this.cursorWidth || this.MIN_TEXT_WIDTH;
        this.height = this.calcTextHeight();
      }
      if (this.textAlign.indexOf('justify') !== -1) {
        // once text is measured we need to make space fatter to make justified text.
        this.enlargeSpaces();
      }
      this.saveState({ propertySet: '_dimensionAffectingProps' });
    },

    /**
     * Enlarge space boxes and shift the others
     */
    enlargeSpaces: function() {
      var diffSpace, currentLineWidth, numberOfSpaces, accumulatedSpace, line, charBound, spaces;
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        if (this.textAlign !== 'justify' && (i === len - 1 || this.isEndOfWrapping(i))) {
          continue;
        }
        accumulatedSpace = 0;
        line = this._textLines[i];
        currentLineWidth = this.getLineWidth(i);
        if (currentLineWidth < this.width && (spaces = this.textLines[i].match(this._reSpacesAndTabs))) {
          numberOfSpaces = spaces.length;
          diffSpace = (this.width - currentLineWidth) / numberOfSpaces;
          for (var j = 0, jlen = line.length; j <= jlen; j++) {
            charBound = this.__charBounds[i][j];
            if (this._reSpaceAndTab.test(line[j])) {
              charBound.width += diffSpace;
              charBound.kernedWidth += diffSpace;
              charBound.left += accumulatedSpace;
              accumulatedSpace += diffSpace;
            }
            else {
              charBound.left += accumulatedSpace;
            }
          }
        }
      }
    },

    /**
     * Detect if the text line is ended with an hard break
     * text and itext do not have wrapping, return false
     * @return {Boolean}
     */
    isEndOfWrapping: function(lineIndex) {
      return lineIndex === this._textLines.length - 1;
    },

    /**
     * Detect if a line has a linebreak and so we need to account for it when moving
     * and counting style.
     * It return always for text and Itext.
     * @return Number
     */
    missingNewlineOffset: function() {
      return 1;
    },

    /**
     * Returns string representation of an instance
     * @return {String} String representation of text object
     */
    toString: function() {
      return '#<fabric.Text (' + this.complexity() +
        '): { "text": "' + this.text + '", "fontFamily": "' + this.fontFamily + '" }>';
    },

    /**
     * Return the dimension and the zoom level needed to create a cache canvas
     * big enough to host the object to be cached.
     * @private
     * @param {Object} dim.x width of object to be cached
     * @param {Object} dim.y height of object to be cached
     * @return {Object}.width width of canvas
     * @return {Object}.height height of canvas
     * @return {Object}.zoomX zoomX zoom value to unscale the canvas before drawing cache
     * @return {Object}.zoomY zoomY zoom value to unscale the canvas before drawing cache
     */
    _getCacheCanvasDimensions: function() {
      var dims = this.callSuper('_getCacheCanvasDimensions');
      var fontSize = this.fontSize;
      dims.width += fontSize * dims.zoomX;
      dims.height += fontSize * dims.zoomY;
      return dims;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _render: function(ctx) {
      var path = this.path;
      path && !path.isNotVisible() && path._render(ctx);
      this._setTextStyles(ctx);
      this._renderTextLinesBackground(ctx);
      this._renderTextDecoration(ctx, 'underline');
      this._renderText(ctx);
      this._renderTextDecoration(ctx, 'overline');
      this._renderTextDecoration(ctx, 'linethrough');
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderText: function(ctx) {
      if (this.paintFirst === 'stroke') {
        this._renderTextStroke(ctx);
        this._renderTextFill(ctx);
      }
      else {
        this._renderTextFill(ctx);
        this._renderTextStroke(ctx);
      }
    },

    /**
     * Set the font parameter of the context with the object properties or with charStyle
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Object} [charStyle] object with font style properties
     * @param {String} [charStyle.fontFamily] Font Family
     * @param {Number} [charStyle.fontSize] Font size in pixels. ( without px suffix )
     * @param {String} [charStyle.fontWeight] Font weight
     * @param {String} [charStyle.fontStyle] Font style (italic|normal)
     */
    _setTextStyles: function(ctx, charStyle, forMeasuring) {
      ctx.textBaseline = 'alphabetic';
      ctx.font = this._getFontDeclaration(charStyle, forMeasuring);
    },

    /**
     * calculate and return the text Width measuring each line.
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @return {Number} Maximum width of fabric.Text object
     */
    calcTextWidth: function() {
      var maxWidth = this.getLineWidth(0);

      for (var i = 1, len = this._textLines.length; i < len; i++) {
        var currentLineWidth = this.getLineWidth(i);
        if (currentLineWidth > maxWidth) {
          maxWidth = currentLineWidth;
        }
      }
      return maxWidth;
    },

    /**
     * @private
     * @param {String} method Method name ("fillText" or "strokeText")
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {String} line Text to render
     * @param {Number} left Left position of text
     * @param {Number} top Top position of text
     * @param {Number} lineIndex Index of a line in a text
     */
    _renderTextLine: function(method, ctx, line, left, top, lineIndex) {
      this._renderChars(method, ctx, line, left, top, lineIndex);
    },

    /**
     * Renders the text background for lines, taking care of style
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextLinesBackground: function(ctx) {
      if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor')) {
        return;
      }
      var heightOfLine,
          lineLeftOffset, originalFill = ctx.fillStyle,
          line, lastColor,
          leftOffset = this._getLeftOffset(),
          lineTopOffset = this._getTopOffset(),
          boxStart = 0, boxWidth = 0, charBox, currentColor, path = this.path,
          drawStart;

      for (var i = 0, len = this._textLines.length; i < len; i++) {
        heightOfLine = this.getHeightOfLine(i);
        if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor', i)) {
          lineTopOffset += heightOfLine;
          continue;
        }
        line = this._textLines[i];
        lineLeftOffset = this._getLineLeftOffset(i);
        boxWidth = 0;
        boxStart = 0;
        lastColor = this.getValueOfPropertyAt(i, 0, 'textBackgroundColor');
        for (var j = 0, jlen = line.length; j < jlen; j++) {
          charBox = this.__charBounds[i][j];
          currentColor = this.getValueOfPropertyAt(i, j, 'textBackgroundColor');
          if (path) {
            ctx.save();
            ctx.translate(charBox.renderLeft, charBox.renderTop);
            ctx.rotate(charBox.angle);
            ctx.fillStyle = currentColor;
            currentColor && ctx.fillRect(
              -charBox.width / 2,
              -heightOfLine / this.lineHeight * (1 - this._fontSizeFraction),
              charBox.width,
              heightOfLine / this.lineHeight
            );
            ctx.restore();
          }
          else if (currentColor !== lastColor) {
            drawStart = leftOffset + lineLeftOffset + boxStart;
            if (this.direction === 'rtl') {
              drawStart = this.width - drawStart - boxWidth;
            }
            ctx.fillStyle = lastColor;
            lastColor && ctx.fillRect(
              drawStart,
              lineTopOffset,
              boxWidth,
              heightOfLine / this.lineHeight
            );
            boxStart = charBox.left;
            boxWidth = charBox.width;
            lastColor = currentColor;
          }
          else {
            boxWidth += charBox.kernedWidth;
          }
        }
        if (currentColor && !path) {
          drawStart = leftOffset + lineLeftOffset + boxStart;
          if (this.direction === 'rtl') {
            drawStart = this.width - drawStart - boxWidth;
          }
          ctx.fillStyle = currentColor;
          ctx.fillRect(
            drawStart,
            lineTopOffset,
            boxWidth,
            heightOfLine / this.lineHeight
          );
        }
        lineTopOffset += heightOfLine;
      }
      ctx.fillStyle = originalFill;
      // if there is text background color no
      // other shadows should be casted
      this._removeShadow(ctx);
    },

    /**
     * @private
     * @param {Object} decl style declaration for cache
     * @param {String} decl.fontFamily fontFamily
     * @param {String} decl.fontStyle fontStyle
     * @param {String} decl.fontWeight fontWeight
     * @return {Object} reference to cache
     */
    getFontCache: function(decl) {
      var fontFamily = decl.fontFamily.toLowerCase();
      if (!fabric.charWidthsCache[fontFamily]) {
        fabric.charWidthsCache[fontFamily] = { };
      }
      var cache = fabric.charWidthsCache[fontFamily],
          cacheProp = decl.fontStyle.toLowerCase() + '_' + (decl.fontWeight + '').toLowerCase();
      if (!cache[cacheProp]) {
        cache[cacheProp] = { };
      }
      return cache[cacheProp];
    },

    /**
     * measure and return the width of a single character.
     * possibly overridden to accommodate different measure logic or
     * to hook some external lib for character measurement
     * @private
     * @param {String} _char, char to be measured
     * @param {Object} charStyle style of char to be measured
     * @param {String} [previousChar] previous char
     * @param {Object} [prevCharStyle] style of previous char
     */
    _measureChar: function(_char, charStyle, previousChar, prevCharStyle) {
      // first i try to return from cache
      var fontCache = this.getFontCache(charStyle), fontDeclaration = this._getFontDeclaration(charStyle),
          previousFontDeclaration = this._getFontDeclaration(prevCharStyle), couple = previousChar + _char,
          stylesAreEqual = fontDeclaration === previousFontDeclaration, width, coupleWidth, previousWidth,
          fontMultiplier = charStyle.fontSize / this.CACHE_FONT_SIZE, kernedWidth;

      if (previousChar && fontCache[previousChar] !== undefined) {
        previousWidth = fontCache[previousChar];
      }
      if (fontCache[_char] !== undefined) {
        kernedWidth = width = fontCache[_char];
      }
      if (stylesAreEqual && fontCache[couple] !== undefined) {
        coupleWidth = fontCache[couple];
        kernedWidth = coupleWidth - previousWidth;
      }
      if (width === undefined || previousWidth === undefined || coupleWidth === undefined) {
        var ctx = this.getMeasuringContext();
        // send a TRUE to specify measuring font size CACHE_FONT_SIZE
        this._setTextStyles(ctx, charStyle, true);
      }
      if (width === undefined) {
        kernedWidth = width = ctx.measureText(_char).width;
        fontCache[_char] = width;
      }
      if (previousWidth === undefined && stylesAreEqual && previousChar) {
        previousWidth = ctx.measureText(previousChar).width;
        fontCache[previousChar] = previousWidth;
      }
      if (stylesAreEqual && coupleWidth === undefined) {
        // we can measure the kerning couple and subtract the width of the previous character
        coupleWidth = ctx.measureText(couple).width;
        fontCache[couple] = coupleWidth;
        kernedWidth = coupleWidth - previousWidth;
      }
      return { width: width * fontMultiplier, kernedWidth: kernedWidth * fontMultiplier };
    },

    /**
     * Computes height of character at given position
     * @param {Number} line the line index number
     * @param {Number} _char the character index number
     * @return {Number} fontSize of the character
     */
    getHeightOfChar: function(line, _char) {
      return this.getValueOfPropertyAt(line, _char, 'fontSize');
    },

    /**
     * measure a text line measuring all characters.
     * @param {Number} lineIndex line number
     * @return {Number} Line width
     */
    measureLine: function(lineIndex) {
      var lineInfo = this._measureLine(lineIndex);
      if (this.charSpacing !== 0) {
        lineInfo.width -= this._getWidthOfCharSpacing();
      }
      if (lineInfo.width < 0) {
        lineInfo.width = 0;
      }
      return lineInfo;
    },

    /**
     * measure every grapheme of a line, populating __charBounds
     * @param {Number} lineIndex
     * @return {Object} object.width total width of characters
     * @return {Object} object.widthOfSpaces length of chars that match this._reSpacesAndTabs
     */
    _measureLine: function(lineIndex) {
      var width = 0, i, grapheme, line = this._textLines[lineIndex], prevGrapheme,
          graphemeInfo, numOfSpaces = 0, lineBounds = new Array(line.length),
          positionInPath = 0, startingPoint, totalPathLength, path = this.path,
          reverse = this.pathSide === 'right';

      this.__charBounds[lineIndex] = lineBounds;
      for (i = 0; i < line.length; i++) {
        grapheme = line[i];
        graphemeInfo = this._getGraphemeBox(grapheme, lineIndex, i, prevGrapheme);
        lineBounds[i] = graphemeInfo;
        width += graphemeInfo.kernedWidth;
        prevGrapheme = grapheme;
      }
      // this latest bound box represent the last character of the line
      // to simplify cursor handling in interactive mode.
      lineBounds[i] = {
        left: graphemeInfo ? graphemeInfo.left + graphemeInfo.width : 0,
        width: 0,
        kernedWidth: 0,
        height: this.fontSize
      };
      if (path) {
        totalPathLength = path.segmentsInfo[path.segmentsInfo.length - 1].length;
        startingPoint = fabric.util.getPointOnPath(path.path, 0, path.segmentsInfo);
        startingPoint.x += path.pathOffset.x;
        startingPoint.y += path.pathOffset.y;
        switch (this.textAlign) {
          case 'left':
            positionInPath = reverse ? (totalPathLength - width) : 0;
            break;
          case 'center':
            positionInPath = (totalPathLength - width) / 2;
            break;
          case 'right':
            positionInPath = reverse ? 0 : (totalPathLength - width);
            break;
          //todo - add support for justify
        }
        positionInPath += this.pathStartOffset * (reverse ? -1 : 1);
        for (i = reverse ? line.length - 1 : 0;
          reverse ? i >= 0 : i < line.length;
          reverse ? i-- : i++) {
          graphemeInfo = lineBounds[i];
          if (positionInPath > totalPathLength) {
            positionInPath %= totalPathLength;
          }
          else if (positionInPath < 0) {
            positionInPath += totalPathLength;
          }
          // it would probably much faster to send all the grapheme position for a line
          // and calculate path position/angle at once.
          this._setGraphemeOnPath(positionInPath, graphemeInfo, startingPoint);
          positionInPath += graphemeInfo.kernedWidth;
        }
      }
      return { width: width, numOfSpaces: numOfSpaces };
    },

    /**
     * Calculate the angle  and the left,top position of the char that follow a path.
     * It appends it to graphemeInfo to be reused later at rendering
     * @private
     * @param {Number} positionInPath to be measured
     * @param {Object} graphemeInfo current grapheme box information
     * @param {Object} startingPoint position of the point
     */
    _setGraphemeOnPath: function(positionInPath, graphemeInfo, startingPoint) {
      var centerPosition = positionInPath + graphemeInfo.kernedWidth / 2,
          path = this.path;

      // we are at currentPositionOnPath. we want to know what point on the path is.
      var info = fabric.util.getPointOnPath(path.path, centerPosition, path.segmentsInfo);
      graphemeInfo.renderLeft = info.x - startingPoint.x;
      graphemeInfo.renderTop = info.y - startingPoint.y;
      graphemeInfo.angle = info.angle + (this.pathSide ===  'right' ? Math.PI : 0);
    },

    /**
     * Measure and return the info of a single grapheme.
     * needs the the info of previous graphemes already filled
     * @private
     * @param {String} grapheme to be measured
     * @param {Number} lineIndex index of the line where the char is
     * @param {Number} charIndex position in the line
     * @param {String} [prevGrapheme] character preceding the one to be measured
     */
    _getGraphemeBox: function(grapheme, lineIndex, charIndex, prevGrapheme, skipLeft) {
      var style = this.getCompleteStyleDeclaration(lineIndex, charIndex),
          prevStyle = prevGrapheme ? this.getCompleteStyleDeclaration(lineIndex, charIndex - 1) : { },
          info = this._measureChar(grapheme, style, prevGrapheme, prevStyle),
          kernedWidth = info.kernedWidth,
          width = info.width, charSpacing;

      if (this.charSpacing !== 0) {
        charSpacing = this._getWidthOfCharSpacing();
        width += charSpacing;
        kernedWidth += charSpacing;
      }

      var box = {
        width: width,
        left: 0,
        height: style.fontSize,
        kernedWidth: kernedWidth,
        deltaY: style.deltaY,
      };
      if (charIndex > 0 && !skipLeft) {
        var previousBox = this.__charBounds[lineIndex][charIndex - 1];
        box.left = previousBox.left + previousBox.width + info.kernedWidth - info.width;
      }
      return box;
    },

    /**
     * Calculate height of line at 'lineIndex'
     * @param {Number} lineIndex index of line to calculate
     * @return {Number}
     */
    getHeightOfLine: function(lineIndex) {
      if (this.__lineHeights[lineIndex]) {
        return this.__lineHeights[lineIndex];
      }

      var line = this._textLines[lineIndex],
          // char 0 is measured before the line cycle because it nneds to char
          // emptylines
          maxHeight = this.getHeightOfChar(lineIndex, 0);
      for (var i = 1, len = line.length; i < len; i++) {
        maxHeight = Math.max(this.getHeightOfChar(lineIndex, i), maxHeight);
      }

      return this.__lineHeights[lineIndex] = maxHeight * this.lineHeight * this._fontSizeMult;
    },

    /**
     * Calculate text box height
     */
    calcTextHeight: function() {
      var lineHeight, height = 0;
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        lineHeight = this.getHeightOfLine(i);
        height += (i === len - 1 ? lineHeight / this.lineHeight : lineHeight);
      }
      return height;
    },

    /**
     * @private
     * @return {Number} Left offset
     */
    _getLeftOffset: function() {
      return this.direction === 'ltr' ? -this.width / 2 : this.width / 2;
    },

    /**
     * @private
     * @return {Number} Top offset
     */
    _getTopOffset: function() {
      return -this.height / 2;
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {String} method Method name ("fillText" or "strokeText")
     */
    _renderTextCommon: function(ctx, method) {
      ctx.save();
      var lineHeights = 0, left = this._getLeftOffset(), top = this._getTopOffset();
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        var heightOfLine = this.getHeightOfLine(i),
            maxHeight = heightOfLine / this.lineHeight,
            leftOffset = this._getLineLeftOffset(i);
        this._renderTextLine(
          method,
          ctx,
          this._textLines[i],
          left + leftOffset,
          top + lineHeights + maxHeight,
          i
        );
        lineHeights += heightOfLine;
      }
      ctx.restore();
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextFill: function(ctx) {
      if (!this.fill && !this.styleHas('fill')) {
        return;
      }

      this._renderTextCommon(ctx, 'fillText');
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextStroke: function(ctx) {
      if ((!this.stroke || this.strokeWidth === 0) && this.isEmptyStyles()) {
        return;
      }

      if (this.shadow && !this.shadow.affectStroke) {
        this._removeShadow(ctx);
      }

      ctx.save();
      this._setLineDash(ctx, this.strokeDashArray);
      ctx.beginPath();
      this._renderTextCommon(ctx, 'strokeText');
      ctx.closePath();
      ctx.restore();
    },

    /**
     * @private
     * @param {String} method fillText or strokeText.
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Array} line Content of the line, splitted in an array by grapheme
     * @param {Number} left
     * @param {Number} top
     * @param {Number} lineIndex
     */
    _renderChars: function(method, ctx, line, left, top, lineIndex) {
      // set proper line offset
      var lineHeight = this.getHeightOfLine(lineIndex),
          isJustify = this.textAlign.indexOf('justify') !== -1,
          actualStyle,
          nextStyle,
          charsToRender = '',
          charBox,
          boxWidth = 0,
          timeToRender,
          path = this.path,
          shortCut = !isJustify && this.charSpacing === 0 && this.isEmptyStyles(lineIndex) && !path,
          isLtr = this.direction === 'ltr', sign = this.direction === 'ltr' ? 1 : -1,
          drawingLeft;

      ctx.save();
      top -= lineHeight * this._fontSizeFraction / this.lineHeight;
      if (shortCut) {
        // render all the line in one pass without checking
        // drawingLeft = isLtr ? left : left - this.getLineWidth(lineIndex);
        ctx.canvas.setAttribute('dir', isLtr ? 'ltr' : 'rtl');
        ctx.direction = isLtr ? 'ltr' : 'rtl';
        ctx.textAlign = isLtr ? 'left' : 'right';
        this._renderChar(method, ctx, lineIndex, 0, line.join(''), left, top, lineHeight);
        ctx.restore();
        return;
      }
      for (var i = 0, len = line.length - 1; i <= len; i++) {
        timeToRender = i === len || this.charSpacing || path;
        charsToRender += line[i];
        charBox = this.__charBounds[lineIndex][i];
        if (boxWidth === 0) {
          left += sign * (charBox.kernedWidth - charBox.width);
          boxWidth += charBox.width;
        }
        else {
          boxWidth += charBox.kernedWidth;
        }
        if (isJustify && !timeToRender) {
          if (this._reSpaceAndTab.test(line[i])) {
            timeToRender = true;
          }
        }
        if (!timeToRender) {
          // if we have charSpacing, we render char by char
          actualStyle = actualStyle || this.getCompleteStyleDeclaration(lineIndex, i);
          nextStyle = this.getCompleteStyleDeclaration(lineIndex, i + 1);
          timeToRender = this._hasStyleChanged(actualStyle, nextStyle);
        }
        if (timeToRender) {
          if (path) {
            ctx.save();
            ctx.translate(charBox.renderLeft, charBox.renderTop);
            ctx.rotate(charBox.angle);
            this._renderChar(method, ctx, lineIndex, i, charsToRender, -boxWidth / 2, 0, lineHeight);
            ctx.restore();
          }
          else {
            drawingLeft = left;
            ctx.canvas.setAttribute('dir', isLtr ? 'ltr' : 'rtl');
            ctx.direction = isLtr ? 'ltr' : 'rtl';
            ctx.textAlign = isLtr ? 'left' : 'right';
            this._renderChar(method, ctx, lineIndex, i, charsToRender, drawingLeft, top, lineHeight);
          }
          charsToRender = '';
          actualStyle = nextStyle;
          left += sign * boxWidth;
          boxWidth = 0;
        }
      }
      ctx.restore();
    },

    /**
     * This function try to patch the missing gradientTransform on canvas gradients.
     * transforming a context to transform the gradient, is going to transform the stroke too.
     * we want to transform the gradient but not the stroke operation, so we create
     * a transformed gradient on a pattern and then we use the pattern instead of the gradient.
     * this method has drawbacks: is slow, is in low resolution, needs a patch for when the size
     * is limited.
     * @private
     * @param {fabric.Gradient} filler a fabric gradient instance
     * @return {CanvasPattern} a pattern to use as fill/stroke style
     */
    _applyPatternGradientTransformText: function(filler) {
      var pCanvas = fabric.util.createCanvasElement(), pCtx,
          // TODO: verify compatibility with strokeUniform
          width = this.width + this.strokeWidth, height = this.height + this.strokeWidth;
      pCanvas.width = width;
      pCanvas.height = height;
      pCtx = pCanvas.getContext('2d');
      pCtx.beginPath(); pCtx.moveTo(0, 0); pCtx.lineTo(width, 0); pCtx.lineTo(width, height);
      pCtx.lineTo(0, height); pCtx.closePath();
      pCtx.translate(width / 2, height / 2);
      pCtx.fillStyle = filler.toLive(pCtx);
      this._applyPatternGradientTransform(pCtx, filler);
      pCtx.fill();
      return pCtx.createPattern(pCanvas, 'no-repeat');
    },

    handleFiller: function(ctx, property, filler) {
      var offsetX, offsetY;
      if (filler.toLive) {
        if (filler.gradientUnits === 'percentage' || filler.gradientTransform || filler.patternTransform) {
          // need to transform gradient in a pattern.
          // this is a slow process. If you are hitting this codepath, and the object
          // is not using caching, you should consider switching it on.
          // we need a canvas as big as the current object caching canvas.
          offsetX = -this.width / 2;
          offsetY = -this.height / 2;
          ctx.translate(offsetX, offsetY);
          ctx[property] = this._applyPatternGradientTransformText(filler);
          return { offsetX: offsetX, offsetY: offsetY };
        }
        else {
          // is a simple gradient or pattern
          ctx[property] = filler.toLive(ctx, this);
          return this._applyPatternGradientTransform(ctx, filler);
        }
      }
      else {
        // is a color
        ctx[property] = filler;
      }
      return { offsetX: 0, offsetY: 0 };
    },

    _setStrokeStyles: function(ctx, decl) {
      ctx.lineWidth = decl.strokeWidth;
      ctx.lineCap = this.strokeLineCap;
      ctx.lineDashOffset = this.strokeDashOffset;
      ctx.lineJoin = this.strokeLineJoin;
      ctx.miterLimit = this.strokeMiterLimit;
      return this.handleFiller(ctx, 'strokeStyle', decl.stroke);
    },

    _setFillStyles: function(ctx, decl) {
      return this.handleFiller(ctx, 'fillStyle', decl.fill);
    },

    /**
     * @private
     * @param {String} method
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @param {Number} lineIndex
     * @param {Number} charIndex
     * @param {String} _char
     * @param {Number} left Left coordinate
     * @param {Number} top Top coordinate
     * @param {Number} lineHeight Height of the line
     */
    _renderChar: function(method, ctx, lineIndex, charIndex, _char, left, top) {
      var decl = this._getStyleDeclaration(lineIndex, charIndex),
          fullDecl = this.getCompleteStyleDeclaration(lineIndex, charIndex),
          shouldFill = method === 'fillText' && fullDecl.fill,
          shouldStroke = method === 'strokeText' && fullDecl.stroke && fullDecl.strokeWidth,
          fillOffsets, strokeOffsets;

      if (!shouldStroke && !shouldFill) {
        return;
      }
      ctx.save();

      shouldFill && (fillOffsets = this._setFillStyles(ctx, fullDecl));
      shouldStroke && (strokeOffsets = this._setStrokeStyles(ctx, fullDecl));

      ctx.font = this._getFontDeclaration(fullDecl);


      if (decl && decl.textBackgroundColor) {
        this._removeShadow(ctx);
      }
      if (decl && decl.deltaY) {
        top += decl.deltaY;
      }
      shouldFill && ctx.fillText(_char, left - fillOffsets.offsetX, top - fillOffsets.offsetY);
      shouldStroke && ctx.strokeText(_char, left - strokeOffsets.offsetX, top - strokeOffsets.offsetY);
      ctx.restore();
    },

    /**
     * Turns the character into a 'superior figure' (i.e. 'superscript')
     * @param {Number} start selection start
     * @param {Number} end selection end
     * @returns {fabric.Text} thisArg
     * @chainable
     */
    setSuperscript: function(start, end) {
      return this._setScript(start, end, this.superscript);
    },

    /**
     * Turns the character into an 'inferior figure' (i.e. 'subscript')
     * @param {Number} start selection start
     * @param {Number} end selection end
     * @returns {fabric.Text} thisArg
     * @chainable
     */
    setSubscript: function(start, end) {
      return this._setScript(start, end, this.subscript);
    },

    /**
     * Applies 'schema' at given position
     * @private
     * @param {Number} start selection start
     * @param {Number} end selection end
     * @param {Number} schema
     * @returns {fabric.Text} thisArg
     * @chainable
     */
    _setScript: function(start, end, schema) {
      var loc = this.get2DCursorLocation(start, true),
          fontSize = this.getValueOfPropertyAt(loc.lineIndex, loc.charIndex, 'fontSize'),
          dy = this.getValueOfPropertyAt(loc.lineIndex, loc.charIndex, 'deltaY'),
          style = { fontSize: fontSize * schema.size, deltaY: dy + fontSize * schema.baseline };
      this.setSelectionStyles(style, start, end);
      return this;
    },

    /**
     * @private
     * @param {Object} prevStyle
     * @param {Object} thisStyle
     */
    _hasStyleChanged: function(prevStyle, thisStyle) {
      return prevStyle.fill !== thisStyle.fill ||
              prevStyle.stroke !== thisStyle.stroke ||
              prevStyle.strokeWidth !== thisStyle.strokeWidth ||
              prevStyle.fontSize !== thisStyle.fontSize ||
              prevStyle.fontFamily !== thisStyle.fontFamily ||
              prevStyle.fontWeight !== thisStyle.fontWeight ||
              prevStyle.fontStyle !== thisStyle.fontStyle ||
              prevStyle.deltaY !== thisStyle.deltaY;
    },

    /**
     * @private
     * @param {Object} prevStyle
     * @param {Object} thisStyle
     */
    _hasStyleChangedForSvg: function(prevStyle, thisStyle) {
      return this._hasStyleChanged(prevStyle, thisStyle) ||
        prevStyle.overline !== thisStyle.overline ||
        prevStyle.underline !== thisStyle.underline ||
        prevStyle.linethrough !== thisStyle.linethrough;
    },

    /**
     * @private
     * @param {Number} lineIndex index text line
     * @return {Number} Line left offset
     */
    _getLineLeftOffset: function(lineIndex) {
      var lineWidth = this.getLineWidth(lineIndex),
          lineDiff = this.width - lineWidth, textAlign = this.textAlign, direction = this.direction,
          isEndOfWrapping, leftOffset = 0, isEndOfWrapping = this.isEndOfWrapping(lineIndex);
      if (textAlign === 'justify'
        || (textAlign === 'justify-center' && !isEndOfWrapping)
        || (textAlign === 'justify-right' && !isEndOfWrapping)
        || (textAlign === 'justify-left' && !isEndOfWrapping)
      ) {
        return 0;
      }
      if (textAlign === 'center') {
        leftOffset = lineDiff / 2;
      }
      if (textAlign === 'right') {
        leftOffset = lineDiff;
      }
      if (textAlign === 'justify-center') {
        leftOffset = lineDiff / 2;
      }
      if (textAlign === 'justify-right') {
        leftOffset = lineDiff;
      }
      if (direction === 'rtl') {
        leftOffset -= lineDiff;
      }
      return leftOffset;
    },

    /**
     * @private
     */
    _clearCache: function() {
      this.__lineWidths = [];
      this.__lineHeights = [];
      this.__charBounds = [];
    },

    /**
     * @private
     */
    _shouldClearDimensionCache: function() {
      var shouldClear = this._forceClearCache;
      shouldClear || (shouldClear = this.hasStateChanged('_dimensionAffectingProps'));
      if (shouldClear) {
        this.dirty = true;
        this._forceClearCache = false;
      }
      return shouldClear;
    },

    /**
     * Measure a single line given its index. Used to calculate the initial
     * text bounding box. The values are calculated and stored in __lineWidths cache.
     * @private
     * @param {Number} lineIndex line number
     * @return {Number} Line width
     */
    getLineWidth: function(lineIndex) {
      if (this.__lineWidths[lineIndex]) {
        return this.__lineWidths[lineIndex];
      }

      var width, line = this._textLines[lineIndex], lineInfo;

      if (line === '') {
        width = 0;
      }
      else {
        lineInfo = this.measureLine(lineIndex);
        width = lineInfo.width;
      }
      this.__lineWidths[lineIndex] = width;
      return width;
    },

    _getWidthOfCharSpacing: function() {
      if (this.charSpacing !== 0) {
        return this.fontSize * this.charSpacing / 1000;
      }
      return 0;
    },

    /**
     * Retrieves the value of property at given character position
     * @param {Number} lineIndex the line number
     * @param {Number} charIndex the character number
     * @param {String} property the property name
     * @returns the value of 'property'
     */
    getValueOfPropertyAt: function(lineIndex, charIndex, property) {
      var charStyle = this._getStyleDeclaration(lineIndex, charIndex);
      if (charStyle && typeof charStyle[property] !== 'undefined') {
        return charStyle[property];
      }
      return this[property];
    },

    /**
     * @private
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    _renderTextDecoration: function(ctx, type) {
      if (!this[type] && !this.styleHas(type)) {
        return;
      }
      var heightOfLine, size, _size,
          lineLeftOffset, dy, _dy,
          line, lastDecoration,
          leftOffset = this._getLeftOffset(),
          topOffset = this._getTopOffset(), top,
          boxStart, boxWidth, charBox, currentDecoration,
          maxHeight, currentFill, lastFill, path = this.path,
          charSpacing = this._getWidthOfCharSpacing(),
          offsetY = this.offsets[type];

      for (var i = 0, len = this._textLines.length; i < len; i++) {
        heightOfLine = this.getHeightOfLine(i);
        if (!this[type] && !this.styleHas(type, i)) {
          topOffset += heightOfLine;
          continue;
        }
        line = this._textLines[i];
        maxHeight = heightOfLine / this.lineHeight;
        lineLeftOffset = this._getLineLeftOffset(i);
        boxStart = 0;
        boxWidth = 0;
        lastDecoration = this.getValueOfPropertyAt(i, 0, type);
        lastFill = this.getValueOfPropertyAt(i, 0, 'fill');
        top = topOffset + maxHeight * (1 - this._fontSizeFraction);
        size = this.getHeightOfChar(i, 0);
        dy = this.getValueOfPropertyAt(i, 0, 'deltaY');
        for (var j = 0, jlen = line.length; j < jlen; j++) {
          charBox = this.__charBounds[i][j];
          currentDecoration = this.getValueOfPropertyAt(i, j, type);
          currentFill = this.getValueOfPropertyAt(i, j, 'fill');
          _size = this.getHeightOfChar(i, j);
          _dy = this.getValueOfPropertyAt(i, j, 'deltaY');
          if (path && currentDecoration && currentFill) {
            ctx.save();
            ctx.fillStyle = lastFill;
            ctx.translate(charBox.renderLeft, charBox.renderTop);
            ctx.rotate(charBox.angle);
            ctx.fillRect(
              -charBox.kernedWidth / 2,
              offsetY * _size + _dy,
              charBox.kernedWidth,
              this.fontSize / 15
            );
            ctx.restore();
          }
          else if (
            (currentDecoration !== lastDecoration || currentFill !== lastFill || _size !== size || _dy !== dy)
            && boxWidth > 0
          ) {
            var drawStart = leftOffset + lineLeftOffset + boxStart;
            if (this.direction === 'rtl') {
              drawStart = this.width - drawStart - boxWidth;
            }
            if (lastDecoration && lastFill) {
              ctx.fillStyle = lastFill;
              ctx.fillRect(
                drawStart,
                top + offsetY * size + dy,
                boxWidth,
                this.fontSize / 15
              );
            }
            boxStart = charBox.left;
            boxWidth = charBox.width;
            lastDecoration = currentDecoration;
            lastFill = currentFill;
            size = _size;
            dy = _dy;
          }
          else {
            boxWidth += charBox.kernedWidth;
          }
        }
        var drawStart = leftOffset + lineLeftOffset + boxStart;
        if (this.direction === 'rtl') {
          drawStart = this.width - drawStart - boxWidth;
        }
        ctx.fillStyle = currentFill;
        currentDecoration && currentFill && ctx.fillRect(
          drawStart,
          top + offsetY * size + dy,
          boxWidth - charSpacing,
          this.fontSize / 15
        );
        topOffset += heightOfLine;
      }
      // if there is text background color no
      // other shadows should be casted
      this._removeShadow(ctx);
    },

    /**
     * return font declaration string for canvas context
     * @param {Object} [styleObject] object
     * @returns {String} font declaration formatted for canvas context.
     */
    _getFontDeclaration: function(styleObject, forMeasuring) {
      var style = styleObject || this, family = this.fontFamily,
          fontIsGeneric = fabric.Text.genericFonts.indexOf(family.toLowerCase()) > -1;
      var fontFamily = family === undefined ||
      family.indexOf('\'') > -1 || family.indexOf(',') > -1 ||
      family.indexOf('"') > -1 || fontIsGeneric
        ? style.fontFamily : '"' + style.fontFamily + '"';
      return [
        // node-canvas needs "weight style", while browsers need "style weight"
        // verify if this can be fixed in JSDOM
        (fabric.isLikelyNode ? style.fontWeight : style.fontStyle),
        (fabric.isLikelyNode ? style.fontStyle : style.fontWeight),
        forMeasuring ? this.CACHE_FONT_SIZE + 'px' : style.fontSize + 'px',
        fontFamily
      ].join(' ');
    },

    /**
     * Renders text instance on a specified context
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    render: function(ctx) {
      // do not render if object is not visible
      if (!this.visible) {
        return;
      }
      if (this.canvas && this.canvas.skipOffscreen && !this.group && !this.isOnScreen()) {
        return;
      }
      if (this._shouldClearDimensionCache()) {
        this.initDimensions();
      }
      this.callSuper('render', ctx);
    },

    /**
     * Returns the text as an array of lines.
     * @param {String} text text to split
     * @returns {Array} Lines in the text
     */
    _splitTextIntoLines: function(text) {
      var lines = text.split(this._reNewline),
          newLines = new Array(lines.length),
          newLine = ['\n'],
          newText = [];
      for (var i = 0; i < lines.length; i++) {
        newLines[i] = fabric.util.string.graphemeSplit(lines[i]);
        newText = newText.concat(newLines[i], newLine);
      }
      newText.pop();
      return { _unwrappedLines: newLines, lines: lines, graphemeText: newText, graphemeLines: newLines };
    },

    /**
     * Returns object representation of an instance
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object} Object representation of an instance
     */
    toObject: function(propertiesToInclude) {
      var allProperties = additionalProps.concat(propertiesToInclude);
      var obj = this.callSuper('toObject', allProperties);
      // styles will be overridden with a properly cloned structure
      obj.styles = clone(this.styles, true);
      if (obj.path) {
        obj.path = this.path.toObject();
      }
      return obj;
    },

    /**
     * Sets property to a given value. When changing position/dimension -related properties (left, top, scale, angle, etc.) `set` does not update position of object's borders/controls. If you need to update those, call `setCoords()`.
     * @param {String|Object} key Property name or object (if object, iterate over the object properties)
     * @param {Object|Function} value Property value (if function, the value is passed into it and its return value is used as a new one)
     * @return {fabric.Object} thisArg
     * @chainable
     */
    set: function(key, value) {
      this.callSuper('set', key, value);
      var needsDims = false;
      var isAddingPath = false;
      if (typeof key === 'object') {
        for (var _key in key) {
          if (_key === 'path') {
            this.setPathInfo();
          }
          needsDims = needsDims || this._dimensionAffectingProps.indexOf(_key) !== -1;
          isAddingPath = isAddingPath || _key === 'path';
        }
      }
      else {
        needsDims = this._dimensionAffectingProps.indexOf(key) !== -1;
        isAddingPath = key === 'path';
      }
      if (isAddingPath) {
        this.setPathInfo();
      }
      if (needsDims) {
        this.initDimensions();
        this.setCoords();
      }
      return this;
    },

    /**
     * Returns complexity of an instance
     * @return {Number} complexity
     */
    complexity: function() {
      return 1;
    }
  });

  /* _FROM_SVG_START_ */
  /**
   * List of attribute names to account for when parsing SVG element (used by {@link fabric.Text.fromElement})
   * @static
   * @memberOf fabric.Text
   * @see: http://www.w3.org/TR/SVG/text.html#TextElement
   */
  fabric.Text.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat(
    'x y dx dy font-family font-style font-weight font-size letter-spacing text-decoration text-anchor'.split(' '));

  /**
   * Default SVG font size
   * @static
   * @memberOf fabric.Text
   */
  fabric.Text.DEFAULT_SVG_FONT_SIZE = 16;

  /**
   * Returns fabric.Text instance from an SVG element (<b>not yet implemented</b>)
   * @static
   * @memberOf fabric.Text
   * @param {SVGElement} element Element to parse
   * @param {Function} callback callback function invoked after parsing
   * @param {Object} [options] Options object
   */
  fabric.Text.fromElement = function(element, callback, options) {
    if (!element) {
      return callback(null);
    }

    var parsedAttributes = fabric.parseAttributes(element, fabric.Text.ATTRIBUTE_NAMES),
        parsedAnchor = parsedAttributes.textAnchor || 'left';
    options = fabric.util.object.extend((options ? clone(options) : { }), parsedAttributes);

    options.top = options.top || 0;
    options.left = options.left || 0;
    if (parsedAttributes.textDecoration) {
      var textDecoration = parsedAttributes.textDecoration;
      if (textDecoration.indexOf('underline') !== -1) {
        options.underline = true;
      }
      if (textDecoration.indexOf('overline') !== -1) {
        options.overline = true;
      }
      if (textDecoration.indexOf('line-through') !== -1) {
        options.linethrough = true;
      }
      delete options.textDecoration;
    }
    if ('dx' in parsedAttributes) {
      options.left += parsedAttributes.dx;
    }
    if ('dy' in parsedAttributes) {
      options.top += parsedAttributes.dy;
    }
    if (!('fontSize' in options)) {
      options.fontSize = fabric.Text.DEFAULT_SVG_FONT_SIZE;
    }

    var textContent = '';

    // The XML is not properly parsed in IE9 so a workaround to get
    // textContent is through firstChild.data. Another workaround would be
    // to convert XML loaded from a file to be converted using DOMParser (same way loadSVGFromString() does)
    if (!('textContent' in element)) {
      if ('firstChild' in element && element.firstChild !== null) {
        if ('data' in element.firstChild && element.firstChild.data !== null) {
          textContent = element.firstChild.data;
        }
      }
    }
    else {
      textContent = element.textContent;
    }

    textContent = textContent.replace(/^\s+|\s+$|\n+/g, '').replace(/\s+/g, ' ');
    var originalStrokeWidth = options.strokeWidth;
    options.strokeWidth = 0;

    var text = new fabric.Text(textContent, options),
        textHeightScaleFactor = text.getScaledHeight() / text.height,
        lineHeightDiff = (text.height + text.strokeWidth) * text.lineHeight - text.height,
        scaledDiff = lineHeightDiff * textHeightScaleFactor,
        textHeight = text.getScaledHeight() + scaledDiff,
        offX = 0;
    /*
      Adjust positioning:
        x/y attributes in SVG correspond to the bottom-left corner of text bounding box
        fabric output by default at top, left.
    */
    if (parsedAnchor === 'center') {
      offX = text.getScaledWidth() / 2;
    }
    if (parsedAnchor === 'right') {
      offX = text.getScaledWidth();
    }
    text.set({
      left: text.left - offX,
      top: text.top - (textHeight - text.fontSize * (0.07 + text._fontSizeFraction)) / text.lineHeight,
      strokeWidth: typeof originalStrokeWidth !== 'undefined' ? originalStrokeWidth : 1,
    });
    callback(text);
  };
  /* _FROM_SVG_END_ */

  /**
   * Returns fabric.Text instance from an object representation
   * @static
   * @memberOf fabric.Text
   * @param {Object} object plain js Object to create an instance from
   * @param {Function} [callback] Callback to invoke when an fabric.Text instance is created
   */
  fabric.Text.fromObject = function(object, callback) {
    var objectCopy = clone(object), path = object.path;
    delete objectCopy.path;
    return fabric.Object._fromObject('Text', objectCopy, function(textInstance) {
      if (path) {
        fabric.Object._fromObject('Path', path, function(pathInstance) {
          textInstance.set('path', pathInstance);
          callback(textInstance);
        }, 'path');
      }
      else {
        callback(textInstance);
      }
    }, 'text');
  };

  fabric.Text.genericFonts = ['sans-serif', 'serif', 'cursive', 'fantasy', 'monospace'];

  fabric.util.createAccessors && fabric.util.createAccessors(fabric.Text);

})(typeof exports !== 'undefined' ? exports : this);
