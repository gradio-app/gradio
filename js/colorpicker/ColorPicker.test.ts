import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import ColorPicker from "./Index.svelte";

const loading_status = {
	status: "complete" as const,
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full" as const,
	type: "input" as const,
	stream_state: "closed" as const
};

const default_props = {
	value: "#000000",
	label: "Color Picker",
	show_label: true,
	interactive: true,
	info: "",
	loading_status
};

run_shared_prop_tests({
	component: ColorPicker,
	name: "ColorPicker",
	base_props: {
		...default_props
	},
	has_label: true,
	has_validation_error: true
});

function mock_rect(element: Element): void {
	(element as HTMLElement).getBoundingClientRect = () =>
		({
			left: 0,
			top: 0,
			width: 100,
			height: 100,
			right: 100,
			bottom: 100,
			x: 0,
			y: 0,
			toJSON: () => {}
		}) as DOMRect;
}

describe("Events: release", () => {
	afterEach(() => cleanup());

	test("mouseup after dragging color gradient dispatches release with color payload", async () => {
		const { container, listen } = await render(ColorPicker, default_props);
		const release = listen("release");

		const dialog_button = container.querySelector(".dialog-button");
		expect(dialog_button).toBeTruthy();
		await fireEvent.click(dialog_button!);

		const color_gradient = container.querySelector(".color-gradient");
		expect(color_gradient).toBeTruthy();
		mock_rect(color_gradient!);

		await fireEvent.mouseDown(color_gradient!, { clientX: 30, clientY: 20 });
		await fireEvent.mouseUp(window);

		expect(release).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledWith(expect.stringMatching(/^#/));
	});

	test("mouseup after dragging hue slider dispatches release", async () => {
		const { container, listen } = await render(ColorPicker, default_props);
		const release = listen("release");

		const dialog_button = container.querySelector(".dialog-button");
		expect(dialog_button).toBeTruthy();
		await fireEvent.click(dialog_button!);

		const hue_slider = container.querySelector(".hue-slider");
		expect(hue_slider).toBeTruthy();
		mock_rect(hue_slider!);

		await fireEvent.mouseDown(hue_slider!, { clientX: 40 });
		await fireEvent.mouseUp(window);

		expect(release).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledWith(expect.stringMatching(/^#/));
	});

	test("mouseup without dragging does not dispatch release", async () => {
		const { listen } = await render(ColorPicker, default_props);
		const release = listen("release");

		await fireEvent.mouseUp(window);

		expect(release).not.toHaveBeenCalled();
	});
});
