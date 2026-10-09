<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Music, Video } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type {
		ControlMessage,
		QueueTurn,
		StreamState,
		WebRTCEvents,
		WebRTCProps,
		WebRTCServer
	} from "./types";
	import { rejection_message } from "./shared/webrtc";
	import Webcam from "./shared/Webcam.svelte";
	import Microphone from "./shared/Microphone.svelte";
	import VideoPlayer from "./shared/VideoPlayer.svelte";
	import AudioPlayer from "./shared/AudioPlayer.svelte";

	const props = $props();
	const gradio = new Gradio<WebRTCEvents, WebRTCProps>(props, {
		value: null,
		mode: "send-receive",
		modality: "video",
		rtp_params: {},
		track_constraints: {},
		mirror_webcam: "auto",
		time_limit: null,
		icon: null,
		icon_button_color: null,
		pulse_color: null,
		icon_radius: null,
		button_labels: { start: "", stop: "", waiting: "" },
		height: null,
		width: null,
		has_stream: false
	});
	gradio.watch_for_change();

	let server = $derived(gradio.shared.server as unknown as WebRTCServer);
	let is_send = $derived(
		gradio.props.mode === "send" || gradio.props.mode === "send-receive"
	);
	let is_video = $derived(gradio.props.modality !== "audio");
	let label = $derived(
		gradio.shared.label || (is_video ? "Video" : gradio.i18n("audio.audio"))
	);

	// The state of the stream's queue event: "waiting" in line, "open" once its
	// turn has come, "closed" when it has ended
	let queue_state = $state<StreamState | null>(null);
	// The loading status also reports the events that only take this
	// component as an input, such as the one that pushes the input values, and
	// those report a "closed" stream_state when they complete. Only the status
	// of the stream's own event counts, the only one that reports "waiting".
	let stream_fn_index: number | null = null;
	// Whether the page wants a stream: from the request until it ends
	let wants_stream = false;

	let pending_turn: {
		resolve: (admitted: boolean) => void;
		saw_waiting: boolean;
	} | null = null;

	function settle_turn(admitted: boolean): void {
		pending_turn?.resolve(admitted);
		pending_turn = null;
	}

	// The value must already hold the stream's id: the queue event gets it
	// as its first input.
	const turn: QueueTurn = {
		request: () =>
			new Promise((resolve) => {
				settle_turn(false);
				if (!gradio.props.has_stream) {
					gradio.dispatch(
						"error",
						rejection_message({ meta: { error: "no_stream_handler" } })
					);
					resolve(false);
					return;
				}
				wants_stream = true;
				pending_turn = { resolve, saw_waiting: false };
				gradio.dispatch("stream");
			}),
		end: () => {
			wants_stream = false;
			settle_turn(false);
			gradio.dispatch("close_stream");
		}
	};

	$effect(() => {
		const status = gradio.shared.loading_status;
		const state = status?.stream_state ?? null;
		if (state === "waiting") stream_fn_index = status.fn_index;
		if (status?.fn_index !== stream_fn_index) return;
		queue_state = state;
		if (!wants_stream && (state === "waiting" || state === "open")) {
			// A stream event the page no longer wants, e.g. one whose join was
			// still on its way when the user pressed stop: end it before it
			// takes a turn nobody uses
			gradio.dispatch("close_stream");
			return;
		}
		if (!pending_turn) return;
		// Until the new event reports "waiting", the state can still be the one
		// a previous stream left behind
		if (state === "waiting") {
			pending_turn.saw_waiting = true;
		} else if (pending_turn.saw_waiting) {
			settle_turn(state === "open");
		}
	});

	function handle_message(msg: ControlMessage): void {
		const text = typeof msg.data === "string" ? msg.data : (msg.message ?? "");
		switch (msg.type) {
			case "error":
				gradio.dispatch("error", text);
				break;
			case "warning":
			case "end_stream":
				gradio.dispatch("warning", text);
				break;
			case "send_input":
				gradio.dispatch("tick");
				break;
			case "connection_timeout":
				gradio.dispatch(
					"warning",
					"Taking a while to connect. Are you on a VPN?"
				);
				break;
		}
	}

	function handle_reject(response: Record<string, any>): void {
		gradio.dispatch("error", rejection_message(response));
	}
