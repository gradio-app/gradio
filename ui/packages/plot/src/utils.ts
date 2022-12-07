import type { Config as VegaConfig } from "vega";
import tw_colors from "tailwindcss/colors";

export function create_config(darkmode: boolean): VegaConfig {
	return {
		axis: {
			labelFont: "font-sans",
			labelColor: darkmode ? tw_colors.slate["200"] : "black",
			titleFont: "font-sans",
			titleColor: darkmode ? tw_colors.slate["200"] : "black",
			tickColor: "#aaa",
			gridColor: "#aaa"
		},
		legend: {
			labelColor: darkmode ? tw_colors.slate["200"] : "black",
			labelFont: "font-sans",
			titleColor: darkmode ? tw_colors.slate["200"] : "black",
			titleFont: "font-sans"
		},
		title: {
			color: darkmode ? tw_colors.slate["200"] : "black",
			font: "font-sans"
		}
	};
}
