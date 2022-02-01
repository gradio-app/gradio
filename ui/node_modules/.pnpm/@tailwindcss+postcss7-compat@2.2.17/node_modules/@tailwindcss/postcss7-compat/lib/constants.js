"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultPostCssConfigStubFile = exports.simpleConfigStubFile = exports.defaultConfigStubFile = exports.supportedPostCssConfigFile = exports.supportedConfigFiles = exports.cjsPostCssConfigFile = exports.cjsConfigFile = exports.defaultPostCssConfigFile = exports.defaultConfigFile = exports.cli = void 0;

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cli = 'tailwind';
exports.cli = cli;
const defaultConfigFile = './tailwind.config.js';
exports.defaultConfigFile = defaultConfigFile;
const defaultPostCssConfigFile = './postcss.config.js';
exports.defaultPostCssConfigFile = defaultPostCssConfigFile;
const cjsConfigFile = './tailwind.config.cjs';
exports.cjsConfigFile = cjsConfigFile;
const cjsPostCssConfigFile = './postcss.config.cjs';
exports.cjsPostCssConfigFile = cjsPostCssConfigFile;
const supportedConfigFiles = [cjsConfigFile, defaultConfigFile];
exports.supportedConfigFiles = supportedConfigFiles;
const supportedPostCssConfigFile = [cjsPostCssConfigFile, defaultPostCssConfigFile];
exports.supportedPostCssConfigFile = supportedPostCssConfigFile;

const defaultConfigStubFile = _path.default.resolve(__dirname, '../stubs/defaultConfig.stub.js');

exports.defaultConfigStubFile = defaultConfigStubFile;

const simpleConfigStubFile = _path.default.resolve(__dirname, '../stubs/simpleConfig.stub.js');

exports.simpleConfigStubFile = simpleConfigStubFile;

const defaultPostCssConfigStubFile = _path.default.resolve(__dirname, '../stubs/defaultPostCssConfig.stub.js');

exports.defaultPostCssConfigStubFile = defaultPostCssConfigStubFile;