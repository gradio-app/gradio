import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";
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
	base_props: { ...default_props, value: null },
	has_label: false
});

async function waitForChart(container: HTMLElement): Promise<void> {
	await waitFor(() => {
		expect(container.querySelector("svg")).toBeInTheDocument();
	});
}

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