</script>

<Block
	visible={gradio.shared.visible}
	variant="solid"
	border_mode="base"
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	height={gradio.props.height ?? undefined}
	width={gradio.props.width ?? undefined}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	<BlockLabel
		show_label={gradio.shared.show_label}
		Icon={is_video ? Video : Music}
		float={false}
		{label}
	/>

	{#if gradio.props.mode === "receive" && is_video}
		<VideoPlayer
			value={gradio.props.value}
			onvalue={(v) => (gradio.props.value = v)}
			{server}
			{turn}
			{queue_state}
			onmessage={handle_message}
			onreject={handle_reject}
			onerror={(detail) => gradio.dispatch("error", detail)}
			ontick={() => gradio.dispatch("tick")}
		/>
	{:else if gradio.props.mode === "receive"}
		<AudioPlayer
			value={gradio.props.value}
			onvalue={(v) => (gradio.props.value = v)}
			{server}
			{turn}
			{queue_state}
			icon={gradio.props.icon}
			icon_button_color={gradio.props.icon_button_color ??
				"var(--color-accent)"}
			pulse_color={gradio.props.pulse_color ?? "var(--color-accent)"}
			icon_radius={gradio.props.icon_radius ?? 50}
			onmessage={handle_message}
			onreject={handle_reject}
			onerror={(detail) => gradio.dispatch("error", detail)}
			ontick={() => gradio.dispatch("tick")}
		/>
	{:else if is_send && is_video}
		<Webcam
			value={gradio.props.value}
			onvalue={(v) => (gradio.props.value = v)}
			mode={gradio.props.mode}
			include_audio={gradio.props.modality === "audio-video"}
			track_constraints={gradio.props.track_constraints}
			mirror_webcam={gradio.props.mirror_webcam}
			rtp_params={gradio.props.rtp_params}
			time_limit={gradio.props.time_limit}
			button_labels={gradio.props.button_labels}
			icon={gradio.props.icon}
			icon_button_color={gradio.props.icon_button_color ??
				"var(--color-accent)"}
			pulse_color={gradio.props.pulse_color ?? "var(--color-accent)"}
			icon_radius={gradio.props.icon_radius ?? 50}
			i18n={gradio.i18n}
			{server}
			{turn}
			{queue_state}
			onmessage={handle_message}
			onreject={handle_reject}
			onerror={(detail) => gradio.dispatch("error", detail)}
			ontick={() => gradio.dispatch("tick")}
			onstart_recording={() => gradio.dispatch("start_recording")}
			onstop_recording={() => gradio.dispatch("stop_recording")}
		/>
	{:else}
		<Microphone
			value={gradio.props.value}
			onvalue={(v) => (gradio.props.value = v)}
			mode={gradio.props.mode}
			track_constraints={gradio.props.track_constraints}
			rtp_params={gradio.props.rtp_params}
			time_limit={gradio.props.time_limit}
			button_labels={gradio.props.button_labels}
			icon={gradio.props.icon}
			icon_button_color={gradio.props.icon_button_color ??
				"var(--color-accent)"}
			pulse_color={gradio.props.pulse_color ?? "var(--color-accent)"}
			icon_radius={gradio.props.icon_radius ?? 50}
			i18n={gradio.i18n}
			{server}
			{turn}
			{queue_state}
			onmessage={handle_message}
			onreject={handle_reject}
			onerror={(detail) => gradio.dispatch("error", detail)}
			ontick={() => gradio.dispatch("tick")}
			onstart_recording={() => gradio.dispatch("start_recording")}
			onstop_recording={() => gradio.dispatch("stop_recording")}
		/>
	{/if}
</Block>
