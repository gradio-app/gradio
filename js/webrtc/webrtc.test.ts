import { test, describe, afterEach, beforeEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import WebRTC from "./Index.svelte";
import { START_STREAM } from "./types";

type Listener = (event?: any) => void;

class FakeDataChannel {
	onopen: Listener | null = null;
	onmessage: ((event: { data: string }) => void) | null = null;
	send = vi.fn();
}

class FakePeerConnection extends EventTarget {
	static instances: FakePeerConnection[] = [];
	connectionState = "new";
	localDescription: { sdp: string; type: string } | null = null;
	remoteDescription: any = null;
	onicecandidate: Listener | null = null;
	channel = new FakeDataChannel();
	tracks: MediaStreamTrack[] = [];
	closed = false;

	constructor(public configuration: any) {
		super();
		FakePeerConnection.instances.push(this);
	}
	createDataChannel(): FakeDataChannel {
		return this.channel;
	}
	addTrack(track: MediaStreamTrack): {
		getParameters: () => any;
		setParameters: () => Promise<void>;
	} {
		this.tracks.push(track);
		return { getParameters: () => ({}), setParameters: async () => {} };
	}
	addTransceiver = vi.fn();
	async createOffer(): Promise<{ sdp: string; type: string }> {
		return { sdp: "v=0 offer", type: "offer" };
	}
	async setLocalDescription(desc: {
		sdp: string;
		type: string;
	}): Promise<void> {
		this.localDescription = desc;
	}
	async setRemoteDescription(desc: any): Promise<void> {
		this.remoteDescription = desc;
	}
	set_state(state: string): void {
		this.connectionState = state;
		this.dispatchEvent(new Event("connectionstatechange"));
	}
	receive(message: Record<string, unknown>): void {
		this.channel.onmessage?.({ data: JSON.stringify(message) });
	}
	getTransceivers(): any[] {
		return [];
	}
	getSenders(): any[] {
		return this.tracks.map((track) => ({ track }));
	}
	close(): void {
		this.closed = true;
	}
}

// Real MediaStreams, so that they can be assigned to srcObject and fed to an
// AudioContext like the ones getUserMedia returns.
function fake_stream(kind: "video" | "audio"): MediaStream {
	if (kind === "video") {
		const canvas = document.createElement("canvas");
		canvas.width = 2;
		canvas.height = 2;
		return canvas.captureStream(1);
	}
	return new AudioContext().createMediaStreamDestination().stream;
}

function make_server(
	offer_response: Record<string, unknown> = {
		sdp: "v=0 answer",
		type: "answer"
	}
) {
	return {
		offer: vi.fn(async () => offer_response),
		get_rtc_configuration: vi.fn(async () => ({ iceServers: [] }))
	};
}

const loading_status = {
	eta: 0,
	queue_position: 0,
	queue_size: 1,
	status: "pending" as const,
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "minimal" as const,
	type: "output" as const,
	stream_state: null as "waiting" | "open" | "closed" | null
};

type SetData = (data: Record<string, any>) => Promise<void>;

// What the queue reports for the stream's event: it waits in line, its turn
// comes, and it ends
async function queue_reports(
	set_data: SetData,
	...states: ("waiting" | "open" | "closed")[]
): Promise<void> {
	for (const stream_state of states) {
		await set_data({
			loading_status: {
				...loading_status,
				status: stream_state === "closed" ? "complete" : "pending",
				stream_state
			}
		});
	}
}

async function admit(set_data: SetData): Promise<void> {
	await queue_reports(set_data, "waiting", "open");
}

const base_props = {
	value: null as string | null,
	mode: "send-receive" as const,
	modality: "video" as const,
	rtp_params: {},
	track_constraints: {},
	mirror_webcam: "auto" as const,
	time_limit: null as number | null,
	icon: null,
	icon_button_color: null,
	pulse_color: null,
	icon_radius: null,
	button_labels: { start: "", stop: "", waiting: "" },
	height: null,
	width: null,
	interactive: true,
	server: make_server()
};

beforeEach(() => {
	FakePeerConnection.instances = [];
	vi.stubGlobal("RTCPeerConnection", FakePeerConnection);
	Object.defineProperty(navigator, "mediaDevices", {
		configurable: true,
		value: {
			getUserMedia: vi.fn(async (constraints: MediaStreamConstraints) =>
				fake_stream(constraints.video ? "video" : "audio")
			),
			enumerateDevices: vi.fn(async () => [
				{ kind: "videoinput", deviceId: "device-1", label: "Camera 1" },
				{ kind: "audioinput", deviceId: "mic-1", label: "Mic 1" }
			])
		}
	});
	HTMLMediaElement.prototype.play = vi.fn(async () => {});
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

run_shared_prop_tests({
	component: WebRTC,
	name: "WebRTC",
	base_props,
	has_label: false,
	has_validation_error: false
});

describe("WebRTC send-receive video", () => {
	test("starting joins the queue, and the offer goes out once the turn comes", async () => {
		const server = make_server();
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			server
		});

		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});

		const start_recording = listen("start_recording");
		const change = listen("change");
		const stream = listen("stream");
		await fireEvent.click(getByRole("button", { name: "start stream" }));

		await waitFor(() => expect(stream).toHaveBeenCalledTimes(1));
		await queue_reports(set_data, "waiting");
		expect(server.offer).not.toHaveBeenCalled();
		expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
			"audio.waiting"
		);
		await queue_reports(set_data, "open");

		await waitFor(() => {
			expect(server.get_rtc_configuration).toHaveBeenCalled();
			expect(server.offer).toHaveBeenCalledTimes(1);
		});
		expect(start_recording).toHaveBeenCalled();
		const body = server.offer.mock.calls[0][0];
		expect(body.type).toBe("offer");
		expect(body.sdp).toBe("v=0 offer");
		expect(typeof body.webrtc_id).toBe("string");
		await waitFor(() => expect(change).toHaveBeenCalled());

		const pc = FakePeerConnection.instances[0];
		expect(pc.tracks.length).toBe(1);
		expect(pc.remoteDescription).toEqual({ sdp: "v=0 answer", type: "answer" });

		const tick = listen("tick");
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		expect(tick).toHaveBeenCalledTimes(1);
	});

	test("a rejected offer dispatches an error and ends the turn", async () => {
		const server = make_server({
			status: "failed",
			meta: { error: "not_admitted" }
		});
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		const error = listen("error");
		const close_stream = listen("close_stream");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => {
			expect(error).toHaveBeenCalledWith(
				"The stream's turn in the queue ended before it connected. Please try again."
			);
		});
		expect(close_stream).toHaveBeenCalled();
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
				"audio.record"
			);
		});
	});

	test("stopping while waiting in line leaves the queue without connecting", async () => {
		const server = make_server();
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		const close_stream = listen("close_stream");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await queue_reports(set_data, "waiting");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		expect(close_stream).toHaveBeenCalledTimes(1);
		await queue_reports(set_data, "closed");
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(server.get_rtc_configuration).not.toHaveBeenCalled();
		expect(server.offer).not.toHaveBeenCalled();
		expect(FakePeerConnection.instances).toHaveLength(0);
	});

	test("the stream closes when the server ends its turn", async () => {
		const server = make_server({
			sdp: "v=0 answer",
			type: "answer",
			time_limit: 30
		});
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});

		const stop_recording = listen("stop_recording");
		// For example, the time limit was reached
		await queue_reports(set_data, "closed");
		await waitFor(() => expect(stop_recording).toHaveBeenCalled());
		await waitFor(() => expect(pc.closed).toBe(true));
		expect(getByRole("button", { name: "start stream" })).toBeVisible();
	});

	test("another event that takes the component as an input does not end the stream", async () => {
		const server = make_server();
		const { getByRole, getByText, set_data } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});

		// For example the event that pushes the input values, when it completes
		await set_data({
			loading_status: {
				...loading_status,
				fn_index: 1,
				status: "complete",
				stream_state: "closed"
			}
		});
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(pc.closed).toBe(false);
		expect(getByRole("button", { name: "stop stream" })).toBeVisible();
	});

	test("data channel messages map to component events", async () => {
		const server = make_server();
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");

		const tick = listen("tick");
		const warning = listen("warning");
		const stop_recording = listen("stop_recording");
		const close_stream = listen("close_stream");
		pc.receive({ type: "send_input", data: [] });
		expect(tick).toHaveBeenCalledTimes(1);

		pc.receive({ type: "end_stream", data: "Time is up" });
		expect(warning).toHaveBeenCalledWith("Time is up");
		await waitFor(() => expect(stop_recording).toHaveBeenCalled());
		expect(close_stream).toHaveBeenCalled();
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
	});
});

