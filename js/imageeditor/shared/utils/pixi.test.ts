import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Application, TilingSprite } from "pixi.js";

import { CHECKERBOARD_CELL_SIZE, make_checkerboard_texture } from "./pixi";

const CELL = CHECKERBOARD_CELL_SIZE;
const SIZE = CELL * 4;

describe("make_checkerboard_texture", () => {
	let app: Application;

	beforeEach(async () => {
		app = new Application();
		await app.init({
			width: SIZE,
			height: SIZE,
			backgroundAlpha: 0,
			preference: "webgl"
		});
	});

	afterEach(() => app.destroy(true));

	test("tiles into alternating cells", async () => {
		const sprite = new TilingSprite({
			texture: make_checkerboard_texture(app.renderer, false),
			width: SIZE,
			height: SIZE
		});
		app.stage.addChild(sprite);

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
});
