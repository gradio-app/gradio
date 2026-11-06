<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import { Empty } from "@gradio/atoms";
	import { Clear, Music } from "@gradio/icons";
	import AudioWave from "./AudioWave.svelte";
	import {
		start,
		stop,
		new_webrtc_id,
		close_on_pagehide,
		on_connection_state,
		get_rtc_configuration
	} from "./webrtc";
	import { StreamAttempts } from "./attempts.svelte";
	import {
		START_STREAM,
		type ControlMessage,
		type QueueTurn,
		type StreamState,
		type WebRTCServer
	} from "../types";

	let {
		i18n,
		value = null,
		onvalue,
		server,
		turn,
		queue_state = null,
		queue_detail = null,
		waiting_label = "",
		icon = null,
		icon_button_color = "var(--color-accent)",
		pulse_color = "var(--color-accent)",
		icon_radius = 50,
		onmessage,
		onreject,
		onerror,
		ontick
	}: {
		i18n: I18nFormatter;
		value?: string | null;
		onvalue?: (value: string | null) => void;
		server: WebRTCServer;
		turn: QueueTurn;
		queue_state?: StreamState | null;
		queue_detail?: string | null;
		waiting_label?: string;
		icon?: string | null;
		icon_button_color?: string;
		pulse_color?: string;
		icon_radius?: number;
		onmessage?: (msg: ControlMessage) => void;
		onreject?: (response: Record<string, any>) => void;
		onerror?: (error: string) => void;
		ontick?: () => void;
	} = $props();

	let audio_player = $state<HTMLAudioElement>();
	let pc: RTCPeerConnection | null = null;
	let stream_state = $state<StreamState>("closed");
	const attempts = new StreamAttempts(() => turn);

	$effect(() => {
		if (value === START_STREAM) {
			untrack(() => start_stream());
		}
	});

	// The server ended the stream's queue event, for example at the time limit
	$effect(() => {
		if (attempts.admitted && queue_state !== "open") {
			untrack(() => close_stream());
		}
	});

	function close_stream(): void {
		attempts.end();
		const connection = pc;
		pc = null;
		stop(connection);
		stream_state = "closed";
	}

	function handle_message(msg: ControlMessage): void {
		if (msg.type === "end_stream") {
			close_stream();
		}
		onmessage?.(msg);
	}

	async function start_stream(): Promise<void> {
		if (stream_state !== "closed") close_stream();
		const token = attempts.begin();
		const webrtc_id = new_webrtc_id();
		onvalue?.(webrtc_id);
		stream_state = "waiting";

		const turn_result = await attempts.request_turn(token);
		if (turn_result === "superseded") return;
		if (turn_result === "refused") {
			close_stream();
			return;
		}

		const rtc_configuration = await get_rtc_configuration(server, webrtc_id);
		if (!attempts.is_current(token)) return;
		if (rtc_configuration.error) {
			onerror?.(rtc_configuration.error);
			close_stream();
			return;
		}

		const connection = new RTCPeerConnection(rtc_configuration);
		pc = connection;
		on_connection_state(connection, {
			connected: () => {
				if (pc !== connection) return;
				stream_state = "open";
				ontick?.();
			},
			ended: () => {
				if (pc === connection) close_stream();
			},
			failed: () => {
				onerror?.("Connection failed!");
				if (pc === connection) close_stream();
			},
			slow: () => onmessage?.({ type: "connection_timeout" })
		});

		try {
			await start({
				stream: null,
				pc: connection,
				node: audio_player ?? null,
				offer: server.offer,
				webrtc_id,
				modality: "audio",
				// A stopped or replaced connection closes only 500 ms later
				on_message: (msg) => {
					if (pc === connection) handle_message(msg);
				},
				on_reject: (response) => onreject?.(response)
			});
		} catch (e) {
			console.debug("WebRTC offer failed", e);
			if (pc === connection) close_stream();
		}
	}

	$effect(() => close_on_pagehide(() => pc, close_stream));

	onDestroy(() => {
		attempts.destroy();
		stop(pc);
	});
</script>

<audio class="hidden" bind:this={audio_player}></audio>
{#if stream_state === "closed"}
	<Empty size="small"><Music /></Empty>
{:else if stream_state === "waiting"}
	<div class="waiting">
		<span role="status">
			{waiting_label || i18n("audio.waiting")}{queue_detail
				? ` · ${queue_detail}`
				: ""}
		</span>
		<button
			class="cancel-waiting"
			onclick={close_stream}
			aria-label="cancel waiting"
		>
			<span class="cancel-icon"><Clear /></span>
			{i18n("chatbot.cancel")}
		</button>
	</div>
{:else}
	<div class="audio-container">
		<AudioWave
			audio_source={() =>
				(audio_player?.srcObject as MediaStream | null) ?? null}
			{stream_state}
			{icon}
			{icon_button_color}
			{pulse_color}
			{icon_radius}
		/>
	</div>
{/if}

<style>
	.audio-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.hidden {
		display: none;
	}

	.waiting {
		display: flex;
		height: 100%;
		flex-direction: column;
		gap: var(--size-2);
		justify-content: center;
		align-items: center;
		color: var(--body-text-color);
		font-size: var(--text-md);
	}

	.cancel-waiting {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		padding: var(--size-1) var(--size-3);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		font-size: var(--text-sm);
	}

	.cancel-waiting:hover {
		background: var(--button-secondary-background-fill-hover);
	}

	.cancel-icon {
		display: flex;
		width: var(--size-4);
		height: var(--size-4);
	}
</style>
