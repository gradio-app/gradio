import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "@gradio/statustracker";
import type { CustomButton } from "@gradio/utils";
import type { WebcamOptions } from "./shared/utils";

export interface VideoProps {
	value: FileData | null;
	height: number | undefined;
	width: number | undefined;
	autoplay: boolean;
	buttons: ("share" | "download" | "fullscreen" | CustomButton)[];
	sources:
		| ["webcam"]
		| ["upload"]
		| ["webcam", "upload"]
		| ["upload", "webcam"];
	webcam_options: WebcamOptions;
	include_audio: boolean;
	loop: boolean;
	webcam_constraints: object;
	subtitles: FileData | null;
	playback_position: number;
}

export interface VideoEvents {
	change: never;
	clear: never;
	play: never;
	pause: never;
	upload: never;
	stop: never;
	end: never;
	start_recording: never;
	stop_recording: never;
	clear_status: LoadingStatus;
	share: any;
	error: any;
	warning: any;
	custom_button_click: { id: number };
}
