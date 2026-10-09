<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import {
		Circle,
		Spinner,
		DropdownArrow,
		VolumeMuted,
		VolumeHigh,
		Microphone as Mic
	} from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { StreamingBar } from "@gradio/statustracker";
	import { fade } from "svelte/transition";
	import Permissions from "./Permissions.svelte";
	import AudioWave from "./AudioWave.svelte";
	import PulsingIcon from "./PulsingIcon.svelte";
	import { start, stop, new_webrtc_id } from "./webrtc";
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
		track_constraints = {},
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
		track_constraints?: Record<string, any>;
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
		onmessage?: (msg: ControlMessage) => void;
		onreject?: (response: Record<string, any>) => void;
		onerror?: (error: string) => void;
		ontick?: () => void;
		onstart_recording?: () => void;
		onstop_recording?: () => void;
	} = $props();

	let audio_player = $state<HTMLAudioElement>();
	let stream: MediaStream | null = null;
	let pc: RTCPeerConnection | null = null;
	let stream_state = $state<StreamState>("closed");
	let mic_accessed = $state(false);
	let devices = $state<MediaDeviceInfo[]>([]);
	let selected_device = $state<MediaDeviceInfo | null>(null);
	let options_open = $state(false);
	let is_muted = $state(false);
	let is_mic_muted = $state(false);
	let pending = $state(false);
	let active_time_limit = $state<number | null>(null);
	// The time limit the server reported in its answer, if any
	let negotiated_time_limit: number | null = null;
	// Bumped whenever a recording is started or stopped, so an attempt that
	// is still awaiting can tell it has been superseded
	let attempt = 0;
	let destroyed = false;
	// Whether the stream's turn in the queue has come
	let admitted = $state(false);

	// The server ended the stream's queue event, for example at the time limit
	$effect(() => {
		if (admitted && queue_state !== "open") untrack(() => close_stream());
	});

	// What the visualizer listens to: the reply in send-receive, the mic in send
	const output_audio_source = (): MediaStream | null =>
		mode === "send"
			? stream
			: ((audio_player?.srcObject as MediaStream | null) ?? null);
	const input_audio_source = (): MediaStream | null => stream;

	// Read through a function: the connection handlers change stream_state
	// while toggle_stream() is awaiting, which TypeScript cannot see.
	function is_open(): boolean {
		return stream_state === "open";
	}

	function stop_tracks(media: MediaStream | null): void {
		media?.getTracks().forEach((track) => track.stop());
	}

	function release_mic(): void {
		stop_tracks(stream);
		stream = null;
	}

	// The microphone is only held while a recording is running. Opening it
	// takes far less time than negotiating the connection that follows.
	async function open_mic(
		device_id?: string | null
	): Promise<MediaStream | null> {
		if (!navigator.mediaDevices?.getUserMedia) {
			onerror?.(i18n("audio.no_device_support"));
			return null;
		}
		try {
			return await navigator.mediaDevices.getUserMedia({
				audio: with_device(track_constraints, device_id)
			});
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				onerror?.(i18n("audio.allow_recording_access"));
			} else {
				console.debug("getUserMedia failed", err);
				onerror?.(i18n("audio.recording_error"));
			}
			return null;
		}
	}

	// Asks for permission and lists the devices, then lets go of the
	// microphone again until a recording starts.
	async function access_mic(): Promise<void> {
		const local_stream = await open_mic(selected_device?.deviceId);
		if (!local_stream) return;
		if (destroyed) {
			stop_tracks(local_stream);
			return;
		}
		devices = await get_devices("audioinput");
		selected_device = current_device(local_stream, devices);
		stop_tracks(local_stream);
		mic_accessed = true;
	}

	function handle_device_change(event: Event): void {
		const device_id = (event.target as HTMLSelectElement).value;
		selected_device =
			devices.find((device) => device.deviceId === device_id) ??
			selected_device;
		options_open = false;
	}

	function handle_message(msg: ControlMessage): void {
		if (msg.type === "log" && msg.data === "pause_detected") {
			pending = true;
		} else if (msg.type === "log" && msg.data === "response_starting") {
			pending = false;
		} else if (msg.type === "end_stream") {
			close_stream();
		}
		onmessage?.(msg);
	}

	async function close_stream(): Promise<void> {
		const connection = pc;
		attempt++;
		pc = null;
		stop(connection);
		release_mic();
		admitted = false;
		if (stream_state !== "closed") {
			turn.end();
			onstop_recording?.();
		}
		stream_state = "closed";
		active_time_limit = null;
		pending = false;
	}

	async function toggle_stream(): Promise<void> {
		if (stream_state !== "closed") {
			await close_stream();
			return;
		}
		if (!mic_accessed) return;
		const this_attempt = ++attempt;
		onstart_recording?.();
		stream_state = "waiting";
		const webrtc_id = new_webrtc_id();
		onvalue?.(webrtc_id);

		// Wait in line before opening the microphone; stopping meanwhile
		// leaves the queue
		const got_turn = await turn.request();
		if (this_attempt !== attempt || destroyed) return;
		if (!got_turn) {
			await close_stream();
			return;
		}
		admitted = true;

		const [local_stream, rtc_configuration] = await Promise.all([
			open_mic(selected_device?.deviceId),
			server
				.get_rtc_configuration()
				.then((config) => config ?? {})
				.catch((e): Record<string, any> => ({ error: String(e) }))
		]);
		// Stopped (or unmounted) while the microphone was being opened
		if (this_attempt !== attempt || destroyed) {
			stop_tracks(local_stream);
			return;
		}
		if (!local_stream || rtc_configuration.error) {
			stop_tracks(local_stream);
			if (rtc_configuration.error) onerror?.(rtc_configuration.error);
			await close_stream();
			return;
		}
		stream = local_stream;
		is_mic_muted = false;

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
				node: mode === "send" ? null : (audio_player ?? null),
				offer: server.offer,
				webrtc_id,
				modality: "audio",
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

	function toggle_mute(): void {
		if (audio_player) {
			audio_player.muted = !audio_player.muted;
			is_muted = audio_player.muted;
		}
	}

	function toggle_mic_mute(): void {
		const track = stream?.getAudioTracks()[0];
		if (track) {
			track.enabled = !track.enabled;
			is_mic_muted = !track.enabled;
		}
	}

	onDestroy(() => {
		if (stream_state !== "closed") turn.end();
		destroyed = true;
		attempt++;
		stop(pc);
		release_mic();
	});
</script>

<div class="audio-container">
	<audio class="hidden" bind:this={audio_player}></audio>
	{#if !mic_accessed}
		<div
			in:fade={{ delay: 100, duration: 200 }}
			title="grant microphone access"
			style="height: 100%; width: 100%"
		>
			<Permissions kind="microphone" onclick={() => access_mic()} />
		</div>
	{:else}
		<AudioWave
			audio_source={output_audio_source}
			{stream_state}
			{icon}
			{icon_button_color}
			{pulse_color}
			{pending}
			{icon_radius}
		/>
		<StreamingBar time_limit={active_time_limit} />
		<div class="button-wrap">
			<button
				onclick={toggle_stream}
				aria-label={stream_state === "open" ? "stop stream" : "start stream"}
			>
				{#if stream_state === "waiting"}
					<div class="icon-with-text">
						<div class="icon color-primary" title="spinner">
							<Spinner />
						</div>
						{button_labels.waiting || i18n("audio.waiting")}
					</div>
				{:else if stream_state === "open"}
					<div class="icon-with-text">
						{#if mode === "send-receive"}
							<div
								class="icon"
								title="stop stream"
								style={`fill: ${icon_button_color}; stroke: ${icon_button_color}; color: ${icon_button_color};`}
							>
								<PulsingIcon
									audio_source={input_audio_source}
									stream_state="open"
									icon={Circle}
									{pulse_color}
								/>
							</div>
						{:else}
							<div class="icon color-primary" title="stop stream">
								<Circle />
							</div>
						{/if}
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
					class="icon-button"
					onclick={() => (options_open = true)}
					aria-label="select input source"
					aria-haspopup="listbox"
					aria-expanded={options_open}
				>
					<span class="icon"><DropdownArrow /></span>
				</button>
			{/if}
			{#if stream_state === "open" && mode === "send-receive"}
				<button
					class="icon-button"
					onclick={toggle_mute}
					aria-label={is_muted ? "unmute audio" : "mute audio"}
				>
					<span
						class="icon"
						style={`fill: ${icon_button_color}; stroke: ${icon_button_color}; color: ${icon_button_color};`}
					>
						{#if is_muted}
							<VolumeMuted />
						{:else}
							<VolumeHigh />
						{/if}
					</span>
				</button>
			{/if}
			{#if stream_state === "open"}
				<button
					class="icon-button"
					class:muted={is_mic_muted}
					onclick={toggle_mic_mute}
					aria-label={is_mic_muted ? "unmute microphone" : "mute microphone"}
				>
					<span
						class="icon"
						style={`fill: ${icon_button_color}; stroke: ${icon_button_color}; color: ${icon_button_color};`}
					>
						<Mic />
					</span>
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
	.audio-container {
		position: relative;
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.hidden {
		display: none;
	}

	.button-wrap {
		position: relative;
		margin-top: var(--size-2);
		margin-bottom: var(--size-2);
		background-color: var(--block-background-fill);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-xl);
		padding: var(--size-1);
		display: flex;
		align-items: center;
		gap: var(--size-2);
		box-shadow: var(--shadow-drop-lg);
		line-height: var(--size-3);
		color: var(--button-secondary-text-color);
	}

	.button-wrap button {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		min-height: var(--size-10);
		padding: 0 var(--size-2);
	}

	.icon-button {
		min-width: var(--size-10);
		width: var(--size-10);
		padding: 0;
		border-radius: var(--radius-full);
	}

	.icon-button.muted {
		opacity: 0.5;
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
		left: 50%;
		transform: translate(-50%, 0);
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
</style>
