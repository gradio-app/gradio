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
 * Adds a background image to the canvas.
 * @param container The container to add the image to.
 * @param renderer The renderer to use for the image.
 * @param background The background image to add.
 * @param resize The function to resize the canvas.
 * @returns A command that can be used to undo the action.
 */

export function add_bg_image(
	container: Container,
	renderer: IRenderer,
	background: Blob | File,
	resize: (width: number, height: number) => void,
	max_height = 450
): BgImageCommand {
	let sprite: Sprite & DisplayObject;

	function calculate_dimensions(
		width: number,
		height: number,
		max_height: number
	): [number, number] {
		const MAX_HEIGHT = max_height * 1.5;
		const MAX_WIDTH = MAX_HEIGHT * 2;

		let new_width = width;
		let new_height = height;

		if (height > MAX_HEIGHT) {
			const ratio = MAX_HEIGHT / height;
			new_width = width * ratio;
			new_height = MAX_HEIGHT;
		}

		if (new_width > MAX_WIDTH) {
			const ratio = MAX_WIDTH / new_width;
			new_width = MAX_WIDTH;
			new_height = new_height * ratio;
		}

		return [Math.round(new_width), Math.round(new_height)];
	}

	return {
		async start() {
			container.removeChildren();
			const img = await createImageBitmap(background);
			const bitmap_texture = Texture.from(img);
			sprite = new Sprite(bitmap_texture) as Sprite & DisplayObject;

			const [new_width, new_height] = calculate_dimensions(
				sprite.width,
				sprite.height,
				max_height
			);
			sprite.width = new_width;
			sprite.height = new_height;

			return [new_width, new_height];
		},
		async execute() {
			// renderer.resize(sprite.width, sprite.height);
			resize(sprite.width, sprite.height);

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
