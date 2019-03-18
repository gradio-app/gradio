//    The MIT License (MIT)
//
//    Copyright (c) 2014 YIOM
//
//    Permission is hereby granted, free of charge, to any person obtaining a copy
//    of this software and associated documentation files (the "Software"), to deal
//    in the Software without restriction, including without limitation the rights
//    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//    copies of the Software, and to permit persons to whom the Software is
//    furnished to do so, subject to the following conditions:
//
//    The above copyright notice and this permission notice shall be included in
//    all copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//    THE SOFTWARE.

function Sketchpad(config) {
  // Enforces the context for all functions
  for (var key in this.constructor.prototype) {
    this[key] = this[key].bind(this);
  }

  // Warn the user if no DOM element was selected
  if (!config.hasOwnProperty('element')) {
    console.error('SKETCHPAD ERROR: No element selected');
    return;
  }

  this.element = config.element;

  // Width can be defined on the HTML or programatically
  this._width = config.width || $(this.element).attr('data-width') || 0;
  this._height = config.height || $(this.element).attr('data-height') || 0;

  // Pen attributes
  this.color = config.color || $(this.element).attr('data-color') || '#000000';
  this.penSize = config.penSize || $(this.element).attr('data-penSize') || 5;

  // ReadOnly sketchpads may not be modified
  this.readOnly = config.readOnly ||
                  $(this.element).attr('data-readOnly') ||
                  false;
  if (!this.readOnly) {
      $(this.element).css({cursor: 'crosshair'});
  }

  // Stroke control variables
  this.strokes = config.strokes || [];
  this._currentStroke = {
    color: null,
    size: null,
    lines: [],
  };

  // Undo History
  this.undoHistory = config.undoHistory || [];

  // Animation function calls
  this.animateIds = [];

  // Set sketching state
  this._sketching = false;

  // Setup canvas sketching listeners
  this.reset();
}

//
// Private API
//

Sketchpad.prototype._cursorPosition = function(event) {
  return {
    x: event.pageX - $(this.canvas).offset().left,
    y: event.pageY - $(this.canvas).offset().top,
  };
};

Sketchpad.prototype._draw = function(start, end, color, size) {
  this._stroke(start, end, color, size, 'source-over');
};

Sketchpad.prototype._erase = function(start, end, color, size) {
  this._stroke(start, end, color, size, 'destination-out');
};

Sketchpad.prototype._stroke = function(start, end, color, size, compositeOperation) {
  this.context.save();
  this.context.lineJoin = 'round';
  this.context.lineCap = 'round';
  this.context.strokeStyle = color;
  this.context.lineWidth = size;
  this.context.globalCompositeOperation = compositeOperation;
  this.context.beginPath();
  this.context.moveTo(start.x, start.y);
  this.context.lineTo(end.x, end.y);
  this.context.closePath();
  this.context.stroke();

  this.context.restore();
};

//
// Callback Handlers
//

Sketchpad.prototype._mouseDown = function(event) {
  this._lastPosition = this._cursorPosition(event);
  this._currentStroke.color = this.color;
  this._currentStroke.size = this.penSize;
  this._currentStroke.lines = [];
  this._sketching = true;
  this.canvas.addEventListener('mousemove', this._mouseMove);
};

Sketchpad.prototype._mouseUp = function(event) {
  if (this._sketching) {
    this.strokes.push($.extend(true, {}, this._currentStroke));
    this._sketching = false;
  }
  this.canvas.removeEventListener('mousemove', this._mouseMove);
};

Sketchpad.prototype._mouseMove = function(event) {
  var currentPosition = this._cursorPosition(event);

  this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
  this._currentStroke.lines.push({
    start: $.extend(true, {}, this._lastPosition),
    end: $.extend(true, {}, currentPosition),
  });

  this._lastPosition = currentPosition;
};

Sketchpad.prototype._touchStart = function(event) {
  event.preventDefault();
  if (this._sketching) {
    return;
  }
  this._lastPosition = this._cursorPosition(event.changedTouches[0]);
  this._currentStroke.color = this.color;
  this._currentStroke.size = this.penSize;
  this._currentStroke.lines = [];
  this._sketching = true;
  this.canvas.addEventListener('touchmove', this._touchMove, false);
};

