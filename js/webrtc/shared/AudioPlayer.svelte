<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import { Empty } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	import AudioWave from "./AudioWave.svelte";
	import { start, stop, new_webrtc_id } from "./webrtc";
	import {
		START_STREAM,
		type ControlMessage,
		type StreamState,
		type WebRTCServer
	} from "../types";

	let {
		value = null,
		onvalue,
		server,
		icon = null,
		icon_button_color = "var(--color-accent)",
		pulse_color = "var(--color-accent)",
		icon_radius = 50,
		onmessage,
		onreject,
		onerror,
		ontick
	}: {
		value?: string | null;
		onvalue?: (value: string | null) => void;
		server: WebRTCServer;
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

	$effect(() => {
		if (value === START_STREAM) {
			untrack(() => start_stream());
		}
	});

	function close_stream(): void {
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
		if (pc) close_stream();
		const webrtc_id = new_webrtc_id();
		onvalue?.(webrtc_id);
		stream_state = "waiting";

		let rtc_configuration: Record<string, any> = {};
		try {
			rtc_configuration = (await server.get_rtc_configuration()) ?? {};
		} catch (e) {
			rtc_configuration = { error: String(e) };
		}
		if (rtc_configuration.error) {
			onerror?.(rtc_configuration.error);
			stream_state = "closed";
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

	onDestroy(() => stop(pc));
</script>

<audio class="hidden" bind:this={audio_player}></audio>
{#if stream_state === "closed"}
	<Empty size="small"><Music /></Empty>
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
</style>
