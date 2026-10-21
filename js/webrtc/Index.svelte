<script lang="ts">
	import { untrack } from "svelte";
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
		stream_options: {
			button_labels: {},
			icon: null,
			icon_button_color: null,
			pulse_color: null,
			icon_radius: null
		},
		height: null,
		width: null,
		has_stream: false
	});
	gradio.watch_for_change();

	let server = $derived(gradio.shared.server as unknown as WebRTCServer);
	let options = $derived(gradio.props.stream_options);
	// Labels given with gr.I18n arrive as markers; an empty label falls back
	// to the translated default in the players
	const translate_label = (text: string | undefined): string =>
		text ? gradio.live_i18n(text) : "";
	let button_labels = $derived({
		start: translate_label(options.button_labels.start),
		stop: translate_label(options.button_labels.stop),
		waiting: translate_label(options.button_labels.waiting)
	});
	let icon_button_color = $derived(
		options.icon_button_color ?? "var(--color-accent)"
	);
	let pulse_color = $derived(options.pulse_color ?? "var(--color-accent)");
	let icon_radius = $derived(options.icon_radius ?? 50);
	let icon = $derived(options.icon?.url ?? null);
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
	// The place in the queue and the expected wait from the queue's latest
	// estimate, and when that estimate arrived
	let queue_place = $state<{
		position: string | null;
		eta: number | null;
		received_at: number;
	} | null>(null);
	// Ticks while waiting, so that the expected wait counts down between the
	// queue's estimates
	let now = $state(Date.now());
	$effect(() => {
		if (!queue_place) return;
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});
	// e.g. "2/3 · ~25s", shown next to "Waiting". Once the estimate has run
	// out, only the place is shown.
	let queue_detail = $derived.by(() => {
		if (!queue_place) return null;
		const parts: string[] = [];
		if (queue_place.position) parts.push(queue_place.position);
		if (queue_place.eta != null) {
			const left = Math.round(
				queue_place.eta - (now - queue_place.received_at) / 1000
			);
			if (left > 0) parts.push(`~${left}s`);
		}
		return parts.length ? parts.join(" · ") : null;
	});
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
		// A join that fails (a full queue, a lost connection) reports an error
		// before any "waiting", so the stream's event is not known yet
		if (
			pending_turn &&
			!pending_turn.saw_waiting &&
			status?.status === "error"
		) {
			settle_turn(false);
			return;
		}
		if (state === "waiting") stream_fn_index = status.fn_index;
		if (status?.fn_index !== stream_fn_index) return;
		queue_state = state;
		update_place(state === "waiting" ? status : null);
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

	function update_place(
		status: {
			queue_position?: number | null;
			queue_size?: number;
			eta?: number | null;
		} | null
	): void {
		if (!status) {
			queue_place = null;
			return;
		}
		const position =
			status.queue_position != null && status.queue_size != null
				? `${status.queue_position + 1}/${status.queue_size}`
				: null;
		const eta = status.eta != null && status.eta > 0 ? status.eta : null;
		// The same status can be delivered again; only a new estimate (each
		// one is computed afresh, so its eta differs) restarts the countdown
		const current = untrack(() => queue_place);
		if (current?.position === position && current?.eta === eta) return;
		queue_place = { position, eta, received_at: Date.now() };
		now = Date.now();
	}

	function handle_message(msg: ControlMessage): void {
		const text = typeof msg.data === "string" ? msg.data : (msg.message ?? "");
		switch (msg.type) {
			case "error":
			case "warning":
			case "info":
			case "success":
				// Shown like the toasts of a queued event. "success" itself is
				// not a toast event (a component may have a "success" event)
				gradio.dispatch(msg.type === "success" ? "info" : msg.type, {
					type: msg.type,
					message: text,
					title: msg.title ?? undefined,
					duration: msg.duration,
					visible: msg.visible
				});
				break;
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
			i18n={gradio.i18n}
			value={gradio.props.value}
			onvalue={(v) => (gradio.props.value = v)}
			{server}
			{turn}
			{queue_state}
			{queue_detail}
			waiting_label={button_labels.waiting}
			onmessage={handle_message}
			onreject={handle_reject}
			onerror={(detail) => gradio.dispatch("error", detail)}
			ontick={() => gradio.dispatch("tick")}
		/>
	{:else if gradio.props.mode === "receive"}
		<AudioPlayer
			i18n={gradio.i18n}
			value={gradio.props.value}
			onvalue={(v) => (gradio.props.value = v)}
			{server}
			{turn}
			{queue_state}
			{queue_detail}
			waiting_label={button_labels.waiting}
			{icon}
			{icon_button_color}
			{pulse_color}
			{icon_radius}
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
			{button_labels}
			{icon}
			{icon_button_color}
			{pulse_color}
			{icon_radius}
			i18n={gradio.i18n}
			{server}
			{turn}
			{queue_state}
			{queue_detail}
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
			{button_labels}
			{icon}
			{icon_button_color}
			{pulse_color}
			{icon_radius}
			i18n={gradio.i18n}
			{server}
			{turn}
			{queue_state}
			{queue_detail}
			onmessage={handle_message}
			onreject={handle_reject}
			onerror={(detail) => gradio.dispatch("error", detail)}
			ontick={() => gradio.dispatch("tick")}
			onstart_recording={() => gradio.dispatch("start_recording")}
			onstop_recording={() => gradio.dispatch("stop_recording")}
		/>
	{/if}
</Block>
