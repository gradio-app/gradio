(function() {
  // Calculate an in-between color. Returns a "rgba()" string.
  // Credit: Edwin Martin <edwin@bitstorm.org>
  //         http://www.bitstorm.org/jquery/color-animation/jquery.animate-colors.js
  function calculateColor(begin, end, pos) {
    var color = 'rgba('
        + parseInt((begin[0] + pos * (end[0] - begin[0])), 10) + ','
        + parseInt((begin[1] + pos * (end[1] - begin[1])), 10) + ','
        + parseInt((begin[2] + pos * (end[2] - begin[2])), 10);

    color += ',' + (begin && end ? parseFloat(begin[3] + pos * (end[3] - begin[3])) : 1);
    color += ')';
    return color;
  }

  /**
   * Changes the color from one to another within certain period of time, invoking callbacks as value is being changed.
   * @memberOf fabric.util
   * @param {String} fromColor The starting color in hex or rgb(a) format.
   * @param {String} toColor The starting color in hex or rgb(a) format.
   * @param {Number} [duration] Duration of change (in ms).
   * @param {Object} [options] Animation options
   * @param {Function} [options.onChange] Callback; invoked on every value change
   * @param {Function} [options.onComplete] Callback; invoked when value change is completed
   * @param {Function} [options.colorEasing] Easing function. Note that this function only take two arguments (currentTime, duration). Thus the regular animation easing functions cannot be used.
   * @param {Function} [options.abort] Additional function with logic. If returns true, onComplete is called.
   * @returns {Function} abort function
   */
  function animateColor(fromColor, toColor, duration, options) {
    var startColor = new fabric.Color(fromColor).getSource(),
        endColor = new fabric.Color(toColor).getSource(),
        originalOnComplete = options.onComplete,
        originalOnChange = options.onChange;
    options = options || {};

    return fabric.util.animate(fabric.util.object.extend(options, {
      duration: duration || 500,
      startValue: startColor,
      endValue: endColor,
      byValue: endColor,
      easing: function (currentTime, startValue, byValue, duration) {
        var posValue = options.colorEasing
          ? options.colorEasing(currentTime, duration)
          : 1 - Math.cos(currentTime / duration * (Math.PI / 2));
        return calculateColor(startValue, byValue, posValue);
      },
      // has to take in account for color restoring;
      onComplete: function(current, valuePerc, timePerc) {
        if (originalOnComplete) {
          return originalOnComplete(
            calculateColor(endColor, endColor, 0),
            valuePerc,
            timePerc
          );
        }
      },
      onChange: function(current, valuePerc, timePerc) {
        if (originalOnChange) {
          if (Array.isArray(current)) {
            return originalOnChange(
              calculateColor(current, current, 0),
              valuePerc,
              timePerc
            );
          }
          originalOnChange(current, valuePerc, timePerc);
        }
      }
    }));
  }

  fabric.util.animateColor = animateColor;

})();
