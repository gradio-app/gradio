<script lang="ts">
	import { onDestroy, untrack } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import { Empty } from "@gradio/atoms";
	import { Video } from "@gradio/icons";
	import {
		start,
		stop,
		new_webrtc_id,
		close_on_pagehide,
		on_connection_state
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
		onmessage?: (msg: ControlMessage) => void;
		onreject?: (response: Record<string, any>) => void;
		onerror?: (error: string) => void;
		ontick?: () => void;
	} = $props();

	let video_element = $state<HTMLVideoElement>();
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
		on_connection_state(connection, {
			connected: () => {
				stream_state = "open";
				ontick?.();
			},
			ended: () => {
				if (pc === connection) close_stream();
			},
			failed: () => {
				onerror?.("Connection failed!");
				if (pc === connection) close_stream();
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

	$effect(() => close_on_pagehide(() => pc, close_stream));

	onDestroy(() => {
		attempts.destroy();
		stop(pc);
	});
</script>

<div class="wrap">
	{#if stream_state === "closed"}
		<Empty unpadded_box={true} size="large"><Video /></Empty>
	{:else if stream_state === "waiting"}
		<div class="waiting">
			{i18n("audio.waiting")}{queue_detail ? ` · ${queue_detail}` : ""}
		</div>
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

	.waiting {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-md);
		background: var(--background-fill-primary);
		color: var(--body-text-color);
		font-size: var(--text-md);
	}

	video {
		height: var(--size-full);
		width: var(--size-full);
	}
</style>
