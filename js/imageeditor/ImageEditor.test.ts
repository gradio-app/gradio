import { afterEach, describe, expect, test } from "vitest";
import {
	cleanup,
	fireEvent,
	render,
	TEST_PNG,
	waitFor
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import ImageEditor from "./Index.svelte";
import ImageEditorTestWrapper from "./ImageEditorTestWrapper.svelte";

const default_props = {
	sources: ["upload"] as const,
	interactive: true,
	label: "Image Editor",
	show_label: true,
	value: null,
	canvas_size: [800, 600] as [number, number],
	transforms: [] as const,
	layers: { allow_additional_layers: true, layers: ["Layer 1"] },
	brush: {
		default_size: "auto" as const,
		colors: ["#000000"],
		default_color: "#000000",
		color_mode: "defaults" as const
	},
	eraser: { default_size: "auto" as const },
	webcam_options: { mirror: true, constraints: {} },
	buttons: []
};

run_shared_prop_tests({
	component: ImageEditor,
	name: "ImageEditor",
	base_props: { ...default_props, interactive: false },
	has_label: false,
	has_validation_error: true
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("an untouched editor returns the original image files", async () => {
		const background = { ...TEST_PNG, alt_text: "Background" };
		const layer = { ...TEST_PNG, orig_name: "layer.png" };
		const composite = { ...TEST_PNG, orig_name: "composite.png" };
		const value = { background, layers: [layer], composite };
		const { getByRole, get_data } = await render(ImageEditor, {
			...default_props,
			value
		});
		await waitFor(() => {
			expect(getByRole("button", { name: "Pan" })).toBeVisible();
		});

		expect((await get_data()).value).toEqual(value);
	});
});

describe("Internationalization", () => {
	afterEach(() => cleanup());

	test("canvas controls use translated accessible names", async () => {
		const i18n = (key: string): string => key;
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "controls",
			i18n
		});

		expect(getByRole("button", { name: "common.download" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.pan" })).toBeVisible();
		expect(
			getByRole("button", { name: "image_editor.zoom_out" })
		).toBeVisible();
		expect(
			getByRole("button", { name: "image_editor.save_changes" })
		).toBeVisible();
	});

	test("editing tools use translated accessible names", async () => {
		const i18n = (key: string): string => key;
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "toolbar",
			i18n
		});

		expect(getByRole("button", { name: "image.image" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.brush" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.erase" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.upload" })).toBeVisible();
		expect(getByRole("button", { name: "image_editor.paste" })).toBeVisible();
	});

	test("layer controls use translated accessible names", async () => {
		const i18n = (key: string): string => key;
		const { getByRole } = await render(ImageEditorTestWrapper, {
			kind: "layers",
			i18n
		});
		const show_layers = getByRole("button", {
			name: "image_editor.show_layers"
		});

		await fireEvent.click(show_layers);

		expect(
			getByRole("button", { name: "image_editor.add_layer" })
		).toBeVisible();
	});
});
