/*
relative require
*/'use strict';

var path = require('path');
var Module = require('module');

var modules = {};

var getModule = function(dir) {
  var rootPath = dir ? path.resolve(dir) : process.cwd();
  var rootName = path.join(rootPath, '@root');
  var root = modules[rootName];
  if (!root) {
    root = new Module(rootName);
    root.filename = rootName;
    root.paths = Module._nodeModulePaths(rootPath);
    modules[rootName] = root;
  }
  return root;
};

var requireRelative = function(requested, relativeTo) {
  var root = getModule(relativeTo);
  return root.require(requested);
};

requireRelative.resolve = function(requested, relativeTo) {
  var root = getModule(relativeTo);
  return Module._resolveFilename(requested, root);
};

module.exports = requireRelative;
