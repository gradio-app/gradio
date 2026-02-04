import type { SelectData, CustomButton } from "@gradio/utils";
import type { LoadingStatus } from "js/statustracker";

export interface HighlightedToken {
	token: string;
	class_or_confidence: string | number | null;
}

export interface HighlightedTextProps {
	value: HighlightedToken[];
	show_legend: boolean;
	show_inline_category: boolean;
	color_map: Record<string, string>;
	combine_adjacent: boolean;
	show_whitespaces: boolean;
	rtl: boolean;
	buttons: (string | CustomButton)[] | null;
}

export interface HighlightedTextEvents {
	change: never;
	select: SelectData;
	clear_status: LoadingStatus;
	custom_button_click: { id: number };
}
