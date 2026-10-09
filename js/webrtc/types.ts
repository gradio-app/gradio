import type { ILoadingStatus as LoadingStatus } from "@gradio/statustracker";

export type Mode = "send-receive" | "send" | "receive";
export type Modality = "video" | "audio" | "audio-video";
export type StreamState = "open" | "waiting" | "closed";

/** Server functions exposed by the Python component. */
export interface WebRTCServer {
	offer: (body: Record<string, unknown>) => Promise<any>;
	get_rtc_configuration: () => Promise<Record<string, any>>;
}

/**
 * The stream's place in the queue. Each stream is one queue event: it waits
 * in line, and only connects once its turn has come.
 */
export interface QueueTurn {
	/** Joins the queue with the stream; resolves with whether its turn came. */
	request: () => Promise<boolean>;
	/** Leaves the queue, or ends the stream's queue event. */
	end: () => void;
}

/** A control message sent by the server over the data channel. */
export interface ControlMessage {
	type: string;
	data?: unknown;
	message?: string;
}

export interface WebRTCProps {
	value: string | null;
	mode: Mode;
	modality: Modality;
	rtp_params: Record<string, any>;
	track_constraints: Record<string, any>;
	mirror_webcam: boolean | "auto";
	time_limit: number | null;
	icon: string | null;
	icon_button_color: string | null;
	pulse_color: string | null;
	icon_radius: number | null;
	button_labels: { start: string; stop: string; waiting: string };
	height: number | string | null;
	width: number | string | null;
}

export interface WebRTCEvents {
	change: never;
	tick: never;
	stream: never;
	close_stream: never;
	start_recording: never;
	stop_recording: never;
	error: string;
	warning: string;
	clear_status: LoadingStatus;
}

/** Setting the component value to this string starts a stream in mode="receive". */
export const START_STREAM = "__start_webrtc_stream__";
