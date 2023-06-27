<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	import { Button } from "@gradio/button";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { onDestroy, createEventDispatcher, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	// @ts-ignore
	import Range from "svelte-range-slider-pips";

	import type { IBlobEvent, IMediaRecorder } from "extendable-media-recorder";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let show_label: boolean = true;
	export let name: string = "";
	export let source: "microphone" | "upload" | "none";
	export let pending: boolean = false;
	export let streaming: boolean = false;
	export let autoplay: boolean;

	// TODO: make use of this
	// export let type: "normal" | "numpy" = "normal";

	let recording = false;
	let recorder: IMediaRecorder;
	let mode = "";
	let header: Uint8Array | undefined = undefined;
	let pending_stream: Array<Uint8Array> = [];
	let submit_pending_stream_on_pending_end: boolean = false;
	let player: HTMLAudioElement;
	let inited = false;
	let crop_values = [0, 100];
	const STREAM_TIMESLICE = 500;
	const NUM_HEADER_BYTES = 44;
	let audio_chunks: Array<Blob> = [];
	let audio_blob;
	let module_promises:
		| [
				Promise<typeof import("extendable-media-recorder")>,
				Promise<typeof import("extendable-media-recorder-wav-encoder")>
		  ];

	function get_modules() {
		module_promises = [
			import("extendable-media-recorder"),
			import("extendable-media-recorder-wav-encoder")
		];
	}

	if (streaming) {
		get_modules();
	}

	const dispatch = createEventDispatcher<{
		change: AudioData;
		stream: AudioData;
		edit: AudioData;
		play: undefined;
		pause: undefined;
		stop: undefined;
		end: undefined;
		drag: boolean;
		error: string;
		upload: FileData;
		clear: undefined;
		start_recording: undefined;
		stop_recording: undefined;
	}>();

	function blob_to_data_url(blob: Blob): Promise<string> {
		return new Promise((fulfill, reject) => {
			let reader = new FileReader();
			reader.onerror = reject;
			reader.onload = () => fulfill(reader.result as string);
			reader.readAsDataURL(blob);
		});
	}

	const dispatch_blob = async (
		blobs: Array<Uint8Array> | Blob[],
		event: "stream" | "change" | "stop_recording"
	) => {
		let audio_blob = new Blob(blobs, { type: "audio/wav" });
		value = {
			data: await blob_to_data_url(audio_blob),
			name: "audio.wav"
		};
		dispatch(event, value);
	};

	async function prepare_audio() {
		let stream: MediaStream | null;

		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch(
					"error",
					"Please allow access to the microphone for recording."
				);
				return;
			} else {
				throw err;
			}
		}

		if (stream == null) return;

		if (streaming) {
			const [{ MediaRecorder, register }, { connect }] = await Promise.all(
				module_promises
			);

			await register(await connect());

			recorder = new MediaRecorder(stream, { mimeType: "audio/wav" });

			async function handle_chunk(event: IBlobEvent) {
				let buffer = await event.data.arrayBuffer();
				let payload = new Uint8Array(buffer);
				if (!header) {
					header = new Uint8Array(buffer.slice(0, NUM_HEADER_BYTES));
					payload = new Uint8Array(buffer.slice(NUM_HEADER_BYTES));
				}
				if (pending) {
					pending_stream.push(payload);
				} else {
					let blobParts = [header].concat(pending_stream, [payload]);
					dispatch_blob(blobParts, "stream");
					pending_stream = [];
				}
			}
			recorder.addEventListener("dataavailable", handle_chunk);
		} else {
			recorder = new MediaRecorder(stream);

			recorder.addEventListener("dataavailable", (event) => {
				audio_chunks.push(event.data);
			});

			recorder.addEventListener("stop", async () => {
				recording = false;
				await dispatch_blob(audio_chunks, "change");
				await dispatch_blob(audio_chunks, "stop_recording");
				audio_chunks = [];
			});
		}

		inited = true;
	}

	$: if (submit_pending_stream_on_pending_end && pending === false) {
		submit_pending_stream_on_pending_end = false;
		if (header && pending_stream) {
			let blobParts: Array<Uint8Array> = [header].concat(pending_stream);
			pending_stream = [];
			dispatch_blob(blobParts, "stream");
		}
	}

	async function record() {
		recording = true;
		dispatch("start_recording");
		if (!inited) await prepare_audio();
		header = undefined;
		if (streaming) {
			recorder.start(STREAM_TIMESLICE);
		} else {
			recorder.start();
		}
	}

	onDestroy(() => {
		if (recorder && recorder.state !== "inactive") {
			recorder.stop();
		}
	});

	const stop = async () => {
		recorder.stop();
		if (streaming) {
			recording = false;
			if (pending) {
				submit_pending_stream_on_pending_end = true;
			}
		}
	};

	function clear() {
		dispatch("change");
		dispatch("clear");
		mode = "";
		value = null;
	}

	function loaded(node: HTMLAudioElement) {
		function clamp_playback() {
			const start_time = (crop_values[0] / 100) * node.duration;
			const end_time = (crop_values[1] / 100) * node.duration;
			if (node.currentTime < start_time) {
				node.currentTime = start_time;
			}

			if (node.currentTime > end_time) {
				node.currentTime = start_time;
				node.pause();
			}
		}

		node.addEventListener("timeupdate", clamp_playback);

		return {
			destroy: () => node.removeEventListener("timeupdate", clamp_playback)
		};
	}

	function handle_change({
		detail: { values }
	}: {
		detail: { values: [number, number] };
	}) {
		if (!value) return;

		dispatch("change", {
			data: value.data,
			name,
			crop_min: values[0],
			crop_max: values[1]
		});

		dispatch("edit");
	}

	function handle_load({
		detail
	}: {
		detail: {
			data: string;
			name: string;
			size: number;
			is_example: boolean;
		};
	}) {
		value = detail;
		dispatch("change", { data: detail.data, name: detail.name });
		dispatch("upload", detail);
	}

	function handle_ended() {
		dispatch("stop");
		dispatch("end");
	}

	let old_val: any;
	function value_has_changed(val: any) {
		if (val === old_val) return false;
		else {
			old_val = val;
			return true;
		}
	}

	export let dragging = false;
	$: dispatch("drag", dragging);
	$: autoplay && player && value_has_changed(value?.data) && player.play();
