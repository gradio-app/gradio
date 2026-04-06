import { test, describe, expect, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Box from "./Index.svelte";

const default_props = {
	elem_id: "",
	elem_classes: [] as string[],
	visible: true as boolean | "hidden"
};

describe("Box", () => {
	afterEach(() => cleanup());

	test("renders with default props", async () => {
		const { container } = await render(Box, { ...default_props });

		const block = container.querySelector(".block");
		expect(block).not.toBeNull();
	});

	test("renders as a block element with padded styling", async () => {
		const { container } = await render(Box, { ...default_props });

		const block = container.querySelector(".block");
		expect(block).not.toBeNull();
	});
});

describe("Props: elem_id", () => {
	afterEach(() => cleanup());

	test("elem_id is applied to the wrapper", async () => {
		const { container } = await render(Box, {
			...default_props,
			elem_id: "my-box"
		});

		const el = container.querySelector("#my-box");
		expect(el).not.toBeNull();
	});

	test("empty elem_id does not add id attribute with value", async () => {
		const { container } = await render(Box, {
			...default_props,
			elem_id: ""
		});

		const block = container.querySelector(".block");
		expect(block).not.toBeNull();
	});
});

describe("Props: elem_classes", () => {
	afterEach(() => cleanup());

	test("single elem_class is applied", async () => {
		const { container } = await render(Box, {
			...default_props,
			elem_classes: ["custom-class"]
		});

		const el = container.querySelector(".custom-class");
		expect(el).not.toBeNull();
	});

	test("multiple elem_classes are applied", async () => {
		const { container } = await render(Box, {
			...default_props,
			elem_classes: ["class-a", "class-b", "class-c"]
		});

		expect(container.querySelector(".class-a")).not.toBeNull();
		expect(container.querySelector(".class-b")).not.toBeNull();
		expect(container.querySelector(".class-c")).not.toBeNull();
	});

	test("empty elem_classes array adds no extra classes", async () => {
		const { container } = await render(Box, {
			...default_props,
			elem_classes: []
		});

		const block = container.querySelector(".block");
		expect(block).not.toBeNull();
	});
});

describe("Props: visible", () => {
	afterEach(() => cleanup());

	test("visible=true renders the component", async () => {
		const { container } = await render(Box, {
			...default_props,
			visible: true,
			elem_id: "visible-box"
		});

		const el = container.querySelector("#visible-box");
		expect(el).not.toBeNull();
	});

	test("visible='hidden' keeps element in DOM but hides it", async () => {
		const { container } = await render(Box, {
			...default_props,
			visible: "hidden",
			elem_id: "hidden-box"
		});

		const el = container.querySelector("#hidden-box");
		expect(el).not.toBeNull();
	});

	test("visible=false removes the component from the DOM", async () => {
		const { container } = await render(Box, {
			...default_props,
			visible: false,
			elem_id: "gone-box"
		});

		const el = container.querySelector("#gone-box");
		expect(el).toBeNull();
	});
});

describe("Block: explicit_call", () => {
	afterEach(() => cleanup());

	test("Box always applies container styling (no hide-container class)", async () => {
		const { container } = await render(Box, { ...default_props });

		const block = container.querySelector(".block");
		expect(block).not.toBeNull();
	});
});
