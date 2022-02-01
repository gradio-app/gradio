'use strict'

/*!
 * Canvas - PNGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

const { Readable } = require('stream')
function noop () {}

class PNGStream extends Readable {
  constructor (canvas, options) {
    super()

    if (options &&
      options.palette instanceof Uint8ClampedArray &&
      options.palette.length % 4 !== 0) {
      throw new Error('Palette length must be a multiple of 4.')
    }
    this.canvas = canvas
    this.options = options || {}
  }

  _read () {
    // For now we're not controlling the c++ code's data emission, so we only
    // call canvas.streamPNGSync once and let it emit data at will.
    this._read = noop

    this.canvas.streamPNGSync((err, chunk, len) => {
      if (err) {
        this.emit('error', err)
      } else if (len) {
        this.push(chunk)
      } else {
        this.push(null)
      }
    }, this.options)
  }
}

module.exports = PNGStream
