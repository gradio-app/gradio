<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BaseButton } from "@gradio/button/static";

	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { onDestroy, createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	// @ts-ignore
	import Range from "svelte-range-slider-pips";
	import { loaded } from "../shared/utils";

	import type { IBlobEvent, IMediaRecorder } from "extendable-media-recorder";
	import type { I18nFormatter } from "js/app/src/gradio_helper";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let root: string;
	export let show_label = true;
	export let name = "";
	export let source: "microphone" | "upload" | "none";
	export let pending = false;
	export let streaming = false;
	export let autoplay = false;
	export let show_edit_button = true;
	export let i18n: I18nFormatter;

	// TODO: make use of this
	// export let type: "normal" | "numpy" = "normal";

	let recording = false;
	let recorder: IMediaRecorder;
	let mode = "";
	let header: Uint8Array | undefined = undefined;
	let pending_stream: Uint8Array[] = [];
	let submit_pending_stream_on_pending_end = false;
	let player: HTMLAudioElement;
	let inited = false;
	let crop_values: [number, number] = [0, 100];
	const STREAM_TIMESLICE = 500;
	const NUM_HEADER_BYTES = 44;
	let audio_chunks: Blob[] = [];
	let module_promises: [
		Promise<typeof import("extendable-media-recorder")>,
		Promise<typeof import("extendable-media-recorder-wav-encoder")>
	];

	function get_modules(): void {
		module_promises = [
			import("extendable-media-recorder"),
			import("extendable-media-recorder-wav-encoder"),
		];
	}

	if (streaming) {
		get_modules();
	}

	const dispatch = createEventDispatcher<{
		change: AudioData | null;
		stream: AudioData;
		edit: never;
		play: never;
		pause: never;
		stop: never;
		end: never;
		drag: boolean;
		error: string;
		upload: FileData;
		clear: never;
		start_recording: never;
		stop_recording: never;
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
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	): Promise<void> => {
		let _audio_blob = new Blob(blobs, { type: "audio/wav" });
		value = {
			data: await blob_to_data_url(_audio_blob),
			name: "audio.wav",
		};
		const detail = {...value, is_file: false}
		dispatch(event, detail);
	};

	async function prepare_audio(): Promise<void> {
		let stream: MediaStream | null;

		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch (err) {
			if (!navigator.mediaDevices) {
				dispatch("error", i18n("audio.no_device_support"));
				return;
			}
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch("error", i18n("audio.allow_recording_access"));
				return;
			}
			throw err;
		}

		if (stream == null) return;

		if (streaming) {
			const [{ MediaRecorder, register }, { connect }] = await Promise.all(
				module_promises
			);

			await register(await connect());

			recorder = new MediaRecorder(stream, { mimeType: "audio/wav" });

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

	async function handle_chunk(event: IBlobEvent): Promise<void> {
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

	$: if (submit_pending_stream_on_pending_end && pending === false) {
		submit_pending_stream_on_pending_end = false;
		if (header && pending_stream) {
			let blobParts: Uint8Array[] = [header].concat(pending_stream);
			pending_stream = [];
			dispatch_blob(blobParts, "stream");
		}
	}

	async function record(): Promise<void> {
		if (!navigator.mediaDevices) {
			dispatch("error", i18n("audio.no_device_support"));
			return;
		}
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

	function stop(): void {
		recorder.stop();
		if (streaming) {
			recording = false;
			dispatch("stop_recording");
			if (pending) {
				submit_pending_stream_on_pending_end = true;
			}
		}
	}

	function clear(): void {
		dispatch("change", null);
		dispatch("clear");
		mode = "";
		value = null;
	}

	function handle_change({
		detail: { values },
	}: {
		detail: { values: [number, number] };
	}): void {
		if (!value) return;

		dispatch("change", {
			data: value.data,
			name,
			crop_min: values[0],
			crop_max: values[1],
		});

		dispatch("edit");
	}

	function handle_load({
		detail,
	}: {
		detail: {
			data: string;
			name: string;
			size: number;
			is_example: boolean;
		};
	}): void {
		value = detail;
		dispatch("change", detail);
		dispatch("upload", detail);
	}

	function handle_ended(): void {
		dispatch("stop");
		dispatch("end");
	}

	export let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel
	{show_label}
	Icon={Music}
	float={source === "upload" && value === null}
	label={label || i18n("audio.audio")}
/>
{#if value === null || streaming}
	{#if source === "microphone"}
		<div class="mic-wrap">
			{#if recording}
				<BaseButton size="sm" on:click={stop}>
					<span class="record-icon">
						<span class="pinger" />
						<span class="dot" />
					</span>
					{i18n("audio.stop_recording")}
				</BaseButton>
			{:else}
				<BaseButton size="sm" on:click={record}>
					<span class="record-icon">
						<span class="dot" />
					</span>
					{i18n("audio.record_from_microphone")}
				</BaseButton>
			{/if}
		</div>
	{:else if source === "upload"}
		<!-- explicitly listed out audio mimetypes due to iOS bug not recognizing audio/* -->
		<Upload
			filetype="audio/aac,audio/midi,audio/mpeg,audio/ogg,audio/wav,audio/x-wav,audio/opus,audio/webm,audio/flac,audio/vnd.rn-realaudio,audio/x-ms-wma,audio/x-aiff,audio/amr,audio/*"
			on:load={handle_load}
			bind:dragging
			{root}
		>
			<slot />
		</Upload>
	{/if}
{:else}
	<ModifyUpload
		{i18n}
		on:clear={clear}
		on:edit={() => (mode = "edit")}
		editable={show_edit_button}
		absolute={true}
	/>

	<audio
		use:loaded={{ autoplay, crop_values }}
		controls
		bind:this={player}
		preload="metadata"
		src={value?.data}
		on:play
		on:pause
		on:ended={handle_ended}
		data-testid={`${label}-audio`}
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
