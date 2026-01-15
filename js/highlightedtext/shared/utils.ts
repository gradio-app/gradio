import { colors } from "@gradio/theme";

export interface HighlightedToken {
	token: string;
	class_or_confidence: string | number | null;
}

export interface ColorPair {
	primary: string;
	secondary: string;
}

function name_to_rgba(name: string, alpha: number): string {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d")!;
	ctx.fillStyle = name;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function is_transparent(color: string): boolean {
	if (!color) return true;
	const c = color.toLowerCase().trim();
	// 9 chars + ends with 00 = #RRGGBBAA format with 0 alpha
	return c === "transparent" || (c.length === 9 && c.endsWith("00"));
}

export function generate_color_map(
	color_map: Record<string, string>,
	is_browser: boolean
): Record<string, ColorPair> {
	const result: Record<string, ColorPair> = {};

	for (const key in color_map) {
		const color = color_map[key].trim();

		if (color in colors) {
			result[key] = colors[color as keyof typeof colors];
		} else if (is_transparent(color)) {
			result[key] = {
				primary: "transparent",
				secondary: "transparent"
			};
		} else {
			result[key] = {
				primary: is_browser ? name_to_rgba(color, 1) : color,
				secondary: is_browser ? name_to_rgba(color, 0.5) : color
			};
		}
	}

	return result;
}

export function merge_elements(
	value: HighlightedToken[],
	merge_mode: "empty" | "equal"
): HighlightedToken[] {
	if (value.length === 0) return [];

	const result: HighlightedToken[] = [];
	let current_token = value[0].token;
	let current_class = value[0].class_or_confidence;

	for (let i = 1; i < value.length; i++) {
		const { token, class_or_confidence } = value[i];
		const should_merge =
			merge_mode === "empty"
				? class_or_confidence === null
				: current_class === class_or_confidence;

		if (should_merge) {
			current_token += token;
		} else {
			result.push({ token: current_token, class_or_confidence: current_class });
			current_token = token;
			current_class = class_or_confidence;
		}
	}

	result.push({ token: current_token, class_or_confidence: current_class });
	return result;
}

export function get_score_color(score: number | null): string {
	if (score === null) return "";
	if (score < 0) {
		return `rgba(128, 90, 213, ${-score})`;
	}
	return `rgba(239, 68, 60, ${score})`;
}
