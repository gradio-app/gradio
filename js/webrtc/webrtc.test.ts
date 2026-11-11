import { test, describe, afterEach, beforeEach, expect, vi } from "vitest";
import type { Mock } from "vitest";
import { tick } from "svelte";
import {
	cleanup,
	render as render_component,
	fireEvent,
	waitFor
} from "@self/tootils/render";
import type { DispatchObserver } from "@gradio/utils";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import WebRTC from "./Index.svelte";
import { START_STREAM } from "./types";
import { RESTART_GUARD_MS, attach_remote_media } from "./shared/webrtc";

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

// A client whose signalling calls the tests watch through `offer` and
// `get_rtc_configuration`
function make_server(
	offer_response: Record<string, unknown> = {
		sdp: "v=0 answer",
		type: "answer"
	}
) {
	const offer = vi.fn(async (_body?: any) => offer_response);
	const get_rtc_configuration = vi.fn(
		async (_body?: any): Promise<any> => ({ iceServers: [] })
	);
	return {
		offer,
		get_rtc_configuration,
		webrtc_offer: (body: Record<string, unknown>) => offer(body),
		webrtc_rtc_configuration: (webrtc_id: string) =>
			get_rtc_configuration({ webrtc_id })
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

// The runs of the stream event that a rendered component started, each with
// the observer it dispatched it with (see `Gradio.dispatch`), as the app's
// dependency manager would follow them
type StreamRun = { observer: DispatchObserver; started: boolean };
type StreamRuns = { runs: StreamRun[]; closed: Mock };
const stream_runs = new WeakMap<SetData, StreamRuns>();

// `render` that also records the stream runs. `listen("close_stream")` hears
// the page closing its stream run, which it does through the run's handle.
async function render(
	...args: Parameters<typeof render_component>
): ReturnType<typeof render_component> {
	const result = await render_component(...args);
	const runs: StreamRuns = { runs: [], closed: vi.fn() };
	result.listen("stream").mockImplementation((_data, observer) => {
		if (observer) runs.runs.push({ observer, started: false });
	});
	stream_runs.set(result.set_data, runs);
	const listen = result.listen;
	result.listen = ((event_name: string, opts?: any) =>
		event_name === "close_stream"
			? runs.closed
			: listen(event_name, opts)) as typeof listen;
	return result;
}

// The latest stream run, which the queue has now taken
function latest_run(set_data: SetData): StreamRun | null {
	const runs = stream_runs.get(set_data)!;
	const run = runs.runs.at(-1) ?? null;
	if (run && !run.started) {
		run.started = true;
		run.observer.on_start?.({ close: () => runs.closed() });
	}
	return run;
}

// What the queue reports for the latest stream run: a status as its loading
// status gets it
async function queue_status(
	set_data: SetData,
	status: Record<string, unknown>
): Promise<void> {
	const run = latest_run(set_data);
	run?.observer.on_status?.(status as any);
	if (status.stream_state === "closed") run?.observer.on_end?.("ended");
	await tick();
}

// The join of the latest stream run fails before it starts, e.g. a full
// queue answers it with 503
async function join_fails(set_data: SetData): Promise<void> {
	const runs = stream_runs.get(set_data)!;
	runs.runs.at(-1)?.observer.on_end?.("error");
	await tick();
}

// What the queue reports for the stream's event: it waits in line, its turn
// comes, and it ends
async function queue_reports(
	set_data: SetData,
	...states: ("waiting" | "open" | "closed")[]
): Promise<void> {
	for (const stream_state of states) {
		await queue_status(set_data, {
			...loading_status,
			status: stream_state === "closed" ? "complete" : "pending",
			stream_state
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
	client: make_server()
};

// Renders the component and, unless it only receives, opens the camera or
// microphone so that the start button shows
async function ready_device(
	props: Record<string, any> = {},
	server = make_server()
) {
	const result = await render(WebRTC, {
		...base_props,
		client: server,
		...props
	});
	if (props.mode !== "receive") {
		await fireEvent.click(
			result.getByText(
				props.modality === "audio"
					? "Click to Access Microphone"
					: "Click to Access Webcam"
			)
		);
		await waitFor(() => {
			expect(
				result.getByRole("button", { name: "start stream" })
			).toBeVisible();
		});
	}
	return { server, ...result };
}

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

describe("WebRTC interactive", () => {
	test.each(["video", "audio"] as const)(
		"a stream cannot start while the component is not interactive (%s)",
		async (modality) => {
			const { getByRole, listen, set_data } = await ready_device({ modality });
			const stream = listen("stream");
			await set_data({ interactive: false });
			await fireEvent.click(getByRole("button", { name: "start stream" }));
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(stream).not.toHaveBeenCalled();
			await set_data({ interactive: true });
			await fireEvent.click(getByRole("button", { name: "start stream" }));
			await waitFor(() => expect(stream).toHaveBeenCalledTimes(1));
		}
	);

	test("a running stream can still be stopped", async () => {
		const { getByRole, listen, set_data } = await ready_device();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(FakePeerConnection.instances).toHaveLength(1));
		FakePeerConnection.instances[0].set_state("connected");
		await waitFor(() =>
			expect(getByRole("button", { name: "stop stream" })).toBeVisible()
		);
		const close_stream = listen("close_stream");
		await set_data({ interactive: false });
		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await waitFor(() => expect(close_stream).toHaveBeenCalled());
	});

	test("devices cannot be opened while the component is not interactive", async () => {
		const { getByText } = await render(WebRTC, {
			...base_props,
			interactive: false,
			client: make_server()
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
	});
});

describe("WebRTC send-receive video", () => {
	test("starting joins the queue, and the offer goes out once the turn comes", async () => {
		const { getByRole, listen, set_data, server } = await ready_device();
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
			const { getByRole, set_data, server } = await ready_device({
				mirror_webcam
			});
			await fireEvent.click(getByRole("button", { name: "start stream" }));
			await admit(set_data);
			await waitFor(() => expect(server.offer).toHaveBeenCalled());
			expect(server.offer.mock.calls[0][0].mirror).toBe(expected);
		}
	);

	test("stream_options sets the text of the stream button", async () => {
		const { getByRole } = await ready_device({
			stream_options: {
				...base_props.stream_options,
				button_labels: { start: "Start talking" }
			}
		});
		expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
			"Start talking"
		);
	});

	test("the camera can be turned off while no stream runs", async () => {
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		const { getByRole, getByText, queryByRole, set_data, server } =
			await ready_device();

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

	test("a camera that cannot be opened says so", async () => {
		vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(
			new DOMException("Device in use", "NotReadableError")
		);
		const { getByText, listen } = await render(WebRTC, {
			...base_props,
			client: make_server()
		});
		const error = listen("error");
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => {
			expect(error).toHaveBeenCalledWith("audio.no_device_support");
		});
	});

	test("a camera that opens after the component is gone is let go", async () => {
		let open_camera: (stream: MediaStream) => void = () => {};
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		get_user_media.mockImplementation(
			() =>
				new Promise((resolve) => {
					open_camera = resolve;
				})
		);
		const { getByText, unmount } = await render(WebRTC, {
			...base_props,
			client: make_server()
		});
		await fireEvent.click(getByText("Click to Access Webcam"));
		await waitFor(() => expect(get_user_media).toHaveBeenCalled());
		// e.g. a re-render removes the component while the browser asks
		unmount();
		const late = fake_stream("video");
		open_camera(late);
		await waitFor(() => {
			expect(late.getTracks().every((t) => t.readyState === "ended")).toBe(
				true
			);
		});
	});

	test("leaving the page closes the connection at once, and a restored page shows the stream ended", async () => {
		const { getByRole, listen, set_data, server } = await ready_device();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalled());
		const pc = FakePeerConnection.instances[0];
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});
		const close_stream = listen("close_stream");

		// Into the back/forward cache
		window.dispatchEvent(
			new PageTransitionEvent("pagehide", { persisted: true })
		);
		// No later task runs once the page is gone, so this cannot wait
		expect(pc.closed).toBe(true);
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

	test.each([
		// The stream's queue event fails with the handler's error, which the
		// page shows, so the component adds none
		["setup_failed", { error: "setup_failed", message: "No GPU" }, []],
		[
			"not_admitted",
			{ error: "not_admitted" },
			[
				"The stream's turn in the queue ended before it connected. Please try again."
			]
		]
	] as const)(
		"a rejected offer ends the turn and is reported once (%s)",
		async (_, meta, errors) => {
			const { getByRole, listen, set_data } = await ready_device(
				{},
				make_server({ status: "failed", meta })
			);
			const error = listen("error");
			const close_stream = listen("close_stream");
			await fireEvent.click(getByRole("button", { name: "start stream" }));
			await admit(set_data);
			await waitFor(() => expect(close_stream).toHaveBeenCalled());
			await waitFor(() => {
				expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
					"audio.record"
				);
			});
			expect(error.mock.calls).toEqual(errors.map((message) => [message]));
		}
	);

	test("a double click on stop does not start a new stream", async () => {
		const { getByRole, listen, set_data } = await ready_device();
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

	test("stopping while waiting in line leaves the queue without connecting or reopening the camera", async () => {
		const { getByRole, listen, set_data, server } = await ready_device();
		const get_user_media = vi.mocked(navigator.mediaDevices.getUserMedia);
		const opened = get_user_media.mock.calls.length;
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
		// The preview was never stopped, so nothing reopens the camera
		expect(get_user_media.mock.calls.length).toBe(opened);
	});

	test("the stream closes when the server ends its turn", async () => {
		const { getByRole, listen, set_data, server } = await ready_device();
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

	test("a stream does not start while the camera is reopening after the last one", async () => {
		const { getByRole, listen, set_data } = await ready_device();
		const stream = listen("stream");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(FakePeerConnection.instances).toHaveLength(1));
		FakePeerConnection.instances[0].set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "stop stream" })).toBeVisible();
		});

		// The camera comes back for the preview only when this resolves
		let reopen!: () => void;
		const get_user_media = navigator.mediaDevices.getUserMedia as Mock;
		get_user_media.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					reopen = () => resolve(fake_stream("video"));
				})
		);
		// The server ends the stream (e.g. its time limit), which stops the
		// camera's tracks with the connection
		await queue_reports(set_data, "closed");
		await waitFor(() => expect(reopen).toBeDefined());
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await new Promise((resolve) => setTimeout(resolve, 50));
		// A stream would send the stopped tracks and the handler get no frame
		expect(stream).toHaveBeenCalledTimes(1);

		reopen();
		await waitFor(async () => {
			await fireEvent.click(getByRole("button", { name: "start stream" }));
			expect(stream).toHaveBeenCalledTimes(2);
		});
	});

	test("data channel messages map to component events", async () => {
		const { getByRole, listen, set_data, server } = await ready_device();
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

		// The handler's errors and its gr.Info come through the stream's
		// queue event, like an event's: the channel carries no toasts
		const error = listen("error");
		const info = listen("info");
		pc.receive({ type: "error", message: "Bad frame", title: "Oops" });
		pc.receive({ type: "info", message: "Hi" });
		expect(error).not.toHaveBeenCalled();
		expect(info).not.toHaveBeenCalled();

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
			{ ...base_props, modality: "audio-video", client: server }
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
	test.each([
		["webcam", { modality: "video", mode: "send-receive" }],
		["microphone", { modality: "audio", mode: "send-receive" }],
		["video player", { modality: "video", mode: "receive" }],
		["audio player", { modality: "audio", mode: "receive" }]
	] as const)(
		"a stopped connection that connects or fails does nothing (%s)",
		async (_, props) => {
			const { getByRole, listen, set_data, server } = await ready_device(props);
			const error = listen("error");
			// Every player dispatches it once it is connected
			const ticked = listen("tick");
			if (props.mode === "receive") {
				await set_data({ value: START_STREAM });
			} else {
				await fireEvent.click(getByRole("button", { name: "start stream" }));
			}
			await admit(set_data);
			await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
			const pc = FakePeerConnection.instances[0];
			await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
			// stop() closes the connection 500 ms later, so it can still connect
			// or fail
			pc.set_state("connected");
			pc.set_state("failed");
			await tick();
			await tick();
			expect(ticked).not.toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
		}
	);

	test.each([
		["webcam", { modality: "video", mode: "send-receive" }],
		["microphone", { modality: "audio", mode: "send-receive" }],
		["video player", { modality: "video", mode: "receive" }],
		["audio player", { modality: "audio", mode: "receive" }]
	] as const)(
		"stopping while the server sets up the stream says nothing (%s)",
		async (_, props) => {
			const server = make_server();
			let answer: (response: Record<string, any>) => void = () => {};
			server.offer.mockImplementationOnce(
				() => new Promise((resolve) => (answer = resolve))
			);
			const { getByRole, listen, set_data } = await ready_device(props, server);
			const error = listen("error");
			if (props.mode === "receive") {
				await set_data({ value: START_STREAM });
			} else {
				await fireEvent.click(getByRole("button", { name: "start stream" }));
			}
			await admit(set_data);
			await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
			await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
			// The server declines a stream stopped during its setup
			answer({ status: "failed", meta: { error: "not_admitted" } });
			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(error).not.toHaveBeenCalled();
		}
	);

	test("an ended receive connection cannot stop its replacement", async () => {
		const { set_data, getByTestId, server } = await ready_device({
			mode: "receive"
		});
		await set_data({ value: START_STREAM });
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
		const first = FakePeerConnection.instances[0];
		first.set_state("connected");
		await set_data({ value: START_STREAM });
		await admit(set_data);
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(2));
		FakePeerConnection.instances[1].set_state("connected");
		await tick();
		first.receive({ type: "end_stream", data: "" });
		await tick();
		await tick();
		expect(getByTestId("webrtc-player")).toBeVisible();
	});

	test("a join that fails ends the wait", async () => {
		const { getByRole, server, set_data } = await ready_device();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		// e.g. a full queue answers the join with 503, before any "waiting"
		await join_fails(set_data);
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toHaveTextContent(
				"audio.record"
			);
		});
		expect(server.offer).not.toHaveBeenCalled();
	});

	test("while waiting, the place in the queue and the wait count down", async () => {
		const { getByRole, set_data } = await ready_device();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		const waiting = {
			...loading_status,
			stream_state: "waiting" as const,
			queue_position: 1,
			queue_size: 3,
			eta: 24.6
		};
		await queue_status(set_data, waiting);
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
		await queue_status(set_data, { ...waiting });
		expect(getByRole("status")).toHaveTextContent("audio.waiting · 2/3 · ~24s");
		// A new estimate (someone ahead left) replaces it, and once that one
		// runs out only the place is shown
		await queue_status(set_data, {
			...waiting,
			queue_position: 0,
			queue_size: 2,
			eta: 0.4
		});
		await waitFor(
			() => {
				expect(getByRole("status")).toHaveTextContent(
					/^audio\.waiting · 1\/2$/
				);
			},
			{ timeout: 2000 }
		);
	});

	test("a receive player shows its place in the queue and can leave it", async () => {
		const { getByRole, listen, set_data } = await ready_device({
			mode: "receive",
			stream_options: {
				...base_props.stream_options,
				button_labels: { waiting: "In line" }
			}
		});
		const close_stream = listen("close_stream");
		await set_data({ value: START_STREAM });
		await queue_status(set_data, {
			...loading_status,
			stream_state: "waiting",
			queue_position: 0,
			queue_size: 2,
			eta: 10
		});
		await waitFor(() =>
			expect(getByRole("status")).toHaveTextContent("In line · 1/2 · ~10s")
		);
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		await waitFor(() => expect(close_stream).toHaveBeenCalled());
		await queue_reports(set_data, "closed");
		expect(FakePeerConnection.instances).toHaveLength(0);
	});

	test("without a stream handler, starting reports an error at once", async () => {
		const { getByRole, listen, server } = await ready_device({
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
		const { getByRole, listen, set_data } = await ready_device();
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		// Stopped before the join went out
		await fireEvent.click(getByRole("button", { name: "cancel waiting" }));
		const close_stream = listen("close_stream");
		// The join still reaches the queue
		await queue_reports(set_data, "waiting");
		await waitFor(() => expect(close_stream).toHaveBeenCalled());
	});

	test("stopping while the RTC configuration loads does not connect", async () => {
		const { getByRole, set_data, server } = await ready_device();
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

	test("a configuration request that fails is reported instead of connecting without it", async () => {
		const { getByRole, listen, set_data, server } = await ready_device();
		// What the client resolves to when the request failed
		server.get_rtc_configuration.mockResolvedValueOnce(undefined as any);
		const error = listen("error");
		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await admit(set_data);
		await waitFor(() => expect(error).toHaveBeenCalled());
		expect(FakePeerConnection.instances).toHaveLength(0);
		expect(server.offer).not.toHaveBeenCalled();
	});

	test("a receive player unmounted while its configuration loads does not connect", async () => {
		const { set_data, unmount, server } = await ready_device({
			mode: "receive"
		});
		let resolve_config: (config: Record<string, any>) => void = () => {};
		server.get_rtc_configuration.mockImplementationOnce(
			() => new Promise((resolve) => (resolve_config = resolve))
		);
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
		const { listen, set_data, server } = await ready_device({
			mode: "receive"
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
		const { listen, set_data, server } = await ready_device({
			mode: "receive"
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
	test("the microphone is opened once the turn comes and only held while recording", async () => {
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

		const { getByRole, listen, set_data, server } = await ready_device({
			mode: "send",
			modality: "audio"
		});
		// Access only asks for permission and lists the devices
		expect(opened).toHaveLength(1);
		expect(live()).toHaveLength(0);

		await fireEvent.click(getByRole("button", { name: "start stream" }));
		await queue_reports(set_data, "waiting");
		// Waiting in line does not hold the microphone
		expect(opened).toHaveLength(1);
		await queue_reports(set_data, "open");
		await waitFor(() => expect(server.offer).toHaveBeenCalledTimes(1));
		const pc = FakePeerConnection.instances[0];
		expect(pc.tracks.map((t) => t.kind)).toEqual(["audio"]);
		pc.set_state("connected");
		await waitFor(() => {
			expect(getByRole("button", { name: "mute microphone" })).toBeVisible();
		});
		expect(opened).toHaveLength(2);
		expect(live()).toHaveLength(1);

		const close_stream = listen("close_stream");
		await fireEvent.click(getByRole("button", { name: "stop stream" }));
		await waitFor(() => {
			expect(getByRole("button", { name: "start stream" })).toBeVisible();
		});
		expect(close_stream).toHaveBeenCalled();
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

		const { getByRole, set_data } = await ready_device({
			modality: "audio-video"
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
		const { getByRole, set_data } = await ready_device({ modality: "audio" });

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
					icon: { url: "https://example.com/icon.png" }
				},
				client: make_server()
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
			// The icon arrives as served file data, like gr.Button's
			expect(
				getByRole("img", { name: "Audio visualization icon" })
			).toHaveAttribute("src", "https://example.com/icon.png");
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

describe("WebRTC remote media", () => {
	test("audio that comes back with the video is not muted", () => {
		const pc = new FakePeerConnection({});
		// The webcam preview, which plays the processed media once it is back
		const node = document.createElement("video");
		node.muted = true;
		attach_remote_media(pc as unknown as RTCPeerConnection, node);
		const stream = fake_stream("video");
		for (const kind of ["video", "audio"]) {
			const event = new Event("track");
			Object.assign(event, { track: { kind }, streams: [stream] });
			pc.dispatchEvent(event);
		}
		expect(node.srcObject).toBe(stream);
		expect(node.muted).toBe(false);
	});
});
