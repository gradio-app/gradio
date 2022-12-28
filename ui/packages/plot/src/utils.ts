import type { Config as VegaConfig } from "vega";

const light = "#e2e8f0";
const dark = "#111827";

export function create_config(darkmode: boolean): VegaConfig {
	return {
		axis: {
			labelFont: "sans-serif",
			labelColor: dark,
			titleFont: "sans-serif",
			titleColor: dark,
			tickColor: "#aaa",
			gridColor: "#aaa",
			titleFontWeight: "normal",
			labelFontWeight: "normal"
		},
		legend: {
			labelColor: dark,
			labelFont: "sans-serif",
			titleColor: dark,
			titleFont: "sans-serif",
			titleFontWeight: "normal",
			labelFontWeight: "normal"
		},
		title: {
			color: dark,
			font: "sans-serif",
			fontWeight: "normal"
		}
	};
}
