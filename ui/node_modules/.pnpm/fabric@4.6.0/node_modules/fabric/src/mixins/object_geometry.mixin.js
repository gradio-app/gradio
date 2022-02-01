(function() {

  function arrayFromCoords(coords) {
    return [
      new fabric.Point(coords.tl.x, coords.tl.y),
      new fabric.Point(coords.tr.x, coords.tr.y),
      new fabric.Point(coords.br.x, coords.br.y),
      new fabric.Point(coords.bl.x, coords.bl.y)
    ];
  }

  var util = fabric.util,
      degreesToRadians = util.degreesToRadians,
      multiplyMatrices = util.multiplyTransformMatrices,
      transformPoint = util.transformPoint;

  util.object.extend(fabric.Object.prototype, /** @lends fabric.Object.prototype */ {

    /**
     * Describe object's corner position in canvas element coordinates.
     * properties are depending on control keys and padding the main controls.
     * each property is an object with x, y and corner.
     * The `corner` property contains in a similar manner the 4 points of the
     * interactive area of the corner.
     * The coordinates depends from the controls positionHandler and are used
     * to draw and locate controls
     * @memberOf fabric.Object.prototype
     */
    oCoords: null,

    /**
     * Describe object's corner position in canvas object absolute coordinates
     * properties are tl,tr,bl,br and describe the four main corner.
     * each property is an object with x, y, instance of Fabric.Point.
     * The coordinates depends from this properties: width, height, scaleX, scaleY
     * skewX, skewY, angle, strokeWidth, top, left.
     * Those coordinates are useful to understand where an object is. They get updated
     * with oCoords but they do not need to be updated when zoom or panning change.
     * The coordinates get updated with @method setCoords.
     * You can calculate them without updating with @method calcACoords();
     * @memberOf fabric.Object.prototype
     */
    aCoords: null,

    /**
     * Describe object's corner position in canvas element coordinates.
     * includes padding. Used of object detection.
     * set and refreshed with setCoords and calcCoords.
     * @memberOf fabric.Object.prototype
     */
    lineCoords: null,

    /**
     * storage for object transform matrix
     */
    ownMatrixCache: null,

    /**
     * storage for object full transform matrix
     */
    matrixCache: null,

    /**
     * custom controls interface
     * controls are added by default_controls.js
     */
    controls: { },

    /**
     * return correct set of coordinates for intersection
     * this will return either aCoords or lineCoords.
     * @param {Boolean} absolute will return aCoords if true or lineCoords
     * @return {Object} {tl, tr, br, bl} points
     */
    _getCoords: function(absolute, calculate) {
      if (calculate) {
        return (absolute ? this.calcACoords() : this.calcLineCoords());
      }
      if (!this.aCoords || !this.lineCoords) {
        this.setCoords(true);
      }
      return (absolute ? this.aCoords : this.lineCoords);
    },

    /**
     * return correct set of coordinates for intersection
     * this will return either aCoords or lineCoords.
     * The coords are returned in an array.
     * @return {Array} [tl, tr, br, bl] of points
     */
    getCoords: function(absolute, calculate) {
      return arrayFromCoords(this._getCoords(absolute, calculate));
    },

    /**
     * Checks if object intersects with an area formed by 2 points
     * @param {Object} pointTL top-left point of area
     * @param {Object} pointBR bottom-right point of area
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object intersects with an area formed by 2 points
     */
    intersectsWithRect: function(pointTL, pointBR, absolute, calculate) {
      var coords = this.getCoords(absolute, calculate),
          intersection = fabric.Intersection.intersectPolygonRectangle(
            coords,
            pointTL,
            pointBR
          );
      return intersection.status === 'Intersection';
    },

    /**
     * Checks if object intersects with another object
     * @param {Object} other Object to test
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object intersects with another object
     */
    intersectsWithObject: function(other, absolute, calculate) {
      var intersection = fabric.Intersection.intersectPolygonPolygon(
        this.getCoords(absolute, calculate),
        other.getCoords(absolute, calculate)
      );

      return intersection.status === 'Intersection'
        || other.isContainedWithinObject(this, absolute, calculate)
        || this.isContainedWithinObject(other, absolute, calculate);
    },

    /**
     * Checks if object is fully contained within area of another object
     * @param {Object} other Object to test
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object is fully contained within area of another object
     */
    isContainedWithinObject: function(other, absolute, calculate) {
      var points = this.getCoords(absolute, calculate),
          otherCoords = absolute ? other.aCoords : other.lineCoords,
          i = 0, lines = other._getImageLines(otherCoords);
      for (; i < 4; i++) {
        if (!other.containsPoint(points[i], lines)) {
          return false;
        }
      }
      return true;
    },

    /**
     * Checks if object is fully contained within area formed by 2 points
     * @param {Object} pointTL top-left point of area
     * @param {Object} pointBR bottom-right point of area
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object is fully contained within area formed by 2 points
     */
    isContainedWithinRect: function(pointTL, pointBR, absolute, calculate) {
      var boundingRect = this.getBoundingRect(absolute, calculate);

      return (
        boundingRect.left >= pointTL.x &&
        boundingRect.left + boundingRect.width <= pointBR.x &&
        boundingRect.top >= pointTL.y &&
        boundingRect.top + boundingRect.height <= pointBR.y
      );
    },

    /**
     * Checks if point is inside the object
     * @param {fabric.Point} point Point to check against
     * @param {Object} [lines] object returned from @method _getImageLines
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if point is inside the object
     */
    containsPoint: function(point, lines, absolute, calculate) {
      var coords = this._getCoords(absolute, calculate),
          lines = lines || this._getImageLines(coords),
          xPoints = this._findCrossPoints(point, lines);
      // if xPoints is odd then point is inside the object
      return (xPoints !== 0 && xPoints % 2 === 1);
    },

    /**
     * Checks if object is contained within the canvas with current viewportTransform
     * the check is done stopping at first point that appears on screen
     * @param {Boolean} [calculate] use coordinates of current position instead of .aCoords
     * @return {Boolean} true if object is fully or partially contained within canvas
     */
    isOnScreen: function(calculate) {
      if (!this.canvas) {
        return false;
      }
      var pointTL = this.canvas.vptCoords.tl, pointBR = this.canvas.vptCoords.br;
      var points = this.getCoords(true, calculate);
      // if some point is on screen, the object is on screen.
      if (points.some(function(point) {
        return point.x <= pointBR.x && point.x >= pointTL.x &&
        point.y <= pointBR.y && point.y >= pointTL.y;
      })) {
        return true;
      }
      // no points on screen, check intersection with absolute coordinates
      if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
        return true;
      }
      return this._containsCenterOfCanvas(pointTL, pointBR, calculate);
    },

    /**
     * Checks if the object contains the midpoint between canvas extremities
     * Does not make sense outside the context of isOnScreen and isPartiallyOnScreen
     * @private
     * @param {Fabric.Point} pointTL Top Left point
     * @param {Fabric.Point} pointBR Top Right point
     * @param {Boolean} calculate use coordinates of current position instead of .oCoords
     * @return {Boolean} true if the object contains the point
     */
    _containsCenterOfCanvas: function(pointTL, pointBR, calculate) {
      // worst case scenario the object is so big that contains the screen
      var centerPoint = { x: (pointTL.x + pointBR.x) / 2, y: (pointTL.y + pointBR.y) / 2 };
      if (this.containsPoint(centerPoint, null, true, calculate)) {
        return true;
      }
      return false;
    },

    /**
     * Checks if object is partially contained within the canvas with current viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords
     * @return {Boolean} true if object is partially contained within canvas
     */
    isPartiallyOnScreen: function(calculate) {
      if (!this.canvas) {
        return false;
      }
      var pointTL = this.canvas.vptCoords.tl, pointBR = this.canvas.vptCoords.br;
      if (this.intersectsWithRect(pointTL, pointBR, true, calculate)) {
        return true;
      }
      var allPointsAreOutside = this.getCoords(true, calculate).every(function(point) {
        return (point.x >= pointBR.x || point.x <= pointTL.x) &&
        (point.y >= pointBR.y || point.y <= pointTL.y);
      });
      return allPointsAreOutside && this._containsCenterOfCanvas(pointTL, pointBR, calculate);
    },

    /**
     * Method that returns an object with the object edges in it, given the coordinates of the corners
     * @private
     * @param {Object} oCoords Coordinates of the object corners
     */
    _getImageLines: function(oCoords) {

      var lines = {
        topline: {
          o: oCoords.tl,
          d: oCoords.tr
        },
        rightline: {
          o: oCoords.tr,
          d: oCoords.br
        },
        bottomline: {
          o: oCoords.br,
          d: oCoords.bl
        },
        leftline: {
          o: oCoords.bl,
          d: oCoords.tl
        }
      };

      // // debugging
      // if (this.canvas.contextTop) {
      //   this.canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);
      //
      //   this.canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);
      //
      //   this.canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);
      //
      //   this.canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
      //   this.canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);
      // }

      return lines;
    },

    /**
     * Helper method to determine how many cross points are between the 4 object edges
     * and the horizontal line determined by a point on canvas
     * @private
     * @param {fabric.Point} point Point to check
     * @param {Object} lines Coordinates of the object being evaluated
     */
    // remove yi, not used but left code here just in case.
    _findCrossPoints: function(point, lines) {
      var b1, b2, a1, a2, xi, // yi,
          xcount = 0,
          iLine;

      for (var lineKey in lines) {
        iLine = lines[lineKey];
        // optimisation 1: line below point. no cross
        if ((iLine.o.y < point.y) && (iLine.d.y < point.y)) {
          continue;
        }
        // optimisation 2: line above point. no cross
        if ((iLine.o.y >= point.y) && (iLine.d.y >= point.y)) {
          continue;
        }
        // optimisation 3: vertical line case
        if ((iLine.o.x === iLine.d.x) && (iLine.o.x >= point.x)) {
          xi = iLine.o.x;
          // yi = point.y;
        }
        // calculate the intersection point
        else {
          b1 = 0;
          b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
          a1 = point.y - b1 * point.x;
          a2 = iLine.o.y - b2 * iLine.o.x;

          xi = -(a1 - a2) / (b1 - b2);
          // yi = a1 + b1 * xi;
        }
        // dont count xi < point.x cases
        if (xi >= point.x) {
          xcount += 1;
        }
        // optimisation 4: specific for square images
        if (xcount === 2) {
          break;
        }
      }
      return xcount;
    },

    /**
     * Returns coordinates of object's bounding rectangle (left, top, width, height)
     * the box is intended as aligned to axis of canvas.
     * @param {Boolean} [absolute] use coordinates without viewportTransform
     * @param {Boolean} [calculate] use coordinates of current position instead of .oCoords / .aCoords
     * @return {Object} Object with left, top, width, height properties
     */
    getBoundingRect: function(absolute, calculate) {
      var coords = this.getCoords(absolute, calculate);
      return util.makeBoundingBoxFromPoints(coords);
    },

    /**
     * Returns width of an object's bounding box counting transformations
     * before 2.0 it was named getWidth();
     * @return {Number} width value
     */
    getScaledWidth: function() {
      return this._getTransformedDimensions().x;
    },

    /**
     * Returns height of an object bounding box counting transformations
     * before 2.0 it was named getHeight();
     * @return {Number} height value
     */
    getScaledHeight: function() {
      return this._getTransformedDimensions().y;
    },

    /**
     * Makes sure the scale is valid and modifies it if necessary
     * @private
     * @param {Number} value
     * @return {Number}
     */
    _constrainScale: function(value) {
      if (Math.abs(value) < this.minScaleLimit) {
        if (value < 0) {
          return -this.minScaleLimit;
        }
        else {
          return this.minScaleLimit;
        }
      }
      else if (value === 0) {
        return 0.0001;
      }
      return value;
    },

    /**
     * Scales an object (equally by x and y)
     * @param {Number} value Scale factor
     * @return {fabric.Object} thisArg
     * @chainable
     */
    scale: function(value) {
      this._set('scaleX', value);
      this._set('scaleY', value);
      return this.setCoords();
    },

    /**
     * Scales an object to a given width, with respect to bounding box (scaling by x/y equally)
     * @param {Number} value New width value
     * @param {Boolean} absolute ignore viewport
     * @return {fabric.Object} thisArg
     * @chainable
     */
    scaleToWidth: function(value, absolute) {
      // adjust to bounding rect factor so that rotated shapes would fit as well
      var boundingRectFactor = this.getBoundingRect(absolute).width / this.getScaledWidth();
      return this.scale(value / this.width / boundingRectFactor);
    },

    /**
     * Scales an object to a given height, with respect to bounding box (scaling by x/y equally)
     * @param {Number} value New height value
     * @param {Boolean} absolute ignore viewport
     * @return {fabric.Object} thisArg
     * @chainable
     */
    scaleToHeight: function(value, absolute) {
      // adjust to bounding rect factor so that rotated shapes would fit as well
      var boundingRectFactor = this.getBoundingRect(absolute).height / this.getScaledHeight();
      return this.scale(value / this.height / boundingRectFactor);
    },

    /**
     * Calculates and returns the .coords of an object.
     * unused by the library, only for the end dev.
     * @return {Object} Object with tl, tr, br, bl ....
     * @chainable
     * @deprecated
     */
    calcCoords: function(absolute) {
      // this is a compatibility function to avoid removing calcCoords now.
      if (absolute) {
        return this.calcACoords();
      }
      return this.calcOCoords();
    },

    calcLineCoords: function() {
      var vpt = this.getViewportTransform(),
          padding = this.padding, angle = degreesToRadians(this.angle),
          cos = util.cos(angle), sin = util.sin(angle),
          cosP = cos * padding, sinP = sin * padding, cosPSinP = cosP + sinP,
          cosPMinusSinP = cosP - sinP, aCoords = this.calcACoords();

      var lineCoords = {
        tl: transformPoint(aCoords.tl, vpt),
        tr: transformPoint(aCoords.tr, vpt),
        bl: transformPoint(aCoords.bl, vpt),
        br: transformPoint(aCoords.br, vpt),
      };

      if (padding) {
        lineCoords.tl.x -= cosPMinusSinP;
        lineCoords.tl.y -= cosPSinP;
        lineCoords.tr.x += cosPSinP;
        lineCoords.tr.y -= cosPMinusSinP;
        lineCoords.bl.x -= cosPSinP;
        lineCoords.bl.y += cosPMinusSinP;
        lineCoords.br.x += cosPMinusSinP;
        lineCoords.br.y += cosPSinP;
      }

      return lineCoords;
    },

    calcOCoords: function() {
      var rotateMatrix = this._calcRotateMatrix(),
          translateMatrix = this._calcTranslateMatrix(),
          vpt = this.getViewportTransform(),
          startMatrix = multiplyMatrices(vpt, translateMatrix),
          finalMatrix = multiplyMatrices(startMatrix, rotateMatrix),
          finalMatrix = multiplyMatrices(finalMatrix, [1 / vpt[0], 0, 0, 1 / vpt[3], 0, 0]),
          dim = this._calculateCurrentDimensions(),
          coords = {};
      this.forEachControl(function(control, key, fabricObject) {
        coords[key] = control.positionHandler(dim, finalMatrix, fabricObject);
      });

      // debug code
      // var canvas = this.canvas;
      // setTimeout(function() {
      //   canvas.contextTop.clearRect(0, 0, 700, 700);
      //   canvas.contextTop.fillStyle = 'green';
      //   Object.keys(coords).forEach(function(key) {
      //     var control = coords[key];
      //     canvas.contextTop.fillRect(control.x, control.y, 3, 3);
      //   });
      // }, 50);
      return coords;
    },

    calcACoords: function() {
      var rotateMatrix = this._calcRotateMatrix(),
          translateMatrix = this._calcTranslateMatrix(),
          finalMatrix = multiplyMatrices(translateMatrix, rotateMatrix),
          dim = this._getTransformedDimensions(),
          w = dim.x / 2, h = dim.y / 2;
      return {
        // corners
        tl: transformPoint({ x: -w, y: -h }, finalMatrix),
        tr: transformPoint({ x: w, y: -h }, finalMatrix),
        bl: transformPoint({ x: -w, y: h }, finalMatrix),
        br: transformPoint({ x: w, y: h }, finalMatrix)
      };
    },

    /**
     * Sets corner and controls position coordinates based on current angle, width and height, left and top.
     * oCoords are used to find the corners
     * aCoords are used to quickly find an object on the canvas
     * lineCoords are used to quickly find object during pointer events.
     * See {@link https://github.com/kangax/fabric.js/wiki/When-to-call-setCoords|When-to-call-setCoords}
     * @param {Boolean} [skipCorners] skip calculation of oCoords.
     * @return {fabric.Object} thisArg
     * @chainable
     */
    setCoords: function(skipCorners) {
      this.aCoords = this.calcACoords();
      // in case we are in a group, for how the inner group target check works,
      // lineCoords are exactly aCoords. Since the vpt gets absorbed by the normalized pointer.
      this.lineCoords = this.group ? this.aCoords : this.calcLineCoords();
      if (skipCorners) {
        return this;
      }
      // set coordinates of the draggable boxes in the corners used to scale/rotate the image
      this.oCoords = this.calcOCoords();
      this._setCornerCoords && this._setCornerCoords();
      return this;
    },

    /**
     * calculate rotation matrix of an object
     * @return {Array} rotation matrix for the object
     */
    _calcRotateMatrix: function() {
      return util.calcRotateMatrix(this);
    },

    /**
     * calculate the translation matrix for an object transform
     * @return {Array} rotation matrix for the object
     */
    _calcTranslateMatrix: function() {
      var center = this.getCenterPoint();
      return [1, 0, 0, 1, center.x, center.y];
    },

    transformMatrixKey: function(skipGroup) {
      var sep = '_', prefix = '';
      if (!skipGroup && this.group) {
        prefix = this.group.transformMatrixKey(skipGroup) + sep;
      };
      return prefix + this.top + sep + this.left + sep + this.scaleX + sep + this.scaleY +
        sep + this.skewX + sep + this.skewY + sep + this.angle + sep + this.originX + sep + this.originY +
        sep + this.width + sep + this.height + sep + this.strokeWidth + this.flipX + this.flipY;
    },

    /**
     * calculate transform matrix that represents the current transformations from the
     * object's properties.
     * @param {Boolean} [skipGroup] return transform matrix for object not counting parent transformations
     * There are some situation in which this is useful to avoid the fake rotation.
     * @return {Array} transform matrix for the object
     */
    calcTransformMatrix: function(skipGroup) {
      var matrix = this.calcOwnMatrix();
      if (skipGroup || !this.group) {
        return matrix;
      }
      var key = this.transformMatrixKey(skipGroup), cache = this.matrixCache || (this.matrixCache = {});
      if (cache.key === key) {
        return cache.value;
      }
      if (this.group) {
        matrix = multiplyMatrices(this.group.calcTransformMatrix(false), matrix);
      }
      cache.key = key;
      cache.value = matrix;
      return matrix;
    },

    /**
     * calculate transform matrix that represents the current transformations from the
     * object's properties, this matrix does not include the group transformation
     * @return {Array} transform matrix for the object
     */
    calcOwnMatrix: function() {
      var key = this.transformMatrixKey(true), cache = this.ownMatrixCache || (this.ownMatrixCache = {});
      if (cache.key === key) {
        return cache.value;
      }
      var tMatrix = this._calcTranslateMatrix(),
          options = {
            angle: this.angle,
            translateX: tMatrix[4],
            translateY: tMatrix[5],
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            skewX: this.skewX,
            skewY: this.skewY,
            flipX: this.flipX,
            flipY: this.flipY,
          };
      cache.key = key;
      cache.value = util.composeMatrix(options);
      return cache.value;
    },

    /*
     * Calculate object dimensions from its properties
     * @private
     * @deprecated since 3.4.0, please use fabric.util._calcDimensionsTransformMatrix
     * not including or including flipX, flipY to emulate the flipping boolean
     * @return {Object} .x width dimension
     * @return {Object} .y height dimension
     */
    _calcDimensionsTransformMatrix: function(skewX, skewY, flipping) {
      return util.calcDimensionsMatrix({
        skewX: skewX,
        skewY: skewY,
        scaleX: this.scaleX * (flipping && this.flipX ? -1 : 1),
        scaleY: this.scaleY * (flipping && this.flipY ? -1 : 1)
      });
    },

    /*
     * Calculate object dimensions from its properties
     * @private
     * @return {Object} .x width dimension
     * @return {Object} .y height dimension
     */
    _getNonTransformedDimensions: function() {
      var strokeWidth = this.strokeWidth,
          w = this.width + strokeWidth,
          h = this.height + strokeWidth;
      return { x: w, y: h };
    },

    /*
     * Calculate object bounding box dimensions from its properties scale, skew.
     * @param {Number} skewX, a value to override current skewX
     * @param {Number} skewY, a value to override current skewY
     * @private
     * @return {Object} .x width dimension
     * @return {Object} .y height dimension
     */
    _getTransformedDimensions: function(skewX, skewY) {
      if (typeof skewX === 'undefined') {
        skewX = this.skewX;
      }
      if (typeof skewY === 'undefined') {
        skewY = this.skewY;
      }
      var dimensions, dimX, dimY,
          noSkew = skewX === 0 && skewY === 0;

      if (this.strokeUniform) {
        dimX = this.width;
        dimY = this.height;
      }
      else {
        dimensions = this._getNonTransformedDimensions();
        dimX = dimensions.x;
        dimY = dimensions.y;
      }
      if (noSkew) {
        return this._finalizeDimensions(dimX * this.scaleX, dimY * this.scaleY);
      }
      var bbox = util.sizeAfterTransform(dimX, dimY, {
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        skewX: skewX,
        skewY: skewY,
      });
      return this._finalizeDimensions(bbox.x, bbox.y);
    },

    /*
     * Calculate object bounding box dimensions from its properties scale, skew.
     * @param Number width width of the bbox
     * @param Number height height of the bbox
     * @private
     * @return {Object} .x finalized width dimension
     * @return {Object} .y finalized height dimension
     */
    _finalizeDimensions: function(width, height) {
      return this.strokeUniform ?
        { x: width + this.strokeWidth, y: height + this.strokeWidth }
        :
        { x: width, y: height };
    },

    /*
     * Calculate object dimensions for controls box, including padding and canvas zoom.
     * and active selection
     * private
     */
    _calculateCurrentDimensions: function()  {
      var vpt = this.getViewportTransform(),
          dim = this._getTransformedDimensions(),
          p = transformPoint(dim, vpt, true);
      return p.scalarAdd(2 * this.padding);
    },
  });
})();
