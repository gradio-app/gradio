(function() {

  var addListener = fabric.util.addListener,
      removeListener = fabric.util.removeListener,
      RIGHT_CLICK = 3, MIDDLE_CLICK = 2, LEFT_CLICK = 1,
      addEventOptions = { passive: false };

  function checkClick(e, value) {
    return e.button && (e.button === value - 1);
  }

  fabric.util.object.extend(fabric.Canvas.prototype, /** @lends fabric.Canvas.prototype */ {

    /**
     * Contains the id of the touch event that owns the fabric transform
     * @type Number
     * @private
     */
    mainTouchId: null,

    /**
     * Adds mouse listeners to canvas
     * @private
     */
    _initEventListeners: function () {
      // in case we initialized the class twice. This should not happen normally
      // but in some kind of applications where the canvas element may be changed
      // this is a workaround to having double listeners.
      this.removeListeners();
      this._bindEvents();
      this.addOrRemove(addListener, 'add');
    },

    /**
     * return an event prefix pointer or mouse.
     * @private
     */
    _getEventPrefix: function () {
      return this.enablePointerEvents ? 'pointer' : 'mouse';
    },

    addOrRemove: function(functor, eventjsFunctor) {
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      functor(fabric.window, 'resize', this._onResize);
      functor(canvasElement, eventTypePrefix + 'down', this._onMouseDown);
      functor(canvasElement, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      functor(canvasElement, eventTypePrefix + 'out', this._onMouseOut);
      functor(canvasElement, eventTypePrefix + 'enter', this._onMouseEnter);
      functor(canvasElement, 'wheel', this._onMouseWheel);
      functor(canvasElement, 'contextmenu', this._onContextMenu);
      functor(canvasElement, 'dblclick', this._onDoubleClick);
      functor(canvasElement, 'dragover', this._onDragOver);
      functor(canvasElement, 'dragenter', this._onDragEnter);
      functor(canvasElement, 'dragleave', this._onDragLeave);
      functor(canvasElement, 'drop', this._onDrop);
      if (!this.enablePointerEvents) {
        functor(canvasElement, 'touchstart', this._onTouchStart, addEventOptions);
      }
      if (typeof eventjs !== 'undefined' && eventjsFunctor in eventjs) {
        eventjs[eventjsFunctor](canvasElement, 'gesture', this._onGesture);
        eventjs[eventjsFunctor](canvasElement, 'drag', this._onDrag);
        eventjs[eventjsFunctor](canvasElement, 'orientation', this._onOrientationChange);
        eventjs[eventjsFunctor](canvasElement, 'shake', this._onShake);
        eventjs[eventjsFunctor](canvasElement, 'longpress', this._onLongPress);
      }
    },

    /**
     * Removes all event listeners
     */
    removeListeners: function() {
      this.addOrRemove(removeListener, 'remove');
      // if you dispose on a mouseDown, before mouse up, you need to clean document to...
      var eventTypePrefix = this._getEventPrefix();
      removeListener(fabric.document, eventTypePrefix + 'up', this._onMouseUp);
      removeListener(fabric.document, 'touchend', this._onTouchEnd, addEventOptions);
      removeListener(fabric.document, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      removeListener(fabric.document, 'touchmove', this._onMouseMove, addEventOptions);
    },

    /**
     * @private
     */
    _bindEvents: function() {
      if (this.eventsBound) {
        // for any reason we pass here twice we do not want to bind events twice.
        return;
      }
      this._onMouseDown = this._onMouseDown.bind(this);
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onMouseUp = this._onMouseUp.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onGesture = this._onGesture.bind(this);
      this._onDrag = this._onDrag.bind(this);
      this._onShake = this._onShake.bind(this);
      this._onLongPress = this._onLongPress.bind(this);
      this._onOrientationChange = this._onOrientationChange.bind(this);
      this._onMouseWheel = this._onMouseWheel.bind(this);
      this._onMouseOut = this._onMouseOut.bind(this);
      this._onMouseEnter = this._onMouseEnter.bind(this);
      this._onContextMenu = this._onContextMenu.bind(this);
      this._onDoubleClick = this._onDoubleClick.bind(this);
      this._onDragOver = this._onDragOver.bind(this);
      this._onDragEnter = this._simpleEventHandler.bind(this, 'dragenter');
      this._onDragLeave = this._simpleEventHandler.bind(this, 'dragleave');
      this._onDrop = this._simpleEventHandler.bind(this, 'drop');
      this.eventsBound = true;
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js gesture
     * @param {Event} [self] Inner Event object
     */
    _onGesture: function(e, self) {
      this.__onTransformGesture && this.__onTransformGesture(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js drag
     * @param {Event} [self] Inner Event object
     */
    _onDrag: function(e, self) {
      this.__onDrag && this.__onDrag(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on wheel event
     */
    _onMouseWheel: function(e) {
      this.__onMouseWheel(e);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onMouseOut: function(e) {
      var target = this._hoveredTarget;
      this.fire('mouse:out', { target: target, e: e });
      this._hoveredTarget = null;
      target && target.fire('mouseout', { e: e });

      var _this = this;
      this._hoveredTargets.forEach(function(_target){
        _this.fire('mouse:out', { target: target, e: e });
        _target && target.fire('mouseout', { e: e });
      });
      this._hoveredTargets = [];

      if (this._iTextInstances) {
        this._iTextInstances.forEach(function(obj) {
          if (obj.isEditing) {
            obj.hiddenTextarea.focus();
          }
        });
      }
    },

    /**
     * @private
     * @param {Event} e Event object fired on mouseenter
     */
    _onMouseEnter: function(e) {
      // This find target and consequent 'mouse:over' is used to
      // clear old instances on hovered target.
      // calling findTarget has the side effect of killing target.__corner.
      // as a short term fix we are not firing this if we are currently transforming.
      // as a long term fix we need to separate the action of finding a target with the
      // side effects we added to it.
      if (!this._currentTransform && !this.findTarget(e)) {
        this.fire('mouse:over', { target: null, e: e });
        this._hoveredTarget = null;
        this._hoveredTargets = [];
      }
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js orientation change
     * @param {Event} [self] Inner Event object
     */
    _onOrientationChange: function(e, self) {
      this.__onOrientationChange && this.__onOrientationChange(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js shake
     * @param {Event} [self] Inner Event object
     */
    _onShake: function(e, self) {
      this.__onShake && this.__onShake(e, self);
    },

    /**
     * @private
     * @param {Event} [e] Event object fired on Event.js shake
     * @param {Event} [self] Inner Event object
     */
    _onLongPress: function(e, self) {
      this.__onLongPress && this.__onLongPress(e, self);
    },

    /**
     * prevent default to allow drop event to be fired
     * @private
     * @param {Event} [e] Event object fired on Event.js shake
     */
    _onDragOver: function(e) {
      e.preventDefault();
      var target = this._simpleEventHandler('dragover', e);
      this._fireEnterLeaveEvents(target, e);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onContextMenu: function (e) {
      if (this.stopContextMenu) {
        e.stopPropagation();
        e.preventDefault();
      }
      return false;
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onDoubleClick: function (e) {
      this._cacheTransformEventData(e);
      this._handleEvent(e, 'dblclick');
      this._resetTransformEventData(e);
    },

    /**
     * Return a the id of an event.
     * returns either the pointerId or the identifier or 0 for the mouse event
     * @private
     * @param {Event} evt Event object
     */
    getPointerId: function(evt) {
      var changedTouches = evt.changedTouches;

      if (changedTouches) {
        return changedTouches[0] && changedTouches[0].identifier;
      }

      if (this.enablePointerEvents) {
        return evt.pointerId;
      }

      return -1;
    },

    /**
     * Determines if an event has the id of the event that is considered main
     * @private
     * @param {evt} event Event object
     */
    _isMainEvent: function(evt) {
      if (evt.isPrimary === true) {
        return true;
      }
      if (evt.isPrimary === false) {
        return false;
      }
      if (evt.type === 'touchend' && evt.touches.length === 0) {
        return true;
      }
      if (evt.changedTouches) {
        return evt.changedTouches[0].identifier === this.mainTouchId;
      }
      return true;
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onTouchStart: function(e) {
      e.preventDefault();
      if (this.mainTouchId === null) {
        this.mainTouchId = this.getPointerId(e);
      }
      this.__onMouseDown(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      addListener(fabric.document, 'touchend', this._onTouchEnd, addEventOptions);
      addListener(fabric.document, 'touchmove', this._onMouseMove, addEventOptions);
      // Unbind mousedown to prevent double triggers from touch devices
      removeListener(canvasElement, eventTypePrefix + 'down', this._onMouseDown);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onMouseDown: function (e) {
      this.__onMouseDown(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      removeListener(canvasElement, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      addListener(fabric.document, eventTypePrefix + 'up', this._onMouseUp);
      addListener(fabric.document, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onTouchEnd: function(e) {
      if (e.touches.length > 0) {
        // if there are still touches stop here
        return;
      }
      this.__onMouseUp(e);
      this._resetTransformEventData();
      this.mainTouchId = null;
      var eventTypePrefix = this._getEventPrefix();
      removeListener(fabric.document, 'touchend', this._onTouchEnd, addEventOptions);
      removeListener(fabric.document, 'touchmove', this._onMouseMove, addEventOptions);
      var _this = this;
      if (this._willAddMouseDown) {
        clearTimeout(this._willAddMouseDown);
      }
      this._willAddMouseDown = setTimeout(function() {
        // Wait 400ms before rebinding mousedown to prevent double triggers
        // from touch devices
        addListener(_this.upperCanvasEl, eventTypePrefix + 'down', _this._onMouseDown);
        _this._willAddMouseDown = 0;
      }, 400);
    },

    /**
     * @private
     * @param {Event} e Event object fired on mouseup
     */
    _onMouseUp: function (e) {
      this.__onMouseUp(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
          eventTypePrefix = this._getEventPrefix();
      if (this._isMainEvent(e)) {
        removeListener(fabric.document, eventTypePrefix + 'up', this._onMouseUp);
        removeListener(fabric.document, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
        addListener(canvasElement, eventTypePrefix + 'move', this._onMouseMove, addEventOptions);
      }
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    _onMouseMove: function (e) {
      !this.allowTouchScrolling && e.preventDefault && e.preventDefault();
      this.__onMouseMove(e);
    },

    /**
     * @private
     */
    _onResize: function () {
      this.calcOffset();
    },

    /**
     * Decides whether the canvas should be redrawn in mouseup and mousedown events.
     * @private
     * @param {Object} target
     */
    _shouldRender: function(target) {
      var activeObject = this._activeObject;

      if (
        !!activeObject !== !!target ||
        (activeObject && target && (activeObject !== target))
      ) {
        // this covers: switch of target, from target to no target, selection of target
        // multiSelection with key and mouse
        return true;
      }
      else if (activeObject && activeObject.isEditing) {
        // if we mouse up/down over a editing textbox a cursor change,
        // there is no need to re render
        return false;
      }
      return false;
    },

    /**
     * Method that defines the actions when mouse is released on canvas.
     * The method resets the currentTransform parameters, store the image corner
     * position in the image object and render the canvas on top.
     * @private
     * @param {Event} e Event object fired on mouseup
     */
    __onMouseUp: function (e) {
      var target, transform = this._currentTransform,
          groupSelector = this._groupSelector, shouldRender = false,
          isClick = (!groupSelector || (groupSelector.left === 0 && groupSelector.top === 0));
      this._cacheTransformEventData(e);
      target = this._target;
      this._handleEvent(e, 'up:before');
      // if right/middle click just fire events and return
      // target undefined will make the _handleEvent search the target
      if (checkClick(e, RIGHT_CLICK)) {
        if (this.fireRightClick) {
          this._handleEvent(e, 'up', RIGHT_CLICK, isClick);
        }
        return;
      }

      if (checkClick(e, MIDDLE_CLICK)) {
        if (this.fireMiddleClick) {
          this._handleEvent(e, 'up', MIDDLE_CLICK, isClick);
        }
        this._resetTransformEventData();
        return;
      }

      if (this.isDrawingMode && this._isCurrentlyDrawing) {
        this._onMouseUpInDrawingMode(e);
        return;
      }

      if (!this._isMainEvent(e)) {
        return;
      }
      if (transform) {
        this._finalizeCurrentTransform(e);
        shouldRender = transform.actionPerformed;
      }
      if (!isClick) {
        var targetWasActive = target === this._activeObject;
        this._maybeGroupObjects(e);
        if (!shouldRender) {
          shouldRender = (
            this._shouldRender(target) ||
            (!targetWasActive && target === this._activeObject)
          );
        }
      }
      if (target) {
        if (target.selectable && target !== this._activeObject && target.activeOn === 'up') {
          this.setActiveObject(target, e);
          shouldRender = true;
        }
        else {
          var corner = target._findTargetCorner(
            this.getPointer(e, true),
            fabric.util.isTouchEvent(e)
          );
          var control = target.controls[corner],
              mouseUpHandler = control && control.getMouseUpHandler(e, target, control);
          if (mouseUpHandler) {
            var pointer = this.getPointer(e);
            mouseUpHandler(e, transform, pointer.x, pointer.y);
          }
        }
        target.isMoving = false;
      }
      this._setCursorFromEvent(e, target);
      this._handleEvent(e, 'up', LEFT_CLICK, isClick);
      this._groupSelector = null;
      this._currentTransform = null;
      // reset the target information about which corner is selected
      target && (target.__corner = 0);
      if (shouldRender) {
        this.requestRenderAll();
      }
      else if (!isClick) {
        this.renderTop();
      }
    },

    /**
     * @private
     * Handle event firing for target and subtargets
     * @param {Event} e event from mouse
     * @param {String} eventType event to fire (up, down or move)
     * @return {Fabric.Object} target return the the target found, for internal reasons.
     */
    _simpleEventHandler: function(eventType, e) {
      var target = this.findTarget(e),
          targets = this.targets,
          options = {
            e: e,
            target: target,
            subTargets: targets,
          };
      this.fire(eventType, options);
      target && target.fire(eventType, options);
      if (!targets) {
        return target;
      }
      for (var i = 0; i < targets.length; i++) {
        targets[i].fire(eventType, options);
      }
      return target;
    },

    /**
     * @private
     * Handle event firing for target and subtargets
     * @param {Event} e event from mouse
     * @param {String} eventType event to fire (up, down or move)
     * @param {fabric.Object} targetObj receiving event
     * @param {Number} [button] button used in the event 1 = left, 2 = middle, 3 = right
     * @param {Boolean} isClick for left button only, indicates that the mouse up happened without move.
     */
    _handleEvent: function(e, eventType, button, isClick) {
      var target = this._target,
          targets = this.targets || [],
          options = {
            e: e,
            target: target,
            subTargets: targets,
            button: button || LEFT_CLICK,
            isClick: isClick || false,
            pointer: this._pointer,
            absolutePointer: this._absolutePointer,
            transform: this._currentTransform
          };
      if (eventType === 'up') {
        options.currentTarget = this.findTarget(e);
        options.currentSubTargets = this.targets;
      }
      this.fire('mouse:' + eventType, options);
      target && target.fire('mouse' + eventType, options);
      for (var i = 0; i < targets.length; i++) {
        targets[i].fire('mouse' + eventType, options);
      }
    },

    /**
     * @private
     * @param {Event} e send the mouse event that generate the finalize down, so it can be used in the event
     */
    _finalizeCurrentTransform: function(e) {

      var transform = this._currentTransform,
          target = transform.target,
          eventName,
          options = {
            e: e,
            target: target,
            transform: transform,
            action: transform.action,
          };

      if (target._scaling) {
        target._scaling = false;
      }

      target.setCoords();

      if (transform.actionPerformed || (this.stateful && target.hasStateChanged())) {
        if (transform.actionPerformed) {
          // this is not friendly to the new control api.
          // is deprecated.
          eventName = this._addEventOptions(options, transform);
          this._fire(eventName, options);
        }
        this._fire('modified', options);
      }
    },

    /**
     * Mutate option object in order to add by property and give back the event name.
     * @private
     * @deprecated since 4.2.0
     * @param {Object} options to mutate
     * @param {Object} transform to inspect action from
     */
    _addEventOptions: function(options, transform) {
      // we can probably add more details at low cost
      // scale change, rotation changes, translation changes
      var eventName, by;
      switch (transform.action) {
        case 'scaleX':
          eventName = 'scaled';
          by = 'x';
          break;
        case 'scaleY':
          eventName = 'scaled';
          by = 'y';
          break;
        case 'skewX':
          eventName = 'skewed';
          by = 'x';
          break;
        case 'skewY':
          eventName = 'skewed';
          by = 'y';
          break;
        case 'scale':
          eventName = 'scaled';
          by = 'equally';
          break;
        case 'rotate':
          eventName = 'rotated';
          break;
        case 'drag':
          eventName = 'moved';
          break;
      }
      options.by = by;
      return eventName;
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    _onMouseDownInDrawingMode: function(e) {
      this._isCurrentlyDrawing = true;
      if (this.getActiveObject()) {
        this.discardActiveObject(e).requestRenderAll();
      }
      var pointer = this.getPointer(e);
      this.freeDrawingBrush.onMouseDown(pointer, { e: e, pointer: pointer });
      this._handleEvent(e, 'down');
    },

    /**
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    _onMouseMoveInDrawingMode: function(e) {
      if (this._isCurrentlyDrawing) {
        var pointer = this.getPointer(e);
        this.freeDrawingBrush.onMouseMove(pointer, { e: e, pointer: pointer });
      }
      this.setCursor(this.freeDrawingCursor);
      this._handleEvent(e, 'move');
    },

    /**
     * @private
     * @param {Event} e Event object fired on mouseup
     */
    _onMouseUpInDrawingMode: function(e) {
      var pointer = this.getPointer(e);
      this._isCurrentlyDrawing = this.freeDrawingBrush.onMouseUp({ e: e, pointer: pointer });
      this._handleEvent(e, 'up');
    },

    /**
     * Method that defines the actions when mouse is clicked on canvas.
     * The method inits the currentTransform parameters and renders all the
     * canvas so the current image can be placed on the top canvas and the rest
     * in on the container one.
     * @private
     * @param {Event} e Event object fired on mousedown
     */
    __onMouseDown: function (e) {
      this._cacheTransformEventData(e);
      this._handleEvent(e, 'down:before');
      var target = this._target;
      // if right click just fire events
      if (checkClick(e, RIGHT_CLICK)) {
        if (this.fireRightClick) {
          this._handleEvent(e, 'down', RIGHT_CLICK);
        }
        return;
      }

      if (checkClick(e, MIDDLE_CLICK)) {
        if (this.fireMiddleClick) {
          this._handleEvent(e, 'down', MIDDLE_CLICK);
        }
        return;
      }

      if (this.isDrawingMode) {
        this._onMouseDownInDrawingMode(e);
        return;
      }

      if (!this._isMainEvent(e)) {
        return;
      }

      // ignore if some object is being transformed at this moment
      if (this._currentTransform) {
        return;
      }

      var pointer = this._pointer;
      // save pointer for check in __onMouseUp event
      this._previousPointer = pointer;
      var shouldRender = this._shouldRender(target),
          shouldGroup = this._shouldGroup(e, target);
      if (this._shouldClearSelection(e, target)) {
        this.discardActiveObject(e);
      }
      else if (shouldGroup) {
        this._handleGrouping(e, target);
        target = this._activeObject;
      }

      if (this.selection && (!target ||
        (!target.selectable && !target.isEditing && target !== this._activeObject))) {
        this._groupSelector = {
          ex: this._absolutePointer.x,
          ey: this._absolutePointer.y,
          top: 0,
          left: 0
        };
      }

      if (target) {
        var alreadySelected = target === this._activeObject;
        if (target.selectable && target.activeOn === 'down') {
          this.setActiveObject(target, e);
        }
        var corner = target._findTargetCorner(
          this.getPointer(e, true),
          fabric.util.isTouchEvent(e)
        );
        target.__corner = corner;
        if (target === this._activeObject && (corner || !shouldGroup)) {
          this._setupCurrentTransform(e, target, alreadySelected);
          var control = target.controls[corner],
              pointer = this.getPointer(e),
              mouseDownHandler = control && control.getMouseDownHandler(e, target, control);
          if (mouseDownHandler) {
            mouseDownHandler(e, this._currentTransform, pointer.x, pointer.y);
          }
        }
      }
      this._handleEvent(e, 'down');
      // we must renderAll so that we update the visuals
      (shouldRender || shouldGroup) && this.requestRenderAll();
    },

    /**
     * reset cache form common information needed during event processing
     * @private
     */
    _resetTransformEventData: function() {
      this._target = null;
      this._pointer = null;
      this._absolutePointer = null;
    },

    /**
     * Cache common information needed during event processing
     * @private
     * @param {Event} e Event object fired on event
     */
    _cacheTransformEventData: function(e) {
      // reset in order to avoid stale caching
      this._resetTransformEventData();
      this._pointer = this.getPointer(e, true);
      this._absolutePointer = this.restorePointerVpt(this._pointer);
      this._target = this._currentTransform ? this._currentTransform.target : this.findTarget(e) || null;
    },

    /**
     * @private
     */
    _beforeTransform: function(e) {
      var t = this._currentTransform;
      this.stateful && t.target.saveState();
      this.fire('before:transform', {
        e: e,
        transform: t,
      });
    },

    /**
     * Method that defines the actions when mouse is hovering the canvas.
     * The currentTransform parameter will define whether the user is rotating/scaling/translating
     * an image or neither of them (only hovering). A group selection is also possible and would cancel
     * all any other type of action.
     * In case of an image transformation only the top canvas will be rendered.
     * @private
     * @param {Event} e Event object fired on mousemove
     */
    __onMouseMove: function (e) {
      this._handleEvent(e, 'move:before');
      this._cacheTransformEventData(e);
      var target, pointer;

      if (this.isDrawingMode) {
        this._onMouseMoveInDrawingMode(e);
        return;
      }

      if (!this._isMainEvent(e)) {
        return;
      }

      var groupSelector = this._groupSelector;

      // We initially clicked in an empty area, so we draw a box for multiple selection
      if (groupSelector) {
        pointer = this._absolutePointer;

        groupSelector.left = pointer.x - groupSelector.ex;
        groupSelector.top = pointer.y - groupSelector.ey;

        this.renderTop();
      }
      else if (!this._currentTransform) {
        target = this.findTarget(e) || null;
        this._setCursorFromEvent(e, target);
        this._fireOverOutEvents(target, e);
      }
      else {
        this._transformObject(e);
      }
      this._handleEvent(e, 'move');
      this._resetTransformEventData();
    },

    /**
     * Manage the mouseout, mouseover events for the fabric object on the canvas
     * @param {Fabric.Object} target the target where the target from the mousemove event
     * @param {Event} e Event object fired on mousemove
     * @private
     */
    _fireOverOutEvents: function(target, e) {
      var _hoveredTarget = this._hoveredTarget,
          _hoveredTargets = this._hoveredTargets, targets = this.targets,
          length = Math.max(_hoveredTargets.length, targets.length);

      this.fireSyntheticInOutEvents(target, e, {
        oldTarget: _hoveredTarget,
        evtOut: 'mouseout',
        canvasEvtOut: 'mouse:out',
        evtIn: 'mouseover',
        canvasEvtIn: 'mouse:over',
      });
      for (var i = 0; i < length; i++){
        this.fireSyntheticInOutEvents(targets[i], e, {
          oldTarget: _hoveredTargets[i],
          evtOut: 'mouseout',
          evtIn: 'mouseover',
        });
      }
      this._hoveredTarget = target;
      this._hoveredTargets = this.targets.concat();
    },

    /**
     * Manage the dragEnter, dragLeave events for the fabric objects on the canvas
     * @param {Fabric.Object} target the target where the target from the onDrag event
     * @param {Event} e Event object fired on ondrag
     * @private
     */
    _fireEnterLeaveEvents: function(target, e) {
      var _draggedoverTarget = this._draggedoverTarget,
          _hoveredTargets = this._hoveredTargets, targets = this.targets,
          length = Math.max(_hoveredTargets.length, targets.length);

      this.fireSyntheticInOutEvents(target, e, {
        oldTarget: _draggedoverTarget,
        evtOut: 'dragleave',
        evtIn: 'dragenter',
      });
      for (var i = 0; i < length; i++) {
        this.fireSyntheticInOutEvents(targets[i], e, {
          oldTarget: _hoveredTargets[i],
          evtOut: 'dragleave',
          evtIn: 'dragenter',
        });
      }
      this._draggedoverTarget = target;
    },

    /**
     * Manage the synthetic in/out events for the fabric objects on the canvas
     * @param {Fabric.Object} target the target where the target from the supported events
     * @param {Event} e Event object fired
     * @param {Object} config configuration for the function to work
     * @param {String} config.targetName property on the canvas where the old target is stored
     * @param {String} [config.canvasEvtOut] name of the event to fire at canvas level for out
     * @param {String} config.evtOut name of the event to fire for out
     * @param {String} [config.canvasEvtIn] name of the event to fire at canvas level for in
     * @param {String} config.evtIn name of the event to fire for in
     * @private
     */
    fireSyntheticInOutEvents: function(target, e, config) {
      var inOpt, outOpt, oldTarget = config.oldTarget, outFires, inFires,
          targetChanged = oldTarget !== target, canvasEvtIn = config.canvasEvtIn, canvasEvtOut = config.canvasEvtOut;
      if (targetChanged) {
        inOpt = { e: e, target: target, previousTarget: oldTarget };
        outOpt = { e: e, target: oldTarget, nextTarget: target };
      }
      inFires = target && targetChanged;
      outFires = oldTarget && targetChanged;
      if (outFires) {
        canvasEvtOut && this.fire(canvasEvtOut, outOpt);
        oldTarget.fire(config.evtOut, outOpt);
      }
      if (inFires) {
        canvasEvtIn && this.fire(canvasEvtIn, inOpt);
        target.fire(config.evtIn, inOpt);
      }
    },

    /**
     * Method that defines actions when an Event Mouse Wheel
     * @param {Event} e Event object fired on mouseup
     */
    __onMouseWheel: function(e) {
      this._cacheTransformEventData(e);
      this._handleEvent(e, 'wheel');
      this._resetTransformEventData();
    },

    /**
     * @private
     * @param {Event} e Event fired on mousemove
     */
    _transformObject: function(e) {
      var pointer = this.getPointer(e),
          transform = this._currentTransform;

      transform.reset = false;
      transform.shiftKey = e.shiftKey;
      transform.altKey = e[this.centeredKey];

      this._performTransformAction(e, transform, pointer);
      transform.actionPerformed && this.requestRenderAll();
    },

    /**
     * @private
     */
    _performTransformAction: function(e, transform, pointer) {
      var x = pointer.x,
          y = pointer.y,
          action = transform.action,
          actionPerformed = false,
          actionHandler = transform.actionHandler;
          // this object could be created from the function in the control handlers


      if (actionHandler) {
        actionPerformed = actionHandler(e, transform, x, y);
      }
      if (action === 'drag' && actionPerformed) {
        transform.target.isMoving = true;
        this.setCursor(transform.target.moveCursor || this.moveCursor);
      }
      transform.actionPerformed = transform.actionPerformed || actionPerformed;
    },

    /**
     * @private
     */
    _fire: fabric.controlsUtils.fireEvent,

    /**
     * Sets the cursor depending on where the canvas is being hovered.
     * Note: very buggy in Opera
     * @param {Event} e Event object
     * @param {Object} target Object that the mouse is hovering, if so.
     */
    _setCursorFromEvent: function (e, target) {
      if (!target) {
        this.setCursor(this.defaultCursor);
        return false;
      }
      var hoverCursor = target.hoverCursor || this.hoverCursor,
          activeSelection = this._activeObject && this._activeObject.type === 'activeSelection' ?
            this._activeObject : null,
          // only show proper corner when group selection is not active
          corner = (!activeSelection || !activeSelection.contains(target))
          // here we call findTargetCorner always with undefined for the touch parameter.
          // we assume that if you are using a cursor you do not need to interact with
          // the bigger touch area.
                    && target._findTargetCorner(this.getPointer(e, true));

      if (!corner) {
        if (target.subTargetCheck){
          // hoverCursor should come from top-most subTarget,
          // so we walk the array backwards
          this.targets.concat().reverse().map(function(_target){
            hoverCursor = _target.hoverCursor || hoverCursor;
          });
        }
        this.setCursor(hoverCursor);
      }
      else {
        this.setCursor(this.getCornerCursor(corner, target, e));
      }
    },

    /**
     * @private
     */
    getCornerCursor: function(corner, target, e) {
      var control = target.controls[corner];
      return control.cursorStyleHandler(e, control, target);
    }
  });
})();
