import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import Label from "./Index.svelte";

// Default props: label with three confidence items
const default_props = {
	value: {
		label: "Cat",
		confidences: [
			{ label: "cat", confidence: 0.9 },
			{ label: "dog", confidence: 0.08 },
			{ label: "lion", confidence: 0.02 }
		]
	},
	show_heading: true,
	_selectable: false,
	buttons: null
};

// ─── Shared prop tests ────────────────────────────────────────────────────────

// has_label: false because the Label component removes BlockLabel from the DOM
// when show_label=false (using {#if show_label}) rather than keeping it with
// sr-only. The custom label tests below cover label/show_label behaviour.
run_shared_prop_tests({
	component: Label,
	name: "Label",
	base_props: {
		value: { label: "Cat" },
		show_heading: true,
		_selectable: false,
		buttons: null
	},
	has_label: false
});

describe("Label: label prop", () => {
	afterEach(() => cleanup());

	test("label text is rendered in the block header when show_label=true", async () => {
		const { getByText } = await render(Label, {
			...default_props,
			label: "My Output",
			show_label: true
		});
		expect(getByText("My Output")).toBeInTheDocument();
	});

	test("show_label=true makes the block label visible", async () => {
		const { getByText } = await render(Label, {
			...default_props,
			label: "Visible Label",
			show_label: true
		});
		expect(getByText("Visible Label")).toBeVisible();
	});

	test("show_label=false removes the block label from the DOM", async () => {
		const { queryByText } = await render(Label, {
			...default_props,
			label: "Hidden Label",
			show_label: false
		});
		// Label uses conditional rendering ({#if show_label}) so the element
		// is absent from the DOM entirely rather than hidden with sr-only.
		expect(queryByText("Hidden Label")).not.toBeInTheDocument();
	});
});

// ─── General rendering ────────────────────────────────────────────────────────

describe("Label — rendering", () => {
	afterEach(() => cleanup());

	test("renders label text in heading", async () => {
		const { getByTestId } = await render(Label, {
			value: { label: "Cat" },
			show_heading: true,
			_selectable: false,
			buttons: null
		});
		expect(getByTestId("label-output-value")).toHaveTextContent("Cat");
	});

	test("renders one confidence bar for each item in confidences", async () => {
		const { getByTestId } = await render(Label, default_props);
		expect(getByTestId("cat-confidence-set")).toBeInTheDocument();
		expect(getByTestId("dog-confidence-set")).toBeInTheDocument();
		expect(getByTestId("lion-confidence-set")).toBeInTheDocument();
	});

	test("shows empty state when value.label is null", async () => {
		const { queryByTestId } = await render(Label, {
			...default_props,
			value: { label: null }
		});
		expect(queryByTestId("label-output-value")).not.toBeInTheDocument();
	});

	test("shows empty state when value has no label property", async () => {
		const { queryByTestId } = await render(Label, {
			...default_props,
			value: {}
		});
		expect(queryByTestId("label-output-value")).not.toBeInTheDocument();
	});

	test("heading text matches value.label", async () => {
		const { getByTestId } = await render(Label, {
			...default_props,
			value: { label: "Golden Retriever" }
		});
		expect(getByTestId("label-output-value")).toHaveTextContent(
			"Golden Retriever"
		);
	});
});

// ─── Props: value — confidence bars ──────────────────────────────────────────

