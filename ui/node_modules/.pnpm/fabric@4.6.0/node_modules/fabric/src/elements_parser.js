fabric.ElementsParser = function(elements, callback, options, reviver, parsingOptions, doc) {
  this.elements = elements;
  this.callback = callback;
  this.options = options;
  this.reviver = reviver;
  this.svgUid = (options && options.svgUid) || 0;
  this.parsingOptions = parsingOptions;
  this.regexUrl = /^url\(['"]?#([^'"]+)['"]?\)/g;
  this.doc = doc;
};

(function(proto) {
  proto.parse = function() {
    this.instances = new Array(this.elements.length);
    this.numElements = this.elements.length;
    this.createObjects();
  };

  proto.createObjects = function() {
    var _this = this;
    this.elements.forEach(function(element, i) {
      element.setAttribute('svgUid', _this.svgUid);
      _this.createObject(element, i);
    });
  };

  proto.findTag = function(el) {
    return fabric[fabric.util.string.capitalize(el.tagName.replace('svg:', ''))];
  };

  proto.createObject = function(el, index) {
    var klass = this.findTag(el);
    if (klass && klass.fromElement) {
      try {
        klass.fromElement(el, this.createCallback(index, el), this.options);
      }
      catch (err) {
        fabric.log(err);
      }
    }
    else {
      this.checkIfDone();
    }
  };

  proto.createCallback = function(index, el) {
    var _this = this;
    return function(obj) {
      var _options;
      _this.resolveGradient(obj, el, 'fill');
      _this.resolveGradient(obj, el, 'stroke');
      if (obj instanceof fabric.Image && obj._originalElement) {
        _options = obj.parsePreserveAspectRatioAttribute(el);
      }
      obj._removeTransformMatrix(_options);
      _this.resolveClipPath(obj, el);
      _this.reviver && _this.reviver(el, obj);
      _this.instances[index] = obj;
      _this.checkIfDone();
    };
  };

  proto.extractPropertyDefinition = function(obj, property, storage) {
    var value = obj[property], regex = this.regexUrl;
    if (!regex.test(value)) {
      return;
    }
    regex.lastIndex = 0;
    var id = regex.exec(value)[1];
    regex.lastIndex = 0;
    return fabric[storage][this.svgUid][id];
  };

  proto.resolveGradient = function(obj, el, property) {
    var gradientDef = this.extractPropertyDefinition(obj, property, 'gradientDefs');
    if (gradientDef) {
      var opacityAttr = el.getAttribute(property + '-opacity');
      var gradient = fabric.Gradient.fromElement(gradientDef, obj, opacityAttr, this.options);
      obj.set(property, gradient);
    }
  };

  proto.createClipPathCallback = function(obj, container) {
    return function(_newObj) {
      _newObj._removeTransformMatrix();
      _newObj.fillRule = _newObj.clipRule;
      container.push(_newObj);
    };
  };

  proto.resolveClipPath = function(obj, usingElement) {
    var clipPath = this.extractPropertyDefinition(obj, 'clipPath', 'clipPaths'),
        element, klass, objTransformInv, container, gTransform, options;
    if (clipPath) {
      container = [];
      objTransformInv = fabric.util.invertTransform(obj.calcTransformMatrix());
      // move the clipPath tag as sibling to the real element that is using it
      var clipPathTag = clipPath[0].parentNode;
      var clipPathOwner = usingElement;
      while (clipPathOwner.parentNode && clipPathOwner.getAttribute('clip-path') !== obj.clipPath) {
        clipPathOwner = clipPathOwner.parentNode;
      }
      clipPathOwner.parentNode.appendChild(clipPathTag);
      for (var i = 0; i < clipPath.length; i++) {
        element = clipPath[i];
        klass = this.findTag(element);
        klass.fromElement(
          element,
          this.createClipPathCallback(obj, container),
          this.options
        );
      }
      if (container.length === 1) {
        clipPath = container[0];
      }
      else {
        clipPath = new fabric.Group(container);
      }
      gTransform = fabric.util.multiplyTransformMatrices(
        objTransformInv,
        clipPath.calcTransformMatrix()
      );
      if (clipPath.clipPath) {
        this.resolveClipPath(clipPath, clipPathOwner);
      }
      var options = fabric.util.qrDecompose(gTransform);
      clipPath.flipX = false;
      clipPath.flipY = false;
      clipPath.set('scaleX', options.scaleX);
      clipPath.set('scaleY', options.scaleY);
      clipPath.angle = options.angle;
      clipPath.skewX = options.skewX;
      clipPath.skewY = 0;
      clipPath.setPositionByOrigin({ x: options.translateX, y: options.translateY }, 'center', 'center');
      obj.clipPath = clipPath;
    }
    else {
      // if clip-path does not resolve to any element, delete the property.
      delete obj.clipPath;
    }
  };

  proto.checkIfDone = function() {
    if (--this.numElements === 0) {
      this.instances = this.instances.filter(function(el) {
        // eslint-disable-next-line no-eq-null, eqeqeq
        return el != null;
      });
      this.callback(this.instances, this.elements);
    }
  };
})(fabric.ElementsParser.prototype);
