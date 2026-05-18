import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "@gradio/statustracker";

export interface VideoEditorData {
	video: FileData;
	mask?: FileData | null;
}

export interface VideoEditorProps {
	value: VideoEditorData | null;
	brush_color: string;
	brush_size: number;
	height: number | string | undefined;
}

export interface VideoEditorEvents {
	change: never;
	upload: never;
	clear: never;
	clear_status: LoadingStatus;
}
