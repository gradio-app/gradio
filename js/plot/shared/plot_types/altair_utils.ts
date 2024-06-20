import type { Config as VegaConfig } from "vega";

export function create_config(computed_style: CSSStyleDeclaration): VegaConfig {
	let accentColor = computed_style.getPropertyValue("--color-accent");
	let bodyTextColor = computed_style.getPropertyValue("--body-text-color");
	let borderColorPrimary = computed_style.getPropertyValue(
		"--border-color-primary"
	);
	let fontFamily = computed_style.fontFamily;
	let titleWeight = computed_style.getPropertyValue(
		"--block-title-text-weight"
	) as "bold" | "normal" | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	const fontToPxVal = (font: string) => {
		return font.endsWith("px") ? parseFloat(font.slice(0, -2)) : 12;
	};
	let textSizeMd = fontToPxVal(computed_style.getPropertyValue("--text-md"));
	let textSizeSm = fontToPxVal(computed_style.getPropertyValue("--text-sm"));
	return {
		autosize: { type: "fit", contains: "padding" },
		mark: {
			color: accentColor,
			fillOpacity: 0.8,

		},
		axis: {
			labelFont: fontFamily,
			labelColor: bodyTextColor,
			titleFont: fontFamily,
			titleColor: bodyTextColor,
			tickColor: borderColorPrimary,
			labelFontSize: textSizeSm,
			gridColor: borderColorPrimary,
			titleFontWeight: "normal",
			titleFontSize: textSizeSm,
			labelFontWeight: "normal",
			domain: false,
			labelAngle: 0
		},
		legend: {
			labelColor: bodyTextColor,
			labelFont: fontFamily,
			titleColor: bodyTextColor,
			titleFont: fontFamily,
			titleFontWeight: "normal",
			titleFontSize: textSizeSm,
			labelFontWeight: "normal",
			offset: 2
		},
		title: {
			color: bodyTextColor,
			font: fontFamily,
			fontSize: textSizeMd,
			fontWeight: titleWeight,
			anchor: "middle"
		},
		view: {
			stroke: borderColorPrimary
		}
	};
}
