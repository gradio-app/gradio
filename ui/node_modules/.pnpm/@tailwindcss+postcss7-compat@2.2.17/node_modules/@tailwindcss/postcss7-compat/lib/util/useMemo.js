"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMemo = useMemo;

var _disposables = require("./disposables");

function useMemo(cb, keyResolver) {
  let cache = new Map();

  function clearCache() {
    cache.clear();

    _disposables.shared.add(clearCache);
  }

  _disposables.shared.add(clearCache);

  return (...args) => {
    let key = keyResolver(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    let result = cb(...args);
    cache.set(key, result);
    return result;
  };
}