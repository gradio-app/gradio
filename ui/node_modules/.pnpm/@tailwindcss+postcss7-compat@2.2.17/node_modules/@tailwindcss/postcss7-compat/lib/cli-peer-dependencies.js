"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lazyAutoprefixer = lazyAutoprefixer;
exports.lazyCssnano = lazyCssnano;
exports.postcss = void 0;

let postcss = require('postcss');

exports.postcss = postcss;

function lazyAutoprefixer() {
  return require('autoprefixer');
}

function lazyCssnano() {
  return require('cssnano');
}