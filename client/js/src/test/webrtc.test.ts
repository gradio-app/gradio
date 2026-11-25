import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const zerogpu_headers = vi.hoisted(() => ({
	value: null as Record<string, string> | null,
	// Whether the page that embeds the Space never answers
	no_reply: false,
	on_request: (() => {}) as () => void
}));

vi.mock("../helpers/zerogpu", async (importOriginal) => ({
	...(await importOriginal<typeof import("../helpers/zerogpu")>()),
	get_zerogpu_headers: () => {
		zerogpu_headers.on_request();
		return zerogpu_headers.no_reply
			? new Promise(() => {})
			: Promise.resolve(zerogpu_headers.value);
	}
}));

import { Client } from "../client";
import { post_data } from "../utils/post_data";
import {
	negotiate_webrtc,
	new_webrtc_id,
	on_webrtc_connection_state,
	submit_over_webrtc,
	WEBRTC_DISCONNECT_GRACE_MS,
	WEBRTC_SLOW_CONNECT_MS
} from "../utils/webrtc";

function fake_client(token?: `hf_${string}`): {
	client: Client;
	requests: { url: string; init: RequestInit }[];
} {
	const requests: { url: string; init: RequestInit }[] = [];
	const client = {
		config: { root: "https://example.hf.space", components: [] },
		options: { token },
		session_hash: "abc",
		api_prefix: "/gradio_api",
		post_webrtc: (Client.prototype as any).post_webrtc,
		fetch: (url: string, init: RequestInit) => {
			requests.push({ url, init });
			return Promise.resolve(
				new Response(JSON.stringify({ type: "answer" }), { status: 200 })
			);
		}
	} as unknown as Client;
	client.post_data = post_data.bind(client);
	return { client, requests };
}

