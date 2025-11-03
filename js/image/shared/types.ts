import type { LoadingStatus } from "@gradio/statustracker";
import type { FileData } from "@gradio/client";

export interface Base64File {
	url: string;
	alt_text: string;
}

export interface WebcamOptions {
	mirror: boolean;
	constraints: MediaStreamConstraints;
}

export interface ImageProps {
	_selectable: boolean;
	sources: ("clipboard" | "webcam" | "upload")[];
	height: number;
	width: number;
	webcam_options: WebcamOptions;
	value: FileData | null;
	buttons: string[];
	pending: boolean;
	streaming: boolean;
	stream_every: number;
	input_ready: boolean;
	placeholder: string;
	watermark: FileData | null;
}

export interface ImageEvents {
	clear: void;
	change: any;
	stream: any;
	select: any;
	upload: any;
	input: any;
	clear_status: LoadingStatus;
	share: any;
	error: any;
}
