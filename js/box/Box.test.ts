import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import Box from "./Index.svelte";

// Box is a layout container with no label, value, events, or validation.
// All meaningful props (elem_id, elem_classes, visible) are shared props.
run_shared_prop_tests({
	component: Box,
	name: "Box",
	base_props: {},
	has_label: false,
	has_validation_error: false
});

describe("Box", () => {
	afterEach(() => cleanup());

	test("renders without props", async () => {
		const { container } = await render(Box, {});
		// No role, label, or text available on a bare layout container —
		// querySelector(".block") is the appropriate query here.
		const block = container.querySelector(".block");
		expect(block).not.toBeNull();
	});

	test("renders with props", async () => {
		const { container } = await render(Box, {
			elem_id: "my-box",
			elem_classes: ["my-class"],
			visible: true
		});
		const block = container.querySelector("#my-box.my-class");
		expect(block).not.toBeNull();
	});

	test.todo(
		"VISUAL: Box renders with full block styling (padding, border, background, shadow) because explicit_call is always passed to Block — needs Playwright visual regression screenshot"
	);

	test.todo(
		"VISUAL: Box container never enters hide-container mode (transparent, no border, no padding) — explicit_call prevents this regardless of container prop — needs Playwright visual regression screenshot"
	);

	test.todo(
		"VISUAL: slot content renders inside the block container — needs integration test mounting Box with real child Gradio components as slot content"
	);
});
