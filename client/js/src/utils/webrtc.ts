import type { Client } from "../client";
import type { StatusMessage } from "../types";

/** A message the server sends over a stream's data channel. */
export interface WebRTCControlMessage {
	type: string;
	data?: unknown;
	message?: string;
	// Toasts (errors of the handler, gr.Warning / gr.Info / gr.Success)
	title?: string | null;
	duration?: number | null;
	visible?: boolean;
}

/** Sends a signalling message (the offer or an ICE candidate). */
export type WebRTCOffer = (
	body: Record<string, unknown>
) => Promise<Record<string, any> | undefined>;

/** A random id for a new stream. */
export function new_webrtc_id(): string {
	// Hard to guess, as it names the stream in signalling. Unlike
	// crypto.randomUUID(), getRandomValues() also works without HTTPS.
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// How long a connection may stay "disconnected" before its stream ends. The
// state is often brief (a network switch, a short Wi-Fi drop) and goes back to
// "connected" by itself.
export const WEBRTC_DISCONNECT_GRACE_MS = 5000;

// How long a connection may take to connect before `slow` is called. One that
// cannot get through (a VPN, a strict NAT without TURN) never connects.
export const WEBRTC_SLOW_CONNECT_MS = 10000;

/**
 * Calls `connected` the first time the connection is up, `ended` when it
 * closes (or stays "disconnected" past a grace period), `failed` when it
 * fails, and `slow` if it has not connected after a while.
 */
export function on_webrtc_connection_state(
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
			}, WEBRTC_SLOW_CONNECT_MS)
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
				}, WEBRTC_DISCONNECT_GRACE_MS);
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

export interface NegotiateOptions {
	pc: RTCPeerConnection;
	/** Sends the offer and the ICE candidates, e.g. `client.webrtc_offer`. */
	offer: WebRTCOffer;
	webrtc_id: string;
	/** Local media to send, or null when only receiving. */
	stream: MediaStream | null;
	/** Track kind to receive when no local stream is sent. */
	modality: "video" | "audio";
	rtp_params?: Record<string, any>;
	/** Whether the server should mirror the frames, as a webcam preview is. */
	mirror?: boolean;
	/** Called once the data channel is open, to send to the server. */
	on_open?: (channel: RTCDataChannel) => void;
	on_message?: (msg: WebRTCControlMessage) => void;
	on_reject?: (response: Record<string, any>) => void;
}

/**
 * Opens the data channel, adds the local tracks (or a receive-only
 * transceiver) and negotiates the connection of an admitted stream. Resolves
 * with the server's answer once the remote description is set; the caller
 * watches the connection state for the actual connection.
 */
