import { afterEach, describe, expect, test, vi } from "vitest";
import { Application, Graphics, TilingSprite } from "pixi.js";

import {
	CHECKERBOARD_CELL_SIZE,
	get_canvas_blob,
	make_checkerboard_texture,
	unpremultiply_alpha
} from "./pixi";

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

describe("get_canvas_blob", () => {
	let app: Application;

	afterEach(() => {
		vi.restoreAllMocks();
		app.destroy(true);
	});

	test("keeps the colour of semi-transparent pixels", async () => {
		app = new Application();
		await app.init({
			width: SIZE,
			height: SIZE,
			backgroundAlpha: 0,
			preference: "webgl"
		});
		const square = new Graphics()
			.rect(0, 0, SIZE, SIZE)
			.fill({ color: 0xffffff, alpha: 0.5 });
		app.stage.addChild(square);

		const blob = await get_canvas_blob(app.renderer, square);
		const bitmap = await createImageBitmap(blob!);
		const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext(
			"2d"
		)!;
		ctx.drawImage(bitmap, 0, 0);
		const [r, g, b, a] = ctx.getImageData(SIZE / 2, SIZE / 2, 1, 1).data;

		// The renderer works with premultiplied alpha, so without un-premultiplying
		// on export this comes back as (128, 128, 128, 128).
		expect(a).toBeGreaterThanOrEqual(127);
		expect(a).toBeLessThanOrEqual(128);
		for (const channel of [r, g, b]) {
			expect(channel).toBeGreaterThanOrEqual(254);
		}
	});

	test("resolves null when a 2d context is unavailable", async () => {
		app = new Application();
		await app.init({
			width: SIZE,
			height: SIZE,
			backgroundAlpha: 0,
			preference: "webgl"
		});
		const square = new Graphics().rect(0, 0, SIZE, SIZE).fill(0xffffff);
		app.stage.addChild(square);

		// The renderer already holds its own context, so only the export canvas
		// sees this.
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

		// An empty image here would silently replace the user's edits.
		expect(await get_canvas_blob(app.renderer, square)).toBeNull();
	});
});

describe("unpremultiply_alpha", () => {
	test("divides colour by alpha and leaves opaque and empty pixels alone", () => {
		// [premultiplied input, expected straight alpha output]
		const cases = [
			[
				[128, 64, 0, 128],
				[255, 128, 0, 128]
			],
			// rounding on the GPU can leave a channel above alpha
			[
				[129, 129, 129, 128],
				[255, 255, 255, 128]
			],
			[
				[10, 20, 30, 255],
				[10, 20, 30, 255]
			],
			[
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			]
		];
		const pixels = new Uint8ClampedArray(cases.flatMap(([input]) => input));

		unpremultiply_alpha(pixels);

		expect(Array.from(pixels)).toEqual(cases.flatMap(([, output]) => output));
	});
});
