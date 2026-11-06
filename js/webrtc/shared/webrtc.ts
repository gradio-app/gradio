import {
	close_webrtc,
	negotiate_webrtc,
	new_webrtc_id,
	on_webrtc_connection_state,
	webrtc_rejection_message,
	WEBRTC_DISCONNECT_GRACE_MS,
	WEBRTC_SLOW_CONNECT_MS
} from "@gradio/client";
import type { ControlMessage, WebRTCServer } from "../types";

// The connection itself is the client's, which gr.Server apps use too
export {
	new_webrtc_id,
	close_webrtc as stop,
	on_webrtc_connection_state as on_connection_state,
	webrtc_rejection_message as rejection_message,
	WEBRTC_DISCONNECT_GRACE_MS as DISCONNECT_GRACE_MS,
	WEBRTC_SLOW_CONNECT_MS as SLOW_CONNECT_MS
};

export interface StartOptions {
	/** Local media to send, or null when only receiving. */
	stream: MediaStream | null;
	pc: RTCPeerConnection;
	/** Element that plays the remote media, or null when only sending. */
	node: HTMLMediaElement | null;
	offer: WebRTCServer["offer"];
	webrtc_id: string;
	/** Track kind to receive when no local stream is sent. */
	modality: "video" | "audio";
	rtp_params?: Record<string, any>;
	/** Whether the server should mirror the frames, as the webcam preview is. */
	mirror?: boolean;
	on_message?: (msg: ControlMessage) => void;
	on_reject?: (response: Record<string, any>) => void;
}

// How long after the user stops a stream the same button ignores clicks, so
// that a double click on stop does not start a new stream (and take a turn)
export const RESTART_GUARD_MS = 500;

export function attach_remote_media(
	pc: RTCPeerConnection,
	node: HTMLMediaElement | null
): void {
	pc.addEventListener("track", (evt) => {
		if (!node) return;
		// Checked on every track: an audio-video answer brings both tracks in one
		// stream, and the element may be the muted webcam preview
		if (evt.track.kind === "audio") {
			node.volume = 1.0;
			node.muted = false;
			node.autoplay = true;
		}
		if (node.srcObject !== evt.streams[0]) {
			node.srcObject = evt.streams[0];
			node.play().catch((e) => console.debug("Autoplay failed:", e));
		}
	});
}

/**
 * Plays the remote media in `node` and negotiates the connection (see
 * `negotiate_webrtc` in @gradio/client). Resolves with the server's answer
 * once the remote description is set; the caller watches
 * `connectionstatechange` for the actual connection.
 */
export async function start({
	node,
	...options
}: StartOptions): Promise<Record<string, any>> {
	attach_remote_media(options.pc, node);
	return negotiate_webrtc(options);
}

/**
 * Closes the connection when the page goes away (tab closed, navigation).
 * Otherwise the server only ends the stream after the queue's reconnection
 * grace period, and a handler holding a GPU keeps it that long. `stop()`
 * defers the close, which never runs on a page that is going away.
 * A page kept in the back/forward cache comes back with the connection
 * closed, which fires no connectionstatechange, so `on_restored` is called
 * then to end the stream on the page.
 * Returns a function that removes the listeners.
 */
export function close_on_pagehide(
	get_pc: () => RTCPeerConnection | null,
	on_restored: () => void
): () => void {
	let closed = false;
	const close = (): void => {
		const pc = get_pc();
		if (!pc) return;
		pc.close();
		closed = true;
	};
	const restore = (event: PageTransitionEvent): void => {
		if (!event.persisted || !closed) return;
		closed = false;
		on_restored();
	};
	window.addEventListener("pagehide", close);
	window.addEventListener("pageshow", restore);
	return () => {
		window.removeEventListener("pagehide", close);
		window.removeEventListener("pageshow", restore);
	};
}

/**
 * The stream's RTC configuration, or `{ error }` to show. A request that
 * fails resolves to undefined, which must not pass for a configuration
 * without ICE servers: the stream would connect without TURN.
 */
export async function get_rtc_configuration(
	server: WebRTCServer,
	webrtc_id: string
): Promise<Record<string, any>> {
	try {
		return (
			(await server.get_rtc_configuration({ webrtc_id })) ?? {
				error: "Could not get the connection settings from the server."
			}
		);
	} catch (e) {
		return { error: String(e) };
	}
}