describe("WebRTC receive video", () => {
	test("the start value opens a receive-only connection", async () => {
		const server = make_server();
		const { listen, set_data } = await render(WebRTC, {
			...base_props,
			mode: "receive",
			server
		});
		const change = listen("change");
		const stream = listen("stream");
		await set_data({ value: START_STREAM });
		await waitFor(() => expect(stream).toHaveBeenCalledTimes(1));
		expect(server.offer).not.toHaveBeenCalled();
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
		const pc = FakePeerConnection.instances[0];
		expect(pc.addTransceiver).toHaveBeenCalledWith("video", {
			direction: "recvonly"
		});
		expect(pc.tracks.length).toBe(0);
		await waitFor(() => expect(change).toHaveBeenCalled());
		const body = server.offer.mock.calls[0][0];
		expect(body.webrtc_id).not.toBe(START_STREAM);
	});
});

describe("WebRTC audio", () => {
	test("send mode opens the microphone once the turn comes", async () => {
		const server = make_server();
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			mode: "send",
			modality: "audio",
			server
		});
		await fireEvent.click(getByText("Click to Access Microphone"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		const accessed = get_user_media.mock.calls.length;
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await queue_reports(set_data, "waiting");
		// Waiting in line does not hold the microphone
		expect(get_user_media.mock.calls.length).toBe(accessed);
		await queue_reports(set_data, "open");
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
		expect(get_user_media.mock.calls.length).toBe(accessed + 1);
		const pc = FakePeerConnection.instances[0];
		expect(pc.tracks.map((t) => t.kind)).toEqual(["audio"]);
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "mute microphone" })).toBeVisible();
		});
		const close_stream = listen("close_stream");
		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await waitFor(() => expect(close_stream).toHaveBeenCalled());
	});

	test("the microphone is only held while recording", async () => {
		const opened: MediaStream[] = [];
		vi.mocked(navigator.mediaDevices.getUserMedia).mockImplementation(
			async () => {
				const stream = fake_stream("audio");
				opened.push(stream);
				return stream;
			}
		);
		const live = (): MediaStreamTrack[] =>
			opened
				.flatMap((stream) => stream.getTracks())
				.filter((track) => track.readyState === "live");

		const { getByRole, getByText, set_data } = await render(WebRTC, {
			...base_props,
			mode: "send-receive",
			modality: "audio",
			server: make_server()
		});
		await fireEvent.click(getByText("Click to Access Microphone"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		// Access only asks for permission and lists the devices
		expect(opened).toHaveLength(1);
		expect(live()).toHaveLength(0);

		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(FakePeerConnection.instances).toHaveLength(1));
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		expect(opened).toHaveLength(2);
		expect(live()).toHaveLength(1);

		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		expect(live()).toHaveLength(0);
		expect(opened).toHaveLength(2);
	});

	test("stopping while the microphone is opening releases it", async () => {
		const { getByRole, getByText, set_data } = await render(WebRTC, {
			...base_props,
			mode: "send-receive",
			modality: "audio",
			server: make_server()
		});
		await fireEvent.click(getByText("Click to Access Microphone"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});

		let resolve_mic: (stream: MediaStream) => void = () => {};
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		get_user_media.mockImplementationOnce(
			() => new Promise((resolve) => (resolve_mic = resolve))
		);
		const accessed = get_user_media.mock.calls.length;
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() =>
			expect(get_user_media.mock.calls.length).toBe(accessed + 1)
		);
		// Still waiting for the microphone: this click stops the attempt
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		const late_stream = fake_stream("audio");
		resolve_mic(late_stream);

		await waitFor(() => {
			expect(
				late_stream.getTracks().every((track) => track.readyState === "ended")
			).toBe(true);
		});
		expect(FakePeerConnection.instances).toHaveLength(0);
	});
});
