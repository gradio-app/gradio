/* _TO_SVG_START_ */
(function() {
  var toFixed = fabric.util.toFixed,
      multipleSpacesRegex = /  +/g;

  fabric.util.object.extend(fabric.Text.prototype, /** @lends fabric.Text.prototype */ {

    /**
     * Returns SVG representation of an instance
     * @param {Function} [reviver] Method for further parsing of svg representation.
     * @return {String} svg representation of an instance
     */
    _toSVG: function() {
      var offsets = this._getSVGLeftTopOffsets(),
          textAndBg = this._getSVGTextAndBg(offsets.textTop, offsets.textLeft);
      return this._wrapSVGTextAndBg(textAndBg);
    },

    /**
     * Returns svg representation of an instance
     * @param {Function} [reviver] Method for further parsing of svg representation.
     * @return {String} svg representation of an instance
     */
    toSVG: function(reviver) {
      return this._createBaseSVGMarkup(
        this._toSVG(),
        { reviver: reviver, noStyle: true, withShadow: true }
      );
    },

    /**
     * @private
     */
    _getSVGLeftTopOffsets: function() {
      return {
        textLeft: -this.width / 2,
        textTop: -this.height / 2,
        lineTop: this.getHeightOfLine(0)
      };
    },

    /**
     * @private
     */
    _wrapSVGTextAndBg: function(textAndBg) {
      var noShadow = true,
          textDecoration = this.getSvgTextDecoration(this);
      return [
        textAndBg.textBgRects.join(''),
        '\t\t<text xml:space="preserve" ',
        (this.fontFamily ? 'font-family="' + this.fontFamily.replace(/"/g, '\'') + '" ' : ''),
        (this.fontSize ? 'font-size="' + this.fontSize + '" ' : ''),
        (this.fontStyle ? 'font-style="' + this.fontStyle + '" ' : ''),
        (this.fontWeight ? 'font-weight="' + this.fontWeight + '" ' : ''),
        (textDecoration ? 'text-decoration="' + textDecoration + '" ' : ''),
        'style="', this.getSvgStyles(noShadow), '"', this.addPaintOrder(), ' >',
        textAndBg.textSpans.join(''),
        '</text>\n'
      ];
    },

    /**
     * @private
     * @param {Number} textTopOffset Text top offset
     * @param {Number} textLeftOffset Text left offset
     * @return {Object}
     */
    _getSVGTextAndBg: function(textTopOffset, textLeftOffset) {
      var textSpans = [],
          textBgRects = [],
          height = textTopOffset, lineOffset;
      // bounding-box background
      this._setSVGBg(textBgRects);

      // text and text-background
      for (var i = 0, len = this._textLines.length; i < len; i++) {
        lineOffset = this._getLineLeftOffset(i);
        if (this.textBackgroundColor || this.styleHas('textBackgroundColor', i)) {
          this._setSVGTextLineBg(textBgRects, i, textLeftOffset + lineOffset, height);
        }
        this._setSVGTextLineText(textSpans, i, textLeftOffset + lineOffset, height);
        height += this.getHeightOfLine(i);
      }

      return {
        textSpans: textSpans,
        textBgRects: textBgRects
      };
    },

    /**
     * @private
     */
    _createTextCharSpan: function(_char, styleDecl, left, top) {
      var shouldUseWhitespace = _char !== _char.trim() || _char.match(multipleSpacesRegex),
          styleProps = this.getSvgSpanStyles(styleDecl, shouldUseWhitespace),
          fillStyles = styleProps ? 'style="' + styleProps + '"' : '',
          dy = styleDecl.deltaY, dySpan = '',
          NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;
      if (dy) {
        dySpan = ' dy="' + toFixed(dy, NUM_FRACTION_DIGITS) + '" ';
      }
      return [
        '<tspan x="', toFixed(left, NUM_FRACTION_DIGITS), '" y="',
        toFixed(top, NUM_FRACTION_DIGITS), '" ', dySpan,
        fillStyles, '>',
        fabric.util.string.escapeXml(_char),
        '</tspan>'
      ].join('');
    },

    _setSVGTextLineText: function(textSpans, lineIndex, textLeftOffset, textTopOffset) {
      // set proper line offset
      var lineHeight = this.getHeightOfLine(lineIndex),
          isJustify = this.textAlign.indexOf('justify') !== -1,
          actualStyle,
          nextStyle,
          charsToRender = '',
          charBox, style,
          boxWidth = 0,
          line = this._textLines[lineIndex],
          timeToRender;

      textTopOffset += lineHeight * (1 - this._fontSizeFraction) / this.lineHeight;
      for (var i = 0, len = line.length - 1; i <= len; i++) {
        timeToRender = i === len || this.charSpacing;
        charsToRender += line[i];
        charBox = this.__charBounds[lineIndex][i];
        if (boxWidth === 0) {
          textLeftOffset += charBox.kernedWidth - charBox.width;
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
          timeToRender = this._hasStyleChangedForSvg(actualStyle, nextStyle);
        }
        if (timeToRender) {
          style = this._getStyleDeclaration(lineIndex, i) || { };
          textSpans.push(this._createTextCharSpan(charsToRender, style, textLeftOffset, textTopOffset));
          charsToRender = '';
          actualStyle = nextStyle;
          textLeftOffset += boxWidth;
          boxWidth = 0;
        }
      }
    },

    _pushTextBgRect: function(textBgRects, color, left, top, width, height) {
      var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;
      textBgRects.push(
        '\t\t<rect ',
        this._getFillAttributes(color),
        ' x="',
        toFixed(left, NUM_FRACTION_DIGITS),
        '" y="',
        toFixed(top, NUM_FRACTION_DIGITS),
        '" width="',
        toFixed(width, NUM_FRACTION_DIGITS),
        '" height="',
        toFixed(height, NUM_FRACTION_DIGITS),
        '"></rect>\n');
    },

    _setSVGTextLineBg: function(textBgRects, i, leftOffset, textTopOffset) {
      var line = this._textLines[i],
          heightOfLine = this.getHeightOfLine(i) / this.lineHeight,
          boxWidth = 0,
          boxStart = 0,
          charBox, currentColor,
          lastColor = this.getValueOfPropertyAt(i, 0, 'textBackgroundColor');
      for (var j = 0, jlen = line.length; j < jlen; j++) {
        charBox = this.__charBounds[i][j];
        currentColor = this.getValueOfPropertyAt(i, j, 'textBackgroundColor');
        if (currentColor !== lastColor) {
          lastColor && this._pushTextBgRect(textBgRects, lastColor, leftOffset + boxStart,
            textTopOffset, boxWidth, heightOfLine);
          boxStart = charBox.left;
          boxWidth = charBox.width;
          lastColor = currentColor;
        }
        else {
          boxWidth += charBox.kernedWidth;
        }
      }
      currentColor && this._pushTextBgRect(textBgRects, currentColor, leftOffset + boxStart,
        textTopOffset, boxWidth, heightOfLine);
    },

    /**
     * Adobe Illustrator (at least CS5) is unable to render rgba()-based fill values
     * we work around it by "moving" alpha channel into opacity attribute and setting fill's alpha to 1
     *
     * @private
     * @param {*} value
     * @return {String}
     */
    _getFillAttributes: function(value) {
      var fillColor = (value && typeof value === 'string') ? new fabric.Color(value) : '';
      if (!fillColor || !fillColor.getSource() || fillColor.getAlpha() === 1) {
        return 'fill="' + value + '"';
      }
      return 'opacity="' + fillColor.getAlpha() + '" fill="' + fillColor.setAlpha(1).toRgb() + '"';
    },

    /**
     * @private
     */
    _getSVGLineTopOffset: function(lineIndex) {
      var lineTopOffset = 0, lastHeight = 0;
      for (var j = 0; j < lineIndex; j++) {
        lineTopOffset += this.getHeightOfLine(j);
      }
      lastHeight = this.getHeightOfLine(j);
      return {
        lineTop: lineTopOffset,
        offset: (this._fontSizeMult - this._fontSizeFraction) * lastHeight / (this.lineHeight * this._fontSizeMult)
      };
    },

    /**
     * Returns styles-string for svg-export
     * @param {Boolean} skipShadow a boolean to skip shadow filter output
     * @return {String}
     */
    getSvgStyles: function(skipShadow) {
      var svgStyle = fabric.Object.prototype.getSvgStyles.call(this, skipShadow);
      return svgStyle + ' white-space: pre;';
    },
  });
})();
/* _TO_SVG_END_ */
