'use strict'

/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

const bindings = require('./bindings')
const Canvas = module.exports = bindings.Canvas
const Context2d = require('./context2d')
const PNGStream = require('./pngstream')
const PDFStream = require('./pdfstream')
const JPEGStream = require('./jpegstream')
const FORMATS = ['image/png', 'image/jpeg']
const util = require('util')

// TODO || is for Node.js pre-v6.6.0
Canvas.prototype[util.inspect.custom || 'inspect'] = function () {
  return `[Canvas ${this.width}x${this.height}]`
}

Canvas.prototype.getContext = function (contextType, contextAttributes) {
  if (contextType == '2d') {
    const ctx = this._context2d || (this._context2d = new Context2d(this, contextAttributes))
    this.context = ctx
    ctx.canvas = this
    return ctx
  }
}

Canvas.prototype.pngStream =
Canvas.prototype.createPNGStream = function (options) {
  return new PNGStream(this, options)
}

Canvas.prototype.pdfStream =
Canvas.prototype.createPDFStream = function (options) {
  return new PDFStream(this, options)
}

Canvas.prototype.jpegStream =
Canvas.prototype.createJPEGStream = function (options) {
  return new JPEGStream(this, options)
}

Canvas.prototype.toDataURL = function (a1, a2, a3) {
  // valid arg patterns (args -> [type, opts, fn]):
  // [] -> ['image/png', null, null]
  // [qual] -> ['image/png', null, null]
  // [undefined] -> ['image/png', null, null]
  // ['image/png'] -> ['image/png', null, null]
  // ['image/png', qual] -> ['image/png', null, null]
  // [fn] -> ['image/png', null, fn]
  // [type, fn] -> [type, null, fn]
  // [undefined, fn] -> ['image/png', null, fn]
  // ['image/png', qual, fn] -> ['image/png', null, fn]
  // ['image/jpeg', fn] -> ['image/jpeg', null, fn]
  // ['image/jpeg', opts, fn] -> ['image/jpeg', opts, fn]
  // ['image/jpeg', qual, fn] -> ['image/jpeg', {quality: qual}, fn]
  // ['image/jpeg', undefined, fn] -> ['image/jpeg', null, fn]
  // ['image/jpeg'] -> ['image/jpeg', null, fn]
  // ['image/jpeg', opts] -> ['image/jpeg', opts, fn]
  // ['image/jpeg', qual] -> ['image/jpeg', {quality: qual}, fn]

  let type = 'image/png'
  let opts = {}
  let fn

  if (typeof a1 === 'function') {
    fn = a1
  } else {
    if (typeof a1 === 'string' && FORMATS.includes(a1.toLowerCase())) {
      type = a1.toLowerCase()
    }

    if (typeof a2 === 'function') {
      fn = a2
    } else {
      if (typeof a2 === 'object') {
        opts = a2
      } else if (typeof a2 === 'number') {
        opts = { quality: Math.max(0, Math.min(1, a2)) }
      }

      if (typeof a3 === 'function') {
        fn = a3
      } else if (undefined !== a3) {
        throw new TypeError(`${typeof a3} is not a function`)
      }
    }
  }

  if (this.width === 0 || this.height === 0) {
    // Per spec, if the bitmap has no pixels, return this string:
    const str = 'data:,'
    if (fn) {
      setTimeout(() => fn(null, str))
      return
    } else {
      return str
    }
  }

  if (fn) {
    this.toBuffer((err, buf) => {
      if (err) return fn(err)
      fn(null, `data:${type};base64,${buf.toString('base64')}`)
    }, type, opts)
  } else {
    return `data:${type};base64,${this.toBuffer(type, opts).toString('base64')}`
  }
}
