import { Graphics, Rectangle, type Renderer, type Container } from "pixi.js";

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

/**
 * Clamps a number between a min and max value.
 * @param n The number to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped number.
 */
export function clamp(n: number, min: number, max: number): number {
	return n < min ? min : n > max ? max : n;
}

/**
 * Generates a blob from a pixi object.s
 * @param renderer The pixi renderer.
 * @param obj The pixi object to generate a blob from.
 * @param bounds The bounds of the canvas that we wish to extract
 * @param width The full width of the canvas
 * @param height The full height of the canvas
 * @returns A promise with the blob.
 */
export function get_canvas_blob(
	renderer: Renderer,
	obj: Container | null,
	bounds?: { x: number; y: number; width: number; height: number }
): Promise<Blob | null> {
	return new Promise((resolve) => {
		if (!obj) {
			resolve(null);
			return;
		}

		const image_bounds = obj.getLocalBounds();
		const frame = bounds
			? new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height)
			: new Rectangle(0, 0, image_bounds.width, image_bounds.height);

		const src_canvas = renderer.extract.canvas({
			target: obj,
			resolution: 1,
			frame
		});

		src_canvas.toBlob?.((blob) => {
			if (!blob) {
				resolve(null);
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
