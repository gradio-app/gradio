import {
	Container,
	Graphics,
	Color,
	type IRenderer,
	RenderTexture,
	Sprite,
	Filter,
	AlphaFilter
} from "pixi.js";
// import * as PIXI from "pixi.js";

import type { LayerScene } from "./scene_manager";

export interface Command {
	start?: (...args: any) => void;
	continue?: (...args: any) => void;
	stop?: (...args: any) => void;
	execute(): void;
	undo(): void;
}

export interface DrawCommand extends Command {
	start: (options: DrawOptions) => void;
	continue: (options: PathOptions) => void;
	stop: () => void;
	drawing: boolean;
}

interface PathOptions {
	x: number;
	y: number;
}

interface DrawOptions extends PathOptions {
	size: number;
	color?: Color;
	opacity: number;
	// layer: number;
}

function drawCircle(
	graphics: Graphics,
	x: number,
	y: number,
	brush_color: Color = new Color("black"),
	brush_size: number
): void {
	const color = new Color(brush_color);
	graphics.beginFill(color);
	graphics.drawCircle(x, y, brush_size);
	graphics.endFill();
}

export function make_graphics(z_index: number): Graphics {
	const graphics = new Graphics();
	graphics.eventMode = "none";
	graphics.zIndex = z_index;

	return graphics;
}

function interpolate(
	point1: { x: number; y: number },
	point2: { x: number; y: number }
): PathOptions[] {
	let points: PathOptions[] = [];
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
	const paths: PathOptions[] = [];
	let initial_path: DrawOptions;
	let graphics: Graphics;

	const colorMatrix = new AlphaFilter();
	colorMatrix.alpha = 0.5;
	layer.draw_texture.filters = [colorMatrix];

	let has_drawn = false;
	let id = 0;
	return {
		drawing: false,
		start: function ({
			x,
			y,
			size,
			color = new Color("black"),
			opacity
		}: DrawOptions) {
			initial_path = { x, y, size, color, opacity };
			paths.push({ x, y });
			graphics = make_graphics(id++);

			drawCircle(graphics, x, y, color, size);

			// const sprite = new Sprite(
			// 	mode === "draw" ? layer.draw_texture : layer.erase_texture
			// );

			renderer.render(graphics, {
				renderTexture:
					mode === "draw" ? layer.draw_texture : layer.erase_texture,
				clear: false
			});

			// renderer.render(stage);

			this.drawing = true;
		},
		continue: function ({ x, y }: PathOptions) {
			const last_point = paths[paths.length - 1];
			const new_points = interpolate(last_point, { x, y });

			for (let i = 0; i < new_points.length; i++) {
				const { x, y } = new_points[i];
				drawCircle(graphics, x, y, initial_path.color, initial_path.size);
				paths.push({ x, y });
			}
			graphics.alpha = 0.5;

			renderer.render(graphics, {
				renderTexture:
					mode === "draw" ? layer.draw_texture : layer.erase_texture,
				clear: false
			});

			// renderer.render(stage);
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
				this.start!(initial_path);
				for (let i = 1; i < paths.length; i++) {
					const { x, y } = paths[i];
					drawCircle(graphics, x, y, initial_path.color, initial_path.size);
				}

				graphics.alpha = 0.5;
				renderer.render(graphics, {
					renderTexture:
						mode === "draw" ? layer.draw_texture : layer.erase_texture
				});
				// renderer.render(stage);
			}
		},
		undo: function () {
			graphics.destroy();
			renderer.render(graphics, {
				renderTexture:
					mode === "draw" ? layer.draw_texture : layer.erase_texture
			});
			has_drawn = false;
		}
	};
}
