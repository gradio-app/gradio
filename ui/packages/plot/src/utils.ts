import type { Config as VegaConfig } from "vega";
import tw_colors from "tailwindcss/colors";

export function create_config(darkmode: boolean): VegaConfig {
	return {
		axis: {
			labelFont: "sans-serif",
			labelColor: darkmode ? tw_colors.slate["200"] : tw_colors.gray[900],
			titleFont: "sans-serif",
			titleColor: darkmode ? tw_colors.slate["200"] : tw_colors.gray[900],
			tickColor: "#aaa",
			gridColor: "#aaa",
			titleFontWeight: "normal",
			labelFontWeight: "normal"
		},
		legend: {
			labelColor: darkmode ? tw_colors.slate["200"] : tw_colors.gray[900],
			labelFont: "sans-serif",
			titleColor: darkmode ? tw_colors.slate["200"] : tw_colors.gray[900],
			titleFont: "sans-serif",
			titleFontWeight: "normal",
			labelFontWeight: "normal"
		},
		title: {
			color: darkmode ? tw_colors.slate["200"] : tw_colors.gray[900],
			font: "sans-serif",
			fontWeight: "normal"
		}
	};
}
