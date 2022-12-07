import type { Config as VegaConfig } from "vega";
import tw_colors from "tailwindcss/colors";

export function create_config(darkmode: boolean): VegaConfig {
	return {
		axis: {
			labelFont: "sans-serif",
			labelColor: darkmode ? tw_colors.slate["200"] : "black",
			titleFont: "sans-serif",
			titleColor: darkmode ? tw_colors.slate["200"] : "black",
			tickColor: "#aaa",
			gridColor: "#aaa"
		},
		legend: {
			labelColor: darkmode ? tw_colors.slate["200"] : "black",
			labelFont: "sans-serif",
			titleColor: darkmode ? tw_colors.slate["200"] : "black",
			titleFont: "sans-serif"
		},
		title: {
			color: darkmode ? tw_colors.slate["200"] : "black",
			font: "sans-serif"
		}
	};
}