</script>

<BlockLabel
	{show_label}
	Icon={Music}
	float={source === "upload" && value === null}
	label={label || "Audio"}
/>
{#if value === null || streaming}
	{#if source === "microphone"}
		<div class="mic-wrap">
			{#if recording}
				<Button size="sm" on:click={stop}>
					<span class="record-icon">
						<span class="pinger" />
						<span class="dot" />
					</span>
					Stop recording
				</Button>
			{:else}
				<Button size="sm" on:click={record}>
					<span class="record-icon">
						<span class="dot" />
					</span>
					Record from microphone
				</Button>
			{/if}
		</div>
	{:else if source === "upload"}
		<!-- explicitly listed out audio mimetypes due to iOS bug not recognizing audio/* -->
		<Upload
			filetype="audio/aac,audio/midi,audio/mpeg,audio/ogg,audio/wav,audio/x-wav,audio/opus,audio/webm,audio/flac,audio/vnd.rn-realaudio,audio/x-ms-wma,audio/x-aiff,audio/amr,audio/*"
			on:load={handle_load}
			bind:dragging
		>
			<slot />
		</Upload>
	{/if}
{:else}
	<ModifyUpload
		on:clear={clear}
		on:edit={() => (mode = "edit")}
		editable
		absolute={true}
	/>

	<audio
		use:loaded
		controls
		bind:this={player}
		preload="metadata"
		src={value.data}
		on:play
		on:pause
		on:ended={handle_ended}
		data-testid={`${label}-dynamic-audio`}
	/>

	{#if mode === "edit" && player?.duration}
		<Range
			bind:values={crop_values}
			range
			min={0}
			max={100}
			step={1}
			on:change={handle_change}
		/>
	{/if}
{/if}

<style>
	.mic-wrap {
		padding: var(--size-2);
	}

	.record-icon {
		display: flex;
		position: relative;
		margin-right: var(--size-2);
		width: 6px;
		height: 6px;
	}

	.dot {
		display: inline-flex;
		position: relative;
		border-radius: var(--radius-full);
		background: var(--color-red-500);
		width: 6px;
		height: 6px;
	}

	.pinger {
		display: inline-flex;
		position: absolute;
		opacity: 0.9;
		animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
		border-radius: var(--radius-full);
		background: var(--color-red-500);
		width: var(--size-full);
		height: var(--size-full);
	}

	@keyframes ping {
		75%,
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	audio {
		padding: var(--size-2);
		width: var(--size-full);
		height: var(--size-14);
	}
</style>
