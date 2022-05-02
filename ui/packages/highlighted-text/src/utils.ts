import { ordered_colors } from "@gradio/theme";

export function randInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min);
}

export const getNextColor = (index: number): string => {
	return ordered_colors[index % ordered_colors.length];
};
