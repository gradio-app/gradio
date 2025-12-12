import type { LoadingStatus } from "js/statustracker";
import type { CustomButton } from "@gradio/utils";

export interface JSONProps {
	value: any;
	open: boolean;
	show_indices: boolean;
	height: number | string | undefined;
	min_height: number | string | undefined;
	max_height: number | string | undefined;
	theme_mode: "system" | "light" | "dark";
	buttons: (string | CustomButton)[];
}

export interface JSONEvents {
	change: never;
	clear_status: LoadingStatus;
}
