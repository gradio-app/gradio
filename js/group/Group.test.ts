import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Group from "./Index.svelte";

describe("Group", () => {
	afterEach(() => cleanup());

	test("renders the group container", async () => {
		const { container } = await render(Group, {});
		// No role, label, or text available for a bare layout container —
		// querySelector(".gr-group") is the appropriate query here.
		expect(container.querySelector(".gr-group")).not.toBeNull();
	});

	test("elem_id is applied to the outer div", async () => {
		const { container } = await render(Group, { elem_id: "my-group" });
		expect(container.querySelector("#my-group")).not.toBeNull();
	});

	test("elem_classes are applied to the outer div", async () => {
		const { container } = await render(Group, {
			elem_classes: ["my-group-class"]
		});
		expect(container.querySelector(".my-group-class")).not.toBeNull();
	});

	test("visible: true → container is visible", async () => {
		const { container } = await render(Group, {
			visible: true,
			elem_id: "group-visible"
		});
		expect(container.querySelector("#group-visible")).toBeVisible();
	});

	test("visible: 'hidden' → container is hidden in the DOM", async () => {
		const { container } = await render(Group, {
			visible: "hidden",
			elem_id: "group-hidden"
		});
		const el = container.querySelector("#group-hidden");
		expect(el).not.toBeNull();
		expect(el).not.toBeVisible();
	});

	test("visible: false does NOT hide the container (Group only responds to the 'hidden' string)", async () => {
		// Group's template uses class:hide={gradio.shared.visible === "hidden"}.
		// Boolean false does not equal the string "hidden", so the container remains
		// visible. Differs from Row/Column which use !visible and hide on false.
		const { container } = await render(Group, {
			visible: false,
			elem_id: "group-false"
		});
		const el = container.querySelector("#group-false");
		expect(el).not.toBeNull();
		expect(el).toBeVisible();
	});
});

test.todo(
	"VISUAL: Group removes borders, border-radius, and box-shadow from child blocks via CSS variable overrides (--block-border-width: 0px, --block-radius: 0px) — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: Group uses 1px gap between children (--form-gap-width: 1px, --layout-gap: 1px), tightly grouping them without spacing — needs Playwright visual regression screenshot comparison"
);
