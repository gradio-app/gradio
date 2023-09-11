import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render } from "@gradio/tootils";

import Group from "./static";

describe("Group", () => {
	afterEach(() => {
		cleanup();
	});

	test("setting visible to false hides the Group", async () => {
		render(Group, {
			elem_id: "group",
			visible: false
		});

		const groupElement = document.getElementById("group");

		assert(groupElement !== null, "Group element not found.");
		assert(
			groupElement.classList.contains("hide"),
			"Group element is not hidden."
		);
	});
});
