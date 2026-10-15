import { test, describe, afterEach, beforeEach, expect, vi } from "vitest";
import type { Mock } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import WebRTC from "./Index.svelte";
import { START_STREAM } from "./types";
import {
	DISCONNECT_GRACE_MS,
	RESTART_GUARD_MS,
	new_webrtc_id,
	on_connection_state
} from "./shared/webrtc";

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
	stream_options: {
		button_labels: {},
		icon: null,
		icon_button_color: null,
		pulse_color: null,
		icon_radius: null
	},
	height: null,
	width: null,
	has_stream: true,
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
		expect(getByRole("status")).toHaveTextContent("audio.waiting");
		expect(getByRole("button", { name: "cancel waiting" })).toHaveTextContent(
			"chatbot.cancel"
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

	test.each([
		["auto", true],
		[false, false]
	] as const)(
		"with mirror_webcam=%s the offer asks for mirrored frames: %s",
		async (mirror_webcam, expected) => {
			const server = make_server();
			const { getByRole, getByText, set_data } = await render(WebRTC, {
				...base_props,
				mirror_webcam,
				server
			});
			await fireEvent.click(getByText("Click to Access Webcam"));
			await waitFor(() => {
				expect(getByRole("button", { name: "start stream" })).toBeVisible();
			});
			await fireEvent.click(getByRole("button", { name: "start stream" }));
			await admit(set_data);
			await waitFor(() => expect(server.offer).toHaveBeenCalled());
			expect(server.offer.mock.calls[0][0].mirror).toBe(expected);
		}
	);

	test("stream_options sets the text of the stream button", async () => {
		const { getByRole, getByText } = await render(WebRTC, {
			...base_props,
			stream_options: {
				...base_props.stream_options,
				button_labels: { start: "Start talking" }
			}
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
				"Start talking"
			);
		});
	});

	test("the camera can be turned off while no stream runs", async () => {
		const server = make_server();
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		const { getByRole, getByText, queryByRole, set_data } = await render(
			WebRTC,
			{ ...base_props, server }
		);
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});

		// Not while streaming: the stop button ends the stream first
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		expect(queryByRole("button", { name: "Turn off the camera" })).toBeNull();
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
				"audio.record"
			);
		});

		await fireEvent.click(getByRole("button", { name: "Turn off the camera" }));
		// The preview the stream's end reopened
		const latest: MediaStream = await get_user_media.mock.results.at(-1)!.value;
		expect(latest.getTracks().every((t) => t.readyState === "ended")).toBe(
			true
		);
		await waitFor(() => {
			expect(getByText("Click to Access Webcam")).toBeVisible();
		});
	});

	test("leaving the page closes the connection at once", async () => {
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

		// No later task runs once the page is gone, so this cannot wait
		window.dispatchEvent(new PageTransitionEvent("pagehide"));
		expect(pc.closed).toBe(true);
	});

	test("a page restored from the back/forward cache shows the stream ended", async () => {
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
		FakePeerConnection.instances[0].set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		const close_stream = listen("close_stream");

		window.dispatchEvent(
			new PageTransitionEvent("pagehide", { persisted: true })
		);
		window.dispatchEvent(
			new PageTransitionEvent("pageshow", { persisted: true })
		);
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
				"audio.record"
			);
		});
		expect(close_stream).toHaveBeenCalled();
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

	test("a double click on stop does not start a new stream", async () => {
		const server = make_server();
		const { getByRole, getByText, listen, set_data } = await render(WebRTC, {
			...base_props,
			server
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		const stream = listen("stream");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(FakePeerConnection.instances).toHaveLength(1));
		FakePeerConnection.instances[0].set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		expect(stream).toHaveBeenCalledTimes(1);

		// The second click of a double click lands on the start button
		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(stream).toHaveBeenCalledTimes(1);

		// A start a moment later is the user's own
		await new Promise((resolve) => setTimeout(resolve, RESTART_GUARD_MS));
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await waitFor(() => expect(stream).toHaveBeenCalledTimes(2));
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
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
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

		// Errors of the handler and gr.Info keep their title and duration
		const error = listen("error");
		const info = listen("info");
		pc.receive({
			type: "error",
			message: "Bad frame",
			title: "Oops",
			duration: 5,
			visible: true
		});
		expect(error).toHaveBeenCalledWith({
			message: "Bad frame",
			title: "Oops",
			duration: 5,
			visible: true
		});
		pc.receive({ type: "info", message: "Hi", title: null, duration: 10 });
		expect(info).toHaveBeenCalledWith({
			message: "Hi",
			title: undefined,
			duration: 10,
			visible: undefined
		});

		pc.receive({ type: "end_stream", data: "Time is up" });
		expect(warning).toHaveBeenCalledWith("Time is up");
		await waitFor(() => expect(stop_recording).toHaveBeenCalled());
		expect(close_stream).toHaveBeenCalled();
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
	});
});