describe("WebRTC signalling", () => {
	beforeEach(() => {
		zerogpu_headers.value = null;
		zerogpu_headers.no_reply = false;
		zerogpu_headers.on_request = () => {};
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("sends the offer, and not an ICE candidate, with the session and the visitor's ZeroGPU headers, so that the handler's GPU work is attributed to the visitor", async () => {
		zerogpu_headers.value = { "X-ZeroGPU-Token": "jwt" };
		const asked = vi.fn();
		zerogpu_headers.on_request = asked;
		const { client, requests } = fake_client();

		const answer = await Client.prototype.webrtc_offer.call(client, {
			sdp: "v=0",
			type: "offer",
			webrtc_id: "one"
		});

		expect(answer).toEqual({ type: "answer" });
		expect(requests[0].url).toBe(
			"https://example.hf.space/gradio_api/webrtc/offer"
		);
		expect(JSON.parse(requests[0].init.body as string)).toEqual({
			sdp: "v=0",
			type: "offer",
			webrtc_id: "one",
			session_hash: "abc"
		});
		expect(requests[0].init.headers).toEqual({
			"X-ZeroGPU-Token": "jwt",
			"Content-Type": "application/json"
		});

		await Client.prototype.webrtc_offer.call(client, {
			type: "ice-candidate",
			webrtc_id: "one",
			candidate: {}
		});

		expect(asked).toHaveBeenCalledTimes(1);
	});

	it("sends the offer without ZeroGPU headers when the embedding page does not answer", async () => {
		vi.useFakeTimers();
		zerogpu_headers.no_reply = true;
		const { client, requests } = fake_client();

		const call = Client.prototype.webrtc_offer.call(client, {
			sdp: "v=0",
			type: "offer",
			webrtc_id: "one"
		});
		await vi.advanceTimersByTimeAsync(10_000);
		await call;

		expect(requests[0].init.headers).toEqual({
			"Content-Type": "application/json"
		});
	});

	it("asks for the stream's RTC configuration with the session and the token", async () => {
		const { client, requests } = fake_client("hf_token");

		await Client.prototype.webrtc_rtc_configuration.call(client, "one");

		expect(requests[0].url).toBe(
			"https://example.hf.space/gradio_api/webrtc/rtc_configuration"
		);
		expect(JSON.parse(requests[0].init.body as string)).toEqual({
			webrtc_id: "one",
			session_hash: "abc"
		});
		expect(requests[0].init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer hf_token"
		});
	});
});

class FakeChannel {
	readyState = "connecting";
	onopen: (() => void) | null = null;
	onmessage: ((event: { data: string }) => void) | null = null;
	send = vi.fn();
	open(): void {
		this.readyState = "open";
		this.onopen?.();
	}
}

class FakePeerConnection {
	static instances: FakePeerConnection[] = [];
	connectionState = "new";
	channel = new FakeChannel();
	localDescription: { sdp: string; type: string } | null = null;
	listeners: Record<string, ((event?: any) => void)[]> = {};
	onicecandidate: ((event: any) => void) | null = null;
	close = vi.fn();
	constructor(public configuration: Record<string, any>) {
		FakePeerConnection.instances.push(this);
	}
	createDataChannel(): FakeChannel {
		return this.channel;
	}
	senders: {
		track: { stop: () => void };
		getParameters: () => Record<string, any>;
		setParameters: ReturnType<typeof vi.fn>;
		replaceTrack: ReturnType<typeof vi.fn>;
	}[] = [];
	addTrack(track: { stop: () => void }) {
		const sender = {
			track,
			getParameters: () => ({ encodings: [{}] }),
			setParameters: vi.fn(async () => {}),
			replaceTrack: vi.fn(async (next: { stop: () => void }) => {
				sender.track = next;
			})
		};
		this.senders.push(sender);
		return sender;
	}
	addTransceiver(): void {}
	getTransceivers(): [] {
		return [];
	}
	getSenders(): { track: { stop: () => void } }[] {
		return this.senders;
	}
	async createOffer(): Promise<{ sdp: string; type: string }> {
		return { sdp: "v=0 offer", type: "offer" };
	}
	async setLocalDescription(description: { sdp: string; type: string }) {
		this.localDescription = description;
	}
	async setRemoteDescription(): Promise<void> {}
	addEventListener(type: string, listener: (event?: any) => void): void {
		(this.listeners[type] ??= []).push(listener);
	}
	set_state(state: string): void {
		this.connectionState = state;
		this.listeners.connectionstatechange?.forEach((listener) => listener());
	}
}

describe("WebRTC connection", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	function watch() {
		const pc = new FakePeerConnection({});
		const handlers = {
			connected: vi.fn(),
			ended: vi.fn(),
			failed: vi.fn(),
			slow: vi.fn()
		};
		on_webrtc_connection_state(pc as unknown as RTCPeerConnection, handlers);
		return { pc, handlers };
	}

	it("a brief disconnection does not end the stream, one that lasts does", () => {
		vi.useFakeTimers();
		const { pc, handlers } = watch();
		pc.set_state("connected");
		// e.g. a phone switching from Wi-Fi to cellular
		pc.set_state("disconnected");
		vi.advanceTimersByTime(WEBRTC_DISCONNECT_GRACE_MS - 100);
		pc.set_state("connected");
		vi.advanceTimersByTime(WEBRTC_DISCONNECT_GRACE_MS);
		expect(handlers.ended).not.toHaveBeenCalled();
		// The stream carries on as it was
		expect(handlers.connected).toHaveBeenCalledTimes(1);

		pc.set_state("disconnected");
		vi.advanceTimersByTime(WEBRTC_DISCONNECT_GRACE_MS);
		expect(handlers.ended).toHaveBeenCalledTimes(1);
	});

	it("a closed or failed connection ends the stream at once", () => {
		const closed = watch();
		closed.pc.set_state("closed");
		expect(closed.handlers.ended).toHaveBeenCalledTimes(1);
		const failed = watch();
		failed.pc.set_state("failed");
		expect(failed.handlers.failed).toHaveBeenCalledTimes(1);
	});

	it("a connection that is slow to connect says so", () => {
		vi.useFakeTimers();
		const stuck = watch();
		// The answer came back at once, but ICE cannot get through
		stuck.pc.set_state("connecting");
		const connects = watch();
		connects.pc.set_state("connected");
		vi.advanceTimersByTime(WEBRTC_SLOW_CONNECT_MS);
		expect(stuck.handlers.slow).toHaveBeenCalledTimes(1);
		expect(connects.handlers.slow).not.toHaveBeenCalled();
	});

	it("the empty candidate that ends gathering is not sent", async () => {
		const pc = new FakePeerConnection({});
		const offer = vi.fn(async (_body: Record<string, unknown>) => ({
			sdp: "v=0 answer",
			type: "answer"
		}));
		await negotiate_webrtc({
			pc: pc as unknown as RTCPeerConnection,
			offer,
			webrtc_id: "id",
			stream: null,
			modality: "video"
		});
		const candidate = (text: string) => ({
			candidate: text,
			toJSON: () => ({ candidate: text })
		});
		pc.onicecandidate?.({ candidate: candidate("candidate:1 1 udp 1 x 9") });
		// As Firefox does
		pc.onicecandidate?.({ candidate: candidate("") });
		pc.onicecandidate?.({ candidate: null });
		const sent = offer.mock.calls.filter(
			([body]) => body.type === "ice-candidate"
		);
		expect(sent).toHaveLength(1);
	});

	it("stream ids are hard to guess", () => {
		// The id names the stream to the server in signalling
		const id = new_webrtc_id();
		expect(id).toMatch(/^[0-9a-f]{32}$/);
		expect(new_webrtc_id()).not.toBe(id);
	});
});

