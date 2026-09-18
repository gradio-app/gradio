import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import NativePlot from "./Index.svelte";
import type { NativePlotProps } from "./types";

const plot_value = {
	columns: ["x", "y", "series"],
	data: [
		[1, 4, "alpha"],
		[2, 5, "alpha"],
		[1, 7, "beta"],
		[2, 8, "beta"]
	],
	datatypes: {
		x: "quantitative",
		y: "quantitative",
		series: "nominal"
	},
	mark: "line"
} satisfies NativePlotProps["value"];

const bar_value = {
	columns: ["category", "count"],
	data: [
		["apples", 3],
		["pears", 6]
	],
	datatypes: {
		category: "nominal",
		count: "quantitative"
	},
	mark: "bar"
} satisfies NativePlotProps["value"];

const default_props = {
	value: plot_value,
	x: "x",
	y: "y",
	color: null,
	title: null,
	x_title: null,
	y_title: null,
	color_title: null,
	x_bin: null,
	y_aggregate: undefined,
	color_map: null,
	colors_in_legend: null,
	x_lim: null,
	y_lim: null,
	x_label_angle: 0,
	y_label_angle: 0,
	x_axis_format: null,
	y_axis_format: null,
	x_axis_labels_visible: true,
	caption: null,
	sort: null,
	tooltip: "axis" as const,
	buttons: null,
	_selectable: false,
	label: "Native Plot",
	show_label: false,
	scale: null,
	min_width: 160,
	loading_status: undefined,
	height: 260
};

run_shared_prop_tests({
	component: NativePlot,
	name: "NativePlot",
	base_props: { ...default_props, value: null }
});

async function waitForChart(container: HTMLElement): Promise<void> {
	await waitFor(() => {
		expect(container.querySelector(".vega-embed svg")).toBeInTheDocument();
	});
}

describe("NativePlot", () => {
	afterEach(() => cleanup());

	test("renders a chart when given a value", async () => {
		const { container } = await render(NativePlot, default_props);

		await waitForChart(container);
	});

	test("renders an empty placeholder when the value is null", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: null
		});

		expect(container.querySelector(".vega-embed svg")).not.toBeInTheDocument();
		expect(container).not.toHaveTextContent("alpha");
	});

	test("labels both axes with the column names by default", async () => {
		const { container } = await render(NativePlot, default_props);

		await waitForChart(container);

		expect(container).toHaveTextContent("x");
		expect(container).toHaveTextContent("y");
	});

	test("renders a bar chart from nominal data", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("apples");
		expect(container).toHaveTextContent("pears");
	});
});

describe("Props: title / caption", () => {
	afterEach(() => cleanup());

	test("title is rendered above the chart", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			title: "Quarterly revenue"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("Quarterly revenue");
	});

	test("no title is rendered when title is null", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			title: null
		});

		await waitForChart(container);

		expect(container).not.toHaveTextContent("Quarterly revenue");
	});

	test("caption is rendered below the chart", async () => {
		const { getByText, container } = await render(NativePlot, {
			...default_props,
			caption: "Source: internal data"
		});

		await waitForChart(container);

		expect(getByText("Source: internal data")).toBeVisible();
	});

	test("no caption element is rendered when caption is null", async () => {
		const { queryByText, container } = await render(NativePlot, {
			...default_props,
			caption: null
		});

		await waitForChart(container);

		expect(queryByText("Source: internal data")).not.toBeInTheDocument();
	});
});

describe("Props: axis titles", () => {
	afterEach(() => cleanup());

	test("x_title replaces the x column name on the axis", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			x_title: "Time elapsed"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("Time elapsed");
	});

	test("y_title replaces the y column name on the axis", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			y_title: "Temperature"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("Temperature");
	});

	test("x_axis_labels_visible: false hides the x axis tick labels", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count",
			x_axis_labels_visible: false
		});

		await waitForChart(container);

		await waitFor(() => {
			expect(container).not.toHaveTextContent("apples");
		});
	});

	test("x_axis_labels_visible: true shows the x axis tick labels", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count",
			x_axis_labels_visible: true
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("apples");
	});
});

describe("Props: color", () => {
	afterEach(() => cleanup());

	test("a nominal color column renders a legend entry per series", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			color: "series"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("alpha");
		expect(container).toHaveTextContent("beta");
	});

	test("no legend is rendered when color is null", async () => {
		const { container } = await render(NativePlot, default_props);

		await waitForChart(container);

		expect(container).not.toHaveTextContent("alpha");
	});

	test("color_title names the legend", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			color: "series",
			color_title: "Cohort"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("Cohort");
	});
});

