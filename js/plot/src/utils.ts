import type { Config as VegaConfig } from "vega";

const dark = "#e2e8f0";
const light = "#111827";

export function create_config(darkmode: boolean): VegaConfig {
	return {
		axis: {
			labelFont: "sans-serif",
			labelColor: darkmode ? dark : light,
			titleFont: "sans-serif",
			titleColor: darkmode ? dark : light,
			tickColor: "#aaa",
			gridColor: "#aaa",
			titleFontWeight: "normal",
			labelFontWeight: "normal"
		},
		legend: {
			labelColor: darkmode ? dark : light,
			labelFont: "sans-serif",
			titleColor: darkmode ? dark : light,
			titleFont: "sans-serif",
			titleFontWeight: "normal",
			labelFontWeight: "normal"
		},
		title: {
			color: darkmode ? dark : light,
			font: "sans-serif",
			fontWeight: "normal",
			anchor: "middle"
		}
	};
}
