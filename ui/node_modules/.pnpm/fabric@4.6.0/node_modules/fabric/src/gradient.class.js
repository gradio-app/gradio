(function() {

  /* _FROM_SVG_START_ */
  function getColorStop(el, multiplier) {
    var style = el.getAttribute('style'),
        offset = el.getAttribute('offset') || 0,
        color, colorAlpha, opacity, i;

    // convert percents to absolute values
    offset = parseFloat(offset) / (/%$/.test(offset) ? 100 : 1);
    offset = offset < 0 ? 0 : offset > 1 ? 1 : offset;
    if (style) {
      var keyValuePairs = style.split(/\s*;\s*/);

      if (keyValuePairs[keyValuePairs.length - 1] === '') {
        keyValuePairs.pop();
      }

      for (i = keyValuePairs.length; i--; ) {

        var split = keyValuePairs[i].split(/\s*:\s*/),
            key = split[0].trim(),
            value = split[1].trim();

        if (key === 'stop-color') {
          color = value;
        }
        else if (key === 'stop-opacity') {
          opacity = value;
        }
      }
    }

    if (!color) {
      color = el.getAttribute('stop-color') || 'rgb(0,0,0)';
    }
    if (!opacity) {
      opacity = el.getAttribute('stop-opacity');
    }

    color = new fabric.Color(color);
    colorAlpha = color.getAlpha();
    opacity = isNaN(parseFloat(opacity)) ? 1 : parseFloat(opacity);
    opacity *= colorAlpha * multiplier;

    return {
      offset: offset,
      color: color.toRgb(),
      opacity: opacity
    };
  }

  function getLinearCoords(el) {
    return {
      x1: el.getAttribute('x1') || 0,
      y1: el.getAttribute('y1') || 0,
      x2: el.getAttribute('x2') || '100%',
      y2: el.getAttribute('y2') || 0
    };
  }

  function getRadialCoords(el) {
    return {
      x1: el.getAttribute('fx') || el.getAttribute('cx') || '50%',
      y1: el.getAttribute('fy') || el.getAttribute('cy') || '50%',
      r1: 0,
      x2: el.getAttribute('cx') || '50%',
      y2: el.getAttribute('cy') || '50%',
      r2: el.getAttribute('r') || '50%'
    };
  }
  /* _FROM_SVG_END_ */

  var clone = fabric.util.object.clone;

  /**
   * Gradient class
   * @class fabric.Gradient
   * @tutorial {@link http://fabricjs.com/fabric-intro-part-2#gradients}
   * @see {@link fabric.Gradient#initialize} for constructor definition
   */
  fabric.Gradient = fabric.util.createClass(/** @lends fabric.Gradient.prototype */ {

    /**
     * Horizontal offset for aligning gradients coming from SVG when outside pathgroups
     * @type Number
     * @default 0
     */
    offsetX: 0,

    /**
     * Vertical offset for aligning gradients coming from SVG when outside pathgroups
     * @type Number
     * @default 0
     */
    offsetY: 0,

    /**
     * A transform matrix to apply to the gradient before painting.
     * Imported from svg gradients, is not applied with the current transform in the center.
     * Before this transform is applied, the origin point is at the top left corner of the object
     * plus the addition of offsetY and offsetX.
     * @type Number[]
     * @default null
     */
    gradientTransform: null,

    /**
     * coordinates units for coords.
     * If `pixels`, the number of coords are in the same unit of width / height.
     * If set as `percentage` the coords are still a number, but 1 means 100% of width
     * for the X and 100% of the height for the y. It can be bigger than 1 and negative.
     * allowed values pixels or percentage.
     * @type String
     * @default 'pixels'
     */
    gradientUnits: 'pixels',

    /**
     * Gradient type linear or radial
     * @type String
     * @default 'pixels'
     */
    type: 'linear',

    /**
     * Constructor
     * @param {Object} options Options object with type, coords, gradientUnits and colorStops
     * @param {Object} [options.type] gradient type linear or radial
     * @param {Object} [options.gradientUnits] gradient units
     * @param {Object} [options.offsetX] SVG import compatibility
     * @param {Object} [options.offsetY] SVG import compatibility
     * @param {Object[]} options.colorStops contains the colorstops.
     * @param {Object} options.coords contains the coords of the gradient
     * @param {Number} [options.coords.x1] X coordiante of the first point for linear or of the focal point for radial
     * @param {Number} [options.coords.y1] Y coordiante of the first point for linear or of the focal point for radial
     * @param {Number} [options.coords.x2] X coordiante of the second point for linear or of the center point for radial
     * @param {Number} [options.coords.y2] Y coordiante of the second point for linear or of the center point for radial
     * @param {Number} [options.coords.r1] only for radial gradient, radius of the inner circle
     * @param {Number} [options.coords.r2] only for radial gradient, radius of the external circle
     * @return {fabric.Gradient} thisArg
     */
    initialize: function(options) {
      options || (options = { });
      options.coords || (options.coords = { });

      var coords, _this = this;

      // sets everything, then coords and colorstops get sets again
      Object.keys(options).forEach(function(option) {
        _this[option] = options[option];
      });

      if (this.id) {
        this.id += '_' + fabric.Object.__uid++;
      }
      else {
        this.id = fabric.Object.__uid++;
      }

      coords = {
        x1: options.coords.x1 || 0,
        y1: options.coords.y1 || 0,
        x2: options.coords.x2 || 0,
        y2: options.coords.y2 || 0
      };

      if (this.type === 'radial') {
        coords.r1 = options.coords.r1 || 0;
        coords.r2 = options.coords.r2 || 0;
      }

      this.coords = coords;
      this.colorStops = options.colorStops.slice();
    },

    /**
     * Adds another colorStop
     * @param {Object} colorStop Object with offset and color
     * @return {fabric.Gradient} thisArg
     */
    addColorStop: function(colorStops) {
      for (var position in colorStops) {
        var color = new fabric.Color(colorStops[position]);
        this.colorStops.push({
          offset: parseFloat(position),
          color: color.toRgb(),
          opacity: color.getAlpha()
        });
      }
      return this;
    },

    /**
     * Returns object representation of a gradient
     * @param {Array} [propertiesToInclude] Any properties that you might want to additionally include in the output
     * @return {Object}
     */
    toObject: function(propertiesToInclude) {
      var object = {
        type: this.type,
        coords: this.coords,
        colorStops: this.colorStops,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        gradientUnits: this.gradientUnits,
        gradientTransform: this.gradientTransform ? this.gradientTransform.concat() : this.gradientTransform
      };
      fabric.util.populateWithProperties(this, object, propertiesToInclude);

      return object;
    },

    /* _TO_SVG_START_ */
    /**
     * Returns SVG representation of an gradient
     * @param {Object} object Object to create a gradient for
     * @return {String} SVG representation of an gradient (linear/radial)
     */
    toSVG: function(object, options) {
      var coords = clone(this.coords, true), i, len, options = options || {},
          markup, commonAttributes, colorStops = clone(this.colorStops, true),
          needsSwap = coords.r1 > coords.r2,
          transform = this.gradientTransform ? this.gradientTransform.concat() : fabric.iMatrix.concat(),
          offsetX = -this.offsetX, offsetY = -this.offsetY,
          withViewport = !!options.additionalTransform,
          gradientUnits = this.gradientUnits === 'pixels' ? 'userSpaceOnUse' : 'objectBoundingBox';
      // colorStops must be sorted ascending
      colorStops.sort(function(a, b) {
        return a.offset - b.offset;
      });

      if (gradientUnits === 'objectBoundingBox') {
        offsetX /= object.width;
        offsetY /= object.height;
      }
      else {
        offsetX += object.width / 2;
        offsetY += object.height / 2;
      }
      if (object.type === 'path' && this.gradientUnits !== 'percentage') {
        offsetX -= object.pathOffset.x;
        offsetY -= object.pathOffset.y;
      }


      transform[4] -= offsetX;
      transform[5] -= offsetY;

      commonAttributes = 'id="SVGID_' + this.id +
                     '" gradientUnits="' + gradientUnits + '"';
      commonAttributes += ' gradientTransform="' + (withViewport ?
        options.additionalTransform + ' ' : '') + fabric.util.matrixToSVG(transform) + '" ';

      if (this.type === 'linear') {
        markup = [
          '<linearGradient ',
          commonAttributes,
          ' x1="', coords.x1,
          '" y1="', coords.y1,
          '" x2="', coords.x2,
          '" y2="', coords.y2,
          '">\n'
        ];
      }
      else if (this.type === 'radial') {
        // svg radial gradient has just 1 radius. the biggest.
        markup = [
          '<radialGradient ',
          commonAttributes,
          ' cx="', needsSwap ? coords.x1 : coords.x2,
          '" cy="', needsSwap ? coords.y1 : coords.y2,
          '" r="', needsSwap ? coords.r1 : coords.r2,
          '" fx="', needsSwap ? coords.x2 : coords.x1,
          '" fy="', needsSwap ? coords.y2 : coords.y1,
          '">\n'
        ];
      }

      if (this.type === 'radial') {
        if (needsSwap) {
          // svg goes from internal to external radius. if radius are inverted, swap color stops.
          colorStops = colorStops.concat();
          colorStops.reverse();
          for (i = 0, len = colorStops.length; i < len; i++) {
            colorStops[i].offset = 1 - colorStops[i].offset;
          }
        }
        var minRadius = Math.min(coords.r1, coords.r2);
        if (minRadius > 0) {
          // i have to shift all colorStops and add new one in 0.
          var maxRadius = Math.max(coords.r1, coords.r2),
              percentageShift = minRadius / maxRadius;
          for (i = 0, len = colorStops.length; i < len; i++) {
            colorStops[i].offset += percentageShift * (1 - colorStops[i].offset);
          }
        }
      }

      for (i = 0, len = colorStops.length; i < len; i++) {
        var colorStop = colorStops[i];
        markup.push(
          '<stop ',
          'offset="', (colorStop.offset * 100) + '%',
          '" style="stop-color:', colorStop.color,
          (typeof colorStop.opacity !== 'undefined' ? ';stop-opacity: ' + colorStop.opacity : ';'),
          '"/>\n'
        );
      }

      markup.push((this.type === 'linear' ? '</linearGradient>\n' : '</radialGradient>\n'));

      return markup.join('');
    },
    /* _TO_SVG_END_ */

    /**
     * Returns an instance of CanvasGradient
     * @param {CanvasRenderingContext2D} ctx Context to render on
     * @return {CanvasGradient}
     */
    toLive: function(ctx) {
      var gradient, coords = fabric.util.object.clone(this.coords), i, len;

      if (!this.type) {
        return;
      }

      if (this.type === 'linear') {
        gradient = ctx.createLinearGradient(
          coords.x1, coords.y1, coords.x2, coords.y2);
      }
      else if (this.type === 'radial') {
        gradient = ctx.createRadialGradient(
          coords.x1, coords.y1, coords.r1, coords.x2, coords.y2, coords.r2);
      }

      for (i = 0, len = this.colorStops.length; i < len; i++) {
        var color = this.colorStops[i].color,
            opacity = this.colorStops[i].opacity,
            offset = this.colorStops[i].offset;

        if (typeof opacity !== 'undefined') {
          color = new fabric.Color(color).setAlpha(opacity).toRgba();
        }
        gradient.addColorStop(offset, color);
      }

      return gradient;
    }
  });

  fabric.util.object.extend(fabric.Gradient, {

    /* _FROM_SVG_START_ */
    /**
     * Returns {@link fabric.Gradient} instance from an SVG element
     * @static
     * @memberOf fabric.Gradient
     * @param {SVGGradientElement} el SVG gradient element
     * @param {fabric.Object} instance
     * @param {String} opacityAttr A fill-opacity or stroke-opacity attribute to multiply to each stop's opacity.
     * @param {Object} svgOptions an object containing the size of the SVG in order to parse correctly gradients
     * that uses gradientUnits as 'userSpaceOnUse' and percentages.
     * @param {Object.number} viewBoxWidth width part of the viewBox attribute on svg
     * @param {Object.number} viewBoxHeight height part of the viewBox attribute on svg
     * @param {Object.number} width width part of the svg tag if viewBox is not specified
     * @param {Object.number} height height part of the svg tag if viewBox is not specified
     * @return {fabric.Gradient} Gradient instance
     * @see http://www.w3.org/TR/SVG/pservers.html#LinearGradientElement
     * @see http://www.w3.org/TR/SVG/pservers.html#RadialGradientElement
     */
    fromElement: function(el, instance, opacityAttr, svgOptions) {
      /**
       *  @example:
       *
       *  <linearGradient id="linearGrad1">
       *    <stop offset="0%" stop-color="white"/>
       *    <stop offset="100%" stop-color="black"/>
       *  </linearGradient>
       *
       *  OR
       *
       *  <linearGradient id="linearGrad2">
       *    <stop offset="0" style="stop-color:rgb(255,255,255)"/>
       *    <stop offset="1" style="stop-color:rgb(0,0,0)"/>
       *  </linearGradient>
       *
       *  OR
       *
       *  <radialGradient id="radialGrad1">
       *    <stop offset="0%" stop-color="white" stop-opacity="1" />
       *    <stop offset="50%" stop-color="black" stop-opacity="0.5" />
       *    <stop offset="100%" stop-color="white" stop-opacity="1" />
       *  </radialGradient>
       *
       *  OR
       *
       *  <radialGradient id="radialGrad2">
       *    <stop offset="0" stop-color="rgb(255,255,255)" />
       *    <stop offset="0.5" stop-color="rgb(0,0,0)" />
       *    <stop offset="1" stop-color="rgb(255,255,255)" />
       *  </radialGradient>
       *
       */

      var multiplier = parseFloat(opacityAttr) / (/%$/.test(opacityAttr) ? 100 : 1);
      multiplier = multiplier < 0 ? 0 : multiplier > 1 ? 1 : multiplier;
      if (isNaN(multiplier)) {
        multiplier = 1;
      }

      var colorStopEls = el.getElementsByTagName('stop'),
          type,
          gradientUnits = el.getAttribute('gradientUnits') === 'userSpaceOnUse' ?
            'pixels' : 'percentage',
          gradientTransform = el.getAttribute('gradientTransform') || '',
          colorStops = [],
          coords, i, offsetX = 0, offsetY = 0,
          transformMatrix;
      if (el.nodeName === 'linearGradient' || el.nodeName === 'LINEARGRADIENT') {
        type = 'linear';
        coords = getLinearCoords(el);
      }
      else {
        type = 'radial';
        coords = getRadialCoords(el);
      }

      for (i = colorStopEls.length; i--; ) {
        colorStops.push(getColorStop(colorStopEls[i], multiplier));
      }

      transformMatrix = fabric.parseTransformAttribute(gradientTransform);

      __convertPercentUnitsToValues(instance, coords, svgOptions, gradientUnits);

      if (gradientUnits === 'pixels') {
        offsetX = -instance.left;
        offsetY = -instance.top;
      }

      var gradient = new fabric.Gradient({
        id: el.getAttribute('id'),
        type: type,
        coords: coords,
        colorStops: colorStops,
        gradientUnits: gradientUnits,
        gradientTransform: transformMatrix,
        offsetX: offsetX,
        offsetY: offsetY,
      });

      return gradient;
    }
    /* _FROM_SVG_END_ */
  });

  /**
   * @private
   */
  function __convertPercentUnitsToValues(instance, options, svgOptions, gradientUnits) {
    var propValue, finalValue;
    Object.keys(options).forEach(function(prop) {
      propValue = options[prop];
      if (propValue === 'Infinity') {
        finalValue = 1;
      }
      else if (propValue === '-Infinity') {
        finalValue = 0;
      }
      else {
        finalValue = parseFloat(options[prop], 10);
        if (typeof propValue === 'string' && /^(\d+\.\d+)%|(\d+)%$/.test(propValue)) {
          finalValue *= 0.01;
          if (gradientUnits === 'pixels') {
            // then we need to fix those percentages here in svg parsing
            if (prop === 'x1' || prop === 'x2' || prop === 'r2') {
              finalValue *= svgOptions.viewBoxWidth || svgOptions.width;
            }
            if (prop === 'y1' || prop === 'y2') {
              finalValue *= svgOptions.viewBoxHeight || svgOptions.height;
            }
          }
        }
      }
      options[prop] = finalValue;
    });
  }
})();
