import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Row from "./Index.svelte";
import RowWithChild from "./WithChild.svelte";

describe("Row", () => {
	afterEach(() => cleanup());

	test("renders the row container", async () => {
		const { container } = await render(Row, {});
		// No role, label, or text available for a bare layout container —
		// querySelector(".row") is the appropriate query here.
		expect(container.querySelector(".row")).not.toBeNull();
	});

	test("elem_id is applied to the root div", async () => {
		const { container } = await render(Row, { elem_id: "my-row" });
		expect(container.querySelector("#my-row")).not.toBeNull();
	});

	test("elem_classes are applied to the root div", async () => {
		const { container } = await render(Row, { elem_classes: ["my-row-class"] });
		expect(container.querySelector(".my-row-class")).not.toBeNull();
	});

	test("visible: true → container is visible", async () => {
		const { container } = await render(Row, {
			visible: true,
			elem_id: "row-visible"
		});
		expect(container.querySelector("#row-visible")).toBeVisible();
	});

	test("visible: false → container is hidden in the DOM", async () => {
		const { container } = await render(Row, {
			visible: false,
			elem_id: "row-false"
		});
		const el = container.querySelector("#row-false");
		expect(el).not.toBeNull();
		expect(el).not.toBeVisible();
	});

	test("visible: 'hidden' does NOT hide the container (Row uses !visible — 'hidden' is truthy)", async () => {
		// Row's template uses class:hide={!gradio.shared.visible}. "hidden" is a
		// non-empty string and therefore truthy, so !("hidden") === false — .hide is
		// not applied. This differs from components that explicitly check === "hidden".
		const { container } = await render(Row, {
			visible: "hidden",
			elem_id: "row-str-hidden"
		});
		const el = container.querySelector("#row-str-hidden");
		expect(el).not.toBeNull();
		expect(el).toBeVisible();
	});
});

describe("Children / slot", () => {
	afterEach(() => cleanup());

	test("renders slot children inside the row container", async () => {
		const { getByTestId } = await render(RowWithChild, {});
		expect(getByTestId("slot-content")).not.toBeNull();
	});

	test("slot children are visible when row is visible", async () => {
		const { getByTestId } = await render(RowWithChild, { visible: true });
		expect(getByTestId("slot-content")).toBeVisible();
	});

	test("slot children are hidden when row is hidden (visible: false)", async () => {
		const { getByTestId } = await render(RowWithChild, { visible: false });
		// Row applies display:none via .hide class — children inherit the hidden state
		expect(getByTestId("slot-content")).not.toBeVisible();
	});
});

test.todo(
	"VISUAL: variant='panel' applies secondary background fill and border-radius to the row container — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: variant='compact' removes border-radius from direct child elements — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: equal_height=true stretches child column containers to equal height via align-items: stretch — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: height/min_height/max_height props apply inline style constraints to the row container — needs Playwright visual regression screenshot comparison"
);