// A submission whose messages the test sends
function fake_job() {
	const messages: any[] = [];
	const waiting: ((result: IteratorResult<any>) => void)[] = [];
	let ended = false;
	const job = {
		close_stream: vi.fn(),
		acknowledge: vi.fn(async () => {}),
		cancel: vi.fn(async () => {}),
		event_id: () => "event",
		wait_for_id: async () => "event",
		[Symbol.asyncIterator]() {
			return this;
		},
		next(): Promise<IteratorResult<any>> {
			if (messages.length)
				return Promise.resolve({ value: messages.shift(), done: false });
			if (ended) return Promise.resolve({ value: undefined, done: true });
			return new Promise((resolve) => waiting.push(resolve));
		},
		send(msg: any): void {
			const next = waiting.shift();
			if (next) next({ value: msg, done: false });
			else messages.push(msg);
		},
		end(): void {
			ended = true;
			waiting
				.splice(0)
				.forEach((next) => next({ value: undefined, done: true }));
		}
	};
	return job;
}

class FakeTrack {
	stop = vi.fn();
	readyState = "live";
	constructor(public kind: "audio" | "video") {}
}

class FakeMediaStream {
	static count = 0;
	id = `stream-${FakeMediaStream.count++}`;
	constructor(public tracks: FakeTrack[] = []) {}
	getTracks(): FakeTrack[] {
		return this.tracks;
	}
	getAudioTracks(): FakeTrack[] {
		return this.tracks.filter((t) => t.kind === "audio");
	}
	getVideoTracks(): FakeTrack[] {
		return this.tracks.filter((t) => t.kind === "video");
	}
}

// The first data message: the stream's turn, with no output updated
const turn = {
	type: "data",
	data: [{ __type__: "update" }, { __type__: "update" }]
};
const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));
const send_receive = {
	type: "webrtc" as const,
	modality: "video" as const,
	mode: "send-receive" as const,
	media_input: 0,
	media_output: 0
};

