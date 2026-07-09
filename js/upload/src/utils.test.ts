import { afterEach, describe, expect, test, vi } from "vitest";
import { create_drag } from "./utils";

describe("create_drag", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	test("does not open the file input when an ignored child is clicked", () => {
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const node = document.createElement("div");
		const toolbar = document.createElement("div");
		const button = document.createElement("button");

		toolbar.className = "toolbar-wrap";
		toolbar.appendChild(button);
		node.appendChild(toolbar);
		document.body.appendChild(node);

		const { drag } = create_drag();
		const action = drag(node, { ignore_click_selector: ".toolbar-wrap" });

		button.click();

		expect(click).not.toHaveBeenCalled();
		action.destroy();
	});

	test("opens the file input when the dropzone is clicked", () => {
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const node = document.createElement("div");

		document.body.appendChild(node);

		const { drag } = create_drag();
		const action = drag(node, { ignore_click_selector: ".toolbar-wrap" });

		node.click();

		expect(click).toHaveBeenCalledOnce();
		action.destroy();
	});
});
