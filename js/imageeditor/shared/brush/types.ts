import { type ColorInput } from "tinycolor2";

/**
 * Represents the state of the brush tool.
 * @interface BrushState
 * @property {number} opacity - The opacity of the brush.
 * @property {number} brush_size - The size of the brush.
 * @property {string} color - The color of the brush in hex format.
 * @property {"draw"|"erase"} mode - The mode of the brush, either draw or erase.
 */
export interface BrushState {
	opacity: number;
	brush_size: number;
	color: string;
	mode: "draw" | "erase";
}

export interface Eraser {
	/**
	 * The default size of the eraser.
	 */
	default_size: number | "auto";
}

export type ColorTuple = [ColorInput, number]; // [color, opacity]

export interface Brush extends Eraser {
	/**
	 * The default color of the brush.
	 */
	default_color: ColorInput;
	/**
	 * The colors to show in the color swatch.
	 * Can be either simple color strings or [color, opacity] tuples.
	 */
	colors: (ColorInput | ColorTuple)[];
	/**
	 * Whether to show _only_ the color swatches specified in `colors`, or to show the color swatches specified in `colors` along with the colorpicker.
	 */
	color_mode: "fixed" | "defaults";
}
