import type { Client } from "../client";
import type {
	GradioEvent,
	StatusMessage,
	StreamTransport,
	SubmitIterable
} from "../types";

/** A data channel control message, or a handler toast (gr.Info, gr.Warning, its error). */
export interface WebRTCControlMessage {
	type: string;
	data?: unknown;
	message?: string;
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

// "disconnected" is often brief (a network switch) and recovers by itself
export const WEBRTC_DISCONNECT_GRACE_MS = 5000;

// Wait before `slow`; a connection blocked by a VPN or strict NAT never connects
export const WEBRTC_SLOW_CONNECT_MS = 10000;

/**
 * Calls `connected` once the connection is first up, `ended` when it closes
 * (or stays "disconnected" too long), `failed` on failure, `slow` if slow to connect.
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
 * Opens the data channel, adds the tracks and negotiates an admitted stream.
 * Resolves with the server's answer once the remote description is set; the
 * caller watches the connection state for the actual connection.
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
 * The transceivers stop at once and the connection closes 500 ms later, or
 * at once with `at_once` (a page being unloaded runs no more timers).
 */
export function close_webrtc(
	pc: RTCPeerConnection | null | undefined,
	{
		stop_tracks = true,
		at_once = false
	}: { stop_tracks?: boolean; at_once?: boolean } = {}
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
	if (at_once) pc.close();
	else setTimeout(() => pc.close(), 500);
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
			return response.meta?.message ?? "Could not establish the connection.";
		default:
			return "Could not establish the connection.";
	}
}

/**
 * `submit()` of a `.stream(transport="webrtc")` event given a
 * MediaStream. The event's queue job carries the stream id in the media
 * slot; once its turn comes the media goes over a peer connection. The
 * remote media arrives as a data message with a MediaStream in the media
 * output's slot, the handler's toasts as log messages, and `send_chunk()`
 * sends new values of the other inputs over the data channel. A stream that
 * hands its slot over at its time limit (its event completes with
 * `stream_ended: false`, see `on_time_limit`) joins the queue again with a new
 * stream id and the same media, unless it only receives: the caller sees the
 * new wait in line, and not that completion.
 */
