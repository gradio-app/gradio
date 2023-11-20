import {
	Container,
	Graphics,
	Color,
	type ColorSource,
	type IRenderer,
	RenderTexture,
	Sprite
} from "pixi.js";

import type { LayerScene } from "../layers/utils";
import { type Command } from "../utils/commands";
import { make_graphics } from "../utils/pixi";

export interface DrawCommand extends Command {
	/**
	 * sets the initial state to begin drawing
	 * @param options the options for drawing
	 * @returns
	 */
	start: (options: DrawOptions) => void;
	/**
	 * continues drawing, smoothly interpolating between points where necessary
	 * @param options the options for drawing
	 * @returns
	 */
	continue: (options: Points) => void;
	/**
	 * stops drawing
	 * @returns
	 */
	stop: () => void;
	/**
	 * Whether or not the user is currently drawing.
	 */
	drawing: boolean;
}

/**
 * Coordinates for a draw or erase path.
 */
interface Points {
	/**
	 * The x coordinate of the path.
	 */
	x: number;
	/**
	 * The y coordinate of the path.
	 */
	y: number;
}

/**
 * Options for drawing a path.
 */
interface DrawOptions extends Points {
	/**
	 * The size of the brush.
	 */
	size: number;
	/**
	 * The color of the brush.
	 */
	color?: ColorSource;
	/**
	 * The opacity of the brush.
	 */
	opacity: number;
	/**
	 * Whether or not to set the initial texture.
	 */
	set_initial_texture?: boolean;
}

/**
 * Draws a circle on the given graphics object.
 * @param graphics the graphics object to draw on
 * @param x the x coordinate of the circle
 * @param y the y coordinate of the circle
 * @param brush_color the color of the circle
 * @param brush_size the radius of the circle
 */
function drawCircle(
	graphics: Graphics,
	x: number,
	y: number,
	brush_color: ColorSource = new Color("black"),
	brush_size: number
): void {
	const color = new Color(brush_color);
	graphics.beginFill(color);
	graphics.drawCircle(x, y, brush_size);
	graphics.endFill();
}

/**
 * Interpolates between two points.
 * @param point1 the first point
 * @param point2 the second point
 * @returns an array of points between the two points
 */
function interpolate(
	point1: { x: number; y: number },
	point2: { x: number; y: number }
): Points[] {
	let points: Points[] = [];
	const dx = point2.x - point1.x;
	const dy = point2.y - point1.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	const steps = Math.ceil(distance / 2);
	const stepX = dx / steps;
	const stepY = dy / steps;

	for (let j = 0; j < steps; j++) {
		const x = point1.x + j * stepX;
		const y = point1.y + j * stepY;
		points.push({ x, y });
	}

	return points;
}

export function draw_path(
	renderer: IRenderer,
	stage: Container,
	layer: LayerScene,
	mode: "draw" | "erase"
): DrawCommand {
	const paths: Points[] = [];
	let initial_path: DrawOptions;
	let graphics: Graphics;
	let InitialTexture: RenderTexture;

	let has_drawn = false;
	let id = 0;

	return {
		drawing: false,
		start: function ({
			x,
			y,
			size,
			color = new Color("black"),
			opacity,
			set_initial_texture = true
		}: DrawOptions) {
			if (set_initial_texture) {
				InitialTexture = RenderTexture.create({
					width: layer.draw_texture.width,
					height: layer.draw_texture.height
				});
				renderer.render(layer.composite, {
					renderTexture: InitialTexture
				});
			}
			initial_path = { x, y, size, color, opacity };
			paths.push({ x, y });
			graphics = make_graphics(id++);

			drawCircle(graphics, x, y, color, size);

			renderer.render(graphics, {
				renderTexture:
					mode === "draw" ? layer.draw_texture : layer.erase_texture,
				clear: false
			});

			this.drawing = true;
		},
		continue: function ({ x, y }: Points) {
			const last_point = paths[paths.length - 1];
			const new_points = interpolate(last_point, { x, y });

			for (let i = 0; i < new_points.length; i++) {
				const { x, y } = new_points[i];
				drawCircle(graphics, x, y, initial_path.color, initial_path.size);
				paths.push({ x, y });
			}

			renderer.render(graphics, {
				renderTexture:
					mode === "draw" ? layer.draw_texture : layer.erase_texture,
				clear: false
			});
			graphics.clear();
		},
		stop: function () {
			const current_sketch = RenderTexture.create({
				width: layer.draw_texture.width,
				height: layer.draw_texture.height
			});

			renderer.render(layer.composite, {
				renderTexture: current_sketch
			});

			renderer.render(new Sprite(current_sketch), {
				renderTexture: layer.draw_texture
			});

			const clear_graphics = new Graphics()
				.beginFill(0x000000, 0) // Use a fill color with 0 alpha for transparency
				.drawRect(0, 0, layer.erase_texture.width, layer.erase_texture.height)
				.endFill();

			renderer.render(clear_graphics, {
				renderTexture: layer.erase_texture,
				clear: true
			});

			has_drawn = true;
			this.drawing = false;
		},
		execute: function () {
			if (!has_drawn) {
				for (let i = 1; i < paths.length; i++) {
					const { x, y } = paths[i];
					drawCircle(graphics, x, y, initial_path.color, initial_path.size);
				}

				renderer.render(graphics, {
					renderTexture:
						mode === "draw" ? layer.draw_texture : layer.erase_texture,
					clear: false
				});

				this.stop!();
			}
		},
		undo: function () {
			const clear_graphics = new Graphics()
				.beginFill(0x000000, 0)
				.drawRect(0, 0, layer.erase_texture.width, layer.erase_texture.height)
				.endFill();
			renderer.render(new Sprite(InitialTexture), {
				renderTexture: layer.draw_texture
			});
			renderer.render(clear_graphics, {
				renderTexture: layer.erase_texture,
				clear: true
			});

			this.stop!();
			has_drawn = false;
		}
	};
}
