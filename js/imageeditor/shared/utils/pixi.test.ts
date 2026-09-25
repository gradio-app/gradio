import { afterEach, describe, expect, test } from "vitest";
import { Application, TilingSprite } from "pixi.js";

import { CHECKERBOARD_CELL_SIZE, make_checkerboard_texture } from "./pixi";

const CELL = CHECKERBOARD_CELL_SIZE;
const SIZE = CELL * 4;

describe("make_checkerboard_texture", () => {
	let app: Application;

	async function mount(resolution: number): Promise<void> {
		app = new Application();
		await app.init({
			width: SIZE,
			height: SIZE,
			resolution,
			autoDensity: true,
			backgroundAlpha: 0,
			preference: "webgl"
		});
		app.stage.addChild(
			new TilingSprite({
				texture: make_checkerboard_texture(app.renderer, false),
				width: SIZE,
				height: SIZE
			})
		);
	}

	afterEach(() => app.destroy(true));

	test("tiles into alternating cells", async () => {
		await mount(1);

		const { pixels, width } = app.renderer.extract.pixels(app.stage);
		const rgb_at = (x: number, y: number): string => {
			const i = (y * width + x) * 4;
			return `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${pixels[i + 3]}`;
		};

		const half = CELL / 2;
		const shade = rgb_at(half, half);
		const light = rgb_at(CELL + half, half);

		// diagonal neighbours match, orthogonal ones alternate
		expect(shade).not.toBe(light);
		expect(rgb_at(half, CELL + half)).toBe(light);
		expect(rgb_at(CELL + half, CELL + half)).toBe(shade);

		// and the pattern repeats past the first tile
		expect(rgb_at(CELL * 2 + half, half)).toBe(shade);
		expect(rgb_at(CELL * 3 + half, half)).toBe(light);
	});

	test("stays sharp on a high density renderer", async () => {
		await mount(2);

		const { pixels, width, height } = app.renderer.extract.pixels(app.stage);
		const row = Math.round(height / 4);
		const shades = new Set<string>();
		for (let x = 0; x < width; x++) {
			const i = (row * width + x) * 4;
			shades.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
		}

		// Upscaling a 1x tile blends the cell edges, which shows up as extra shades
		// and as washed out cells, so the tile has to follow the renderer.
		expect(shades.size).toBe(2);
	});
});
