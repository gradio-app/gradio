<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import { Empty } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	import AudioWave from "./AudioWave.svelte";
	import { start, stop, new_webrtc_id, close_on_pagehide } from "./webrtc";
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

		let rtc_configuration: Record<string, any> = {};
		try {
			rtc_configuration = (await server.get_rtc_configuration()) ?? {};
		} catch (e) {
			rtc_configuration = { error: String(e) };
		}
		if (!attempts.is_current(token)) return;
		if (rtc_configuration.error) {
			onerror?.(rtc_configuration.error);
			close_stream();
			return;
		}

		const connection = new RTCPeerConnection(rtc_configuration);
		pc = connection;
		connection.addEventListener("connectionstatechange", () => {
			switch (connection.connectionState) {
				case "connected":
					stream_state = "open";
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
		try {
			await start({
				stream: null,
				pc: connection,
				node: audio_player ?? null,
				offer: server.offer,
				webrtc_id,
				modality: "audio",
				on_message: handle_message,
				on_reject: (response) => onreject?.(response)
			});
		} catch (e) {
			console.debug("WebRTC offer failed", e);
			if (pc === connection) close_stream();
		} finally {
			clearTimeout(timeout);
		}
	}

	$effect(() => close_on_pagehide(() => pc));

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
		{i18n("audio.waiting")}{queue_detail ? ` · ${queue_detail}` : ""}
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
		justify-content: center;
		align-items: center;
		color: var(--body-text-color);
		font-size: var(--text-md);
	}
</style>
