import tinycolor from "tinycolor2";

export function hsva_to_rgba(hsva: {
	h: number;
	s: number;
	v: number;
	a: number;
}): string {
	const saturation = hsva.s;
	const value = hsva.v;
	let chroma = saturation * value;
	const hue_by_60 = hsva.h / 60;
	let x = chroma * (1 - Math.abs((hue_by_60 % 2) - 1));
	const m = value - chroma;

	chroma = chroma + m;
	x = x + m;

	const index = Math.floor(hue_by_60) % 6;
	const red = [chroma, x, m, m, x, chroma][index];
	const green = [x, chroma, chroma, x, m, m][index];
	const blue = [m, m, x, chroma, chroma, x][index];

	return `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${hsva.a})`;
}

export function format_color(
	color: string,
	mode: "hex" | "rgb" | "hsl"
): string {
	if (mode === "hex") {
		return tinycolor(color).toHexString();
	} else if (mode === "rgb") {
		return tinycolor(color).toRgbString();
	}
	return tinycolor(color).toHslString();
}
