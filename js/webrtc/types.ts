import type { ILoadingStatus as LoadingStatus } from "@gradio/statustracker";

export type Mode = "send-receive" | "send" | "receive";
export type Modality = "video" | "audio" | "audio-video";
export type StreamState = "open" | "waiting" | "closed";

export interface WebRTCServer {
	offer: (body: Record<string, unknown>) => Promise<any>;
	// Only once the stream's turn has come; undefined if the request failed
	get_rtc_configuration: (body: {
		webrtc_id: string;
	}) => Promise<Record<string, any> | undefined>;
}

/** The stream's queue event: it connects only once its turn has come. */
export interface QueueTurn {
	/** Joins the queue with the stream; resolves with whether its turn came. */
	request: () => Promise<boolean>;
	/** Leaves the queue, or ends the stream's queue event. */
	end: () => void;
}

export interface ControlMessage {
	type: string;
	data?: unknown;
}

export interface WebRTCProps {
	value: string | null;
	mode: Mode;
	modality: Modality;
	rtp_params: Record<string, any>;
	track_constraints: Record<string, any>;
	mirror_webcam: boolean | "auto";
	time_limit: number | null;
	/** gr.StreamOptions; labels may be translation markers. */
	stream_options: {
		button_labels: { start?: string; stop?: string; waiting?: string };
		// Served file data, like gr.Button's icon
		icon: { url?: string | null } | null;
		icon_button_color: string | null;
		pulse_color: string | null;
		icon_radius: number | null;
	};
	height: number | string | null;
	width: number | string | null;
	/** Whether a handler is attached with `.stream()`. */
	has_stream: boolean;
}

export interface WebRTCEvents {
	change: never;
	tick: never;
	stream: never;
	start_recording: never;
	stop_recording: never;
	error: string;
	warning: string;
	info: string;
	clear_status: LoadingStatus;
}

/** Setting the component value to this string starts a stream in mode="receive". */
export const START_STREAM = "__start_webrtc_stream__";
