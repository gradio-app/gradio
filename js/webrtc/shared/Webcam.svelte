<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import {
		Circle,
		Square,
		DropdownArrow,
		Spinner,
		Microphone as Mic
	} from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { StreamingBar } from "@gradio/statustracker";
	import { fade } from "svelte/transition";
	import Permissions from "./Permissions.svelte";
	import PulsingIcon from "./PulsingIcon.svelte";
	import { start, stop, new_webrtc_id } from "./webrtc";
	import { StreamAttempts } from "./attempts.svelte";
	import {
		get_devices,
		current_device,
		with_device,
		click_outside
	} from "./devices";
	import type {
		ControlMessage,
		QueueTurn,
		StreamState,
		WebRTCServer
	} from "../types";

	let {
		value = null,
		onvalue,
		mode,
		include_audio = false,
		track_constraints = {},
		mirror_webcam = "auto",
		rtp_params = {},
		time_limit = null,
		button_labels = { start: "", stop: "", waiting: "" },
		icon = null,
		icon_button_color = "var(--color-accent)",
		pulse_color = "var(--color-accent)",
		icon_radius = 50,
		i18n,
		server,
		turn,
		queue_state = null,
		queue_detail = null,
		onmessage,
		onreject,
		onerror,
		ontick,
		onstart_recording,
		onstop_recording
	}: {
		value?: string | null;
		onvalue?: (value: string | null) => void;
		mode: "send" | "send-receive";
		include_audio?: boolean;
		track_constraints?: Record<string, any>;
		mirror_webcam?: boolean | "auto";
		rtp_params?: Record<string, any>;
		time_limit?: number | null;
		button_labels?: { start: string; stop: string; waiting: string };
		icon?: string | null;
		icon_button_color?: string;
		pulse_color?: string;
		icon_radius?: number;
		i18n: I18nFormatter;
		server: WebRTCServer;
		turn: QueueTurn;
		queue_state?: StreamState | null;
		queue_detail?: string | null;
		onmessage?: (msg: ControlMessage) => void;
		onreject?: (response: Record<string, any>) => void;
		onerror?: (error: string) => void;
		ontick?: () => void;
		onstart_recording?: () => void;
		onstop_recording?: () => void;
	} = $props();

	let video_source = $state<HTMLVideoElement>();
	let stream: MediaStream | null = null;
	let pc: RTCPeerConnection | null = null;
	let stream_state = $state<StreamState>("closed");
	let webcam_accessed = $state(false);
	let devices = $state<MediaDeviceInfo[]>([]);
	let selected_device = $state<MediaDeviceInfo | null>(null);
	let options_open = $state(false);
	let facing_mode = $state<string | undefined>(undefined);
	let active_time_limit = $state<number | null>(null);
	// The time limit the server reported in its answer, if any
	let negotiated_time_limit: number | null = null;
	const attempts = new StreamAttempts(() => turn);

	// The server ended the stream's queue event, for example at the time limit
	$effect(() => {
		if (attempts.admitted && queue_state !== "open") {
			untrack(() => close_stream());
		}
	});

	const mirrored = $derived(
		mirror_webcam === "auto" ? facing_mode !== "environment" : mirror_webcam
	);
	// The local preview is mirrored; the processed stream coming back is not.
	const show_mirrored = $derived(
		mirrored && (stream_state !== "open" || mode === "send")
	);
	// For "video" the constraints apply to the video track; for "audio-video"
	// they are split into {video, audio}.
	const video_constraints = $derived(
		include_audio ? (track_constraints.video ?? {}) : track_constraints
	);
	const audio_constraints = $derived(
		include_audio ? (track_constraints.audio ?? true) : false
	);

	// Read through a function: the connection handlers change stream_state
	// while toggle_stream() is awaiting, which TypeScript cannot see.
	function is_open(): boolean {
		return stream_state === "open";
	}

	function set_stream(local_stream: MediaStream): void {
		stream = local_stream;
		facing_mode = local_stream.getVideoTracks()[0]?.getSettings().facingMode;
		if (video_source) {
			video_source.srcObject = local_stream;
			video_source.muted = true;
			video_source.play().catch(() => {});
		}
	}

	async function access_webcam(device_id?: string | null): Promise<void> {
		if (!navigator.mediaDevices?.getUserMedia) {
			onerror?.(i18n("image.no_webcam_support"));
			return;
		}
		try {
			const local_stream = await navigator.mediaDevices.getUserMedia({
				video: with_device(video_constraints, device_id),
				audio: audio_constraints
			});
			set_stream(local_stream);
			webcam_accessed = true;
			devices = await get_devices("videoinput");
			selected_device = current_device(local_stream, devices);
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				onerror?.(i18n("image.allow_webcam_access"));
				return;
			}
			throw err;
		}
	}

	async function handle_device_change(event: Event): Promise<void> {
		const device_id = (event.target as HTMLSelectElement).value;
		stream?.getTracks().forEach((track) => track.stop());
		await access_webcam(device_id);
		options_open = false;
	}

	function handle_message(msg: ControlMessage): void {
		if (msg.type === "end_stream") {
			close_stream();
		}
		onmessage?.(msg);
	}

	async function close_stream(): Promise<void> {
		attempts.end();
		const connection = pc;
		pc = null;
		stop(connection);
		if (stream_state !== "closed") {
			onstop_recording?.();
		}
		stream_state = "closed";
		active_time_limit = null;
		// stop() ends the local tracks too, so reopen the camera for the
		// preview. Without a connection (stopped while waiting in line, or it
		// never connected) the preview is still running.
		if (connection) await access_webcam(selected_device?.deviceId);
	}

	async function toggle_stream(): Promise<void> {
		if (stream_state !== "closed") {
			await close_stream();
			return;
		}
		if (!stream) return;
		const token = attempts.begin();
		onstart_recording?.();
		stream_state = "waiting";
		const webrtc_id = new_webrtc_id();
		onvalue?.(webrtc_id);

		// Wait in line; stopping meanwhile leaves the queue and closes the stream
		const turn_result = await attempts.request_turn(token);
		if (turn_result === "superseded") return;
		if (turn_result === "refused") {
			await close_stream();
			return;
		}

		let rtc_configuration: Record<string, any> = {};
		try {
			rtc_configuration = (await server.get_rtc_configuration()) ?? {};
		} catch (e) {
			rtc_configuration = { error: String(e) };
		}
		// Stopped (or unmounted) while the configuration was loading
		if (!attempts.is_current(token)) return;
		if (rtc_configuration.error) {
			onerror?.(rtc_configuration.error);
			await close_stream();
			return;
		}

		const connection = new RTCPeerConnection(rtc_configuration);
		pc = connection;
		connection.addEventListener("connectionstatechange", () => {
			switch (connection.connectionState) {
				case "connected":
					stream_state = "open";
					active_time_limit = negotiated_time_limit ?? time_limit;
					ontick?.();
					break;
				case "disconnected":
				case "closed":
					if (pc === connection) close_stream();
					break;
				case "failed":
					onerror?.("Connection failed!");
					if (pc === connection) close_stream();
					break;
			}
		});

		const timeout = setTimeout(
			() => onmessage?.({ type: "connection_timeout" }),
			10000
		);
		negotiated_time_limit = null;
		try {
			const response = await start({
				stream,
				pc: connection,
				node: mode === "send" ? null : (video_source ?? null),
				offer: server.offer,
				webrtc_id,
				modality: "video",
				rtp_params,
				on_message: handle_message,
				on_reject: (response) => onreject?.(response)
			});
			negotiated_time_limit = response.time_limit ?? null;
			if (is_open()) {
				active_time_limit = negotiated_time_limit ?? time_limit;
			}
		} catch (e) {
			console.debug("WebRTC offer failed", e);
			if (pc === connection) await close_stream();
		} finally {
			clearTimeout(timeout);
		}
	}

	onDestroy(() => {
		attempts.destroy();
		stop(pc);
		stream?.getTracks().forEach((track) => track.stop());
	});
