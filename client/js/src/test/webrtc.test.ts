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
	webrtc,
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
	senders: { track: { stop: () => void } }[] = [];
	addTrack(track: { stop: () => void }): void {
		this.senders.push({ track });
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

const turn = { type: "data", data: [{ __type__: "update" }] };
const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

describe("client.webrtc", () => {
	let job: ReturnType<typeof fake_job>;
	let client: any;

	beforeEach(() => {
		FakePeerConnection.instances = [];
		vi.stubGlobal("RTCPeerConnection", FakePeerConnection);
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

	it("connects once its turn comes and sends its inputs when the channel opens and when the handler asks", async () => {
		const stream = webrtc.call(client, "/echo", { inputs: [1] });
		// With all events, whatever the client publishes, to see failures
		expect(client.submit).toHaveBeenCalledWith(
			"/echo",
			[stream.webrtc_id],
			undefined,
			undefined,
			true
		);
		job.send({ type: "status", stage: "pending", position: 0 });
		await flush();
		expect(client.webrtc_rtc_configuration).not.toHaveBeenCalled();

		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		expect(pc.configuration).toEqual({ iceServers: [{ urls: "turn:x" }] });
		expect(client.webrtc_offer.mock.calls[0][0]).toMatchObject({
			type: "offer",
			webrtc_id: stream.webrtc_id
		});

		// Plain functions and receive mode never ask: the values go out at once
		pc.channel.open();
		const input = (data: unknown[]) => JSON.stringify({ type: "input", data });
		expect(pc.channel.send).toHaveBeenCalledWith(input([1]));
		stream.set_inputs([2]);
		expect(pc.channel.send).toHaveBeenLastCalledWith(input([2]));
		pc.channel.onmessage?.({ data: JSON.stringify({ type: "send_input" }) });
		expect(pc.channel.send).toHaveBeenLastCalledWith(input([2]));

		pc.set_state("connected");
		await stream.connected;
	});

	it("delivers each AdditionalOutputs and skips the no-op updates", async () => {
		const outputs: unknown[][] = [];
		webrtc.call(client, "/echo", { on_output: (v) => outputs.push(v) });
		job.send(turn);
		job.send({ type: "data", data: [[0.5, "a"]] });
		job.send({ type: "data", data: [{ __type__: "update" }] });
		job.send({ type: "data", data: [[0.7, "b"]] });
		await vi.waitFor(() => expect(outputs).toHaveLength(2));
		expect(outputs).toEqual([
			[0.5, "a"],
			[0.7, "b"]
		]);
	});

	it("stop() ends the stream with its last outputs, closes the connection and acknowledges the event, leaving the caller's media running", async () => {
		vi.useFakeTimers();
		const track = { kind: "video", stop: vi.fn() };
		const media = { getTracks: () => [track] } as unknown as MediaStream;
		const stream = webrtc.call(client, "/echo", { media });
		job.send(turn);
		await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		job.send({ type: "data", data: [[0.5]] });
		await vi.advanceTimersByTimeAsync(0);
		// Not while it runs: acknowledging ends the job's messages
		expect(job.acknowledge).not.toHaveBeenCalled();

		const stopping = stream.stop();
		expect(job.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		job.end();
		await stopping;
		// Once over, so that resume_jobs() does not bring it back
		expect(job.acknowledge).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(1000);
		expect(pc.close).toHaveBeenCalled();
		// The page opened the camera; it decides when to turn it off
		expect(track.stop).not.toHaveBeenCalled();
		await expect(stream.done).resolves.toBeUndefined();
	});

	it("fails with the server's reason when the offer is rejected", async () => {
		client.webrtc_offer = vi.fn(async () => ({
			status: "failed",
			meta: { error: "not_admitted" }
		}));
		const stream = webrtc.call(client, "/echo");
		job.send(turn);
		await expect(stream.connected).rejects.toThrow(
			"The stream's turn in the queue ended"
		);
		expect(job.close_stream).toHaveBeenCalledWith({ read_to_end: true });
		job.end();
		await expect(stream.done).rejects.toThrow(
			"The stream's turn in the queue ended"
		);
	});

	it("a stop() while connecting is not reported as a failure", async () => {
		let answer!: (value: Record<string, any>) => void;
		client.webrtc_rtc_configuration = vi.fn(
			() => new Promise((resolve) => (answer = resolve))
		);
		const stream = webrtc.call(client, "/echo");
		job.send(turn);
		await vi.waitFor(() =>
			expect(client.webrtc_rtc_configuration).toHaveBeenCalled()
		);
		const stopping = stream.stop();
		// The server already ended the stream, so it refuses the request, and
		// the stream's end reaches the page after that answer
		answer({ error: "The stream's turn in the queue ended." });
		await flush();
		job.end();
		await stopping;
		await expect(stream.done).resolves.toBeUndefined();
	});

	it("a stream taken out of the line does not take it as its turn", async () => {
		const stream = webrtc.call(client, "/echo");
		// What the server sends for a stream that leaves the line before its turn
		job.send({ type: "data", data: undefined });
		job.end();
		await expect(stream.done).rejects.toThrow("ended before it connected");
		expect(client.webrtc_rtc_configuration).not.toHaveBeenCalled();
	});

	it("tells on_message the handler's gr.Info, gr.Warning and error, which come through the queue", async () => {
		const messages: any[] = [];
		const stream = webrtc.call(client, "/echo", {
			on_message: (msg) => messages.push(msg)
		});
		job.send(turn);
		job.send({
			type: "log",
			log: "Careful",
			level: "warning",
			title: "Warning",
			duration: 5,
			visible: true
		});
		job.send({
			type: "status",
			stage: "error",
			message: "Bad frame",
			title: "Oops"
		});
		job.end();
		await expect(stream.done).rejects.toThrow("Bad frame");
		expect(messages).toEqual([
			{
				type: "warning",
				message: "Careful",
				title: "Warning",
				duration: 5,
				visible: true
			},
			{ type: "error", message: "Bad frame", title: "Oops" }
		]);
	});

	it("fails, and acknowledges its event, when the queue reports an error before the turn", async () => {
		const stream = webrtc.call(client, "/echo");
		job.send({ type: "status", stage: "error", message: "Queue is full." });
		job.end();
		await expect(stream.connected).rejects.toThrow("Queue is full.");
		await expect(stream.done).rejects.toThrow("Queue is full.");
		expect(FakePeerConnection.instances).toHaveLength(0);
		expect(job.acknowledge).toHaveBeenCalledTimes(1);
	});

	// The client tests also run in Node, which has no page to leave
	it.skipIf(typeof window === "undefined")(
		"closes the connection and the stream when the page goes away",
		async () => {
			webrtc.call(client, "/echo");
			job.send(turn);
			await vi.waitFor(() => expect(client.webrtc_offer).toHaveBeenCalled());
			window.dispatchEvent(new Event("pagehide"));
			expect(FakePeerConnection.instances[0].close).toHaveBeenCalled();
			expect(job.close_stream).toHaveBeenCalled();
			job.end();
		}
	);
});
