import type { ILoadingStatus as LoadingStatus } from "@gradio/statustracker";

export type Mode = "send-receive" | "send" | "receive";
export type Modality = "video" | "audio" | "audio-video";
export type StreamState = "open" | "waiting" | "closed";

/** Server functions exposed by the Python component. */
export interface WebRTCServer {
	offer: (body: Record<string, unknown>) => Promise<any>;
	// Only for a stream whose turn has come, from the page that started it
	get_rtc_configuration: (body: {
		webrtc_id: string;
	}) => Promise<Record<string, any>>;
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
	// Toasts (errors of the handler, gr.Warning / gr.Info / gr.Success)
	title?: string | null;
	duration?: number | null;
	visible?: boolean;
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
	close_stream: never;
	start_recording: never;
	stop_recording: never;
	error: string | Toast;
	warning: string | Toast;
	info: Toast;
	success: Toast;
	clear_status: LoadingStatus;
}

/** A toast from the stream's handler, shown like an event's. */
export interface Toast {
	message: string;
	title?: string;
	duration?: number | null;
	visible?: boolean;
}

/** Setting the component value to this string starts a stream in mode="receive". */
export const START_STREAM = "__start_webrtc_stream__";