describe("Props: value — confidence bars", () => {
	afterEach(() => cleanup());

	test("confidence percentage is rounded to nearest integer (0.855 → 86%)", async () => {
		const { getByText } = await render(Label, {
			...default_props,
			value: {
				label: "Cat",
				confidences: [{ label: "cat", confidence: 0.855 }]
			}
		});
		expect(getByText("86%")).toBeInTheDocument();
	});

	test("confidence of 0 displays as 0% with correct aria-valuenow", async () => {
		const { getByText, getByRole } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0 }]
			}
		});
		expect(getByText("0%")).toBeInTheDocument();
		expect(getByRole("meter", { name: "cat" })).toHaveAttribute(
			"aria-valuenow",
			"0"
		);
	});

	test("confidence of 1 displays as 100% with correct aria-valuenow", async () => {
		const { getByText, getByRole } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 1 }]
			}
		});
		expect(getByText("100%")).toBeInTheDocument();
		expect(getByRole("meter", { name: "cat" })).toHaveAttribute(
			"aria-valuenow",
			"100"
		);
	});

	test("confidence label text is displayed inside each bar", async () => {
		// Use a heading label distinct from the confidence labels to avoid
		// getByText finding duplicate matches (heading + bar).
		const { getByText } = await render(Label, {
			...default_props,
			value: {
				label: "TopResult",
				confidences: [
					{ label: "dog", confidence: 0.7 },
					{ label: "cat", confidence: 0.3 }
				]
			}
		});
		expect(getByText("dog")).toBeInTheDocument();
		expect(getByText("cat")).toBeInTheDocument();
	});

	test("empty confidences array renders no confidence bars", async () => {
		const { queryAllByRole } = await render(Label, {
			...default_props,
			value: { label: "Cat", confidences: [] }
		});
		expect(queryAllByRole("button")).toHaveLength(0);
	});

	test("single confidence item renders exactly one bar", async () => {
		const { getByTestId, queryAllByRole } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.9 }]
			}
		});
		expect(getByTestId("cat-confidence-set")).toBeInTheDocument();
		expect(queryAllByRole("button")).toHaveLength(1);
	});
});

// ─── Props: show_heading ──────────────────────────────────────────────────────

describe("Props: show_heading", () => {
	afterEach(() => cleanup());

	test("show_heading=true with confidences: heading is visible", async () => {
		const { getByTestId } = await render(Label, default_props);
		expect(getByTestId("label-output-value")).toBeVisible();
	});

	test("show_heading=false with confidences: heading is not in the DOM", async () => {
		const { queryByTestId } = await render(Label, {
			...default_props,
			show_heading: false
		});
		expect(queryByTestId("label-output-value")).not.toBeInTheDocument();
	});

	test("show_heading=false without confidences: heading still renders (fallback to !confidences)", async () => {
		// The template condition is `show_heading || !value.confidences`.
		// When show_heading=false but there are no confidences, the heading still shows.
		const { getByTestId } = await render(Label, {
			...default_props,
			show_heading: false,
			value: { label: "Cat" }
		});
		expect(getByTestId("label-output-value")).toBeVisible();
	});

	test("show_heading=true without confidences: heading is visible", async () => {
		const { getByTestId } = await render(Label, {
			...default_props,
			show_heading: true,
			value: { label: "Cat" }
		});
		expect(getByTestId("label-output-value")).toBeVisible();
	});
});

// ─── Props: _selectable ───────────────────────────────────────────────────────

describe("Props: _selectable", () => {
	afterEach(() => cleanup());

	test("clicking confidence bar dispatches select with correct index and value", async () => {
		const { listen, getByTestId } = await render(Label, {
			...default_props,
			_selectable: true
		});
		const select = listen("select");
		await fireEvent.click(getByTestId("cat-confidence-set"));
		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({ index: 0, value: "cat" });
	});

	test("clicking second confidence bar dispatches select with index 1", async () => {
		const { listen, getByTestId } = await render(Label, {
			...default_props,
			_selectable: true
		});
		const select = listen("select");
		await fireEvent.click(getByTestId("dog-confidence-set"));
		expect(select).toHaveBeenCalledWith({ index: 1, value: "dog" });
	});

	test("clicking third confidence bar dispatches select with index 2", async () => {
		const { listen, getByTestId } = await render(Label, {
			...default_props,
			_selectable: true
		});
		const select = listen("select");
		await fireEvent.click(getByTestId("lion-confidence-set"));
		expect(select).toHaveBeenCalledWith({ index: 2, value: "lion" });
	});

	test("_selectable=false: select event still fires on click (onselect is always bound; _selectable controls visual styling only)", async () => {
		const { listen, getByTestId } = await render(Label, {
			...default_props,
			_selectable: false
		});
		const select = listen("select");
		await fireEvent.click(getByTestId("cat-confidence-set"));
		expect(select).toHaveBeenCalledTimes(1);
	});

	test.todo(
		"VISUAL: _selectable=true adds 'selectable' CSS class to confidence bars, enabling hover cursor and colour changes — needs Playwright visual regression screenshot comparison"
	);
});

