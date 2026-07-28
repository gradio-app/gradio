import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Column from "./Index.svelte";
import ColumnWithChild from "./WithChild.svelte";

describe("Column", () => {
	afterEach(() => cleanup());

	test("renders the column container", async () => {
		const { container } = await render(Column, {});
		// No role, label, or text available for a bare layout container —
		// querySelector(".column") is the appropriate query here.
		expect(container.querySelector(".column")).not.toBeNull();
	});

	test("elem_id is applied to the root div", async () => {
		const { container } = await render(Column, { elem_id: "my-column" });
		expect(container.querySelector("#my-column")).not.toBeNull();
	});

	test("elem_classes are applied to the root div", async () => {
		const { container } = await render(Column, {
			elem_classes: ["my-col-class"]
		});
		expect(container.querySelector(".my-col-class")).not.toBeNull();
	});

	test("visible: true → container is visible", async () => {
		const { container } = await render(Column, {
			visible: true,
			elem_id: "col-visible"
		});
		expect(container.querySelector("#col-visible")).toBeVisible();
	});

	test("visible: false → container is hidden in the DOM", async () => {
		const { container } = await render(Column, {
			visible: false,
			elem_id: "col-false"
		});
		const el = container.querySelector("#col-false");
		expect(el).not.toBeNull();
		expect(el).not.toBeVisible();
	});

	test("visible: 'hidden' does NOT hide the container (Column uses !visible — 'hidden' is truthy)", async () => {
		// BaseColumn uses class:hide={!visible}. "hidden" is a non-empty string and
		// therefore truthy, so !("hidden") === false — .hide is not applied.
		// Same pattern as Row.
		const { container } = await render(Column, {
			visible: "hidden",
			elem_id: "col-str-hidden"
		});
		const el = container.querySelector("#col-str-hidden");
		expect(el).not.toBeNull();
		expect(el).toBeVisible();
	});
});

describe("Children / slot", () => {
	afterEach(() => cleanup());

	test("renders slot children inside the column container", async () => {
		const { getByTestId } = await render(ColumnWithChild, {});
		expect(getByTestId("slot-content")).not.toBeNull();
	});

	test("slot children are visible when column is visible", async () => {
		const { getByTestId } = await render(ColumnWithChild, { visible: true });
		expect(getByTestId("slot-content")).toBeVisible();
	});

	test("slot children are hidden when column is hidden (visible: false)", async () => {
		const { getByTestId } = await render(ColumnWithChild, { visible: false });
		// Column applies display:none via .hide class — children inherit the hidden state
		expect(getByTestId("slot-content")).not.toBeVisible();
	});
});

test.todo(
	"VISUAL: variant='panel' applies panel border, background fill, and padding to the column container — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: variant='compact' removes border-radius from direct child elements — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: scale prop controls flex-grow, making the column proportionally wider when scale > 1 — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: min_width prop enforces a minimum pixel width before the column wraps to a new row — needs Playwright visual regression screenshot comparison"
);
