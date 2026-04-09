import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import Form from "./Index.svelte";
import BaseForm from "./BaseForm.svelte";
import FormWithChild from "./WithChild.svelte";

// Form/Index.svelte is a 3-line pass-through; BaseForm.svelte is the real component.
// Form does NOT forward elem_id, elem_classes, or label to BaseForm — only visible,
// scale, and min_width are passed through.

describe("Form", () => {
	afterEach(() => cleanup());

	test("renders the form container", async () => {
		const { container } = await render(Form, { visible: true });
		// No role, label, or text on a bare form without a label prop —
		// querySelector(".form") is the appropriate query here.
		expect(container.querySelector(".form")).not.toBeNull();
	});

	test("visible: true → container is present in the DOM", async () => {
		const { container } = await render(Form, { visible: true });
		// An empty Form auto-hides via CSS :has selector (no non-hidden children),
		// so toBeVisible() is not reliable here. We verify the element is in the DOM.
		expect(container.querySelector(".form")).not.toBeNull();
	});

	test("visible: false → container is hidden", async () => {
		const { container } = await render(Form, { visible: false });
		const el = container.querySelector(".form");
		expect(el).not.toBeNull();
		expect(el).not.toBeVisible();
	});

	test("visible: 'hidden' → container is hidden", async () => {
		const { container } = await render(Form, { visible: "hidden" });
		const el = container.querySelector(".form");
		expect(el).not.toBeNull();
		expect(el).not.toBeVisible();
	});
});

// Accessibility tests render BaseForm directly because Form/Index.svelte does not
// forward the label prop. All BaseForm props (visible, scale, min_width, label) are in
// allowed_shared_props and available via the render utility's top-level spread.
describe("Accessibility", () => {
	afterEach(() => cleanup());

	test("no label → no role='group'", async () => {
		const { container } = await render(BaseForm, {
			visible: true,
			min_width: 0
		});
		expect(container.querySelector(".form")?.getAttribute("role")).toBeNull();
	});

	test("label prop → role='group' is applied", async () => {
		const { container } = await render(BaseForm, {
			visible: true,
			min_width: 0,
			label: "My Section"
		});
		// The empty form auto-hides (CSS :has rule), so getByRole cannot reach it in
		// a real browser. We check the attribute directly.
		expect(container.querySelector(".form")?.getAttribute("role")).toBe(
			"group"
		);
	});

	test("label prop → aria-label matches the provided label", async () => {
		const { container } = await render(BaseForm, {
			visible: true,
			min_width: 0,
			label: "Form Section"
		});
		expect(container.querySelector(".form")?.getAttribute("aria-label")).toBe(
			"Form Section"
		);
	});

	test("no label → no aria-label attribute", async () => {
		const { container } = await render(BaseForm, {
			visible: true,
			min_width: 0
		});
		expect(
			container.querySelector(".form")?.getAttribute("aria-label")
		).toBeNull();
	});
});

describe("Props: scale / min_width", () => {
	afterEach(() => cleanup());

	test("scale prop sets flex-grow on the container", async () => {
		const { container } = await render(BaseForm, {
			visible: true,
			scale: 2,
			min_width: 0
		});
		const el = container.querySelector(".form") as HTMLElement | null;
		expect(el?.style.flexGrow).toBe("2");
	});

	test("min_width prop is reflected in the container's min-width style", async () => {
		const { container } = await render(BaseForm, {
			visible: true,
			scale: null,
			min_width: 320
		});
		const el = container.querySelector(".form") as HTMLElement | null;
		// Inline style is calc(min(320px, 100%))
		expect(el?.style.minWidth).toContain("320");
	});
});

describe("Children / slot", () => {
	afterEach(() => cleanup());

	test("renders slot children inside the form container", async () => {
		const { getByTestId } = await render(FormWithChild, { visible: true });
		expect(getByTestId("slot-content")).not.toBeNull();
	});

	test("slot children are visible when form is visible", async () => {
		const { getByTestId } = await render(FormWithChild, { visible: true });
		// With a non-hidden child present, the CSS :has auto-hide rule does not trigger
		expect(getByTestId("slot-content")).toBeVisible();
	});

	test("slot children are not visible when form is hidden (visible: false)", async () => {
		const { getByTestId } = await render(FormWithChild, { visible: false });
		expect(getByTestId("slot-content")).not.toBeVisible();
	});

	test("slot children are not visible when form is hidden (visible: 'hidden')", async () => {
		const { getByTestId } = await render(FormWithChild, {
			visible: "hidden"
		});
		expect(getByTestId("slot-content")).not.toBeVisible();
	});
});

test.todo(
	"VISUAL: Form children lose box-shadow, border-radius, and border via the .block CSS override — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: Form auto-hides when all direct children carry the .hidden class (CSS :has selector) — needs Playwright visual regression screenshot comparison"
);
