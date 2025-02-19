import { type ColorInput } from "tinycolor2";

export interface Eraser {
	/**
	 * The default size of the eraser.
	 */
	default_size: number | "auto";
}

export interface Brush extends Eraser {
	/**
	 * The default color of the brush.
	 */
	default_color: ColorInput;
	/**
	 * The colors to show in the color swatch
	 */
	colors: ColorInput[];
	/**
	 * Whether to show _only_ the color swatches specified in `colors`, or to show the color swatches specified in `colors` along with the colorpicker.
	 */
	color_mode: "fixed" | "defaults";
}
