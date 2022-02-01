// TypeScript Version: 3.0
/// <reference lib="dom" />

import { Readable } from 'stream'

export interface PngConfig {
	/** Specifies the ZLIB compression level. Defaults to 6. */
	compressionLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
	/**
	 * Any bitwise combination of `PNG_FILTER_NONE`, `PNG_FITLER_SUB`,
	 * `PNG_FILTER_UP`, `PNG_FILTER_AVG` and `PNG_FILTER_PATETH`; or one of
	 * `PNG_ALL_FILTERS` or `PNG_NO_FILTERS` (all are properties of the canvas
	 * instance). These specify which filters *may* be used by libpng. During
	 * encoding, libpng will select the best filter from this list of allowed
	 * filters. Defaults to `canvas.PNG_ALL_FITLERS`.
	 */
	filters?: number
	/**
	 * _For creating indexed PNGs._ The palette of colors. Entries should be in
	 * RGBA order.
	 */
	palette?: Uint8ClampedArray
	/**
	 * _For creating indexed PNGs._ The index of the background color. Defaults
	 * to 0.
	 */
	backgroundIndex?: number
	/** pixels per inch */
	resolution?: number
}

export interface JpegConfig {
	/** Specifies the quality, between 0 and 1. Defaults to 0.75. */
	quality?: number
	/** Enables progressive encoding. Defaults to `false`. */
	progressive?: boolean
	/** Enables 2x2 chroma subsampling. Defaults to `true`. */
	chromaSubsampling?: boolean
}

export interface PdfConfig {
	title?: string
	author?: string
	subject?: string
	keywords?: string
	creator?: string
	creationDate?: Date
	modDate?: Date
}

export interface NodeCanvasRenderingContext2DSettings {
	alpha?: boolean
	pixelFormat?: 'RGBA32' | 'RGB24' | 'A8' | 'RGB16_565' | 'A1' | 'RGB30'
}

export class Canvas {
	width: number
	height: number

	/** _Non standard._ The type of the canvas. */
	readonly type: 'image'|'pdf'|'svg'

	/** _Non standard._ Getter. The stride used by the canvas. */
	readonly stride: number;

	/** Constant used in PNG encoding methods. */
	readonly PNG_NO_FILTERS: number
	/** Constant used in PNG encoding methods. */
	readonly PNG_ALL_FILTERS: number
	/** Constant used in PNG encoding methods. */
	readonly PNG_FILTER_NONE: number
	/** Constant used in PNG encoding methods. */
	readonly PNG_FILTER_SUB: number
	/** Constant used in PNG encoding methods. */
	readonly PNG_FILTER_UP: number
	/** Constant used in PNG encoding methods. */
	readonly PNG_FILTER_AVG: number
	/** Constant used in PNG encoding methods. */
	readonly PNG_FILTER_PAETH: number

	constructor(width: number, height: number, type?: 'image'|'pdf'|'svg')

	getContext(contextId: '2d', contextAttributes?: NodeCanvasRenderingContext2DSettings): NodeCanvasRenderingContext2D

	/**
	 * For image canvases, encodes the canvas as a PNG. For PDF canvases,
	 * encodes the canvas as a PDF. For SVG canvases, encodes the canvas as an
	 * SVG.
	 */
	toBuffer(cb: (err: Error|null, result: Buffer) => void): void
	toBuffer(cb: (err: Error|null, result: Buffer) => void, mimeType: 'image/png', config?: PngConfig): void
	toBuffer(cb: (err: Error|null, result: Buffer) => void, mimeType: 'image/jpeg', config?: JpegConfig): void

	/**
	 * For image canvases, encodes the canvas as a PNG. For PDF canvases,
	 * encodes the canvas as a PDF. For SVG canvases, encodes the canvas as an
	 * SVG.
	 */
	toBuffer(): Buffer
	toBuffer(mimeType: 'image/png', config?: PngConfig): Buffer
	toBuffer(mimeType: 'image/jpeg', config?: JpegConfig): Buffer
	toBuffer(mimeType: 'application/pdf', config?: PdfConfig): Buffer

	/**
	 * Returns the unencoded pixel data, top-to-bottom. On little-endian (most)
	 * systems, the array will be ordered BGRA; on big-endian systems, it will
	 * be ARGB.
	 */
	toBuffer(mimeType: 'raw'): Buffer

	createPNGStream(config?: PngConfig): PNGStream
	createJPEGStream(config?: JpegConfig): JPEGStream
	createPDFStream(config?: PdfConfig): PDFStream

