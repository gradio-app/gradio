import type { FileData } from "@gradio/client";
import type { LoadingStatus } from "@gradio/statustracker";
import type { WebcamOptions } from "./shared/utils";

export interface VideoProps {
	value: FileData | null;
	height: number | undefined;
	width: number | undefined;
	autoplay: boolean;
	buttons: ("share" | "download" | "fullscreen")[];
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
}
