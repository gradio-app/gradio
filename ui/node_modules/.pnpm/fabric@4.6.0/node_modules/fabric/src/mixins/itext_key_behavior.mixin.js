fabric.util.object.extend(fabric.IText.prototype, /** @lends fabric.IText.prototype */ {

  /**
   * Initializes hidden textarea (needed to bring up keyboard in iOS)
   */
  initHiddenTextarea: function() {
    this.hiddenTextarea = fabric.document.createElement('textarea');
    this.hiddenTextarea.setAttribute('autocapitalize', 'off');
    this.hiddenTextarea.setAttribute('autocorrect', 'off');
    this.hiddenTextarea.setAttribute('autocomplete', 'off');
    this.hiddenTextarea.setAttribute('spellcheck', 'false');
    this.hiddenTextarea.setAttribute('data-fabric-hiddentextarea', '');
    this.hiddenTextarea.setAttribute('wrap', 'off');
    var style = this._calcTextareaPosition();
    // line-height: 1px; was removed from the style to fix this:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=870966
    this.hiddenTextarea.style.cssText = 'position: absolute; top: ' + style.top +
    '; left: ' + style.left + '; z-index: -999; opacity: 0; width: 1px; height: 1px; font-size: 1px;' +
    ' paddingｰtop: ' + style.fontSize + ';';

    if (this.hiddenTextareaContainer) {
      this.hiddenTextareaContainer.appendChild(this.hiddenTextarea);
    }
    else {
      fabric.document.body.appendChild(this.hiddenTextarea);
    }

    fabric.util.addListener(this.hiddenTextarea, 'keydown', this.onKeyDown.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'keyup', this.onKeyUp.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'input', this.onInput.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'copy', this.copy.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'cut', this.copy.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'paste', this.paste.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'compositionstart', this.onCompositionStart.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'compositionupdate', this.onCompositionUpdate.bind(this));
    fabric.util.addListener(this.hiddenTextarea, 'compositionend', this.onCompositionEnd.bind(this));

    if (!this._clickHandlerInitialized && this.canvas) {
      fabric.util.addListener(this.canvas.upperCanvasEl, 'click', this.onClick.bind(this));
      this._clickHandlerInitialized = true;
    }
  },

  /**
   * For functionalities on keyDown
   * Map a special key to a function of the instance/prototype
   * If you need different behaviour for ESC or TAB or arrows, you have to change
   * this map setting the name of a function that you build on the fabric.Itext or
   * your prototype.
   * the map change will affect all Instances unless you need for only some text Instances
   * in that case you have to clone this object and assign your Instance.
   * this.keysMap = fabric.util.object.clone(this.keysMap);
   * The function must be in fabric.Itext.prototype.myFunction And will receive event as args[0]
   */
  keysMap: {
    9:  'exitEditing',
    27: 'exitEditing',
    33: 'moveCursorUp',
    34: 'moveCursorDown',
    35: 'moveCursorRight',
    36: 'moveCursorLeft',
    37: 'moveCursorLeft',
    38: 'moveCursorUp',
    39: 'moveCursorRight',
    40: 'moveCursorDown',
  },

  keysMapRtl: {
    9:  'exitEditing',
    27: 'exitEditing',
    33: 'moveCursorUp',
    34: 'moveCursorDown',
    35: 'moveCursorLeft',
    36: 'moveCursorRight',
    37: 'moveCursorRight',
    38: 'moveCursorUp',
    39: 'moveCursorLeft',
    40: 'moveCursorDown',
  },

  /**
   * For functionalities on keyUp + ctrl || cmd
   */
  ctrlKeysMapUp: {
    67: 'copy',
    88: 'cut'
  },

  /**
   * For functionalities on keyDown + ctrl || cmd
   */
  ctrlKeysMapDown: {
    65: 'selectAll'
  },

  onClick: function() {
    // No need to trigger click event here, focus is enough to have the keyboard appear on Android
    this.hiddenTextarea && this.hiddenTextarea.focus();
  },

  /**
   * Handles keydown event
   * only used for arrows and combination of modifier keys.
   * @param {Event} e Event object
   */
  onKeyDown: function(e) {
    if (!this.isEditing) {
      return;
    }
    var keyMap = this.direction === 'rtl' ? this.keysMapRtl : this.keysMap;
    if (e.keyCode in keyMap) {
      this[keyMap[e.keyCode]](e);
    }
    else if ((e.keyCode in this.ctrlKeysMapDown) && (e.ctrlKey || e.metaKey)) {
      this[this.ctrlKeysMapDown[e.keyCode]](e);
    }
    else {
      return;
    }
    e.stopImmediatePropagation();
    e.preventDefault();
    if (e.keyCode >= 33 && e.keyCode <= 40) {
      // if i press an arrow key just update selection
      this.inCompositionMode = false;
      this.clearContextTop();
      this.renderCursorOrSelection();
    }
    else {
      this.canvas && this.canvas.requestRenderAll();
    }
  },

  /**
   * Handles keyup event
   * We handle KeyUp because ie11 and edge have difficulties copy/pasting
   * if a copy/cut event fired, keyup is dismissed
   * @param {Event} e Event object
   */
  onKeyUp: function(e) {
    if (!this.isEditing || this._copyDone || this.inCompositionMode) {
      this._copyDone = false;
      return;
    }
    if ((e.keyCode in this.ctrlKeysMapUp) && (e.ctrlKey || e.metaKey)) {
      this[this.ctrlKeysMapUp[e.keyCode]](e);
    }
    else {
      return;
    }
    e.stopImmediatePropagation();
    e.preventDefault();
    this.canvas && this.canvas.requestRenderAll();
  },

  /**
   * Handles onInput event
   * @param {Event} e Event object
   */
  onInput: function(e) {
    var fromPaste = this.fromPaste;
    this.fromPaste = false;
    e && e.stopPropagation();
    if (!this.isEditing) {
      return;
    }
    // decisions about style changes.
    var nextText = this._splitTextIntoLines(this.hiddenTextarea.value).graphemeText,
        charCount = this._text.length,
        nextCharCount = nextText.length,
        removedText, insertedText,
        charDiff = nextCharCount - charCount,
        selectionStart = this.selectionStart, selectionEnd = this.selectionEnd,
        selection = selectionStart !== selectionEnd,
        copiedStyle, removeFrom, removeTo;
    if (this.hiddenTextarea.value === '') {
      this.styles = { };
      this.updateFromTextArea();
      this.fire('changed');
      if (this.canvas) {
        this.canvas.fire('text:changed', { target: this });
        this.canvas.requestRenderAll();
      }
      return;
    }

    var textareaSelection = this.fromStringToGraphemeSelection(
      this.hiddenTextarea.selectionStart,
      this.hiddenTextarea.selectionEnd,
      this.hiddenTextarea.value
    );
    var backDelete = selectionStart > textareaSelection.selectionStart;

    if (selection) {
      removedText = this._text.slice(selectionStart, selectionEnd);
      charDiff += selectionEnd - selectionStart;
    }
    else if (nextCharCount < charCount) {
      if (backDelete) {
        removedText = this._text.slice(selectionEnd + charDiff, selectionEnd);
      }
      else {
        removedText = this._text.slice(selectionStart, selectionStart - charDiff);
      }
    }
    insertedText = nextText.slice(textareaSelection.selectionEnd - charDiff, textareaSelection.selectionEnd);
    if (removedText && removedText.length) {
      if (insertedText.length) {
        // let's copy some style before deleting.
        // we want to copy the style before the cursor OR the style at the cursor if selection
        // is bigger than 0.
        copiedStyle = this.getSelectionStyles(selectionStart, selectionStart + 1, false);
        // now duplicate the style one for each inserted text.
        copiedStyle = insertedText.map(function() {
          // this return an array of references, but that is fine since we are
          // copying the style later.
          return copiedStyle[0];
        });
      }
      if (selection) {
        removeFrom = selectionStart;
        removeTo = selectionEnd;
      }
      else if (backDelete) {
        // detect differences between forwardDelete and backDelete
        removeFrom = selectionEnd - removedText.length;
        removeTo = selectionEnd;
      }
      else {
        removeFrom = selectionEnd;
        removeTo = selectionEnd + removedText.length;
      }
      this.removeStyleFromTo(removeFrom, removeTo);
    }
    if (insertedText.length) {
      if (fromPaste && insertedText.join('') === fabric.copiedText && !fabric.disableStyleCopyPaste) {
        copiedStyle = fabric.copiedTextStyle;
      }
      this.insertNewStyleBlock(insertedText, selectionStart, copiedStyle);
    }
    this.updateFromTextArea();
    this.fire('changed');
    if (this.canvas) {
      this.canvas.fire('text:changed', { target: this });
      this.canvas.requestRenderAll();
    }
  },
  /**
   * Composition start
   */
  onCompositionStart: function() {
    this.inCompositionMode = true;
  },

  /**
   * Composition end
   */
  onCompositionEnd: function() {
    this.inCompositionMode = false;
  },

  // /**
  //  * Composition update
  //  */
  onCompositionUpdate: function(e) {
    this.compositionStart = e.target.selectionStart;
    this.compositionEnd = e.target.selectionEnd;
    this.updateTextareaPosition();
  },

  /**
   * Copies selected text
   * @param {Event} e Event object
   */
  copy: function() {
    if (this.selectionStart === this.selectionEnd) {
      //do not cut-copy if no selection
      return;
    }

    fabric.copiedText = this.getSelectedText();
    if (!fabric.disableStyleCopyPaste) {
      fabric.copiedTextStyle = this.getSelectionStyles(this.selectionStart, this.selectionEnd, true);
    }
    else {
      fabric.copiedTextStyle = null;
    }
    this._copyDone = true;
  },

  /**
   * Pastes text
   * @param {Event} e Event object
   */
  paste: function() {
    this.fromPaste = true;
  },

  /**
   * @private
   * @param {Event} e Event object
   * @return {Object} Clipboard data object
   */
  _getClipboardData: function(e) {
    return (e && e.clipboardData) || fabric.window.clipboardData;
  },

  /**
   * Finds the width in pixels before the cursor on the same line
   * @private
   * @param {Number} lineIndex
   * @param {Number} charIndex
   * @return {Number} widthBeforeCursor width before cursor
   */
  _getWidthBeforeCursor: function(lineIndex, charIndex) {
    var widthBeforeCursor = this._getLineLeftOffset(lineIndex), bound;

    if (charIndex > 0) {
      bound = this.__charBounds[lineIndex][charIndex - 1];
      widthBeforeCursor += bound.left + bound.width;
    }
    return widthBeforeCursor;
  },

  /**
   * Gets start offset of a selection
   * @param {Event} e Event object
   * @param {Boolean} isRight
   * @return {Number}
   */
  getDownCursorOffset: function(e, isRight) {
    var selectionProp = this._getSelectionForOffset(e, isRight),
        cursorLocation = this.get2DCursorLocation(selectionProp),
        lineIndex = cursorLocation.lineIndex;
    // if on last line, down cursor goes to end of line
    if (lineIndex === this._textLines.length - 1 || e.metaKey || e.keyCode === 34) {
      // move to the end of a text
      return this._text.length - selectionProp;
    }
    var charIndex = cursorLocation.charIndex,
        widthBeforeCursor = this._getWidthBeforeCursor(lineIndex, charIndex),
        indexOnOtherLine = this._getIndexOnLine(lineIndex + 1, widthBeforeCursor),
        textAfterCursor = this._textLines[lineIndex].slice(charIndex);
    return textAfterCursor.length + indexOnOtherLine + 1 + this.missingNewlineOffset(lineIndex);
  },

  /**
   * private
   * Helps finding if the offset should be counted from Start or End
   * @param {Event} e Event object
   * @param {Boolean} isRight
   * @return {Number}
   */
  _getSelectionForOffset: function(e, isRight) {
    if (e.shiftKey && this.selectionStart !== this.selectionEnd && isRight) {
      return this.selectionEnd;
    }
    else {
      return this.selectionStart;
    }
  },

  /**
   * @param {Event} e Event object
   * @param {Boolean} isRight
   * @return {Number}
   */
  getUpCursorOffset: function(e, isRight) {
    var selectionProp = this._getSelectionForOffset(e, isRight),
        cursorLocation = this.get2DCursorLocation(selectionProp),
        lineIndex = cursorLocation.lineIndex;
    if (lineIndex === 0 || e.metaKey || e.keyCode === 33) {
      // if on first line, up cursor goes to start of line
      return -selectionProp;
    }
    var charIndex = cursorLocation.charIndex,
        widthBeforeCursor = this._getWidthBeforeCursor(lineIndex, charIndex),
        indexOnOtherLine = this._getIndexOnLine(lineIndex - 1, widthBeforeCursor),
        textBeforeCursor = this._textLines[lineIndex].slice(0, charIndex),
        missingNewlineOffset = this.missingNewlineOffset(lineIndex - 1);
    // return a negative offset
    return -this._textLines[lineIndex - 1].length
     + indexOnOtherLine - textBeforeCursor.length + (1 - missingNewlineOffset);
  },

  /**
   * for a given width it founds the matching character.
   * @private
   */
  _getIndexOnLine: function(lineIndex, width) {

    var line = this._textLines[lineIndex],
        lineLeftOffset = this._getLineLeftOffset(lineIndex),
        widthOfCharsOnLine = lineLeftOffset,
        indexOnLine = 0, charWidth, foundMatch;

    for (var j = 0, jlen = line.length; j < jlen; j++) {
      charWidth = this.__charBounds[lineIndex][j].width;
      widthOfCharsOnLine += charWidth;
      if (widthOfCharsOnLine > width) {
        foundMatch = true;
        var leftEdge = widthOfCharsOnLine - charWidth,
            rightEdge = widthOfCharsOnLine,
            offsetFromLeftEdge = Math.abs(leftEdge - width),
            offsetFromRightEdge = Math.abs(rightEdge - width);

        indexOnLine = offsetFromRightEdge < offsetFromLeftEdge ? j : (j - 1);
        break;
      }
    }

    // reached end
    if (!foundMatch) {
      indexOnLine = line.length - 1;
    }

    return indexOnLine;
  },


  /**
   * Moves cursor down
   * @param {Event} e Event object
   */
  moveCursorDown: function(e) {
    if (this.selectionStart >= this._text.length && this.selectionEnd >= this._text.length) {
      return;
    }
    this._moveCursorUpOrDown('Down', e);
  },

  /**
   * Moves cursor up
   * @param {Event} e Event object
   */
  moveCursorUp: function(e) {
    if (this.selectionStart === 0 && this.selectionEnd === 0) {
      return;
    }
    this._moveCursorUpOrDown('Up', e);
  },

  /**
   * Moves cursor up or down, fires the events
   * @param {String} direction 'Up' or 'Down'
   * @param {Event} e Event object
   */
  _moveCursorUpOrDown: function(direction, e) {
    // getUpCursorOffset
    // getDownCursorOffset
    var action = 'get' + direction + 'CursorOffset',
        offset = this[action](e, this._selectionDirection === 'right');
    if (e.shiftKey) {
      this.moveCursorWithShift(offset);
    }
    else {
      this.moveCursorWithoutShift(offset);
    }
    if (offset !== 0) {
      this.setSelectionInBoundaries();
      this.abortCursorAnimation();
      this._currentCursorOpacity = 1;
      this.initDelayedCursor();
      this._fireSelectionChanged();
      this._updateTextarea();
    }
  },

  /**
   * Moves cursor with shift
   * @param {Number} offset
   */
  moveCursorWithShift: function(offset) {
    var newSelection = this._selectionDirection === 'left'
      ? this.selectionStart + offset
      : this.selectionEnd + offset;
    this.setSelectionStartEndWithShift(this.selectionStart, this.selectionEnd, newSelection);
    return offset !== 0;
  },

  /**
   * Moves cursor up without shift
   * @param {Number} offset
   */
  moveCursorWithoutShift: function(offset) {
    if (offset < 0) {
      this.selectionStart += offset;
      this.selectionEnd = this.selectionStart;
    }
    else {
      this.selectionEnd += offset;
      this.selectionStart = this.selectionEnd;
    }
    return offset !== 0;
  },

  /**
   * Moves cursor left
   * @param {Event} e Event object
   */
  moveCursorLeft: function(e) {
    if (this.selectionStart === 0 && this.selectionEnd === 0) {
      return;
    }
    this._moveCursorLeftOrRight('Left', e);
  },

  /**
   * @private
   * @return {Boolean} true if a change happened
   */
  _move: function(e, prop, direction) {
    var newValue;
    if (e.altKey) {
      newValue = this['findWordBoundary' + direction](this[prop]);
    }
    else if (e.metaKey || e.keyCode === 35 ||  e.keyCode === 36 ) {
      newValue = this['findLineBoundary' + direction](this[prop]);
    }
    else {
      this[prop] += direction === 'Left' ? -1 : 1;
      return true;
    }
    if (typeof newValue !== undefined && this[prop] !== newValue) {
      this[prop] = newValue;
      return true;
    }
  },

  /**
   * @private
   */
  _moveLeft: function(e, prop) {
    return this._move(e, prop, 'Left');
  },

  /**
   * @private
   */
  _moveRight: function(e, prop) {
    return this._move(e, prop, 'Right');
  },

  /**
   * Moves cursor left without keeping selection
   * @param {Event} e
   */
  moveCursorLeftWithoutShift: function(e) {
    var change = true;
    this._selectionDirection = 'left';

    // only move cursor when there is no selection,
    // otherwise we discard it, and leave cursor on same place
    if (this.selectionEnd === this.selectionStart && this.selectionStart !== 0) {
      change = this._moveLeft(e, 'selectionStart');

    }
    this.selectionEnd = this.selectionStart;
    return change;
  },

  /**
   * Moves cursor left while keeping selection
   * @param {Event} e
   */
  moveCursorLeftWithShift: function(e) {
    if (this._selectionDirection === 'right' && this.selectionStart !== this.selectionEnd) {
      return this._moveLeft(e, 'selectionEnd');
    }
    else if (this.selectionStart !== 0){
      this._selectionDirection = 'left';
      return this._moveLeft(e, 'selectionStart');
    }
  },

  /**
   * Moves cursor right
   * @param {Event} e Event object
   */
  moveCursorRight: function(e) {
    if (this.selectionStart >= this._text.length && this.selectionEnd >= this._text.length) {
      return;
    }
    this._moveCursorLeftOrRight('Right', e);
  },

  /**
   * Moves cursor right or Left, fires event
   * @param {String} direction 'Left', 'Right'
   * @param {Event} e Event object
   */
  _moveCursorLeftOrRight: function(direction, e) {
    var actionName = 'moveCursor' + direction + 'With';
    this._currentCursorOpacity = 1;

    if (e.shiftKey) {
      actionName += 'Shift';
    }
    else {
      actionName += 'outShift';
    }
    if (this[actionName](e)) {
      this.abortCursorAnimation();
      this.initDelayedCursor();
      this._fireSelectionChanged();
      this._updateTextarea();
    }
  },

  /**
   * Moves cursor right while keeping selection
   * @param {Event} e
   */
  moveCursorRightWithShift: function(e) {
    if (this._selectionDirection === 'left' && this.selectionStart !== this.selectionEnd) {
      return this._moveRight(e, 'selectionStart');
    }
    else if (this.selectionEnd !== this._text.length) {
      this._selectionDirection = 'right';
      return this._moveRight(e, 'selectionEnd');
    }
  },

  /**
   * Moves cursor right without keeping selection
   * @param {Event} e Event object
   */
  moveCursorRightWithoutShift: function(e) {
    var changed = true;
    this._selectionDirection = 'right';

    if (this.selectionStart === this.selectionEnd) {
      changed = this._moveRight(e, 'selectionStart');
      this.selectionEnd = this.selectionStart;
    }
    else {
      this.selectionStart = this.selectionEnd;
    }
    return changed;
  },

  /**
   * Removes characters from start/end
   * start/end ar per grapheme position in _text array.
   *
   * @param {Number} start
   * @param {Number} end default to start + 1
   */
  removeChars: function(start, end) {
    if (typeof end === 'undefined') {
      end = start + 1;
    }
    this.removeStyleFromTo(start, end);
    this._text.splice(start, end - start);
    this.text = this._text.join('');
    this.set('dirty', true);
    if (this._shouldClearDimensionCache()) {
      this.initDimensions();
      this.setCoords();
    }
    this._removeExtraneousStyles();
  },

  /**
   * insert characters at start position, before start position.
   * start  equal 1 it means the text get inserted between actual grapheme 0 and 1
   * if style array is provided, it must be as the same length of text in graphemes
   * if end is provided and is bigger than start, old text is replaced.
   * start/end ar per grapheme position in _text array.
   *
   * @param {String} text text to insert
   * @param {Array} style array of style objects
   * @param {Number} start
   * @param {Number} end default to start + 1
   */
  insertChars: function(text, style, start, end) {
    if (typeof end === 'undefined') {
      end = start;
    }
    if (end > start) {
      this.removeStyleFromTo(start, end);
    }
    var graphemes = fabric.util.string.graphemeSplit(text);
    this.insertNewStyleBlock(graphemes, start, style);
    this._text = [].concat(this._text.slice(0, start), graphemes, this._text.slice(end));
    this.text = this._text.join('');
    this.set('dirty', true);
    if (this._shouldClearDimensionCache()) {
      this.initDimensions();
      this.setCoords();
    }
    this._removeExtraneousStyles();
  },

});
