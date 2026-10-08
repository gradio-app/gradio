<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import { Empty } from "@gradio/atoms";
	import { Video } from "@gradio/icons";
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
		onmessage,
		onreject,
		onerror,
		ontick
	}: {
		value?: string | null;
		onvalue?: (value: string | null) => void;
		server: WebRTCServer;
		onmessage?: (msg: ControlMessage) => void;
		onreject?: (response: Record<string, any>) => void;
		onerror?: (error: string) => void;
		ontick?: () => void;
	} = $props();

	let video_element = $state<HTMLVideoElement>();
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
				node: video_element ?? null,
				offer: server.offer,
				webrtc_id,
				modality: "video",
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

<div class="wrap">
	{#if stream_state === "closed"}
		<Empty unpadded_box={true} size="large"><Video /></Empty>
	{/if}
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={video_element}
		data-testid="webrtc-player"
		class:hidden={stream_state === "closed"}
		autoplay
		playsinline
	></video>
</div>

<style>
	.wrap {
		position: relative;
		background-color: var(--background-fill-secondary);
		height: var(--size-full);
		width: var(--size-full);
		border-radius: var(--radius-xl);
	}

	.hidden {
		display: none;
	}

	video {
		height: var(--size-full);
		width: var(--size-full);
	}
</style>
