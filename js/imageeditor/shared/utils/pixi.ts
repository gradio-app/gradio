import {
	Application,
	Container,
	Graphics,
	Sprite,
	Rectangle,
	RenderTexture,
	type IRenderer,
	type DisplayObject,
	type ICanvas
} from "pixi.js";

import { type LayerScene } from "../layers/utils";

/**
 * interface holding references to pixi app components
 */
export interface PixiApp {
	/**
	 * The pixi container for layers
	 */
	layer_container: Container;
	/**
	 * The pixi container for background images and colors
	 */
	background_container: Container;
	/**
	 * The pixi renderer
	 */
	renderer: IRenderer;
	/**
	 * The pixi canvas
	 */
	view: HTMLCanvasElement & ICanvas;
	/**
	 * The pixi container for masking
	 */
	mask_container: Container;
	destroy(): void;
	/**
	 * Resizes the pixi app
	 * @param width the new width
	 * @param height the new height
	 */
	resize(width: number, height: number): void;
	/**
	 * Gets the blobs for the background, layers, and composite
	 * @param bounds the bounds of the canvas
	 * @returns a promise with the blobs
	 */
	get_blobs(layers: LayerScene[], bounds: Rectangle): Promise<ImageBlobs>;
	/**
	 * Resets the mask
	 */
	reset?: () => void;

	/**
	 * Gets the layers
	 */
	get_layers?: () => LayerScene[];
}

/**
 * Creates a PIXI app and attaches it to a DOM element
 * @param target DOM element to attach PIXI app to
 * @param width Width of the PIXI app
 * @param height Height of the PIXI app
 * @param antialias Whether to use antialiasing
 * @returns object with pixi container and renderer
 */
export function create_pixi_app(
	target: HTMLElement,
	width: number,
	height: number,
	antialias: boolean
): PixiApp {
	const ratio = window.devicePixelRatio || 1;
	const app = new Application({
		width,
		height,
		antialias: antialias,
		backgroundAlpha: 0,
		eventMode: "static"
	});
	const view = app.view as HTMLCanvasElement;
	// ensure that we can sort the background and layer containers
	app.stage.sortableChildren = true;
	view.style.maxWidth = `${width / ratio}px`;
	view.style.maxHeight = `${height / ratio}px`;
	view.style.width = "100%";
	view.style.height = "100%";

	target.appendChild(app.view as HTMLCanvasElement);

	// we need a separate container for the background so that we can
	// clear its content without knowing too much about its children
	const background_container = new Container() as Container & DisplayObject;
	background_container.zIndex = 0;
	const layer_container = new Container() as Container & DisplayObject;
	layer_container.zIndex = 1;

	// ensure we can reorder  layers via zIndex
	layer_container.sortableChildren = true;

	const mask_container = new Container() as Container & DisplayObject;
	mask_container.zIndex = 1;
	const composite_container = new Container() as Container & DisplayObject;
	composite_container.zIndex = 0;

	mask_container.addChild(background_container);
	mask_container.addChild(layer_container);

	app.stage.addChild(mask_container);
	app.stage.addChild(composite_container);
	const mask = new Graphics();
	let text = RenderTexture.create({
		width,
		height
	});
	const sprite = new Sprite(text);

	mask_container.mask = sprite;

	app.render();

	function reset_mask(width: number, height: number): void {
		mask.beginFill(0xffffff, 1);
		mask.drawRect(0, 0, width, height);
		mask.endFill();
		text = RenderTexture.create({
			width,
			height
		});
		app.renderer.render(mask, {
			renderTexture: text
		});

		const sprite = new Sprite(text);

		mask_container.mask = sprite;
	}

	function resize(width: number, height: number): void {
		app.renderer.resize(width, height);
		view.style.maxWidth = `${width / ratio}px`;
		view.style.maxHeight = `${height / ratio}px`;
		reset_mask(width, height);
	}

	async function get_blobs(
		_layers: LayerScene[],
		bounds: Rectangle
	): Promise<ImageBlobs> {
		const background = await get_canvas_blob(app, background_container, bounds);
		console.log(_layers, background_container);
		const layers = await Promise.all(
			_layers.map((layer) =>
				get_canvas_blob(app, layer.composite as DisplayObject, bounds)
			)
		);
		const composite = await get_canvas_blob(app, mask_container, bounds);
		console.log(composite, mask_container);

		// const background = app.renderer.plugins.extract.pixels(background_container);
		return {
			background,
			layers,
			composite
		};
	}

	return {
		layer_container,
		renderer: app.renderer,
		destroy: app.destroy,
		view: app.view as HTMLCanvasElement & ICanvas,
		background_container,
		mask_container,
		resize,
		get_blobs
	};
}

/**
 * Creates a pixi graphics object.
 * @param z_index the z index of the graphics object
 * @returns a graphics object
 */
export function make_graphics(z_index: number): Graphics {
	const graphics = new Graphics();
	graphics.eventMode = "none";
	graphics.zIndex = z_index;

	return graphics;
}

export function clamp(n: number, min: number, max: number): number {
	return n < min ? min : n > max ? max : n;
}

function get_canvas_blob(
	app: Application,
	obj: DisplayObject,
	bounds: Rectangle
): Promise<Blob> {
	console.log(bounds, obj);
	return new Promise((resolve) => {
		app.renderer.extract.canvas(obj, bounds).toBlob?.((blob) => {
			if (!blob) {
				throw new Error("Could not create blob");
			}
			resolve(blob);
		});
	});
}

export interface ImageBlobs {
	background: Blob | null;
	layers: (Blob | null)[];
	composite: Blob | null;
}