	/** Defaults to PNG image. */
	toDataURL(): string
	toDataURL(mimeType: 'image/png'): string
	toDataURL(mimeType: 'image/jpeg', quality?: number): string
	/** _Non-standard._ Defaults to PNG image. */
	toDataURL(cb: (err: Error|null, result: string) => void): void
	/** _Non-standard._ */
	toDataURL(mimeType: 'image/png', cb: (err: Error|null, result: string) => void): void
	/** _Non-standard._ */
	toDataURL(mimeType: 'image/jpeg', cb: (err: Error|null, result: string) => void): void
	/** _Non-standard._ */
	toDataURL(mimeType: 'image/jpeg', config: JpegConfig, cb: (err: Error|null, result: string) => void): void
	/** _Non-standard._ */
	toDataURL(mimeType: 'image/jpeg', quality: number, cb: (err: Error|null, result: string) => void): void
}

declare class NodeCanvasRenderingContext2D extends CanvasRenderingContext2D {
	/**
	 * _Non-standard_. Defaults to 'good'. Affects pattern (gradient, image,
	 * etc.) rendering quality.
	 */
	patternQuality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'

	/**
	 * _Non-standard_. Defaults to 'good'. Like `patternQuality`, but applies to
	 * transformations affecting more than just patterns.
	 */
	quality: 'fast' | 'good' | 'best' | 'nearest' | 'bilinear'

	/**
	 * Defaults to 'path'. The effect depends on the canvas type:
	 *
	 * * **Standard (image)** `'glyph'` and `'path'` both result in rasterized
	 *   text. Glyph mode is faster than path, but may result in lower-quality
	 *   text, especially when rotated or translated.
	 *
	 * * **PDF** `'glyph'` will embed text instead of paths into the PDF. This
	 *   is faster to encode, faster to open with PDF viewers, yields a smaller
	 *   file size and makes the text selectable. The subset of the font needed
	 *   to render the glyphs will be embedded in the PDF. This is usually the
	 *   mode you want to use with PDF canvases.
	 *
	 * * **SVG** glyph does not cause `<text>` elements to be produced as one
	 *   might expect ([cairo bug](https://gitlab.freedesktop.org/cairo/cairo/issues/253)).
	 *   Rather, glyph will create a `<defs>` section with a `<symbol>` for each
	 *   glyph, then those glyphs be reused via `<use>` elements. `'path'` mode
	 *   creates a `<path>` element for each text string. glyph mode is faster
	 *   and yields a smaller file size.
	 *
	 * In glyph mode, `ctx.strokeText()` and `ctx.fillText()` behave the same
	 * (aside from using the stroke and fill style, respectively).
	 */
	textDrawingMode: 'path' | 'glyph'

	/** _'saturate' is non-standard._ */
	globalCompositeOperation: 'saturate' | 'clear' | 'copy' | 'destination' | 'source-over' | 'destination-over' |
		'source-in' | 'destination-in' | 'source-out' | 'destination-out' | 'source-atop' | 'destination-atop' |
		'xor' | 'lighter' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' |
		'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'

	/** _Non-standard_. Sets the antialiasing mode. */
	antialias: 'default' | 'gray' | 'none' | 'subpixel'

	// Standard, but not in the TS lib and needs node-canvas class return type.
	/** Returns or sets a `DOMMatrix` for the current transformation matrix. */
	currentTransform: NodeCanvasDOMMatrix

	// Standard, but need node-canvas class versions:
	getTransform(): NodeCanvasDOMMatrix
	setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void
	setTransform(transform?: NodeCanvasDOMMatrix): void
	createImageData(sw: number, sh: number): NodeCanvasImageData
	createImageData(imagedata: NodeCanvasImageData): NodeCanvasImageData
	getImageData(sx: number, sy: number, sw: number, sh: number): NodeCanvasImageData
	putImageData(imagedata: NodeCanvasImageData, dx: number, dy: number): void
	putImageData(imagedata: NodeCanvasImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void
	drawImage(image: Canvas|Image, dx: number, dy: number): void
	drawImage(image: Canvas|Image, dx: number, dy: number, dw: number, dh: number): void
	drawImage(image: Canvas|Image, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void
	/**
	 * **Do not use this overload. Use one of the other three overloads.** This
	 * is a catch-all definition required for compatibility with the base
	 * `CanvasRenderingContext2D` interface.
	 */
	drawImage(...args: any[]): void
	createPattern(image: Canvas|Image, repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | '' | null): NodeCanvasCanvasPattern
	/**
	 * **Do not use this overload. Use the other three overload.** This is a
	 * catch-all definition required for compatibility with the base
	 * `CanvasRenderingContext2D` interface.
	 */
	createPattern(...args: any[]): NodeCanvasCanvasPattern
	createLinearGradient(x0: number, y0: number, x1: number, y1: number): NodeCanvasCanvasGradient;
	createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): NodeCanvasCanvasGradient;

	/**
	 * For PDF canvases, adds another page. If width and/or height are omitted,
	 * the canvas's initial size is used.
	 */
	addPage(width?: number, height?: number): void
}
export { NodeCanvasRenderingContext2D as CanvasRenderingContext2D }

declare class NodeCanvasCanvasGradient extends CanvasGradient {}
export { NodeCanvasCanvasGradient as CanvasGradient }

declare class NodeCanvasCanvasPattern extends CanvasPattern {}
export { NodeCanvasCanvasPattern as CanvasPattern }

// This does not extend HTMLImageElement because there are dozens of inherited
// methods and properties that we do not provide.
export class Image {
	/** Track image data */
	static readonly MODE_IMAGE: number
	/** Track MIME data */
	static readonly MODE_MIME: number

