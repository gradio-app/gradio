/**
 * Object.assign() polyfill for IE11
 * @see <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign>
 */

if (typeof Object.assign != "function") {
  Object.defineProperty(Object, "assign", {
    // eslint-disable-next-line no-unused-vars
    value: function assign(target, varArgs) {
      "use strict";
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      let to = Object(target);
      for (let index = 1; index < arguments.length; index++) {
        let nextSource = arguments[index];
        if (nextSource != null) {
          for (let nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}
