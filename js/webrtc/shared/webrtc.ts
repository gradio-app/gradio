import type { ControlMessage, WebRTCServer } from "../types";

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

export function new_webrtc_id(): string {
	// Hard to guess, as it names the stream in signalling. Unlike
	// crypto.randomUUID(), getRandomValues() also works without HTTPS.
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// How long after the user stops a stream the same button ignores clicks, so
// that a double click on stop does not start a new stream (and take a turn)
export const RESTART_GUARD_MS = 500;

// How long a connection may stay "disconnected" before its stream ends. The
// state is often brief (a network switch, a short Wi-Fi drop) and goes back to
// "connected" by itself.
export const DISCONNECT_GRACE_MS = 5000;

// How long a connection may take to connect before `slow` is called. One that
// cannot get through (a VPN, a strict NAT without TURN) never connects.
export const SLOW_CONNECT_MS = 10000;

export function on_connection_state(
	pc: RTCPeerConnection,
	{
		connected,
		ended,
		failed,
		slow
	}: {
		connected: () => void;
		ended: () => void;
		failed: () => void;
		slow?: () => void;
	}
): void {
	let grace: ReturnType<typeof setTimeout> | null = null;
	let was_connected = false;
	const clear_grace = (): void => {
		if (grace !== null) clearTimeout(grace);
		grace = null;
	};
	// Closing the connection on the page fires no event, hence the state check
	let slow_timer: ReturnType<typeof setTimeout> | null = slow
		? setTimeout(() => {
				slow_timer = null;
				if (["new", "connecting"].includes(pc.connectionState)) slow();
			}, SLOW_CONNECT_MS)
		: null;
	const clear_slow = (): void => {
		if (slow_timer !== null) clearTimeout(slow_timer);
		slow_timer = null;
	};
	pc.addEventListener("connectionstatechange", () => {
		switch (pc.connectionState) {
			case "connected":
				clear_grace();
				clear_slow();
				// A connection that comes back carries on with its stream
				if (!was_connected) {
					was_connected = true;
					connected();
				}
				break;
			case "disconnected":
				clear_grace();
				grace = setTimeout(() => {
					grace = null;
					if (pc.connectionState === "disconnected") ended();
				}, DISCONNECT_GRACE_MS);
				break;
			case "closed":
				clear_grace();
				clear_slow();
				ended();
				break;
			case "failed":
				clear_grace();
				clear_slow();
				failed();
				break;
		}
	});
}

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
 * Opens the data channel, adds the local tracks (or a receive-only
 * transceiver) and negotiates the connection through the component's `offer`
 * server function. Resolves with the server's answer once the remote
 * description is set; the caller watches `connectionstatechange` for the
 * actual connection.
 */
export async function start({
	stream,
	pc,
	node,
	offer,
	webrtc_id,
	modality,
	rtp_params = {},
	mirror = false,
	on_message = () => {},
	on_reject = () => {}
}: StartOptions): Promise<Record<string, any>> {
	attach_remote_media(pc, node);
	const data_channel = pc.createDataChannel("text");
	data_channel.onopen = () => data_channel.send("handshake");
	data_channel.onmessage = (event) => {
		let msg: ControlMessage | null = null;
		try {
			msg = JSON.parse(event.data);
		} catch {
			msg = { type: String(event.data) };
		}
		if (msg && typeof msg.type === "string") on_message(msg);
	};

	if (stream) {
		for (const track of stream.getTracks()) {
			const sender = pc.addTrack(track, stream);
			if (Object.keys(rtp_params).length) {
				const params = sender.getParameters();
				await sender.setParameters({ ...params, ...rtp_params });
			}
		}
	} else {
		pc.addTransceiver(modality, { direction: "recvonly" });
	}

	pc.onicecandidate = ({ candidate }) => {
		// Firefox ends gathering with an empty candidate, which is not one to send
		if (candidate?.candidate) {
			offer({
				candidate: candidate.toJSON(),
				webrtc_id,
				type: "ice-candidate"
			}).catch((err) => console.error("Error sending ICE candidate:", err));
		}
	};

	const local_offer = await pc.createOffer();
	await pc.setLocalDescription(local_offer);
	const response = await offer({
		sdp: pc.localDescription?.sdp,
		type: pc.localDescription?.type,
		webrtc_id,
		mirror
	});
	if (!response || response.status === "failed") {
		on_reject(response ?? {});
		throw new Error(response?.meta?.error ?? "offer rejected");
	}
	await pc.setRemoteDescription({ sdp: response.sdp, type: response.type });
	return response;
}

/** Stops the local tracks and closes the peer connection. */
export function stop(pc: RTCPeerConnection | null | undefined): void {
	if (!pc) return;
	pc.getTransceivers?.().forEach((transceiver) => {
		try {
			transceiver.stop?.();
		} catch {
			// already stopped
		}
	});
	pc.getSenders?.().forEach((sender) => {
		sender.track?.stop();
	});
	setTimeout(() => pc.close(), 500);
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
 * The stream's RTC configuration, or `{ error }` to show. A server function
 * call that fails resolves to undefined, which must not pass for a
 * configuration without ICE servers: the stream would connect without TURN.
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

/** Turns an offer rejection into a message for the user. */
export function rejection_message(response: Record<string, any>): string {
	const error = response?.meta?.error;
	switch (error) {
		case "not_admitted":
			return "The stream's turn in the queue ended before it connected. Please try again.";
		case "connection_already_exists":
			return "A connection with this id already exists.";
		case "unsupported_track":
			return (
				response.meta?.message ??
				"This stream does not accept that kind of media."
			);
		case "no_stream_handler":
			return "No stream handler is attached to this component.";
		case "setup_failed":
			// What the handler raised, shown like the error of an event
			return response.meta?.message ?? "Could not establish the connection.";
		default:
			return "Could not establish the connection.";
	}
}
