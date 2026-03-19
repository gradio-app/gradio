import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "js/statustracker";

export interface RobotViewerProps {
	value: null | FileData;
	joint_states: Record<string, number> | null;
	clear_color: [number, number, number, number];
	camera_position: [number | null, number | null, number | null];
	zoom_speed: number;
	pan_speed: number;
	height: number | string | undefined;
	show_joint_names: boolean;
}

export interface RobotViewerEvents {
	change: FileData | null;
	upload: FileData;
	clear: never;
	clear_status: LoadingStatus;
	error: string;
}
