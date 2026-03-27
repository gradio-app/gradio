import { test, describe, expect, afterEach } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Group from "./Index.svelte";

describe("Group", () => {
	afterEach(() => {
		cleanup();
	});

	test("visible: true renders the Group", async () => {
		const { container } = await render(Group, {
			visible: true
		});

		const groupElement = container.querySelector(".gr-group");
		expect(groupElement).not.toBeNull();
	});

	test("visible: false removes the Group from the DOM", async () => {
		const { container } = await render(Group, {
			visible: false
		});

		const groupElement = container.querySelector(".gr-group");
		expect(groupElement).toBeNull();
	});

	test("visible: 'hidden' hides the Group but keeps it in the DOM", async () => {
		const { container } = await render(Group, {
			visible: "hidden"
		});

		const groupElement = container.querySelector(".gr-group");
		expect(groupElement).not.toBeNull();
		expect(groupElement!.classList.contains("hide")).toBe(true);
	});
});
