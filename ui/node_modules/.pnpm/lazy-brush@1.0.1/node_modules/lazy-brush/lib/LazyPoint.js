'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Point2 = require('./Point');

var _Point3 = _interopRequireDefault(_Point2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LazyPoint = function (_Point) {
  _inherits(LazyPoint, _Point);

  function LazyPoint() {
    _classCallCheck(this, LazyPoint);

    return _possibleConstructorReturn(this, (LazyPoint.__proto__ || Object.getPrototypeOf(LazyPoint)).apply(this, arguments));
  }

  _createClass(LazyPoint, [{
    key: 'update',

    /**
     * Update the x and y values
     *
     * @param {Point} point
     */
    value: function update(point) {
      this.x = point.x;
      this.y = point.y;
    }

    /**
     * Move the point to another position using an angle and distance
     *
     * @param {number} angle The angle in radians
     * @param {number} distance How much the point should be moved
     */

  }, {
    key: 'moveByAngle',
    value: function moveByAngle(angle, distance) {
      // Rotate the angle based on the browser coordinate system ([0,0] in the top left)
      var angleRotated = angle + Math.PI / 2;

      this.x = this.x + Math.sin(angleRotated) * distance, this.y = this.y - Math.cos(angleRotated) * distance;
    }

    /**
     * Check if this point is the same as another point
     *
     * @param {Point} point
     * @returns {boolean}
     */

  }, {
    key: 'equalsTo',
    value: function equalsTo(point) {
      return this.x === point.x && this.y === point.y;
    }

    /**
     * Get the difference for x and y axis to another point
     *
     * @param {Point} point
     * @returns {Point}
     */

  }, {
    key: 'getDifferenceTo',
    value: function getDifferenceTo(point) {
      return new _Point3.default(this.x - point.x, this.y - point.y);
    }

    /**
     * Calculate distance to another point
     *
     * @param {Point} point
     * @returns {Point}
     */

  }, {
    key: 'getDistanceTo',
    value: function getDistanceTo(point) {
      var diff = this.getDifferenceTo(point);

      return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
    }

    /**
     * Calculate the angle to another point
     *
     * @param {Point} point
     * @returns {Point}
     */

  }, {
    key: 'getAngleTo',
    value: function getAngleTo(point) {
      var diff = this.getDifferenceTo(point);

      return Math.atan2(diff.y, diff.x);
    }

    /**
     * Return a simple object with x and y properties
     *
     * @returns {object}
     */

  }, {
    key: 'toObject',
    value: function toObject() {
      return {
        x: this.x,
        y: this.y
      };
    }
  }]);

  return LazyPoint;
}(_Point3.default);

exports.default = LazyPoint;