import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "js/statustracker";
import type { CustomButton } from "@gradio/utils";

export interface Model3DProps {
	value: null | FileData;
	display_mode: "solid" | "point_cloud" | "wireframe";
	clear_color: [number, number, number, number];
	height: number | undefined;
	zoom_speed: number;
	has_change_history: boolean;
	camera_position: [number | null, number | null, number | null];
	buttons: (string | CustomButton)[] | null;
}

export interface Model3DEvents {
	change: FileData | null;
	upload: FileData;
	edit: never;
	clear: never;
	clear_status: LoadingStatus;
	error: string;
	custom_button_click: { id: number };
}
