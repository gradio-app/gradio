import type { Config as VegaConfig } from "vega";
import tw_colors from "tailwindcss/colors";

export function create_config(darkmode: boolean): VegaConfig {
	return {
		axis: {
			labelFont: "monospace",
			labelColor: darkmode ? tw_colors.slate["200"] : "black",
			titleFont: "monospace",
			titleColor: darkmode ? tw_colors.slate["200"] : "black",
			tickColor: "#aaa",
			gridColor: "#aaa"
		},
		legend: {
			labelColor: darkmode ? tw_colors.slate["200"] : "black",
			labelFont: "monospace",
			titleColor: darkmode ? tw_colors.slate["200"] : "black",
			titleFont: "monospace"
		},
		title: {
			color: darkmode ? tw_colors.slate["200"] : "black",
			font: "monospace"
		}
	};
}
