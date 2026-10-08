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
		get_rtc_configuration: vi.fn(async () => ({ iceServers: [] })),
		stop_outputs: vi.fn(async () => ({ success: true }))
	};
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
	test("opening the webcam then starting negotiates through the server offer", async () => {
		const server = make_server();
		const { getByRole, getByText, listen, component } = await render(WebRTC, {
			...base_props,
			server
		});

		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});

		const start_recording = listen("start_recording");
		const change = listen("change");
		await fireEvent.click(getByRole("button", { name: "start stream" }));

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

	test("a rejected offer dispatches an error", async () => {
		const server = make_server({
			status: "failed",
			meta: { error: "concurrency_limit_reached", limit: 1 }
		});
		const { getByRole, getByText, listen } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		const error = listen("error");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await waitFor(() => {
			expect(error).toHaveBeenCalledWith(
				"Too many users are connected right now. Please try again later."
			);
		});
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
	});

	test("data channel messages map to component events", async () => {
		const server = make_server();
		const { getByRole, getByText, listen } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");

		const tick = listen("tick");
		const state_change = listen("state_change");
		const warning = listen("warning");
		const stop_recording = listen("stop_recording");
		pc.receive({ type: "send_input", data: [] });
		pc.receive({ type: "fetch_output", data: [] });
		expect(tick).toHaveBeenCalledTimes(1);
		expect(state_change).toHaveBeenCalledTimes(1);

		pc.receive({ type: "end_stream", data: "Time is up" });
		expect(warning).toHaveBeenCalledWith("Time is up");
		await waitFor(() => expect(stop_recording).toHaveBeenCalled());
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
		await set_data({ value: START_STREAM });
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
	test("send mode opens the microphone and sends the audio track", async () => {
		const server = make_server();
		const { getByRole, getByText } = await render(WebRTC, {
			...base_props,
			mode: "send",
			modality: "audio",
			server
		});
		await fireEvent.click(getByText("Click to Access Microphone"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
		const pc = FakePeerConnection.instances[0];
		expect(pc.tracks.map((t) => t.kind)).toEqual(["audio"]);
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "mute microphone" })).toBeVisible();
		});
		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await waitFor(() => expect(server.stop_outputs).toHaveBeenCalled());
	});
});
