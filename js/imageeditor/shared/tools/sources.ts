import {
	type Container,
	type IRenderer,
	Sprite,
	Texture,
	DisplayObject,
	type ColorSource,
	Color,
	RenderTexture
} from "pixi.js";

import { type Command } from "../utils/commands";
import { make_graphics } from "../utils/pixi";

interface BgImageCommand extends Command {
	/**
	 * Initial setup for the bg command
	 * @returns
	 */
	start: () => Promise<[number, number]>;
}

/**
 * Calculates new dimensions and position for an image to fit within a canvas while maintaining aspect ratio
 * @param image_width Original width of the image
 * @param image_height Original height of the image
 * @param canvas_width Width of the canvas
 * @param canvas_height Height of the canvas
 * @returns Object containing new dimensions and position
 */
export function fit_image_to_canvas(
	image_width: number,
	image_height: number,
	canvas_width: number,
	canvas_height: number
): {
	width: number;
	height: number;
	x: number;
	y: number;
} {
	const image_aspect_ratio = image_width / image_height;
	const canvas_aspect_ratio = canvas_width / canvas_height;

	let new_width: number;
	let new_height: number;

	if (image_width <= canvas_width && image_height <= canvas_height) {
		new_width = image_width;
		new_height = image_height;
	} else {
		if (image_aspect_ratio > canvas_aspect_ratio) {
			// Width is the limiting factor
			new_width = canvas_width;
			new_height = canvas_width / image_aspect_ratio;
		} else {
			// Height is the limiting factor
			new_height = canvas_height;
			new_width = canvas_height * image_aspect_ratio;
		}
	}

	// Calculate position to center the image
	const x = Math.round((canvas_width - new_width) / 2);
	const y = Math.round((canvas_height - new_height) / 2);

	return {
		width: Math.round(new_width),
		height: Math.round(new_height),
		x,
		y
	};
}

export function add_bg_image(
	container: Container,
	renderer: IRenderer,
	background: Blob | File,
	resize: (width: number, height: number) => void,
	canvas_size: [number, number],
	fixed_canvas: boolean
): BgImageCommand {
	let sprite: Sprite & DisplayObject;

	return {
		async start() {
			container.removeChildren();
			const img = await createImageBitmap(background);
			const bitmap_texture = Texture.from(img);
			sprite = new Sprite(bitmap_texture) as Sprite & DisplayObject;
			if (!fixed_canvas) {
				canvas_size = [sprite.width, sprite.height];
			}

			if (fixed_canvas) {
				const [canvas_width, canvas_height] = canvas_size;
				const { width, height, x, y } = fit_image_to_canvas(
					sprite.width,
					sprite.height,
					canvas_width,
					canvas_height
				);

				sprite.width = width;
				sprite.height = height;
				sprite.x = x;
				sprite.y = y;

				return canvas_size;
			}
			// Use existing max_height based scaling if no canvas_size
			const x = fit_image_to_canvas(
				sprite.width,
				sprite.height,
				canvas_size[0],
				canvas_size[1]
			);
			sprite.width = x.width;
			sprite.height = x.height;
			sprite.x = 0;
			sprite.y = 0;
			return [x.width, x.height];
		},
		async execute() {
			resize(
				// @ts-ignore
				fixed_canvas ? canvas_size[0] : sprite.width,
				// @ts-ignore
				fixed_canvas ? canvas_size[1] : sprite.height
			);

			sprite.zIndex = 0;
			container.addChild(sprite);
		},
		undo() {
			container.removeChildAt(0);
		}
	};
}

/**
 * Command that sets a background
 */
interface BgColorCommand extends Command {
	/**
	 * Initial setup for the bg command
	 * @returns
	 */
	start: () => [number, number];
}

/**
 * Adds a background color to the canvas.
 * @param container The container to add the image to.
 * @param renderer The renderer to use for the image.
 * @param color The background color to add.
 * @param width The width of the background.
 * @param height The height of the background.
 * @param resize The function to resize the canvas.
 * @returns A command that can be used to undo the action.
 */
export function add_bg_color(
	container: Container,
	renderer: IRenderer,
	color: ColorSource,
	width: number,
	height: number,
	resize: (width: number, height: number) => void
): BgColorCommand {
	let sprite: Sprite & DisplayObject;
	return {
		start() {
			container.removeChildren();
			const graphics = make_graphics(1);
			const texture = RenderTexture.create({
				width,
				height
			});
			graphics.beginFill(new Color(color));
			graphics.drawRect(0, 0, width, height);
			graphics.endFill();
			renderer.render(graphics, { renderTexture: texture });
			sprite = new Sprite(texture) as Sprite & DisplayObject;
			return [sprite.width, sprite.height];
		},
		async execute() {
			resize(sprite.width, sprite.height);
			sprite.zIndex = 1;
			container.addChild(sprite);
		},
		undo() {
			container.removeChildren();
		}
	};
}
