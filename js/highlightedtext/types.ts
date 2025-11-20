import type { SelectData } from "@gradio/utils";
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
	rtl: boolean;
}

export interface HighlightedTextEvents {
	change: never;
	select: SelectData;
	clear_status: LoadingStatus;
}