describe("Props: colors_in_legend", () => {
	afterEach(() => cleanup());

	test("colors_in_legend: [] hides all color legend entries", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			color: "series",
			colors_in_legend: []
		});

		await waitForChart(container);

		expect(container).not.toHaveTextContent("alpha");
		expect(container).not.toHaveTextContent("beta");
		expect(container).not.toHaveTextContent("series");
	});

	test("colors_in_legend limits visible color legend entries", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			color: "series",
			colors_in_legend: ["alpha"]
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("alpha");
		expect(container).not.toHaveTextContent("beta");
	});
});

describe("Props: sort", () => {
	afterEach(() => cleanup());

	test("sort: 'x' orders nominal categories ascending", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count",
			sort: "x"
		});

		await waitForChart(container);

		await waitFor(() => {
			expect(x_axis_labels(container)).toEqual(["apples", "pears"]);
		});
	});

	test("sort: '-x' orders nominal categories descending", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count",
			sort: "-x"
		});

		await waitForChart(container);

		await waitFor(() => {
			expect(x_axis_labels(container)).toEqual(["pears", "apples"]);
		});
	});

	test("an explicit sort list fixes the category order", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count",
			sort: ["pears", "apples"]
		});

		await waitForChart(container);

		await waitFor(() => {
			expect(x_axis_labels(container)).toEqual(["pears", "apples"]);
		});
	});
});

