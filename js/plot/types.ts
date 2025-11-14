import type { SelectData } from "@gradio/utils";
import type { LoadingStatus } from "@gradio/statustracker";

export type ThemeMode = "system" | "light" | "dark";

export interface PlotProps {
	value: null | string;
	theme_mode: ThemeMode;
	caption: string;
	bokeh_version: string | null;
	show_actions_button: boolean;
	_selectable: boolean;
	x_lim: [number, number] | null;
	show_fullscreen_button: boolean;
}

export interface PlotEvents {
	change: never;
	select: SelectData;
	clear_status: LoadingStatus;
}