describe("submit() of a stream with transport='webrtc'", () => {
	let job: ReturnType<typeof fake_job>;
	let client: any;

	beforeEach(() => {
		FakePeerConnection.instances = [];
		vi.stubGlobal("RTCPeerConnection", FakePeerConnection);
		vi.stubGlobal("MediaStream", FakeMediaStream);
		job = fake_job();
		client = {
			submit: vi.fn(() => job),
			webrtc_offer: vi.fn(async (body: any) =>
				body.type === "offer" ? { sdp: "v=0 answer", type: "answer" } : {}
			),
			webrtc_rtc_configuration: vi.fn(async () => ({
				iceServers: [{ urls: "turn:x" }]
			}))
		};
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	function start(event_data: Record<string, unknown> = {}) {
		const video = new FakeTrack("video");
		const audio = new FakeTrack("audio");
		const media = new FakeMediaStream([video, audio]);
		const job_iter = submit_over_webrtc.call(
			client,
			"/flip",
			[media, 1],
			send_receive,
			{ media, ...event_data },
			null,
			true,
			["frame", "brightness"]
		);
		return { media, video, audio, job_iter };
	}

	async function read(iter: any, count: number): Promise<any[]> {
		const out: any[] = [];
		while (out.length < count) out.push((await iter.next()).value);
		return out;
	}

	it("joins the queue with the media slot empty and the stream id in the event data, then connects at its turn", async () => {
		const { video, job_iter } = start({ mirror: true });
		expect(client.submit).toHaveBeenCalledWith(
			"/flip",
			[null, 1],
			{ webrtc_id: expect.any(String) },
			null,
			true
		);
		const { webrtc_id } = client.submit.mock.calls[0][2];
		job.send({ type: "status", stage: "pending", position: 0 });
		await flush();
		expect(client.webrtc_rtc_configuration).not.toHaveBeenCalled();

		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		expect(pc.configuration).toEqual({ iceServers: [{ urls: "turn:x" }] });
		// Only the kinds the stream takes: the camera's microphone stays home
		expect(pc.senders.map((s) => s.track)).toEqual([video]);
		expect(client.webrtc_offer.mock.calls[0][0]).toMatchObject({
			type: "offer",
			webrtc_id,
			mirror: true
		});

		// The other inputs go over the data channel: at once, on send_chunk,
		// and again when the handler asks
		pc.channel.open();
		const input = (data: unknown[]) => JSON.stringify({ type: "input", data });
		expect(pc.channel.send).toHaveBeenCalledWith(input([1]));
		job_iter.send_chunk({ data: [null, 2] });
		expect(pc.channel.send).toHaveBeenLastCalledWith(input([2]));
		pc.channel.onmessage?.({ data: JSON.stringify({ type: "send_input" }) });
		expect(pc.channel.send).toHaveBeenLastCalledWith(input([2]));
		// Named, as submit() takes them: the others keep their values
		job_iter.send_chunk({ data: { brightness: 3 } });
		expect(pc.channel.send).toHaveBeenLastCalledWith(input([3]));
	});

	it("a MediaStream in the media slot of send_chunk() switches the camera of a running stream", async () => {
		const { job_iter } = start();
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.channel.open();
		const other = new FakeTrack("video");
		job_iter.send_chunk({ data: [new FakeMediaStream([other]), 3] });
		// Same connection, same turn: the track is replaced, the inputs sent
		expect(pc.senders.map((s) => s.track)).toEqual([other]);
		expect(client.submit).toHaveBeenCalledTimes(1);
		expect(pc.channel.send).toHaveBeenLastCalledWith(
			JSON.stringify({ type: "input", data: [3] })
		);
	});

	it("a stream that switches cameras while it waits connects with the new one", async () => {
		const { job_iter } = start();
		const other = new FakeTrack("video");
		job_iter.send_chunk({ data: [new FakeMediaStream([other]), 1] });
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		expect(FakePeerConnection.instances[0].senders.map((s) => s.track)).toEqual(
			[other]
		);
	});

	it("applies the stream's rtp_params to the tracks it sends", async () => {
		const media = new FakeMediaStream([new FakeTrack("video")]);
		submit_over_webrtc.call(
			client,
			"/flip",
			[media, 1],
			{
				...send_receive,
				rtp_params: { degradationPreference: "maintain-framerate" }
			},
			{ media },
			null,
			true
		);
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const [sender] = FakePeerConnection.instances[0].senders;
		expect(sender.setParameters).toHaveBeenCalledWith({
			encodings: [{}],
			degradationPreference: "maintain-framerate"
		});
	});

	it("puts the remote media in the media output's slot, and leaves outputs it did not update undefined", async () => {
		const { job_iter } = start();
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const remote = new FakeMediaStream([new FakeTrack("video")]);
		FakePeerConnection.instances[0].listeners.track.forEach((listener) =>
			listener({ streams: [remote], track: remote.tracks[0] })
		);
		job.send({ type: "data", data: [{ __type__: "update" }, "640x480"] });
		const [first, media, text] = await read(job_iter, 3);
		expect(first.data).toEqual([undefined, undefined]);
		expect(media.data[0]).toBe(remote);
		expect(text.data).toEqual([undefined, "640x480"]);
	});

	it("close_stream() closes the connection and reads the event to its end, leaving the caller's media running", async () => {
		const { video, job_iter } = start();
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		job_iter.close_stream();
		expect(job.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		await vi.waitFor(() => expect(pc.close).toHaveBeenCalled(), {
			timeout: 2000
		});
		expect(video.stop).not.toHaveBeenCalled();
	});

	it("a caller that takes only data messages still connects, hands over and joins again, and gets only data", async () => {
		client.options = { events: ["data"] };
		const media = new FakeMediaStream([new FakeTrack("video")]);
		const job_iter = submit_over_webrtc.call(
			client,
			"/flip",
			[media, 1],
			send_receive,
			{},
			null,
			undefined,
			["frame", "brightness"]
		);
		// The stream reads every message of its job itself
		expect(client.submit.mock.calls[0][4]).toBe(true);
		job.send({ type: "status", stage: "pending", position: 0 });
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const next_job = fake_job();
		client.submit.mockImplementation(() => next_job);
		job.send({ type: "status", stage: "complete", stream_ended: false });
		job.end();
		await vi.waitFor(() => expect(client.submit).toHaveBeenCalledTimes(2));
		next_job.send({ type: "data", data: [null, "after"] });
		const seen: any[] = [];
		while (seen.at(-1)?.data?.[1] !== "after") {
			seen.push((await job_iter.next()).value);
		}
		expect(seen.map((msg) => msg.type)).toEqual(["data", "data"]);
	});

	it("a stream that hands its slot over joins the queue again with a new id and the same media", async () => {
		const { video, job_iter } = start();
		const first_id = client.submit.mock.calls[0][2].webrtc_id;
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const first_pc = FakePeerConnection.instances[0];
		first_pc.channel.open();
		job_iter.send_chunk({ data: { brightness: 2 } });

		const next_job = fake_job();
		client.submit.mockImplementation(() => next_job);
		// The server ends the connection, then the event: before the
		// completion, the page cannot tell a hand-over from an end
		first_pc.set_state("closed");
		expect(job.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		job.send({ type: "status", stage: "complete", stream_ended: false });
		job.end();

		await vi.waitFor(() => expect(client.submit).toHaveBeenCalledTimes(2));
		// Otherwise a reload resumes the finished event and runs its .then()
		expect(job.acknowledge).toHaveBeenCalled();
		const [endpoint, data, event_data] = client.submit.mock.calls[1];
		expect(endpoint).toBe("/flip");
		// The current values of the other inputs, the media slot empty
		expect(data).toEqual([null, 2]);
		expect(event_data.webrtc_id).not.toBe(first_id);

		// The caller sees the new wait in line, not the completion
		next_job.send({ type: "status", stage: "pending", position: 1 });
		const seen: any[] = [];
		while (seen.at(-1)?.position !== 1) {
			seen.push((await job_iter.next()).value);
		}
		expect(seen.at(-1)).toMatchObject({ stage: "pending", position: 1 });
		expect(seen.some((msg) => msg?.stage === "complete")).toBe(false);
		// Said explicitly, since progress is a "pending" status too
		expect(seen.at(-2)).toMatchObject({ stage: "pending", rejoining: true });

		next_job.send(turn);
		await vi.waitFor(() =>
			expect(FakePeerConnection.instances).toHaveLength(2)
		);
		const second_pc = FakePeerConnection.instances[1];
		await vi.waitFor(() =>
			expect(second_pc.senders.map((s) => s.track)).toEqual([video])
		);
		expect(client.webrtc_offer.mock.calls.at(-1)[0]).toMatchObject({
			type: "offer",
			webrtc_id: event_data.webrtc_id
		});
		// The first connection's end is no longer news
		first_pc.set_state("failed");
		expect(next_job.close_stream).not.toHaveBeenCalled();
		expect(video.stop).not.toHaveBeenCalled();
	});

	it("a stream that ended for good, that the page closed, or that only receives does not join the queue again", async () => {
		const ended = start();
		job.send(turn);
		job.send({ type: "status", stage: "complete", stream_ended: true });
		job.end();
		const [, complete] = await read(ended.job_iter, 2);
		expect(complete.stage).toBe("complete");
		expect((await ended.job_iter.next()).done).toBe(true);

		job = fake_job();
		client.submit = vi.fn(() => job);
		const closed = start();
		job.send(turn);
		closed.job_iter.close_stream();
		job.send({ type: "status", stage: "complete", stream_ended: false });
		job.end();
		const [, closed_complete] = await read(closed.job_iter, 2);
		expect(closed_complete.stage).toBe("complete");
		expect((await closed.job_iter.next()).done).toBe(true);

		job = fake_job();
		client.submit = vi.fn(() => job);
		const receiving = submit_over_webrtc.call(
			client,
			"/generate",
			[1],
			{ ...send_receive, mode: "receive", media_input: null },
			{},
			null,
			true,
			["brightness"]
		);
		job.send(turn);
		job.send({ type: "status", stage: "complete", stream_ended: false });
		job.end();
		const [, received_complete] = await read(receiving, 2);
		// Never starts again without a click
		expect(received_complete.stage).toBe("complete");
		expect((await receiving.next()).done).toBe(true);
		expect(client.submit).toHaveBeenCalledTimes(1);
	});

	it("reports a rejected offer as the event's error", async () => {
		client.webrtc_offer = vi.fn(async () => ({
			status: "failed",
			meta: { error: "not_admitted" }
		}));
		const { job_iter } = start();
		job.send(turn);
		const [, error] = await read(job_iter, 2);
		expect(error).toMatchObject({
			type: "status",
			stage: "error",
			message:
				"The stream's turn in the queue ended before it connected. Please try again."
		});
		expect(job.close_stream).toHaveBeenCalled();
	});

	it("does not connect a stream taken out of the line, and drops its empty data message", async () => {
		const { job_iter } = start();
		job.send({ type: "data", data: undefined });
		job.send({ type: "status", stage: "complete" });
		job.end();
		const [status] = await read(job_iter, 1);
		expect(status.stage).toBe("complete");
		expect((await job_iter.next()).done).toBe(true);
		expect(client.webrtc_rtc_configuration).not.toHaveBeenCalled();
	});

	it("passes the handler's gr.Info and gr.Warning on as log messages", async () => {
		const { job_iter } = start();
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.channel.onmessage?.({
			data: JSON.stringify({ type: "warning", message: "Too dark" })
		});
		// CloseStream("reason") ends the stream with a reason the page can show
		pc.channel.onmessage?.({
			data: JSON.stringify({ type: "end_stream", data: "Quota exceeded" })
		});
		const [, log, ended] = await read(job_iter, 3);
		expect(log).toMatchObject({
			type: "log",
			level: "warning",
			log: "Too dark"
		});
		expect(ended).toMatchObject({
			type: "log",
			level: "warning",
			log: "Quota exceeded"
		});
	});

	it("a stream that only receives asks for the kind of media it receives, and sends none", async () => {
		const add = vi.spyOn(FakePeerConnection.prototype, "addTransceiver");
		// e.g. the .stream() of a camera that is only among the outputs: its
		// media comes in the event data, but the server takes no track then
		const media = new FakeMediaStream([new FakeTrack("video")]);
		submit_over_webrtc.call(
			client,
			"/generate",
			[0.5],
			{ ...send_receive, mode: "receive", media_input: null },
			{ media },
			null,
			true
		);
		expect(client.submit.mock.calls[0][1]).toEqual([0.5]);
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		expect(add).toHaveBeenCalledWith("video", { direction: "recvonly" });
		expect(FakePeerConnection.instances[0].senders).toEqual([]);
	});

	it.skipIf(typeof window === "undefined")(
		"ends the stream at once when the page is hidden",
		async () => {
			start();
			job.send(turn);
			await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
			window.dispatchEvent(new Event("pagehide"));
			// Timers and ordinary requests do not outlive the page
			expect(FakePeerConnection.instances[0].close).toHaveBeenCalled();
			expect(job.close_stream).toHaveBeenCalledWith({
				read_to_end: true,
				keepalive: true
			});
		}
	);
});