export function submit_over_webrtc(
	this: Client,
	endpoint: string | number,
	data: unknown[],
	transport: StreamTransport,
	_event_data?: unknown,
	trigger_id?: number | null,
	all_events?: boolean,
	// The endpoint's parameter names, for named values in send_chunk()
	param_names: string[] = [],
	additional_headers?: Record<string, string>
): SubmitIterable<GradioEvent> {
	// The media comes in its input slot (gr.Server callers) or in the event
	// data (Blocks components, whose value stays theirs); -1 in receive mode
	const in_data = data.findIndex((value) => value instanceof MediaStream);
	const media_index = in_data >= 0 ? in_data : (transport.media_input ?? -1);
	const event_media = (_event_data as any)?.media;
	// Replaced by a MediaStream in the media slot of send_chunk(). None in
	// receive mode, where the server takes no track (a component that is only
	// among the outputs still puts its camera in the event data)
	let media: MediaStream | null =
		transport.mode === "receive"
			? null
			: in_data >= 0
				? (data[in_data] as MediaStream)
				: event_media instanceof MediaStream
					? event_media
					: null;
	let webrtc_id = new_webrtc_id();
	const others = (values: unknown[]): unknown[] =>
		values.filter((_, i) => i !== media_index);
	let inputs = others(data);
	// The current value of each input, the media slot left null
	let current = data.map((value, i) => (i === media_index ? null : value));
	let channel: RTCDataChannel | null = null;
	let pc: RTCPeerConnection | null = null;
	let stopped = false;

	// The media slot holds no value; the stream id travels in the event data.
	// The job yields every message: the stream reads the statuses (its
	// completion says whether it handed its slot over) whatever the caller
	// subscribed to.
	const join = (): ReturnType<Client["submit"]> =>
		this.submit(
			endpoint,
			[...current],
			{ webrtc_id },
			trigger_id,
			true,
			additional_headers
		);
	let job = join();
	const subscribed = (this.options?.events ?? ["data"]) as string[];

	// Messages of the job, plus the ones the connection adds, of the types
	// the caller subscribed to
	const queue: GradioEvent[] = [];
	let wake: (() => void) | null = null;
	let finished = false;
	const push = (msg: GradioEvent): void => {
		if (!all_events && !subscribed.includes(msg.type)) return;
		queue.push(msg);
		wake?.();
	};
	let fn_index = 0;

	const send_inputs = (): void => {
		if (channel?.readyState === "open") {
			channel.send(JSON.stringify({ type: "input", data: inputs }));
		}
	};

	// Another camera or microphone for a running stream: its tracks take the
	// place of the old ones in the connection, so the stream keeps its turn.
	// Before the stream connects, the new media is the one it connects with.
	const replace_media = (next: MediaStream): void => {
		media = next;
		if (!pc) return;
		for (const sender of pc.getSenders()) {
			const kind = sender.track?.kind;
			const track = next.getTracks().find((t) => t.kind === kind);
			if (!kind || !track) continue;
			sender.replaceTrack(track).catch((error) =>
				push({
					type: "log",
					level: "warning",
					log: `Could not switch to the new ${kind}: ${error}`,
					title: null,
					duration: null,
					visible: true,
					time: new Date(),
					endpoint: String(endpoint),
					fn_index
				} as unknown as GradioEvent)
			);
		}
	};

	const close = (options?: { read_to_end?: boolean }): void => {
		stopped = true;
		// The component opened `media` and decides when to stop it
		close_webrtc(pc, { stop_tracks: false });
		pc = null;
		job.close_stream(options ?? { read_to_end: true });
	};

	// Nothing deferred outlives the page: no timer, and only a keepalive request
	const leave = (): void => {
		stopped = true;
		close_webrtc(pc, { stop_tracks: false, at_once: true });
		pc = null;
		job.close_stream({ read_to_end: true, keepalive: true });
	};

	// The connection ended without the page closing the stream: the server
	// frees its slot, and the event's completion says whether the stream
	// handed it over (and joins the queue again) or ended
	const lose = (): void => {
		close_webrtc(pc, { stop_tracks: false });
		pc = null;
		job.close_stream({ read_to_end: true });
	};

	const connect = async (): Promise<void> => {
		// A stream that joins the queue again gets a new id
		const id = webrtc_id;
		const rtc_configuration = await this.webrtc_rtc_configuration(id);
		if (!rtc_configuration || "error" in rtc_configuration) {
			throw new Error(
				rtc_configuration?.error ??
					"Could not get the connection settings from the server."
			);
		}
		if (stopped || id !== webrtc_id) return;
		const connection = new RTCPeerConnection(rtc_configuration);
		pc = connection;
		if (transport.media_output !== null) {
			connection.addEventListener("track", (event) => {
				const remote = event.streams[0] ?? new MediaStream([event.track]);
				const values: unknown[] = [];
				values[transport.media_output!] = remote;
				push({
					type: "data",
					data: values,
					time: new Date(),
					endpoint: String(endpoint),
					fn_index
				} as unknown as GradioEvent);
			});
		}
		// What an earlier connection of a stream that joined the queue again
		// reports is no longer news
		on_webrtc_connection_state(connection, {
			connected: () => {},
			ended: () => {
				if (pc === connection) lose();
			},
			failed: () => {
				if (pc === connection) fail("The connection failed.");
			},
			// e.g. a VPN or a strict NAT without a TURN server in the way
			slow: () =>
				pc === connection &&
				push({
					type: "log",
					level: "warning",
					log: "Taking a while to connect. Are you on a VPN?",
					title: null,
					duration: null,
					visible: true,
					time: new Date(),
					endpoint: String(endpoint),
					fn_index
				} as unknown as GradioEvent)
		});
		await negotiate_webrtc({
			pc: connection,
			offer: (body) => this.webrtc_offer(body),
			webrtc_id: id,
			// Only the kinds the stream takes (a gr.Video camera may also
			// record the microphone for a video-only stream)
			stream:
				media &&
				new MediaStream(
					media
						.getTracks()
						.filter(
							(t) =>
								transport.modality === "audio-video" ||
								t.kind === transport.modality
						)
				),
			modality: transport.modality as "video" | "audio",
			rtp_params: transport.rtp_params,
			// The frames reach the function as the mirrored preview showed them
			mirror: (_event_data as any)?.mirror === true,
			on_open: (opened) => {
				channel = opened;
				send_inputs();
			},
			on_message: (msg) => {
				if (msg.type === "send_input") {
					send_inputs();
				} else if (
					["info", "warning", "error"].includes(msg.type) ||
					// CloseStream("reason"): the server ended the stream and says why
					(msg.type === "end_stream" &&
						typeof msg.data === "string" &&
						msg.data)
				) {
					const ended = msg.type === "end_stream";
					push({
						type: "log",
						level: ended ? "warning" : msg.type,
						log: ended ? String(msg.data) : (msg.message ?? ""),
						title: msg.title ?? null,
						duration: msg.duration ?? null,
						visible: msg.visible ?? true,
						time: new Date(),
						endpoint: String(endpoint),
						fn_index
					} as unknown as GradioEvent);
				}
			},
			on_reject: (response) => {
				throw new Error(webrtc_rejection_message(response));
			}
		});
	};

	// Reported like any event's error, then the stream ends
	const fail = (message: string): void => {
		if (stopped) return;
		push({
			type: "status",
			stage: "error",
			message,
			queue: false,
			visible: true,
			time: new Date(),
			endpoint: String(endpoint),
			fn_index
		} as unknown as GradioEvent);
		close();
	};

	// Leaving the page ends the stream at once, so that the server frees its
	// slot (and GPU) without waiting for the connection to time out
	const on_pagehide = (): void => leave();
	if (typeof window !== "undefined") {
		window.addEventListener("pagehide", on_pagehide);
	}

	let turn = false;
	(async () => {
		try {
			while (true) {
				let rejoin = false;
				for await (const msg of job) {
					fn_index = (msg as any).fn_index ?? fn_index;
					if (
						msg.type === "status" &&
						(msg as any).stage === "complete" &&
						(msg as any).stream_ended === false &&
						transport.mode !== "receive" &&
						!stopped
					) {
						// Handed its slot over at its time limit
						rejoin = true;
						continue;
					}
					if (msg.type === "data" && Array.isArray((msg as any).data)) {
						// An output the stream did not update this time
						(msg as any).data = (msg as any).data.map((value: any) =>
							value &&
							typeof value === "object" &&
							value.__type__ === "update" &&
							Object.keys(value).length === 1
								? undefined
								: value
						);
					}
					if (msg.type === "data" && !turn && (msg as any).data !== undefined) {
						// The first data message means the stream's turn has come
						turn = true;
						if (!stopped) {
							// A failure after the stream joined the queue again is
							// the old stream's, not the new one's
							const id = webrtc_id;
							connect().catch((error: Error) => {
								if (id === webrtc_id) fail(error.message);
							});
						}
					}
					// No data: the stream left the line, or ended, without outputs
					if (msg.type === "data" && (msg as any).data === undefined) continue;
					push(msg);
				}
				if (!rejoin || stopped) break;
				// A new stream waits its turn with the same media and the
				// current values of the other inputs
				close_webrtc(pc, { stop_tracks: false });
				pc = null;
				channel = null;
				turn = false;
				webrtc_id = new_webrtc_id();
				// Says so explicitly: a "pending" status alone may be progress
				push({
					type: "status",
					stage: "pending",
					queue: true,
					rejoining: true,
					time: new Date(),
					endpoint: String(endpoint),
					fn_index
				} as unknown as GradioEvent);
				// The finished event would otherwise stay resumable, and a
				// reload would replay it and run its .then() again. No await
				// before join(): a Stop in between would leave a job unclosed.
				const handed_over = job;
				job = join();
				void handed_over.acknowledge();
			}
		} catch (error) {
			// e.g. joining the queue again after an app reload renamed the endpoint
			fail(error instanceof Error ? error.message : String(error));
		} finally {
			stopped = true;
			if (typeof window !== "undefined") {
				window.removeEventListener("pagehide", on_pagehide);
			}
			close_webrtc(pc, { stop_tracks: false });
			finished = true;
			(wake as (() => void) | null)?.();
		}
	})();

	const iterator: SubmitIterable<GradioEvent> = {
		[Symbol.asyncIterator]: () => iterator,
		async next() {
			while (!queue.length && !finished) {
				await new Promise<void>((resolve) => (wake = resolve));
				wake = null;
			}
			if (queue.length) return { value: queue.shift()!, done: false };
			return { value: undefined, done: true };
		},
		async throw(value: unknown) {
			close();
			return job.throw(value);
		},
		async return() {
			close();
			return job.return();
		},
		cancel: async () => {
			close_webrtc(pc, { stop_tracks: false });
			pc = null;
			stopped = true;
			await job.cancel();
		},
		event_id: () => job.event_id(),
		wait_for_id: () => job.wait_for_id(),
		acknowledge: () => job.acknowledge(),
		send_chunk: (chunk: Record<string, unknown>) => {
			let values = chunk?.data;
			if (values && typeof values === "object" && !Array.isArray(values)) {
				// Named, as submit() takes them: the ones given replace the
				// current values
				const named = values as Record<string, unknown>;
				const unknown_name = Object.keys(named).find(
					(name) => !param_names.includes(name)
				);
				if (unknown_name !== undefined) {
					throw new Error(
						`Parameter \`${unknown_name}\` is not a valid keyword argument.`
					);
				}
				values = current.map((value, i) =>
					param_names[i] in named ? named[param_names[i]] : value
				);
			}
			if (!Array.isArray(values)) return;
			const next = media_index >= 0 ? values[media_index] : undefined;
			if (next instanceof MediaStream) replace_media(next);
			inputs = others(values);
			current = values.map((value, i) => (i === media_index ? null : value));
			send_inputs();
		},
		close_stream: (options) => close(options)
	};
	return iterator;
}
