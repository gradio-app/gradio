import { colors } from "@gradio/theme";

export function name_to_rgba(
	name: string,
	a: number,
	ctx: CanvasRenderingContext2D | null
): string {
	if (!ctx) {
		var canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d")!;
	}
	ctx.fillStyle = name;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	ctx.clearRect(0, 0, 1, 1);
	return `rgba(${r}, ${g}, ${b}, ${255 / a})`;
}

export function correct_color_map(
	color_map: Record<string, string>,
	_color_map: Record<string, { primary: string; secondary: string }>,
	browser: any,
	ctx: CanvasRenderingContext2D | null
): void {
	for (const col in color_map) {
		const _c = color_map[col].trim();

		if (_c in colors) {
			_color_map[col] = colors[_c as keyof typeof colors];
		} else {
			_color_map[col] = {
				primary: browser
					? name_to_rgba(color_map[col], 1, ctx)
					: color_map[col],
				secondary: browser
					? name_to_rgba(color_map[col], 0.5, ctx)
					: color_map[col]
			};
		}
	}
}

export function merge_elements(
	value: { token: string; class_or_confidence: string | number | null }[],
	mergeMode: "empty" | "equal"
): { token: string; class_or_confidence: string | number | null }[] {
	let result: typeof value = [];
	let tempStr: string | null = null;
	let tempVal: string | number | null = null;

	for (const val of value) {
		if (
			(mergeMode === "empty" && val.class_or_confidence === null) ||
			(mergeMode === "equal" && tempVal === val.class_or_confidence)
		) {
			tempStr = tempStr ? tempStr + val.token : val.token;
		} else {
			if (tempStr !== null) {
				result.push({
					token: tempStr,
					class_or_confidence: tempVal
				});
			}
			tempStr = val.token;
			tempVal = val.class_or_confidence;
		}
	}

	if (tempStr !== null) {
		result.push({
			token: tempStr,
			class_or_confidence: tempVal
		});
	}

	return result;
}