describe("WebRTC camera choice", () => {
	// A stream from the requested camera and a microphone. Like the one
	// browsers return, it lists the audio track first.
	function camera_and_mic(constraints: MediaStreamConstraints): MediaStream {
		const video = fake_stream("video").getVideoTracks()[0];
		const audio = fake_stream("audio").getAudioTracks()[0];
		const camera = (constraints.video as any)?.deviceId?.exact ?? "cam-front";
		video.getSettings = () => ({ deviceId: camera });
		audio.getSettings = () => ({ deviceId: "mic-1" });
		return new MediaStream([audio, video]);
	}

	function requested_camera(constraints: MediaStreamConstraints): string {
		return (constraints.video as any)?.deviceId?.exact;
	}

	test("an audio-video stream keeps the chosen camera after it ends", async () => {
		vi.mocked(navigator.mediaDevices.enumerateDevices).mockResolvedValue([
			{ kind: "videoinput", deviceId: "cam-front", label: "Front" },
			{ kind: "videoinput", deviceId: "cam-back", label: "Back" },
			{ kind: "audioinput", deviceId: "mic-1", label: "Mic 1" }
		] as MediaDeviceInfo[]);
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		get_user_media.mockImplementation(async (constraints) =>
			camera_and_mic(constraints!)
		);
		const server = make_server();
		const { getByRole, getByText, getByLabelText, set_data } = await render(
			WebRTC,
			{ ...base_props, modality: "audio-video", server }
		);
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(
				getByRole("button", { name: "select input source" })
			).toBeVisible();
		});

		await fireEvent.click(getByRole("button", { name: "select input source" }));
		const select = getByLabelText("select source") as HTMLSelectElement;
		select.value = "cam-back";
		await fireEvent.change(select);
		await waitFor(() => {
			expect(requested_camera(get_user_media.mock.lastCall![0]!)).toBe(
				"cam-back"
			);
		});
		// The list shows the camera in use
		await fireEvent.click(getByRole("button", { name: "select input source" }));
		expect((getByLabelText("select source") as HTMLSelectElement).value).toBe(
			"cam-back"
		);

		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		const calls = get_user_media.mock.calls.length;

		// The stream ends, and the camera reopens for the preview
		await queue_reports(set_data, "closed");
		await waitFor(() => {
			expect(get_user_media.mock.calls.length).toBe(calls + 1);
		});
		expect(requested_camera(get_user_media.mock.lastCall![0]!)).toBe(
			"cam-back"
		);
	});
});