</script>

<div class="wrap">
	<StreamingBar time_limit={active_time_limit} />
	{#if stream_state === "open" && include_audio}
		<div class="audio-indicator">
			<PulsingIcon
				stream_state="open"
				audio_source={() => stream}
				icon={icon || Mic}
				{pulse_color}
				{icon_radius}
			/>
		</div>
	{/if}
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={video_source}
		data-testid="webrtc-video"
		autoplay
		playsinline
		class:flip={show_mirrored}
		class:hide={!webcam_accessed}
	></video>
	{#if !webcam_accessed}
		<div
			in:fade={{ delay: 100, duration: 200 }}
			title="grant webcam access"
			style="height: 100%"
		>
			<Permissions kind="webcam" onclick={() => access_webcam()} />
		</div>
	{:else}
		<div class="button-wrap">
			<button
				class="stream-button"
				onclick={toggle_stream}
				aria-label={stream_state === "open" ? "stop stream" : "start stream"}
			>
				{#if stream_state === "waiting"}
					<div class="icon-with-text">
						<div class="icon color-primary" title="spinner">
							<Spinner />
						</div>
						{button_labels.waiting || i18n("audio.waiting")}{queue_detail
							? ` · ${queue_detail}`
							: ""}
					</div>
				{:else if stream_state === "open"}
					<div class="icon-with-text">
						<div class="icon color-primary" title="stop stream">
							<Square />
						</div>
						{button_labels.stop || i18n("audio.stop")}
					</div>
				{:else}
					<div class="icon-with-text">
						<div class="icon color-primary" title="start stream">
							<Circle />
						</div>
						{button_labels.start || i18n("audio.record")}
					</div>
				{/if}
			</button>
			{#if stream_state === "closed" && devices.length > 1}
				<button
					class="device-select-button"
					onclick={() => (options_open = true)}
					aria-label="select input source"
					aria-haspopup="listbox"
					aria-expanded={options_open}
				>
					<span class="device-select-icon"><DropdownArrow /></span>
				</button>
			{/if}
			{#if options_open && selected_device}
				<select
					class="select-wrap"
					aria-label="select source"
					use:click_outside={() => (options_open = false)}
					onchange={handle_device_change}
				>
					{#each devices as device}
						<option
							value={device.deviceId}
							selected={selected_device.deviceId === device.deviceId}
						>
							{device.label}
						</option>
					{/each}
				</select>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
	}

	.hide {
		display: none;
	}

	video {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}

	.flip {
		transform: scaleX(-1);
	}

	.audio-indicator {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		z-index: var(--layer-2);
		height: var(--size-5);
		width: var(--size-5);
	}

	.button-wrap {
		position: absolute;
		background-color: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-xl);
		padding: var(--size-1);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		bottom: var(--size-2);
		left: 50%;
		transform: translate(-50%, 0);
		box-shadow: var(--shadow-drop-lg);
		line-height: var(--size-3);
		color: var(--button-secondary-text-color);
	}

	.button-wrap button {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.stream-button {
		min-height: var(--size-10);
		padding: 0 var(--size-2);
	}

	.device-select-button {
		min-width: var(--size-10);
		width: var(--size-10);
		height: var(--size-10);
		padding: 0;
		border-radius: var(--radius-full);
	}

	.device-select-icon {
		display: flex;
		width: var(--size-4);
		height: var(--size-4);
		align-items: center;
		justify-content: center;
	}

	.icon-with-text {
		min-width: var(--size-16);
		align-items: center;
		margin: 0 var(--spacing-xl);
		display: flex;
		justify-content: space-evenly;
		gap: var(--size-2);
	}

	.icon {
		width: 18px;
		height: 18px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.color-primary {
		fill: var(--primary-600);
		stroke: var(--primary-600);
		color: var(--primary-600);
	}

	.select-wrap {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		color: var(--button-secondary-text-color);
		background-color: transparent;
		width: min(var(--size-52), 100%);
		font-size: var(--text-md);
		position: absolute;
		bottom: calc(100% + var(--size-1-5));
		background-color: var(--block-background-fill);
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-xl);
		z-index: var(--layer-top);
		border: 1px solid var(--border-color-primary);
		text-align: left;
		line-height: var(--size-4);
		white-space: nowrap;
		text-overflow: ellipsis;
		right: 0;
	}

	.select-wrap > option {
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid var(--border-color-accent);
		padding-right: var(--size-8);
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.select-wrap > option:hover {
		background-color: var(--color-accent);
	}

	.select-wrap > option:last-child {
		border: none;
	}

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}
</style>
