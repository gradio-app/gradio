const Canvas = require('./lib/canvas')
const Image = require('./lib/image')
const CanvasRenderingContext2D = require('./lib/context2d')
const CanvasPattern = require('./lib/pattern')
const parseFont = require('./lib/parse-font')
const packageJson = require('./package.json')
const bindings = require('./lib/bindings')
const fs = require('fs')
const PNGStream = require('./lib/pngstream')
const PDFStream = require('./lib/pdfstream')
const JPEGStream = require('./lib/jpegstream')
const { DOMPoint, DOMMatrix } = require('./lib/DOMMatrix')

function createCanvas (width, height, type) {
  return new Canvas(width, height, type)
}

function createImageData (array, width, height) {
  return new bindings.ImageData(array, width, height)
}

function loadImage (src) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = () => { cleanup(); resolve(image) }
    image.onerror = (err) => { cleanup(); reject(err) }

    image.src = src
  })
}

/**
 * Resolve paths for registerFont. Must be called *before* creating a Canvas
 * instance.
 * @param src {string} Path to font file.
 * @param fontFace {{family: string, weight?: string, style?: string}} Object
 * specifying font information. `weight` and `style` default to `"normal"`.
 */
function registerFont (src, fontFace) {
  // TODO this doesn't need to be on Canvas; it should just be a static method
  // of `bindings`.
  return Canvas._registerFont(fs.realpathSync(src), fontFace)
}

/**
 * Unload all fonts from pango to free up memory
 */
function deregisterAllFonts () {
  return Canvas._deregisterAllFonts()
}

module.exports = {
  Canvas,
  Context2d: CanvasRenderingContext2D, // Legacy/compat export
  CanvasRenderingContext2D,
  CanvasGradient: bindings.CanvasGradient,
  CanvasPattern,
  Image,
  ImageData: bindings.ImageData,
  PNGStream,
  PDFStream,
  JPEGStream,
  DOMMatrix,
  DOMPoint,

  registerFont,
  deregisterAllFonts,
  parseFont,

  createCanvas,
  createImageData,
  loadImage,

  backends: bindings.Backends,

  /** Library version. */
  version: packageJson.version,
  /** Cairo version. */
  cairoVersion: bindings.cairoVersion,
  /** jpeglib version. */
  jpegVersion: bindings.jpegVersion,
  /** gif_lib version. */
  gifVersion: bindings.gifVersion ? bindings.gifVersion.replace(/[^.\d]/g, '') : undefined,
  /** freetype version. */
  freetypeVersion: bindings.freetypeVersion,
  /** rsvg version. */
  rsvgVersion: bindings.rsvgVersion
}
