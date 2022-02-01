'use strict'

/*!
 * Canvas - Context2d
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

const bindings = require('./bindings')
const parseFont = require('./parse-font')
const { DOMMatrix } = require('./DOMMatrix')

bindings.CanvasRenderingContext2dInit(DOMMatrix, parseFont)
module.exports = bindings.CanvasRenderingContext2d