// ─── Props: color ─────────────────────────────────────────────────────────────

describe("Props: color", () => {
	test.todo(
		"VISUAL: color='red' applies a red background colour to the label heading element — needs Playwright visual regression screenshot comparison"
	);
});

// ─── Props: buttons ───────────────────────────────────────────────────────────

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("buttons=null renders no custom buttons", async () => {
		const { queryByLabelText } = await render(Label, {
			...default_props,
			buttons: null
		});
		expect(queryByLabelText("Analyze")).not.toBeInTheDocument();
	});

	test("custom button is visible when show_label=true", async () => {
		const { getByLabelText } = await render(Label, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Analyze", id: 5, icon: null }]
		});
		expect(getByLabelText("Analyze")).toBeInTheDocument();
	});

	test("clicking custom button dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(Label, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Analyze", id: 5, icon: null }]
		});
		const click = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Analyze"));
		expect(click).toHaveBeenCalledTimes(1);
	});

	test("custom_button_click payload contains the button's id", async () => {
		const { listen, getByLabelText } = await render(Label, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Analyze", id: 5, icon: null }]
		});
		const click = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Analyze"));
		expect(click).toHaveBeenCalledWith({ id: 5 });
	});

	test("custom buttons are not shown when show_label=false", async () => {
		const { queryByLabelText } = await render(Label, {
			...default_props,
			show_label: false,
			buttons: [{ value: "Analyze", id: 5, icon: null }]
		});
		expect(queryByLabelText("Analyze")).not.toBeInTheDocument();
	});
});

// ─── Events ───────────────────────────────────────────────────────────────────

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: fired when value changes via set_data", async () => {
		const { listen, set_data } = await render(Label, default_props);
		const change = listen("change");
		await set_data({ value: { label: "Dog" } });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change: not fired on initial mount", async () => {
		const { listen } = await render(Label, default_props);
		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("change: fired again on a subsequent value update", async () => {
		const { listen, set_data } = await render(Label, default_props);
		const change = listen("change");
		await set_data({ value: { label: "Dog" } });
		await set_data({ value: { label: "Bird" } });
		expect(change).toHaveBeenCalledTimes(2);
	});

	test("select: dispatched with correct payload when confidence bar is clicked", async () => {
		const { listen, getByTestId } = await render(Label, {
			...default_props,
			_selectable: true
		});
		const select = listen("select");
		await fireEvent.click(getByTestId("cat-confidence-set"));
		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({ index: 0, value: "cat" });
	});
});

// ─── get_data / set_data ──────────────────────────────────────────────────────

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("set_data updates the heading text", async () => {
		const { set_data, getByTestId } = await render(Label, default_props);
		await set_data({ value: { label: "Elephant" } });
		expect(getByTestId("label-output-value")).toHaveTextContent("Elephant");
	});

	test("set_data with confidences causes confidence bars to appear", async () => {
		const { set_data, getByTestId } = await render(Label, {
			...default_props,
			value: { label: "Cat" }
		});
		await set_data({
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.9 }]
			}
		});
		expect(getByTestId("cat-confidence-set")).toBeInTheDocument();
	});

	test("set_data removing confidences hides all confidence bars", async () => {
		const { set_data, queryByTestId } = await render(Label, default_props);
		await set_data({ value: { label: "Cat" } });
		expect(queryByTestId("cat-confidence-set")).not.toBeInTheDocument();
		expect(queryByTestId("dog-confidence-set")).not.toBeInTheDocument();
		expect(queryByTestId("lion-confidence-set")).not.toBeInTheDocument();
	});

	test("get_data returns the current value label", async () => {
		const { set_data, get_data } = await render(Label, default_props);
		await set_data({ value: { label: "Dog" } });
		const data = await get_data();
		expect(data.value.label).toBe("Dog");
	});

	test("round-trip: set_data value is returned unchanged by get_data", async () => {
		const { set_data, get_data } = await render(Label, default_props);
		const new_value = {
			label: "bird",
			confidences: [
				{ label: "bird", confidence: 0.7 },
				{ label: "fish", confidence: 0.3 }
			]
		};
		await set_data({ value: new_value });
		const data = await get_data();
		expect(data.value).toEqual(new_value);
	});

	test("set_data with null label transitions to empty state", async () => {
		const { set_data, queryByTestId } = await render(Label, default_props);
		await set_data({ value: { label: null } });
		expect(queryByTestId("label-output-value")).not.toBeInTheDocument();
	});
});

