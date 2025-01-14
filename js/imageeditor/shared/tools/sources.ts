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
 * @param imageWidth Original width of the image
 * @param imageHeight Original height of the image
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @returns Object containing new dimensions and position
 */
export function fitImageToCanvas(
	imageWidth: number,
	imageHeight: number,
	canvasWidth: number,
	canvasHeight: number
): {
	width: number;
	height: number;
	x: number;
	y: number;
} {
	// Calculate aspect ratios
	const imageAspectRatio = imageWidth / imageHeight;
	const canvasAspectRatio = canvasWidth / canvasHeight;

	let newWidth: number;
	let newHeight: number;

	// If image is smaller than canvas in both dimensions
	if (imageWidth <= canvasWidth && imageHeight <= canvasHeight) {
		newWidth = imageWidth;
		newHeight = imageHeight;
	}
	// If image needs to be scaled down
	else {
		if (imageAspectRatio > canvasAspectRatio) {
			// Width is the limiting factor
			newWidth = canvasWidth;
			newHeight = canvasWidth / imageAspectRatio;
		} else {
			// Height is the limiting factor
			newHeight = canvasHeight;
			newWidth = canvasHeight * imageAspectRatio;
		}
	}

	// Calculate position to center the image
	const x = Math.round((canvasWidth - newWidth) / 2);
	const y = Math.round((canvasHeight - newHeight) / 2);

	return {
		width: Math.round(newWidth),
		height: Math.round(newHeight),
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

			if (fixed_canvas) {
				// If canvas_size is provided, fit the image within those dimensions
				const [canvasWidth, canvasHeight] = canvas_size;
				const { width, height, x, y } = fitImageToCanvas(
					sprite.width,
					sprite.height,
					canvasWidth,
					canvasHeight
				);

				sprite.width = width;
				sprite.height = height;
				sprite.x = x;
				sprite.y = y;

				return canvas_size;
			}
			// Use existing max_height based scaling if no canvas_size
			const x = fitImageToCanvas(
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
				fixed_canvas ? canvas_size[0] : sprite.width,
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
