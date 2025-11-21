import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@self/tootils";

import Group from "./Index.svelte";

describe("Group", () => {
	afterEach(() => {
		cleanup();
	});

	test("setting visible to false hides the Group", async () => {
		const { container } = await render(Group, {
			visible: false
		});

		const groupElement = container.querySelector(".gr-group");

		assert(groupElement !== null, "Group element not found.");
		assert(
			groupElement.classList.contains("hide"),
			"Group element is not hidden."
		);
	});
});