	/**
	 * The URL, `data:` URI or local file path of the image to be loaded, or a
	 * Buffer instance containing an encoded image.
	 */
	src: string | Buffer
	/** Retrieves whether the object is fully loaded. */
	readonly complete: boolean
	/** Sets or retrieves the height of the image. */
	height: number
	/** Sets or retrieves the width of the image. */
	width: number

	/** The original height of the image resource before sizing. */
	readonly naturalHeight: number
	/** The original width of the image resource before sizing. */
	readonly naturalWidth: number
	/**
	 * Applies to JPEG images drawn to PDF canvases only. Setting
	 * `img.dataMode = Image.MODE_MIME` or `Image.MODE_MIME|Image.MODE_IMAGE`
	 * enables image MIME data tracking. When MIME data is tracked, PDF canvases
	 * can embed JPEGs directly into the output, rather than re-encoding into
	 * PNG. This can drastically reduce filesize and speed up rendering.
	 */
	dataMode: number

	onload: (() => void) | null;
	onerror: ((err: Error) => void) | null;
}

/**
 * Creates a Canvas instance. This function works in both Node.js and Web
 * browsers, where there is no Canvas constructor.
 * @param type Optionally specify to create a PDF or SVG canvas. Defaults to an
 * image canvas.
 */
export function createCanvas(width: number, height: number, type?: 'pdf'|'svg'): Canvas

/**
 * Creates an ImageData instance. This function works in both Node.js and Web
 * browsers.
 * @param data An array containing the pixel representation of the image.
 * @param height If omitted, the height is calculated based on the array's size
 * and `width`.
 */
export function createImageData(data: Uint8ClampedArray, width: number, height?: number): ImageData
/**
 * _Non-standard._ Creates an ImageData instance for an alternative pixel
 * format, such as RGB16_565
 * @param data An array containing the pixel representation of the image.
 * @param height If omitted, the height is calculated based on the array's size
 * and `width`.
 */
export function createImageData(data: Uint16Array, width: number, height?: number): ImageData
/**
 * Creates an ImageData instance. This function works in both Node.js and Web
 * browsers.
 */
export function createImageData(width: number, height: number): ImageData

/**
 * Convenience function for loading an image with a Promise interface. This
 * function works in both Node.js and Web browsers; however, the `src` must be
 * a string in Web browsers (it can only be a Buffer in Node.js).
 * @param src URL, `data: ` URI or (Node.js only) a local file path or Buffer
 * instance.
 */
export function loadImage(src: string|Buffer, options?: any): Promise<Image>

/**
 * Registers a font that is not installed as a system font. This must be used
 * before creating Canvas instances.
 * @param path Path to local font file.
 * @param fontFace Description of the font face, corresponding to CSS properties
 * used in `@font-face` rules.
 */
export function registerFont(path: string, fontFace: {family: string, weight?: string, style?: string}): void

/** This class must not be constructed directly; use `canvas.createPNGStream()`. */
export class PNGStream extends Readable {}
/** This class must not be constructed directly; use `canvas.createJPEGStream()`. */
export class JPEGStream extends Readable {}
/** This class must not be constructed directly; use `canvas.createPDFStream()`. */
export class PDFStream extends Readable {}

declare class NodeCanvasDOMMatrix extends DOMMatrix {}
export { NodeCanvasDOMMatrix as DOMMatrix }

declare class NodeCanvasDOMPoint extends DOMPoint {}
export { NodeCanvasDOMPoint as DOMPoint }

declare class NodeCanvasImageData extends ImageData {}
export { NodeCanvasImageData as ImageData }

// This is marked private, but is exported...
// export function parseFont(description: string): object

// Not documented: backends

/** Library version. */
export const version: string
/** Cairo version. */
export const cairoVersion: string
/** jpeglib version, if built with JPEG support. */
export const jpegVersion: string | undefined
/** giflib version, if built with GIF support. */
export const gifVersion: string | undefined
/** freetype version. */
export const freetypeVersion: string
/** rsvg version. */
export const rsvgVersion: string | undefined
