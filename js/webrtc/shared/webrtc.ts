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
	return Math.random().toString(36).substring(2);
}

export function attach_remote_media(
	pc: RTCPeerConnection,
	node: HTMLMediaElement | null
): void {
	pc.addEventListener("track", (evt) => {
		if (node && node.srcObject !== evt.streams[0]) {
			node.srcObject = evt.streams[0];
			if (evt.track.kind === "audio") {
				node.volume = 1.0;
				node.muted = false;
				node.autoplay = true;
			}
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
		if (candidate) {
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
		default:
			return "Could not establish the connection.";
	}
}