describe("WebRTC queue turn", () => {
	async function ready_webcam(props: Record<string, any> = {}) {
		const server = make_server();
		const result = await render(WebRTC, { ...base_props, server, ...props });
		await fireEvent.click(result.getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(
				result.getByRole("button", { name: "start stream" })
			).toBeVisible();
		});
		return { server, ...result };
	}

	test("while waiting, the place in the queue and the wait count down", async () => {
		const { getByRole, set_data } = await ready_webcam();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		const waiting = {
			...loading_status,
			stream_state: "waiting" as const,
			queue_position: 1,
			queue_size: 3,
			eta: 24.6
		};
		await set_data({ loading_status: waiting });
		await waitFor(() => {
			expect(getByRole("status")).toHaveTextContent(
				"audio.waiting · 2/3 · ~25s"
			);
		});
		expect(getByRole("button", { name: "cancel waiting" })).toBeVisible();
		// Between the queue's estimates the wait counts down...
		await waitFor(
			() => {
				expect(getByRole("status")).toHaveTextContent(
					"audio.waiting · 2/3 · ~24s"
				);
			},
			{ timeout: 2000 }
		);
		// ...and the same status delivered again does not restart it
		await set_data({ loading_status: { ...waiting } });
		expect(getByRole("status")).toHaveTextContent("audio.waiting · 2/3 · ~24s");
		// A new estimate (someone ahead left) replaces it
		await set_data({
			loading_status: { ...waiting, queue_position: 0, queue_size: 2, eta: 4.2 }
		});
		await waitFor(() => {
			expect(getByRole("status")).toHaveTextContent(
				"audio.waiting · 1/2 · ~4s"
			);
		});
	});

	test("once the estimate runs out, only the place is shown", async () => {
		const { getByRole, set_data } = await ready_webcam();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await set_data({
			loading_status: {
				...loading_status,
				stream_state: "waiting",
				queue_position: 0,
				queue_size: 1,
				eta: 0.4
			}
		});
		await waitFor(
			() => {
				expect(getByRole("status")).toHaveTextContent(
					/^audio\.waiting · 1\/1$/
				);
			},
			{ timeout: 2000 }
		);
	});

	test("a receive player shows the place in the queue while waiting", async () => {
		const { getByText, set_data } = await render(WebRTC, {
			...base_props,
			mode: "receive",
			server: make_server()
		});
		await set_data({ value: START_STREAM });
		await set_data({
			loading_status: {
				...loading_status,
				stream_state: "waiting",
				queue_position: 0,
				queue_size: 2,
				eta: 10
			}
		});
		await waitFor(() =>
			expect(getByText("audio.waiting · 1/2 · ~10s")).toBeVisible()
		);
	});

	test("a receive player can leave the queue while waiting", async () => {
		const { getByRole, listen, set_data } = await render(WebRTC, {
			...base_props,
			mode: "receive",
			server: make_server()
		});
		const close_stream = listen("close_stream");
		await set_data({ value: START_STREAM });
		await queue_reports(set_data, "waiting");
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		await waitFor(() => expect(close_stream).toHaveBeenCalled());
		await queue_reports(set_data, "closed");
		expect(FakePeerConnection.instances).toHaveLength(0);
	});

	test("without a stream handler, starting reports an error at once", async () => {
		const { getByRole, listen, server } = await ready_webcam({
			has_stream: false
		});
		const error = listen("error");
		const stream = listen("stream");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await waitFor(() => {
			expect(error).toHaveBeenCalledWith(
				"No stream handler is attached to this component."
			);
		});
		expect(stream).not.toHaveBeenCalled();
		expect(server.offer).not.toHaveBeenCalled();
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
				"audio.record"
			);
		});
	});

	test("a stream event the page no longer wants is ended", async () => {
		const { getByRole, listen, set_data } = await ready_webcam();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		// Stopped before the join went out
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		const close_stream = listen("close_stream");
		// The join still reaches the queue
		await queue_reports(set_data, "waiting");
		await waitFor(() => expect(close_stream).toHaveBeenCalled());
	});

	test("stopping while waiting keeps the one camera preview", async () => {
		const { getByRole, set_data } = await ready_webcam();
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		const opened = get_user_media.mock.calls.length;
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await queue_reports(set_data, "waiting");
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		await queue_reports(set_data, "closed");
		await new Promise((resolve) => setTimeout(resolve, 50));
		// The preview was never stopped, so nothing reopens the camera
		expect(get_user_media.mock.calls.length).toBe(opened);
	});

	test("stopping while the RTC configuration loads does not connect", async () => {
		const { getByRole, set_data, server } = await ready_webcam();
		let resolve_config: (config: Record<string, any>) => void = () => {};
		server.get_rtc_configuration.mockImplementationOnce(
			() => new Promise((resolve) => (resolve_config = resolve))
		);
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() =>
			expect(server.get_rtc_configuration).toHaveBeenCalled()
		);
		// Stop while the configuration is still on its way
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		resolve_config({ iceServers: [] });
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(FakePeerConnection.instances).toHaveLength(0);
		expect(server.offer).not.toHaveBeenCalled();
	});

	test("a receive player unmounted while its configuration loads does not connect", async () => {
		const server = make_server();
		let resolve_config: (config: Record<string, any>) => void = () => {};
		server.get_rtc_configuration.mockImplementationOnce(
			() => new Promise((resolve) => (resolve_config = resolve))
		);
		const { set_data, unmount } = await render(WebRTC, {
			...base_props,
			mode: "receive",
			server
		});
		await set_data({ value: START_STREAM });
		await admit(set_data);
		await waitFor(() =>
			expect(server.get_rtc_configuration).toHaveBeenCalled()
		);
		unmount();
		resolve_config({ iceServers: [] });
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(FakePeerConnection.instances).toHaveLength(0);
		expect(server.offer).not.toHaveBeenCalled();
	});

	test("starting a receive stream again while waiting keeps the new attempt", async () => {
		const server = make_server();
		const { listen, set_data } = await render(WebRTC, {
			...base_props,
			mode: "receive",
			server
		});
		const stream = listen("stream");
		await set_data({ value: START_STREAM });
		await waitFor(() => expect(stream).toHaveBeenCalledTimes(1));
		await queue_reports(set_data, "waiting");
		// The trigger fires again while the first attempt waits in line
		await set_data({ value: START_STREAM });
		await waitFor(() => expect(stream).toHaveBeenCalledTimes(2));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
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

	test("an audio-video preview holds only the camera", async () => {
		const opened: MediaStream[] = [];
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		get_user_media.mockImplementation(async (constraints) => {
			const tracks = [
				...(constraints?.video ? fake_stream("video").getTracks() : []),
				...(constraints?.audio ? fake_stream("audio").getTracks() : [])
			];
			const stream = new MediaStream(tracks);
			opened.push(stream);
			return stream;
		});
		const live = (kind: string): MediaStreamTrack[] =>
			opened
				.flatMap((stream) => stream.getTracks())
				.filter((track) => track.kind === kind && track.readyState === "live");

		const { getByRole, getByText, set_data } = await render(WebRTC, {
			...base_props,
			modality: "audio-video",
			server: make_server()
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		// One prompt asks for both, but the preview only keeps the camera
		expect(get_user_media.mock.calls[0][0]!.audio).toBeTruthy();
		expect(live("video")).toHaveLength(1);
		expect(live("audio")).toHaveLength(0);

		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(FakePeerConnection.instances).toHaveLength(1));
		const pc = FakePeerConnection.instances[0];
		await waitFor(() => {
			expect(pc.tracks.map((track) => track.kind).sort()).toEqual([
				"audio",
				"video"
			]);
		});
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		expect(live("audio")).toHaveLength(1);

		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		// The camera comes back for the preview, the microphone does not
		await waitFor(() => expect(live("video")).toHaveLength(1));
		expect(live("audio")).toHaveLength(0);
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
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		const late_stream = fake_stream("audio");
		resolve_mic(late_stream);

		await waitFor(() => {
			expect(
				late_stream.getTracks().every((track) => track.readyState === "ended")
			).toBe(true);
		});
		expect(FakePeerConnection.instances).toHaveLength(0);
	});

	test("the icon pulses with each new stream", async () => {
		const analysed: AudioContext[] = [];
		const create_analyser = AudioContext.prototype.createAnalyser;
		const spy = vi
			.spyOn(AudioContext.prototype, "createAnalyser")
			.mockImplementation(function (this: AudioContext) {
				analysed.push(this);
				return create_analyser.call(this);
			});
		try {
			// The microphone keeps its icon on screen between streams
			const { getByRole, getByText, set_data } = await render(WebRTC, {
				...base_props,
				mode: "send-receive",
				modality: "audio",
				stream_options: {
					...base_props.stream_options,
					icon: "https://example.com/icon.png"
				},
				server: make_server()
			});
			await fireEvent.click(getByText("Click to Access Microphone"));

			async function stream_once(n: number): Promise<void> {
				await waitFor(() => {
					expect(getByRole("button", { name: "start stream" })).toBeVisible();
				});
				await fireEvent.click(getByRole("button", { name: "start stream" }));
				await admit(set_data);
				await waitFor(() =>
					expect(FakePeerConnection.instances).toHaveLength(n)
				);
				const pc = FakePeerConnection.instances[n - 1];
				// The server's audio, which the icon pulses with
				const remote = fake_stream("audio");
				pc.dispatchEvent(
					Object.assign(new Event("track"), {
						streams: [remote],
						track: remote.getAudioTracks()[0]
					})
				);
				pc.set_state("connected");
				await waitFor(() => {
					expect(getByRole("button", { name: "stop stream" })).toBeVisible();
				});
			}

			await stream_once(1);
			const per_stream = analysed.length;
			expect(per_stream).toBeGreaterThan(0);
			await fireEvent.click(getByRole("button", { name: "stop stream" }));
			await queue_reports(set_data, "closed");
			// Nothing keeps analysing the stream that ended
			await waitFor(() => {
				expect(analysed.every((context) => context.state === "closed")).toBe(
					true
				);
			});
			await new Promise((resolve) => setTimeout(resolve, RESTART_GUARD_MS));
			await stream_once(2);
			await waitFor(() => expect(analysed).toHaveLength(2 * per_stream));
		} finally {
			spy.mockRestore();
		}
	});
});

describe("WebRTC connection", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	function watch(): {
		pc: FakePeerConnection;
		handlers: Record<"connected" | "ended" | "failed", Mock>;
	} {
		const pc = new FakePeerConnection({});
		const handlers = { connected: vi.fn(), ended: vi.fn(), failed: vi.fn() };
		on_connection_state(pc as unknown as RTCPeerConnection, handlers);
		return { pc, handlers };
	}

	test("a brief disconnection does not end the stream", () => {
		vi.useFakeTimers();
		const { pc, handlers } = watch();
		pc.set_state("connected");
		// e.g. a phone switching from Wi-Fi to cellular
		pc.set_state("disconnected");
		vi.advanceTimersByTime(DISCONNECT_GRACE_MS - 100);
		pc.set_state("connected");
		vi.advanceTimersByTime(DISCONNECT_GRACE_MS);
		expect(handlers.ended).not.toHaveBeenCalled();
		// The stream carries on as it was
		expect(handlers.connected).toHaveBeenCalledTimes(1);
	});

	test("a connection that stays disconnected ends the stream", () => {
		vi.useFakeTimers();
		const { pc, handlers } = watch();
		pc.set_state("connected");
		pc.set_state("disconnected");
		vi.advanceTimersByTime(DISCONNECT_GRACE_MS);
		expect(handlers.ended).toHaveBeenCalledTimes(1);
	});

	test("a closed or failed connection ends the stream at once", () => {
		const closed = watch();
		closed.pc.set_state("closed");
		expect(closed.handlers.ended).toHaveBeenCalledTimes(1);
		const failed = watch();
		failed.pc.set_state("failed");
		expect(failed.handlers.failed).toHaveBeenCalledTimes(1);
	});

	test("stream ids are hard to guess", () => {
		// The id names the stream to the server in signalling
		const id = new_webrtc_id();
		expect(id).toMatch(/^[0-9a-f]{32}$/);
		expect(new_webrtc_id()).not.toBe(id);
	});
});
