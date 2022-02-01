(function(global) {

  'use strict';

  var fabric  = global.fabric || (global.fabric = { }),
      filters = fabric.Image.filters,
      createClass = fabric.util.createClass;

  /**
   * A container class that knows how to apply a sequence of filters to an input image.
   */
  filters.Composed = createClass(filters.BaseFilter, /** @lends fabric.Image.filters.Composed.prototype */ {

    type: 'Composed',

    /**
     * A non sparse array of filters to apply
     */
    subFilters: [],

    /**
     * Constructor
     * @param {Object} [options] Options object
     */
    initialize: function(options) {
      this.callSuper('initialize', options);
      // create a new array instead mutating the prototype with push
      this.subFilters = this.subFilters.slice(0);
    },

    /**
     * Apply this container's filters to the input image provided.
     *
     * @param {Object} options
     * @param {Number} options.passes The number of filters remaining to be applied.
     */
    applyTo: function(options) {
      options.passes += this.subFilters.length - 1;
      this.subFilters.forEach(function(filter) {
        filter.applyTo(options);
      });
    },

    /**
     * Serialize this filter into JSON.
     *
     * @returns {Object} A JSON representation of this filter.
     */
    toObject: function() {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        subFilters: this.subFilters.map(function(filter) { return filter.toObject(); }),
      });
    },

    isNeutralState: function() {
      return !this.subFilters.some(function(filter) { return !filter.isNeutralState(); });
    }
  });

  /**
   * Deserialize a JSON definition of a ComposedFilter into a concrete instance.
   */
  fabric.Image.filters.Composed.fromObject = function(object, callback) {
    var filters = object.subFilters || [],
        subFilters = filters.map(function(filter) {
          return new fabric.Image.filters[filter.type](filter);
        }),
        instance = new fabric.Image.filters.Composed({ subFilters: subFilters });
    callback && callback(instance);
    return instance;
  };
})(typeof exports !== 'undefined' ? exports : this);
