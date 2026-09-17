import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Application, Container } from "pixi.js";

import { LayerManager } from "../core/layers";
import type { ImageEditorContext } from "../core/editor";
import { BrushCommand } from "./brush-textures";

describe("BrushCommand", () => {
	let app: Application;
	let image_container: Container;
	let layer_manager: LayerManager;
	let context: ImageEditorContext;

	beforeEach(async () => {
		app = new Application();
		await app.init({
			width: 32,
			height: 32,
			backgroundAlpha: 0,
			preference: "webgl"
		});
		image_container = new Container();
		layer_manager = new LayerManager(image_container, app, true, false, 0, {
			allow_additional_layers: true,
			layers: ["Layer 1"],
			disabled: false
		});
		layer_manager.create_layer({
			width: 32,
			height: 32,
			user_created: true,
			layer_id: "mask",
			make_active: true
		});
		context = {
			app,
			image_container,
			layer_manager
		} as ImageEditorContext;
	});

	afterEach(() => {
		image_container.destroy({ children: true });
		app.destroy(true);
	});

	test("keeps repeated strokes of the same color at a fixed opacity", async () => {
		const stroke = {
			layer_id: "mask",
			segments: [
				{
					from_x: 16,
					from_y: 16,
					to_x: 16,
					to_y: 16,
					size: 5,
					color: "#ff0000",
					opacity: 0.25,
					mode: "draw" as const
				}
			]
		};

		await new BrushCommand(context, stroke).execute(context);
		const texture = layer_manager.get_layer_textures("mask")!.draw;
		const first = app.renderer.extract.pixels(texture);

		await new BrushCommand(context, stroke).execute(context);
		const second = app.renderer.extract.pixels(texture);

		const pixel_index = (16 * first.width + 16) * 4;
		const first_alpha = first.pixels[pixel_index + 3];

		expect(first_alpha).toBeGreaterThan(0);
		expect(Array.from(second.pixels)).toEqual(Array.from(first.pixels));
	});
});