Sketchpad.prototype._touchEnd = function(event) {
  event.preventDefault();
  if (this._sketching) {
    this.strokes.push($.extend(true, {}, this._currentStroke));
    this._sketching = false;
  }
  this.canvas.removeEventListener('touchmove', this._touchMove);
};

Sketchpad.prototype._touchCancel = function(event) {
  event.preventDefault();
  if (this._sketching) {
    this.strokes.push($.extend(true, {}, this._currentStroke));
    this._sketching = false;
  }
  this.canvas.removeEventListener('touchmove', this._touchMove);
};

Sketchpad.prototype._touchLeave = function(event) {
  event.preventDefault();
  if (this._sketching) {
    this.strokes.push($.extend(true, {}, this._currentStroke));
    this._sketching = false;
  }
  this.canvas.removeEventListener('touchmove', this._touchMove);
};

Sketchpad.prototype._touchMove = function(event) {
  event.preventDefault();
  var currentPosition = this._cursorPosition(event.changedTouches[0]);

  this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
  this._currentStroke.lines.push({
    start: $.extend(true, {}, this._lastPosition),
    end: $.extend(true, {}, currentPosition),
  });

  this._lastPosition = currentPosition;
};

//
// Public API
//

Sketchpad.prototype.reset = function() {
  // Set attributes
  this.canvas = $(this.element)[0];
  this.canvas.width = this._width;
  this.canvas.height = this._height;
  this.context = this.canvas.getContext('2d');

  // Setup event listeners
  this.redraw(this.strokes);

  if (this.readOnly) {
    return;
  }

  // Mouse
  this.canvas.addEventListener('mousedown', this._mouseDown);
  this.canvas.addEventListener('mouseout', this._mouseUp);
  this.canvas.addEventListener('mouseup', this._mouseUp);

  // Touch
  this.canvas.addEventListener('touchstart', this._touchStart);
  this.canvas.addEventListener('touchend', this._touchEnd);
  this.canvas.addEventListener('touchcancel', this._touchCancel);
  this.canvas.addEventListener('touchleave', this._touchLeave);
};

Sketchpad.prototype.drawStroke = function(stroke) {
  for (var j = 0; j < stroke.lines.length; j++) {
    var line = stroke.lines[j];
    this._draw(line.start, line.end, stroke.color, stroke.size);
  }
};

Sketchpad.prototype.redraw = function(strokes) {
  for (var i = 0; i < strokes.length; i++) {
    this.drawStroke(strokes[i]);
  }
};

Sketchpad.prototype.toObject = function() {
  return {
    width: this.canvas.width,
    height: this.canvas.height,
    strokes: this.strokes,
    undoHistory: this.undoHistory,
  };
};

Sketchpad.prototype.toJSON = function() {
  return JSON.stringify(this.toObject());
};

Sketchpad.prototype.animate = function(ms, loop, loopDelay) {
  this.clear();
  var delay = ms;
  var callback = null;
  for (var i = 0; i < this.strokes.length; i++) {
    var stroke = this.strokes[i];
    for (var j = 0; j < stroke.lines.length; j++) {
      var line = stroke.lines[j];
      callback = this._draw.bind(this, line.start, line.end,
                                 stroke.color, stroke.size);
      this.animateIds.push(setTimeout(callback, delay));
      delay += ms;
    }
  }
  if (loop) {
    loopDelay = loopDelay || 0;
    callback = this.animate.bind(this, ms, loop, loopDelay);
    this.animateIds.push(setTimeout(callback, delay + loopDelay));
  }
};

Sketchpad.prototype.cancelAnimation = function() {
  for (var i = 0; i < this.animateIds.length; i++) {
    clearTimeout(this.animateIds[i]);
  }
};

Sketchpad.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Sketchpad.prototype.undo = function() {
  this.clear();
  var stroke = this.strokes.pop();
  if (stroke) {
    this.undoHistory.push(stroke);
    this.redraw(this.strokes);
  }
};

Sketchpad.prototype.redo = function() {
  var stroke = this.undoHistory.pop();
  if (stroke) {
    this.strokes.push(stroke);
    this.drawStroke(stroke);
  }
};
