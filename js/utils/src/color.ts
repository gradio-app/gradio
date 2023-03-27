import { colors, ordered_colors } from "@gradio/theme";

export const get_next_color = (index: number): keyof typeof colors => {
	return ordered_colors[index % ordered_colors.length];
};
