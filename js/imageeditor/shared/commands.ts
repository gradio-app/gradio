import { type Container, Graphics, type Color } from "pixi.js";
// import * as PIXI from "pixi.js";

export interface Command {
	start?: (...args: any) => void;
	continue?: (...args: any) => void;
	stop?: (...args: any) => void;
	execute(): void;
	undo(): void;
}

interface PathOptions {
	x: number;
	y: number;
}

interface DrawOptions extends PathOptions {
	size: number;
	color: Color;
	opacity: number;
	layer: number;
}

function drawCircle(
	graphics: Graphics,
	x: number,
	y: number,
	brush_color: Color,
	brush_size: number
): void {
	graphics.beginFill(brush_color);
	graphics.drawCircle(x, y, brush_size);
	graphics.endFill();
}

export function make_graphics(z_index: number): Graphics {
	const graphics = new Graphics();
	graphics.zIndex = z_index;
	return graphics;
}

function interpolate(
	point1: { x: number; y: number },
	point2: { x: number; y: number },
	ratio: number
): PathOptions[] {
	let points: PathOptions[] = [];
	const dx = point2.x - point1.x;
	const dy = point2.y - point1.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	const steps = Math.ceil(distance / (2 * ratio));
	const stepX = dx / steps;
	const stepY = dy / steps;

	for (let j = 0; j < steps; j++) {
		const x = point1.x + j * stepX;
		const y = point1.y + j * stepY;
		points.push({ x, y });
	}

	return points;
}

export function draw_path(container: Container): Command {
	const paths: PathOptions[] = [];
	let initial_path: DrawOptions;
	let graphics: Graphics;
	let has_drawn = false;
	return {
		start: function ({ x, y, size, color, opacity, layer }: DrawOptions) {
			initial_path = { x, y, size, color, opacity, layer };
			paths.push({ x, y });
			graphics = make_graphics(layer + 1);

			drawCircle(graphics, x, y, color, size);
			container.addChild(graphics);
		},
		continue: function ({ x, y }: PathOptions) {
			const last_point = paths[paths.length - 1];
			const new_points = interpolate(last_point, { x, y }, initial_path.size);

			for (let i = 0; i < new_points.length; i++) {
				const { x, y } = new_points[i];
				drawCircle(graphics, x, y, initial_path.color, initial_path.size);
				paths.push({ x, y });
			}
		},
		stop: function () {
			has_drawn = true;
		},
		execute: function () {
			if (!has_drawn) {
				this.start!(initial_path);
				for (let i = 1; i < paths.length; i++) {
					const { x, y } = paths[i];
					drawCircle(graphics, x, y, initial_path.color, initial_path.size);
				}
			}
		},
		undo: function () {
			graphics.destroy();
			has_drawn = false;
		}
	};
}