export async function negotiate_webrtc({
	pc,
	offer,
	webrtc_id,
	stream,
	modality,
	rtp_params = {},
	mirror = false,
	on_open = () => {},
	on_message = () => {},
	on_reject = () => {}
}: NegotiateOptions): Promise<Record<string, any>> {
	const data_channel = pc.createDataChannel("text");
	data_channel.onopen = () => {
		data_channel.send("handshake");
		on_open(data_channel);
	};
	data_channel.onmessage = (event) => {
		let msg: WebRTCControlMessage | null = null;
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

/**
 * Closes the peer connection. With `stop_tracks` (the default), also stops
 * the local tracks it sends; leave them running when the caller owns them.
 */
export function close_webrtc(
	pc: RTCPeerConnection | null | undefined,
	{ stop_tracks = true }: { stop_tracks?: boolean } = {}
): void {
	if (!pc) return;
	pc.getTransceivers?.().forEach((transceiver) => {
		try {
			transceiver.stop?.();
		} catch {
			// already stopped
		}
	});
	if (stop_tracks) {
		pc.getSenders?.().forEach((sender) => {
			sender.track?.stop();
		});
	}
	setTimeout(() => pc.close(), 500);
}

/** Turns an offer rejection into a message for the user. */
export function webrtc_rejection_message(
	response: Record<string, any>
): string {
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

export interface WebRTCStreamOptions {
	/** Local media to send, for mode "send" and "send-receive". */
	media?: MediaStream | null;
	/** What to receive when no media is sent (mode "receive"). */
	modality?: "video" | "audio";
	/** The values of the endpoint's extra inputs; update with `set_inputs()`. */
	inputs?: unknown[];
	rtp_params?: Record<string, any>;
	/** Whether the server should mirror the frames, as a webcam preview is. */
	mirror?: boolean;
	/** The remote media, once it arrives. */
	on_track?: (event: RTCTrackEvent) => void;
	/** The values of each AdditionalOutputs the handler emits. */
	on_output?: (values: unknown[]) => void;
	/** Messages from the handler: gr.Info, gr.Warning, its errors. */
	on_message?: (msg: WebRTCControlMessage) => void;
	/** Queue statuses (place in line, ETA), if the client publishes them. */
	on_status?: (status: StatusMessage) => void;
}

export interface WebRTCStream {
	readonly webrtc_id: string;
	/** The peer connection, once the stream's turn has come. */
	readonly pc: RTCPeerConnection | null;
	/** Resolves once the media flows; rejects if the stream fails before. */
	readonly connected: Promise<void>;
	/** Resolves when the stream is over; rejects with its error. */
	readonly done: Promise<void>;
	/** Sends new values of the extra inputs. */
	set_inputs(values: unknown[]): void;
	/** Ends the stream; outputs emitted until then still arrive. */
	stop(): Promise<void>;
}

/**
 * Streams media to and from a WebRTC endpoint of a gr.Server app
 * (`server.webrtc()`). The stream waits its turn in the endpoint's queue,
 * then connects. Returns at once; await `connected` or `done`.
 */
export function webrtc(
	this: Client,
	endpoint: string,
	options: WebRTCStreamOptions = {}
): WebRTCStream {
	const {
		media = null,
		modality = "video",
		rtp_params,
		mirror,
		on_track,
		on_output = () => {},
		on_message = () => {},
		on_status = () => {}
	} = options;
	const webrtc_id = new_webrtc_id();
	let inputs: unknown[] = options.inputs ?? [];
	let channel: RTCDataChannel | null = null;
	let pc: RTCPeerConnection | null = null;
	// Whether the stream is over, and whether the caller ended it
	let stopped = false;
	let stopped_by_caller = false;
	let was_connected = false;
	let failure: Error | null = null;

	let resolve_connected!: () => void;
	let reject_connected!: (error: Error) => void;
	const connected = new Promise<void>((resolve, reject) => {
		resolve_connected = () => {
			was_connected = true;
			resolve();
		};
		reject_connected = reject;
	});
	// A stream stopped before it connected rejects `connected`; do not report
	// that as unhandled when the caller only awaits `done`
	connected.catch(() => {});

	const send_inputs = (): void => {
		if (channel?.readyState === "open") {
			channel.send(JSON.stringify({ type: "input", data: inputs }));
		}
	};

	const fail = (error: Error): void => {
		// After the caller's stop(), a refusal from the server is that stop
		if (stopped_by_caller) return;
		failure ??= error;
		reject_connected(error);
		job.close_stream({ read_to_end: true });
	};

	const connect = async (): Promise<void> => {
		const rtc_configuration = await this.webrtc_rtc_configuration(webrtc_id);
		if (!rtc_configuration || "error" in rtc_configuration) {
			throw new Error(
				rtc_configuration?.error ??
					"Could not get the connection settings from the server."
			);
		}
		if (stopped) return;
		const connection = new RTCPeerConnection(rtc_configuration);
		pc = connection;
		if (on_track) connection.addEventListener("track", on_track);
		on_webrtc_connection_state(connection, {
			connected: resolve_connected,
			ended: () => job.close_stream({ read_to_end: true }),
			failed: () => fail(new Error("The connection failed."))
		});
		await negotiate_webrtc({
			pc: connection,
			offer: (body) => this.webrtc_offer(body),
			webrtc_id,
			stream: media,
			modality,
			rtp_params,
			mirror,
			// Plain functions and receive-mode generators do not ask for their
			// inputs: they start with the values sent once the channel opens
			on_open: (opened) => {
				channel = opened;
				send_inputs();
			},
			on_message: (msg) => {
				if (msg.type === "send_input") send_inputs();
				else on_message(msg);
			},
			on_reject: (response) => {
				throw new Error(webrtc_rejection_message(response));
			}
		});
	};

	// All events, whatever the client publishes: the helper needs the
	// statuses to tell a failed stream from one that ended
	const job = this.submit(endpoint, [webrtc_id], undefined, undefined, true);
	// A page that goes away closes the connection at once, so that the server
	// ends the stream (and frees a GPU it holds) without waiting for the queue
	// to notice
	const on_pagehide = (): void => {
		pc?.close();
		job.close_stream();
	};
	if (typeof window !== "undefined") {
		window.addEventListener("pagehide", on_pagehide);
	}
	const done = (async () => {
		let turn = false;
		try {
			for await (const msg of job) {
				if (msg.type === "status") {
					on_status(msg);
					if (msg.stage === "error") {
						fail(new Error(String(msg.message ?? "The stream failed.")));
					}
				} else if (msg.type === "data") {
					// No data: the stream left the line before its turn
					if (msg.data === undefined) continue;
					// The event's first message is the turn: the stream is
					// admitted and may connect
					if (!turn) {
						turn = true;
						if (!stopped) {
							connect().catch((error: Error) => fail(error));
						}
					}
					const value = msg.data?.[0];
					if (Array.isArray(value)) on_output(value);
				}
			}
		} finally {
			stopped = true;
			if (typeof window !== "undefined") {
				window.removeEventListener("pagehide", on_pagehide);
			}
			// The caller opened `media` and decides when to stop it
			close_webrtc(pc, { stop_tracks: false });
			if (!was_connected && !stopped_by_caller) {
				failure ??= new Error("The stream ended before it connected.");
			}
			reject_connected(failure ?? new Error("The stream was stopped."));
		}
		if (failure) throw failure;
	})();
	// Rejected when the stream fails; not unhandled for a caller that only
	// awaits `connected`
	done.catch(() => {});

	return {
		webrtc_id,
		get pc() {
			return pc;
		},
		connected,
		done,
		set_inputs(values: unknown[]) {
			inputs = values;
			send_inputs();
		},
		async stop() {
			if (!stopped) {
				stopped = true;
				stopped_by_caller = true;
				job.close_stream({ read_to_end: true });
			}
			await done.catch(() => {});
		}
	};
}
