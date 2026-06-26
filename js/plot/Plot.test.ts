import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import Plot from "./Index.svelte";

const matplotlib_value = {
	type: "matplotlib",
	plot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
	chart: "bar"
};

// layout has no height on purpose: this is the autosize path.
const plotly_autosize_value = {
	type: "plotly",
	plot: JSON.stringify({
		data: [{ type: "scatter", x: [1, 2, 3], y: [4, 5, 6] }],
		layout: {}
	})
};

const default_props = {
	value: null as null | Record<string, any>,
	label: "Plot",
	show_label: true,
	caption: "",
	theme_mode: "light" as const,
	bokeh_version: null,
	show_actions_button: false,
	_selectable: false,
	x_lim: null,
	show_fullscreen_button: false,
	buttons: null,
	container: true
};

run_shared_prop_tests({
	component: Plot,
	name: "Plot",
	base_props: { ...default_props },
	has_label: false
});

describe("Props: label", () => {
	afterEach(() => cleanup());

	test("renders the label text", async () => {
		const { getByTestId } = await render(Plot, {
			...default_props,
			label: "My Chart"
		});

		expect(getByTestId("block-label")).toHaveTextContent("My Chart");
	});

	test("show_label: true makes the label visible", async () => {
		const { getByTestId } = await render(Plot, {
			...default_props,
			show_label: true
		});

		expect(getByTestId("block-label")).toBeVisible();
	});

	test("show_label: false hides the label", async () => {
		const { getByTestId } = await render(Plot, {
			...default_props,
			show_label: false
		});

		expect(getByTestId("block-label")).not.toBeVisible();
	});
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("renders the empty state when value is null", async () => {
		const { getByLabelText } = await render(Plot, {
			...default_props,
			value: null
		});

		expect(getByLabelText("Empty value")).toBeInTheDocument();
	});

	test("renders a plot when value is provided", async () => {
		const { getByTestId, queryByLabelText } = await render(Plot, {
			...default_props,
			value: matplotlib_value
		});

		await waitFor(() => {
			expect(getByTestId("matplotlib")).toBeInTheDocument();
		});
		expect(queryByLabelText("Empty value")).toBeNull();
	});

	test("the rendered plot uses the value's image source", async () => {
		const { getByTestId } = await render(Plot, {
			...default_props,
			value: matplotlib_value
		});

		await waitFor(() => {
			const img = getByTestId("matplotlib").querySelector("img");
			expect(img).toHaveAttribute("src", matplotlib_value.plot);
		});
	});

	test("set_data with a value replaces the empty state with a plot", async () => {
		const { set_data, getByTestId, queryByLabelText } = await render(Plot, {
			...default_props,
			value: null
		});

		expect(queryByLabelText("Empty value")).toBeInTheDocument();

		await set_data({ value: matplotlib_value });

		await waitFor(() => {
			expect(getByTestId("matplotlib")).toBeInTheDocument();
		});
		expect(queryByLabelText("Empty value")).toBeNull();
	});

	test("set_data with null restores the empty state", async () => {
		const { set_data, getByLabelText } = await render(Plot, {
			...default_props,
			value: matplotlib_value
		});

		await set_data({ value: null });

		expect(getByLabelText("Empty value")).toBeInTheDocument();
	});
});

describe("Props: show_fullscreen_button", () => {
	afterEach(() => cleanup());

	test("show_fullscreen_button: true renders the fullscreen button", async () => {
		const { getByLabelText } = await render(Plot, {
			...default_props,
			show_fullscreen_button: true
		});

		expect(getByLabelText("Fullscreen")).toBeVisible();
	});

	test("show_fullscreen_button: false hides the fullscreen button", async () => {
		const { queryByLabelText } = await render(Plot, {
			...default_props,
			show_fullscreen_button: false
		});

		expect(queryByLabelText("Fullscreen")).toBeNull();
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("a custom button is rendered with its label", async () => {
		const { getByLabelText } = await render(Plot, {
			...default_props,
			buttons: [{ value: "Export", id: 1, icon: null }]
		});

		expect(getByLabelText("Export")).toBeVisible();
	});

	test("no toolbar buttons render when buttons is null and fullscreen is off", async () => {
		const { queryByLabelText } = await render(Plot, {
			...default_props,
			buttons: null,
			show_fullscreen_button: false
		});

		expect(queryByLabelText("Export")).toBeNull();
		expect(queryByLabelText("Fullscreen")).toBeNull();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("fires when value changes via set_data", async () => {
		const { listen, set_data } = await render(Plot, {
			...default_props,
			value: null
		});

		const change = listen("change");

		await set_data({ value: matplotlib_value });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("does not fire when an unrelated prop changes", async () => {
		const { listen, set_data } = await render(Plot, {
			...default_props,
			value: matplotlib_value
		});

		const change = listen("change");

		await set_data({ caption: "A new caption" });

		expect(change).not.toHaveBeenCalled();
	});
});

describe("Events: custom_button_click", () => {
	afterEach(() => cleanup());

	test("fires with the button id when a custom button is clicked", async () => {
		const { listen, getByLabelText } = await render(Plot, {
			...default_props,
			buttons: [{ value: "Export", id: 42, icon: null }]
		});

		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Export"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 42 });
	});

	test("each custom button dispatches its own id", async () => {
		const { listen, getByLabelText } = await render(Plot, {
			...default_props,
			buttons: [
				{ value: "First", id: 1, icon: null },
				{ value: "Second", id: 2, icon: null }
			]
		});

		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("First"));
		await fireEvent.click(getByLabelText("Second"));

		expect(custom).toHaveBeenNthCalledWith(1, { id: 1 });
		expect(custom).toHaveBeenNthCalledWith(2, { id: 2 });
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the initial value", async () => {
		const { get_data } = await render(Plot, {
			...default_props,
			value: matplotlib_value
		});

		const data = await get_data();
		expect(data.value).toEqual(matplotlib_value);
	});

	test("get_data returns null when no value is set", async () => {
		const { get_data } = await render(Plot, {
			...default_props,
			value: null
		});

		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("set_data then get_data round-trips correctly", async () => {
		const { set_data, get_data } = await render(Plot, {
			...default_props,
			value: null
		});

		await set_data({ value: matplotlib_value });

		const data = await get_data();
		expect(data.value).toEqual(matplotlib_value);
	});
});

describe("Plotly", () => {
	afterEach(() => cleanup());

	// Regression: this collapsed to zero height after the Svelte 5 migration.
	test("an autosize figure renders with a non-zero height", async () => {
		const { getByTestId } = await render(Plot, {
			...default_props,
			value: plotly_autosize_value
		});

		await waitFor(() => {
			const plot = getByTestId("plotly");
			expect(plot.querySelector(".main-svg")).toBeTruthy();
			expect(plot.offsetHeight).toBeGreaterThan(0);
		});
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("renders without crashing when value is null", async () => {
		const { container } = await render(Plot, {
			...default_props,
			value: null
		});

		expect(container).toBeInTheDocument();
	});

	test("change fires on initial mount", async () => {
		const { listen } = await render(Plot, {
			...default_props,
			value: matplotlib_value
		});

		const change = listen("change", { retrospective: true });

		expect(change).toHaveBeenCalled();
	});
});