function x_axis_labels(container: HTMLElement): string[] {
	// Vega-Lite renders axis tick labels as <text> inside a role-axis group.
	// There is no accessible role or test id to target them by.
	const axis = Array.from(container.querySelectorAll("g[aria-label]")).find(
		(g) => g.getAttribute("aria-label")?.startsWith("X-axis")
	);
	if (!axis) return [];
	return Array.from(axis.querySelectorAll("text"))
		.map((t) => t.textContent ?? "")
		.filter((t) => t === "apples" || t === "pears");
}

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("no buttons are rendered when the list is null", async () => {
		const { queryByLabelText, container } = await render(
			NativePlot,
			default_props
		);

		await waitForChart(container);

		expect(queryByLabelText("Fullscreen")).not.toBeInTheDocument();
		expect(queryByLabelText("Export")).not.toBeInTheDocument();
	});

	test("clicking the fullscreen button toggles fullscreen mode", async () => {
		const { container, getByLabelText } = await render(NativePlot, {
			...default_props,
			buttons: ["fullscreen"]
		});

		await waitForChart(container);

		await fireEvent.click(getByLabelText("Fullscreen"));
		await waitFor(() => {
			expect(getByLabelText("Exit fullscreen mode")).toBeVisible();
		});

		await fireEvent.click(getByLabelText("Exit fullscreen mode"));
		await waitFor(() => {
			expect(getByLabelText("Fullscreen")).toBeVisible();
		});
		await waitForChart(container);
	});

	test("the export button saves the chart as chart.png", async () => {
		const { container, getByLabelText } = await render(NativePlot, {
			...default_props,
			buttons: ["export"]
		});

		await waitForChart(container);

		// The export builds a data: URL and clicks a synthetic <a download>.
		// Playwright never raises a download event for data: URLs, so
		// download_file() can't observe this one — stubbing the anchor click is
		// the only way to see what the component actually hands the browser.
		const saved: { name: string | null; type: string }[] = [];
		const real_click = HTMLAnchorElement.prototype.click;
		HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
			saved.push({
				name: this.getAttribute("download"),
				type: this.href.slice(0, this.href.indexOf(";"))
			});
		};

		try {
			// export_chart bails out until vegaEmbed's promise has handed over the
			// view, so retry the click until the export actually runs.
			await waitFor(async () => {
				await fireEvent.click(getByLabelText("Export"));
				expect(saved.length).toBeGreaterThan(0);
			});
		} finally {
			HTMLAnchorElement.prototype.click = real_click;
		}

		expect(saved[0].name).toBe("chart.png");
		expect(saved[0].type).toBe("data:image/png");
	});

	test("a custom button dispatches custom_button_click with its id", async () => {
		const { container, listen, getByLabelText } = await render(NativePlot, {
			...default_props,
			buttons: [{ value: "Annotate", id: 3, icon: null }]
		});

		await waitForChart(container);
		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Annotate"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 3 });
	});

	test("custom and built-in buttons can be shown together", async () => {
		const { container, getByLabelText } = await render(NativePlot, {
			...default_props,
			buttons: ["fullscreen", { value: "Annotate", id: 3, icon: null }]
		});

		await waitForChart(container);

		expect(getByLabelText("Fullscreen")).toBeVisible();
		expect(getByLabelText("Annotate")).toBeVisible();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change is not dispatched on mount", async () => {
		const { listen, container } = await render(NativePlot, default_props);
		const change = listen("change", { retrospective: true });

		await waitForChart(container);

		expect(change).not.toHaveBeenCalled();
	});

	test("change is dispatched when a new value arrives", async () => {
		const { listen, set_data, container } = await render(
			NativePlot,
			default_props
		);
		await waitForChart(container);
		const change = listen("change");

		await set_data({
			value: {
				...plot_value,
				data: [
					[1, 10, "alpha"],
					[2, 20, "alpha"]
				]
			}
		});

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change is not dispatched when a prop other than value changes", async () => {
		const { listen, set_data, container } = await render(
			NativePlot,
			default_props
		);
		await waitForChart(container);
		const change = listen("change");

		await set_data({ x_title: "Relabelled" });

		expect(change).not.toHaveBeenCalled();
	});

	test("double clicking the chart dispatches double_click", async () => {
		const { listen, container } = await render(NativePlot, default_props);
		await waitForChart(container);
		const double_click = listen("double_click");

		// The dblclick listener is attached inside vegaEmbed's promise, which
		// resolves after the svg is in the DOM — retry until it is listening.
		await waitFor(async () => {
			await fireEvent.dblClick(container.querySelector(".vega-embed svg")!);
			expect(double_click).toHaveBeenCalled();
		});
	});

	test("clear_status is dispatched when the error status is dismissed", async () => {
		const { listen, getByLabelText } = await render(NativePlot, {
			...default_props,
			loading_status: {
				status: "error",
				queue_position: null,
				queue_size: null,
				eta: null,
				message: "it broke",
				show_progress: "full",
				scroll_to_output: false,
				visible: true,
				fn_index: 0
			}
		});
		const clear_status = listen("clear_status");

		await fireEvent.click(getByLabelText("common.clear"));

		expect(clear_status).toHaveBeenCalledTimes(1);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the current plot data", async () => {
		const { get_data, container } = await render(NativePlot, default_props);
		await waitForChart(container);

		expect((await get_data()).value).toEqual(plot_value);
	});

	test("set_data redraws the chart with the new data", async () => {
		const { set_data, container } = await render(NativePlot, {
			...default_props,
			value: bar_value,
			x: "category",
			y: "count"
		});
		await waitForChart(container);
		expect(container).toHaveTextContent("apples");

		await set_data({
			value: {
				...bar_value,
				data: [
					["plums", 1],
					["figs", 2]
				]
			}
		});

		await waitFor(() => {
			expect(container).toHaveTextContent("plums");
			expect(container).not.toHaveTextContent("apples");
		});
	});

	test("set_data round-trips through get_data", async () => {
		const { set_data, get_data, container } = await render(
			NativePlot,
			default_props
		);
		await waitForChart(container);

		await set_data({ value: bar_value, x: "category", y: "count" });

		expect((await get_data()).value).toEqual(bar_value);
	});

	test("set_data can change the axis titles on an existing chart", async () => {
		const { set_data, container } = await render(NativePlot, default_props);
		await waitForChart(container);

		await set_data({ x_title: "Rebuilt axis" });

		await waitFor(() => {
			expect(container).toHaveTextContent("Rebuilt axis");
		});
	});

	test("setting the value to null clears the chart", async () => {
		const { set_data, container } = await render(NativePlot, default_props);
		await waitForChart(container);

		await set_data({ value: null });

		await waitFor(() => {
			expect(
				container.querySelector(".vega-embed svg")
			).not.toBeInTheDocument();
		});
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("renders a chart from a single data point", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: { ...plot_value, data: [[1, 4, "alpha"]] }
		});

		await waitForChart(container);
	});

	test("renders without error when the data is empty", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: { ...plot_value, data: [] }
		});

		await waitForChart(container);
	});

	test("renders columns whose names contain vega field separators", async () => {
		const { container } = await render(NativePlot, {
			...default_props,
			value: {
				columns: ["a.b", "c[d]"],
				data: [
					[1, 2],
					[3, 4]
				],
				datatypes: { "a.b": "quantitative", "c[d]": "quantitative" },
				mark: "line"
			},
			x: "a.b",
			y: "c[d]"
		});

		await waitForChart(container);

		expect(container).toHaveTextContent("a.b");
	});
});

test.todo(
	"VISUAL: color_map assigns the given colour to each named series — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: x_label_angle and y_label_angle rotate the axis tick labels — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: x_lim and y_lim clip the plotted marks to the given domain — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: height sizes the chart container — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: hovering a line chart thickens the nearest series — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"BROWSER: _selectable=true lets a drag across the chart brush-select an x range and dispatch `select` — needs a real pointer drag over the vega view, which fireEvent cannot simulate"
);
test.todo(
	"BROWSER: tooltip='all' / 'axis' / a column list control which fields appear in the vega tooltip — the tooltip is rendered in a document-level element on real pointer hover"
);
