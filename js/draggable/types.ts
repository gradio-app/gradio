import type { LoadingStatus } from "@gradio/statustracker";

export interface DraggableProps {
	orientation: "row" | "column";
	show_progress: boolean;
}

export interface DraggableEvents {
	clear_status: never;
}
