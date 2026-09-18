import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Application, Container, Graphics, Rectangle, Texture } from "pixi.js";
import { writable } from "svelte/store";

import { LayerManager } from "./layers";
import type { ImageEditorContext } from "./editor";
import { AddImageCommand } from "../image/image";

const SIZE = 16;

/** A SIZE x SIZE texture whose left half is opaque red and right half is transparent. */
function make_half_transparent_texture(app: Application): Texture {
	const graphics = new Graphics()
		.rect(0, 0, SIZE / 2, SIZE)
		.fill({ color: 0xff0000, alpha: 1 });

	return app.renderer.textureGenerator.generateTexture({
		target: graphics,
		frame: new Rectangle(0, 0, SIZE, SIZE)
	});
}

async function alpha_at(
	blob: Blob | null,
	x: number,
	y: number
): Promise<number> {
	if (!blob) throw new Error("no blob was extracted");
	const bitmap = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(bitmap, 0, 0);
	return ctx.getImageData(x, y, 1, 1).data[3];
}

describe("LayerManager background transparency", () => {
	let app: Application;
	let image_container: Container;
	let layer_manager: LayerManager;
	let context: ImageEditorContext;

	beforeEach(async () => {
		app = new Application();
		await app.init({
			width: SIZE,
			height: SIZE,
			backgroundAlpha: 0,
			preference: "webgl"
		});
		image_container = new Container();
		layer_manager = new LayerManager(image_container, app, false, false, 0, {
			allow_additional_layers: true,
			layers: ["Layer 1"],
			disabled: false
		});
		context = {
			app,
			image_container,
			layer_manager,
			dimensions: writable({ width: SIZE, height: SIZE }),
			scale: writable(1),
			position: writable({ x: 0, y: 0 }),
			set_image_properties: async () => {},
			set_background_image: () => {},
			reset: () => {}
		} as unknown as ImageEditorContext;
	});

	afterEach(() => {
		image_container.destroy({ children: true });
		app.destroy(true);
	});

	test("an added image keeps its transparent pixels transparent", async () => {
		await new AddImageCommand(
			context,
			make_half_transparent_texture(app),
			false
		).execute(context);

		const { background, composite } = await layer_manager.get_blobs(SIZE, SIZE);

		expect(await alpha_at(background, 4, 8)).toBe(255);
		expect(await alpha_at(background, 12, 8)).toBe(0);
		expect(await alpha_at(composite, 12, 8)).toBe(0);
		expect(layer_manager.is_background_transparent()).toBe(true);
	});

	test("a canvas with no image keeps an opaque background", async () => {
		layer_manager.create_background_layer(SIZE, SIZE);

		const { background } = await layer_manager.get_blobs(SIZE, SIZE);

		expect(await alpha_at(background, 8, 8)).toBe(255);
		expect(layer_manager.is_background_transparent()).toBe(false);
	});
});
