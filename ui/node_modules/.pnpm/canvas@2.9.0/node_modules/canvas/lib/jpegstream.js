'use strict'

/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

const { Readable } = require('stream')
function noop () {}

class JPEGStream extends Readable {
  constructor (canvas, options) {
    super()

    if (canvas.streamJPEGSync === undefined) {
      throw new Error('node-canvas was built without JPEG support.')
    }

    this.options = options
    this.canvas = canvas
  }

  _read () {
    // For now we're not controlling the c++ code's data emission, so we only
    // call canvas.streamJPEGSync once and let it emit data at will.
    this._read = noop

    this.canvas.streamJPEGSync(this.options, (err, chunk) => {
      if (err) {
        this.emit('error', err)
      } else if (chunk) {
        this.push(chunk)
      } else {
        this.push(null)
      }
    })
  }
};

module.exports = JPEGStream
