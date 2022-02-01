# node-canvas

![Test](https://github.com/Automattic/node-canvas/workflows/Test/badge.svg)
[![NPM version](https://badge.fury.io/js/canvas.svg)](http://badge.fury.io/js/canvas)

node-canvas is a [Cairo](http://cairographics.org/)-backed Canvas implementation for [Node.js](http://nodejs.org).

## Installation

```bash
$ npm install canvas
```

By default, binaries for macOS, Linux and Windows will be downloaded. If you want to build from source, use `npm install --build-from-source` and see the **Compiling** section below.

The minimum version of Node.js required is **6.0.0**.

### Compiling

If you don't have a supported OS or processor architecture, or you use `--build-from-source`, the module will be compiled on your system. This requires several dependencies, including Cairo and Pango.

For detailed installation information, see the [wiki](https://github.com/Automattic/node-canvas/wiki/_pages). One-line installation instructions for common OSes are below. Note that libgif/giflib, librsvg and libjpeg are optional and only required if you need GIF, SVG and JPEG support, respectively. Cairo v1.10.0 or later is required.

OS | Command
----- | -----
OS X | Using [Homebrew](https://brew.sh/):<br/>`brew install pkg-config cairo pango libpng jpeg giflib librsvg`
Ubuntu | `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
Fedora | `sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel`
Solaris | `pkgin install cairo pango pkg-config xproto renderproto kbproto xextproto`
OpenBSD | `doas pkg_add cairo pango png jpeg giflib`
Windows | See the [wiki](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows)
Others | See the [wiki](https://github.com/Automattic/node-canvas/wiki)

**Mac OS X v10.11+:** If you have recently updated to Mac OS X v10.11+ and are experiencing trouble when compiling, run the following command: `xcode-select --install`. Read more about the problem [on Stack Overflow](http://stackoverflow.com/a/32929012/148072).
If you have xcode 10.0 or higher installed, in order to build from source you need NPM 6.4.1 or higher.

## Quick Example

```javascript
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')

// Write "Awesome!"
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('Awesome!', 50, 100)

// Draw line under text
var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()

// Draw cat with lime helmet
loadImage('examples/images/lime-cat.jpg').then((image) => {
  ctx.drawImage(image, 50, 0, 70, 70)

  console.log('<img src="' + canvas.toDataURL() + '" />')
})
```

## Upgrading from 1.x to 2.x

See the [changelog](https://github.com/Automattic/node-canvas/blob/master/CHANGELOG.md) for a guide to upgrading from 1.x to 2.x.

For version 1.x documentation, see [the v1.x branch](https://github.com/Automattic/node-canvas/tree/v1.x).

## Documentation

This project is an implementation of the Web Canvas API and implements that API as closely as possible. For API documentation, please visit [Mozilla Web Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). (See [Compatibility Status](https://github.com/Automattic/node-canvas/wiki/Compatibility-Status) for the current API compliance.) All utility methods and non-standard APIs are documented below.

### Utility methods

* [createCanvas()](#createcanvas)
* [createImageData()](#createimagedata)
* [loadImage()](#loadimage)
* [registerFont()](#registerfont)

### Non-standard APIs

* [Image#src](#imagesrc)
* [Image#dataMode](#imagedatamode)
* [Canvas#toBuffer()](#canvastobuffer)
* [Canvas#createPNGStream()](#canvascreatepngstream)
* [Canvas#createJPEGStream()](#canvascreatejpegstream)
* [Canvas#createPDFStream()](#canvascreatepdfstream)
* [Canvas#toDataURL()](#canvastodataurl)
* [CanvasRenderingContext2D#patternQuality](#canvasrenderingcontext2dpatternquality)
* [CanvasRenderingContext2D#quality](#canvasrenderingcontext2dquality)
* [CanvasRenderingContext2D#textDrawingMode](#canvasrenderingcontext2dtextdrawingmode)
* [CanvasRenderingContext2D#globalCompositeOperator = 'saturate'](#canvasrenderingcontext2dglobalcompositeoperator--saturate)
* [CanvasRenderingContext2D#antialias](#canvasrenderingcontext2dantialias)

### createCanvas()

> ```ts
> createCanvas(width: number, height: number, type?: 'PDF'|'SVG') => Canvas
> ```

Creates a Canvas instance. This method works in both Node.js and Web browsers, where there is no Canvas constructor. (See `browser.js` for the implementation that runs in browsers.)

```js
const { createCanvas } = require('canvas')
const mycanvas = createCanvas(200, 200)
const myPDFcanvas = createCanvas(600, 800, 'pdf') // see "PDF Support" section
```

### createImageData()

> ```ts
> createImageData(width: number, height: number) => ImageData
> createImageData(data: Uint8ClampedArray, width: number, height?: number) => ImageData
> // for alternative pixel formats:
> createImageData(data: Uint16Array, width: number, height?: number) => ImageData
> ```

Creates an ImageData instance. This method works in both Node.js and Web browsers.

```js
const { createImageData } = require('canvas')
const width = 20, height = 20
const arraySize = width * height * 4
const mydata = createImageData(new Uint8ClampedArray(arraySize), width)
```

### loadImage()

> ```ts
> loadImage() => Promise<Image>
> ```

Convenience method for loading images. This method works in both Node.js and Web browsers.

```js
const { loadImage } = require('canvas')
const myimg = loadImage('http://server.com/image.png')

myimg.then(() => {
  // do something with image
}).catch(err => {
  console.log('oh no!', err)
})

// or with async/await:
const myimg = await loadImage('http://server.com/image.png')
// do something with image
```

### registerFont()

> ```ts
> registerFont(path: string, { family: string, weight?: string, style?: string }) => void
> ```

To use a font file that is not installed as a system font, use `registerFont()` to register the font with Canvas. *This must be done before the Canvas is created.*

```js
const { registerFont, createCanvas } = require('canvas')
registerFont('comicsans.ttf', { family: 'Comic Sans' })

const canvas = createCanvas(500, 500)
const ctx = canvas.getContext('2d')

ctx.font = '12px "Comic Sans"'
ctx.fillText('Everyone hates this font :(', 250, 10)
```

The second argument is an object with properties that resemble the CSS properties that are specified in `@font-face` rules. You must specify at least `family`. `weight`, and `style` are optional and default to `'normal'`.

### Image#src

> ```ts
> img.src: string|Buffer
> ```

As in browsers, `img.src` can be set to a `data:` URI or a remote URL. In addition, node-canvas allows setting `src` to a local file path or `Buffer` instance.

```javascript
const { Image } = require('canvas')

// From a buffer:
fs.readFile('images/squid.png', (err, squid) => {
  if (err) throw err
  const img = new Image()
  img.onload = () => ctx.drawImage(img, 0, 0)
  img.onerror = err => { throw err }
  img.src = squid
})

// From a local file path:
const img = new Image()
img.onload = () => ctx.drawImage(img, 0, 0)
img.onerror = err => { throw err }
img.src = 'images/squid.png'

// From a remote URL:
img.src = 'http://picsum.photos/200/300'
// ... as above

// From a `data:` URI:
img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
// ... as above
```

*Note: In some cases, `img.src=` is currently synchronous. However, you should always use `img.onload` and `img.onerror`, as we intend to make `img.src=` always asynchronous as it is in browsers. See https://github.com/Automattic/node-canvas/issues/1007.*

### Image#dataMode

> ```ts
> img.dataMode: number
> ```

Applies to JPEG images drawn to PDF canvases only.

Setting `img.dataMode = Image.MODE_MIME` or `Image.MODE_MIME|Image.MODE_IMAGE` enables MIME data tracking of images. When MIME data is tracked, PDF canvases can embed JPEGs directly into the output, rather than re-encoding into PNG. This can drastically reduce filesize and speed up rendering.

```javascript
const { Image, createCanvas } = require('canvas')
const canvas = createCanvas(w, h, 'pdf')
const img = new Image()
img.dataMode = Image.MODE_IMAGE // Only image data tracked
img.dataMode = Image.MODE_MIME // Only mime data tracked
img.dataMode = Image.MODE_MIME | Image.MODE_IMAGE // Both are tracked
```

If working with a non-PDF canvas, image data *must* be tracked; otherwise the output will be junk.

Enabling mime data tracking has no benefits (only a slow down) unless you are generating a PDF.

### Canvas#toBuffer()

> ```ts
> canvas.toBuffer((err: Error|null, result: Buffer) => void, mimeType?: string, config?: any) => void
> canvas.toBuffer(mimeType?: string, config?: any) => Buffer
> ```

Creates a [`Buffer`](https://nodejs.org/api/buffer.html) object representing the image contained in the canvas.

* **callback** If provided, the buffer will be provided in the callback instead of being returned by the function. Invoked with an error as the first argument if encoding failed, or the resulting buffer as the second argument if it succeeded. Not supported for mimeType `raw` or for PDF or SVG canvases.
* **mimeType** A string indicating the image format. Valid options are `image/png`, `image/jpeg` (if node-canvas was built with JPEG support), `raw` (unencoded data in BGRA order on little-endian (most) systems, ARGB on big-endian systems; top-to-bottom), `application/pdf` (for PDF canvases) and `image/svg+xml` (for SVG canvases). Defaults to `image/png` for image canvases, or the corresponding type for PDF or SVG canvas.
* **config**
  * For `image/jpeg`, an object specifying the quality (0 to 1), if progressive compression should be used and/or if chroma subsampling should be used: `{quality: 0.75, progressive: false, chromaSubsampling: true}`. All properties are optional.

  * For `image/png`, an object specifying the ZLIB compression level (between 0 and 9), the compression filter(s), the palette (indexed PNGs only), the the background palette index (indexed PNGs only) and/or the resolution (ppi): `{compressionLevel: 6, filters: canvas.PNG_ALL_FILTERS, palette: undefined, backgroundIndex: 0, resolution: undefined}`. All properties are optional.

    Note that the PNG format encodes the resolution in pixels per meter, so if you specify `96`, the file will encode 3780 ppm (~96.01 ppi). The resolution is undefined by default to match common browser behavior.

  * For `application/pdf`, an object specifying optional document metadata: `{title: string, author: string, subject: string, keywords: string, creator: string, creationDate: Date, modDate: Date}`. All properties are optional and default to `undefined`, except for `creationDate`, which defaults to the current date. *Adding metadata requires Cairo 1.16.0 or later.*

    For a description of these properties, see page 550 of [PDF 32000-1:2008](https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/PDF32000_2008.pdf).

    Note that there is no standard separator for `keywords`. A space is recommended because it is in common use by other applications, and Cairo will enclose the list of keywords in quotes if a comma or semicolon is used.

**Return value**

If no callback is provided, a [`Buffer`](https://nodejs.org/api/buffer.html). If a callback is provided, none.

#### Examples

```js
// Default: buf contains a PNG-encoded image
const buf = canvas.toBuffer()

// PNG-encoded, zlib compression level 3 for faster compression but bigger files, no filtering
const buf2 = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE })

// JPEG-encoded, 50% quality
const buf3 = canvas.toBuffer('image/jpeg', { quality: 0.5 })

// Asynchronous PNG
canvas.toBuffer((err, buf) => {
  if (err) throw err // encoding failed
  // buf is PNG-encoded image
})

canvas.toBuffer((err, buf) => {
  if (err) throw err // encoding failed
  // buf is JPEG-encoded image at 95% quality
}, 'image/jpeg', { quality: 0.95 })

// BGRA pixel values, native-endian
const buf4 = canvas.toBuffer('raw')
const { stride, width } = canvas
// In memory, this is `canvas.height * canvas.stride` bytes long.
// The top row of pixels, in BGRA order on little-endian hardware,
// left-to-right, is:
const topPixelsBGRALeftToRight = buf4.slice(0, width * 4)
// And the third row is:
const row3 = buf4.slice(2 * stride, 2 * stride + width * 4)

// SVG and PDF canvases
const myCanvas = createCanvas(w, h, 'pdf')
myCanvas.toBuffer() // returns a buffer containing a PDF-encoded canvas
// With optional metadata:
myCanvas.toBuffer('application/pdf', {
  title: 'my picture',
  keywords: 'node.js demo cairo',
  creationDate: new Date()
})
```

### Canvas#createPNGStream()

> ```ts
> canvas.createPNGStream(config?: any) => ReadableStream
> ```

Creates a [`ReadableStream`](https://nodejs.org/api/stream.html#stream_class_stream_readable) that emits PNG-encoded data.

* `config` An object specifying the ZLIB compression level (between 0 and 9), the compression filter(s), the palette (indexed PNGs only) and/or the background palette index (indexed PNGs only): `{compressionLevel: 6, filters: canvas.PNG_ALL_FILTERS, palette: undefined, backgroundIndex: 0, resolution: undefined}`. All properties are optional.

#### Examples

```javascript
const fs = require('fs')
const out = fs.createWriteStream(__dirname + '/test.png')
const stream = canvas.createPNGStream()
stream.pipe(out)
out.on('finish', () =>  console.log('The PNG file was created.'))
```

To encode indexed PNGs from canvases with `pixelFormat: 'A8'` or `'A1'`, provide an options object:

```js
const palette = new Uint8ClampedArray([
  //r    g    b    a
    0,  50,  50, 255, // index 1
   10,  90,  90, 255, // index 2
  127, 127, 255, 255
  // ...
])
canvas.createPNGStream({
  palette: palette,
  backgroundIndex: 0 // optional, defaults to 0
})
```

### Canvas#createJPEGStream()

> ```ts
> canvas.createJPEGStream(config?: any) => ReadableStream
> ```

Creates a [`ReadableStream`](https://nodejs.org/api/stream.html#stream_class_stream_readable) that emits JPEG-encoded data.

*Note: At the moment, `createJPEGStream()` is synchronous under the hood. That is, it runs in the main thread, not in the libuv threadpool.*

* `config` an object specifying the quality (0 to 1), if progressive compression should be used and/or if chroma subsampling should be used: `{quality: 0.75, progressive: false, chromaSubsampling: true}`. All properties are optional.

#### Examples

```javascript
const fs = require('fs')
const out = fs.createWriteStream(__dirname + '/test.jpeg')
const stream = canvas.createJPEGStream()
stream.pipe(out)
out.on('finish', () =>  console.log('The JPEG file was created.'))

// Disable 2x2 chromaSubsampling for deeper colors and use a higher quality
const stream = canvas.createJPEGStream({
  quality: 0.95,
  chromaSubsampling: false
})
```

### Canvas#createPDFStream()

> ```ts
> canvas.createPDFStream(config?: any) => ReadableStream
> ```

* `config` an object specifying optional document metadata: `{title: string, author: string, subject: string, keywords: string, creator: string, creationDate: Date, modDate: Date}`. See `toBuffer()` for more information. *Adding metadata requires Cairo 1.16.0 or later.*

Applies to PDF canvases only. Creates a [`ReadableStream`](https://nodejs.org/api/stream.html#stream_class_stream_readable) that emits the encoded PDF. `canvas.toBuffer()` also produces an encoded PDF, but `createPDFStream()` can be used to reduce memory usage.

### Canvas#toDataURL()

This is a standard API, but several non-standard calls are supported. The full list of supported calls is:

```js
dataUrl = canvas.toDataURL() // defaults to PNG
dataUrl = canvas.toDataURL('image/png')
dataUrl = canvas.toDataURL('image/jpeg')
dataUrl = canvas.toDataURL('image/jpeg', quality) // quality from 0 to 1
canvas.toDataURL((err, png) => { }) // defaults to PNG
canvas.toDataURL('image/png', (err, png) => { })
canvas.toDataURL('image/jpeg', (err, jpeg) => { }) // sync JPEG is not supported
canvas.toDataURL('image/jpeg', {...opts}, (err, jpeg) => { }) // see Canvas#createJPEGStream for valid options
canvas.toDataURL('image/jpeg', quality, (err, jpeg) => { }) // spec-following; quality from 0 to 1
```

### CanvasRenderingContext2D#patternQuality

> ```ts
> context.patternQuality: 'fast'|'good'|'best'|'nearest'|'bilinear'
> ```

Defaults to `'good'`. Affects pattern (gradient, image, etc.) rendering quality.

### CanvasRenderingContext2D#quality

> ```ts
> context.quality: 'fast'|'good'|'best'|'nearest'|'bilinear'
> ```

Defaults to `'good'`. Like `patternQuality`, but applies to transformations affecting more than just patterns.

### CanvasRenderingContext2D#textDrawingMode

> ```ts
> context.textDrawingMode: 'path'|'glyph'
> ```

Defaults to `'path'`. The effect depends on the canvas type:

* **Standard (image)** `glyph` and `path` both result in rasterized text. Glyph mode is faster than `path`, but may result in lower-quality text, especially when rotated or translated.

* **PDF** `glyph` will embed text instead of paths into the PDF. This is faster to encode, faster to open with PDF viewers, yields a smaller file size and makes the text selectable. The subset of the font needed to render the glyphs will be embedded in the PDF. This is usually the mode you want to use with PDF canvases.

* **SVG** `glyph` does *not* cause `<text>` elements to be produced as one might expect ([cairo bug](https://gitlab.freedesktop.org/cairo/cairo/issues/253)). Rather, `glyph` will create a `<defs>` section with a `<symbol>` for each glyph, then those glyphs be reused via `<use>` elements. `path` mode creates a `<path>` element for each text string. `glyph` mode is faster and yields a smaller file size.

In `glyph` mode, `ctx.strokeText()` and `ctx.fillText()` behave the same (aside from using the stroke and fill style, respectively).

This property is tracked as part of the canvas state in save/restore.

### CanvasRenderingContext2D#globalCompositeOperation = 'saturate'

In addition to all of the standard global composite operations defined by the Canvas specification, the ['saturate'](https://www.cairographics.org/operators/#saturate) operation is also available.

### CanvasRenderingContext2D#antialias

> ```ts
> context.antialias: 'default'|'none'|'gray'|'subpixel'
> ```

Sets the anti-aliasing mode.

## PDF Output Support

node-canvas can create PDF documents instead of images. The canvas type must be set when creating the canvas as follows:

```js
const canvas = createCanvas(200, 500, 'pdf')
```

An additional method `.addPage()` is then available to create multiple page PDFs:

```js
// On first page
ctx.font = '22px Helvetica'
ctx.fillText('Hello World', 50, 80)

ctx.addPage()
// Now on second page
ctx.font = '22px Helvetica'
ctx.fillText('Hello World 2', 50, 80)

canvas.toBuffer() // returns a PDF file
canvas.createPDFStream() // returns a ReadableStream that emits a PDF
// With optional document metadata (requires Cairo 1.16.0):
canvas.toBuffer('application/pdf', {
  title: 'my picture',
  keywords: 'node.js demo cairo',
  creationDate: new Date()
})
```

It is also possible to create pages with different sizes by passing `width` and `height` to the `.addPage()` method:

```js
ctx.font = '22px Helvetica'
ctx.fillText('Hello World', 50, 80)
ctx.addPage(400, 800)

ctx.fillText('Hello World 2', 50, 80)
```

See also:

* [Image#dataMode](#imagedatamode) for embedding JPEGs in PDFs
* [Canvas#createPDFStream()](#canvascreatepdfstream) for creating PDF streams
* [CanvasRenderingContext2D#textDrawingMode](#canvasrenderingcontext2dtextdrawingmode)
  for embedding text instead of paths

## SVG Output Support

node-canvas can create SVG documents instead of images. The canvas type must be set when creating the canvas as follows:

```js
const canvas = createCanvas(200, 500, 'svg')
// Use the normal primitives.
fs.writeFileSync('out.svg', canvas.toBuffer())
```

## SVG Image Support

If librsvg is available when node-canvas is installed, node-canvas can render SVG images to your canvas context. This currently works by rasterizing the SVG image (i.e. drawing an SVG image to an SVG canvas will not preserve the SVG data).

```js
const img = new Image()
img.onload = () => ctx.drawImage(img, 0, 0)
img.onerror = err => { throw err }
img.src = './example.svg'
```

## Image pixel formats (experimental)

node-canvas has experimental support for additional pixel formats, roughly following the [Canvas color space proposal](https://github.com/WICG/canvas-color-space/blob/master/CanvasColorSpaceProposal.md).

```js
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d', { pixelFormat: 'A8' })
```

By default, canvases are created in the `RGBA32` format, which corresponds to the native HTML Canvas behavior. Each pixel is 32 bits. The JavaScript APIs that involve pixel data (`getImageData`, `putImageData`) store the colors in the order {red, green, blue, alpha} without alpha pre-multiplication. (The C++ API stores the colors in the order {alpha, red, green, blue} in native-[endian](https://en.wikipedia.org/wiki/Endianness) ordering, with alpha pre-multiplication.)

These additional pixel formats have experimental support:

* `RGB24` Like `RGBA32`, but the 8 alpha bits are always opaque. This format is always used if the `alpha` context attribute is set to false (i.e. `canvas.getContext('2d', {alpha: false})`). This format can be faster than `RGBA32` because transparency does not need to be calculated.
* `A8` Each pixel is 8 bits. This format can either be used for creating grayscale images (treating each byte as an alpha value), or for creating indexed PNGs (treating each byte as a palette index) (see [the example using alpha values with `fillStyle`](examples/indexed-png-alpha.js) and [the example using `imageData`](examples/indexed-png-image-data.js)).
* `RGB16_565` Each pixel is 16 bits, with red in the upper 5 bits, green in the middle 6 bits, and blue in the lower 5 bits, in native platform endianness. Some hardware devices and frame buffers use this format. Note that PNG does not support this format; when creating a PNG, the image will be converted to 24-bit RGB. This format is thus suboptimal for generating PNGs. `ImageData` instances for this mode use a `Uint16Array` instead of a `Uint8ClampedArray`.
* `A1` Each pixel is 1 bit, and pixels are packed together into 32-bit quantities. The ordering of the bits matches the endianness of the
  platform: on a little-endian machine, the first pixel is the least-significant bit. This format can be used for creating single-color images. *Support for this format is incomplete, see note below.*
* `RGB30` Each pixel is 30 bits, with red in the upper 10, green in the middle 10, and blue in the lower 10. (Requires Cairo 1.12 or later.) *Support for this format is incomplete, see note below.*

Notes and caveats:

* Using a non-default format can affect the behavior of APIs that involve pixel data:

  * `context2d.createImageData` The size of the array returned depends on the number of bit per pixel for the underlying image data format, per the above descriptions.
  * `context2d.getImageData` The format of the array returned depends on the underlying image mode, per the above descriptions. Be aware of platform endianness, which can be determined using node.js's [`os.endianness()`](https://nodejs.org/api/os.html#os_os_endianness)
    function.
  * `context2d.putImageData` As above.

* `A1` and `RGB30` do not yet support `getImageData` or `putImageData`. Have a use case and/or opinion on working with these formats? Open an issue and let us know! (See #935.)

* `A1`, `A8`, `RGB30` and `RGB16_565` with shadow blurs may crash or not render properly.

* The `ImageData(width, height)` and `ImageData(Uint8ClampedArray, width)` constructors assume 4 bytes per pixel. To create an `ImageData` instance with a different number of bytes per pixel, use `new ImageData(new Uint8ClampedArray(size), width, height)` or `new ImageData(new Uint16ClampedArray(size), width, height)`.

## Testing

First make sure you've built the latest version. Get all the deps you need (see [compiling](#compiling) above), and run:

```
npm install --build-from-source
```

For visual tests: `npm run test-server` and point your browser to http://localhost:4000.

For unit tests: `npm run test`.

## Benchmarks

Benchmarks live in the `benchmarks` directory.

## Examples

Examples line in the `examples` directory. Most produce a png image of the same name, and others such as *live-clock.js* launch an HTTP server to be viewed in the browser.

## Original Authors

  - TJ Holowaychuk ([tj](http://github.com/tj))
  - Nathan Rajlich ([TooTallNate](http://github.com/TooTallNate))
  - Rod Vagg ([rvagg](http://github.com/rvagg))
  - Juriy Zaytsev ([kangax](http://github.com/kangax))

## License

### node-canvas

(The MIT License)

Copyright (c) 2010 LearnBoost, and contributors &lt;dev@learnboost.com&gt;

Copyright (c) 2014 Automattic, Inc and contributors &lt;dev@automattic.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### BMP parser

See [license](src/bmp/LICENSE.md)