// ─── Accessibility ────────────────────────────────────────────────────────────

describe("Accessibility", () => {
	afterEach(() => cleanup());

	test("confidence meter aria-valuenow reflects the confidence as a percentage integer", async () => {
		const { getByRole } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.9 }]
			}
		});
		expect(getByRole("meter", { name: "cat" })).toHaveAttribute(
			"aria-valuenow",
			"90"
		);
	});

	test("confidence meter has aria-valuemin=0 and aria-valuemax=100", async () => {
		const { getByRole } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.9 }]
			}
		});
		const meter = getByRole("meter", { name: "cat" });
		expect(meter).toHaveAttribute("aria-valuemin", "0");
		expect(meter).toHaveAttribute("aria-valuemax", "100");
	});

	test("meter aria-labelledby references an existing element in the DOM", async () => {
		const { getByRole } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.9 }]
			}
		});
		const meter = getByRole("meter", { name: "cat" });
		const labelledby_id = meter.getAttribute("aria-labelledby");
		expect(labelledby_id).not.toBeNull();
		expect(document.getElementById(labelledby_id!)).toBeInTheDocument();
	});

	test("confidence bars are accessible as button elements", async () => {
		const { getAllByRole } = await render(Label, default_props);
		expect(getAllByRole("button")).toHaveLength(3);
	});

	test("spaces in confidence label are replaced with hyphens in aria IDs (avoids invalid id-reference lists)", async () => {
		const { getByRole } = await render(Label, {
			...default_props,
			value: {
				label: "golden retriever",
				confidences: [{ label: "golden retriever", confidence: 0.85 }]
			}
		});
		const meter = getByRole("meter", { name: "golden retriever" });
		// aria-labelledby must not contain spaces (each token is treated as a separate ID)
		const labelledby_id = meter.getAttribute("aria-labelledby");
		expect(labelledby_id).not.toContain(" ");
		expect(document.getElementById(labelledby_id!)).toBeInTheDocument();
	});
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("no spurious change event fires on initial mount", async () => {
		const { listen } = await render(Label, default_props);
		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("confidence of 0.5 displays as 50%", async () => {
		const { getByText } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.5 }]
			}
		});
		expect(getByText("50%")).toBeInTheDocument();
	});

	test("confidence of 0.855 rounds to 86% (not 85%)", async () => {
		const { getByText, queryByText } = await render(Label, {
			...default_props,
			value: {
				label: "cat",
				confidences: [{ label: "cat", confidence: 0.855 }]
			}
		});
		expect(getByText("86%")).toBeInTheDocument();
		expect(queryByText("85%")).not.toBeInTheDocument();
	});

	test("very long label text renders the heading visibly", async () => {
		const { getByTestId } = await render(Label, {
			...default_props,
			value: {
				label:
					"A very long classification label that describes many possible output categories in detail"
			}
		});
		expect(getByTestId("label-output-value")).toBeVisible();
	});

	test("change event fires after set_data transitions from empty to labelled state", async () => {
		const { listen, set_data } = await render(Label, {
			...default_props,
			value: { label: null }
		});
		const change = listen("change");
		await set_data({ value: { label: "Cat" } });
		expect(change).toHaveBeenCalledTimes(1);
	});
});
