<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";

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
	import AudioPlayer from "../player/AudioPlayer.svelte";
	import { _ } from "svelte-i18n";

	import type { IBlobEvent, IMediaRecorder } from "extendable-media-recorder";
	import type { I18nFormatter } from "js/app/src/gradio_helper";
	import AudioRecorder from "../recorder/AudioRecorder.svelte";

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

	// waveform settings
	export let waveformColor = "#9ca3af";
	export let waveformProgressColor = "#f97316";

	// TODO: make use of this
	// export let type: "normal" | "numpy" = "normal";

	let recording = false;
	let mode = "";
	let header: Uint8Array | undefined = undefined;
	let pending_stream: Uint8Array[] = [];
	let submit_pending_stream_on_pending_end = false;
	// let inited = false;
	// let crop_values: [number, number] = [0, 100];
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
		pause_recording: never; // TODO: add to docs
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
		const detail = { ...value, is_file: false };
		dispatch(event, detail);
	};

	// TODO: implement streaming

	// async function prepare_audio(): Promise<void> {
	// 	let stream: MediaStream | null;

	// 	if (stream == null) return;

	// 	if (streaming) {
	// 		const [{ MediaRecorder, register }, { connect }] = await Promise.all(
	// 			module_promises
	// 		);

	// 		await register(await connect());

	// 		recorder = new MediaRecorder(stream, { mimeType: "audio/wav" });

	// 		recorder.addEventListener("dataavailable", handle_chunk);
	// 	} else {
	// 		recorder = new MediaRecorder(stream);

	// 		recorder.addEventListener("dataavailable", (event) => {
	// 			audio_chunks.push(event.data);
	// 		});

	// recorder.addEventListener("stop", async () => {
	// 	recording = false;
	// 	await dispatch_blob(audio_chunks, "change");
	// 	await dispatch_blob(audio_chunks, "stop_recording");
	// 	audio_chunks = [];
	// });
	// }

	// 	inited = true;
	// }

	// async function handle_chunk(event: IBlobEvent): Promise<void> {
	// 	let buffer = await event.data.arrayBuffer();
	// 	let payload = new Uint8Array(buffer);
	// 	if (!header) {
	// 		header = new Uint8Array(buffer.slice(0, NUM_HEADER_BYTES));
	// 		payload = new Uint8Array(buffer.slice(NUM_HEADER_BYTES));
	// 	}
	// 	if (pending) {
	// 		pending_stream.push(payload);
	// 	} else {
	// 		let blobParts = [header].concat(pending_stream, [payload]);
	// 		dispatch_blob(blobParts, "stream");
	// 		pending_stream = [];
	// 	}
	// }

	// $: if (submit_pending_stream_on_pending_end && pending === false) {
	// 	submit_pending_stream_on_pending_end = false;
	// 	if (header && pending_stream) {
	// 		let blobParts: Uint8Array[] = [header].concat(pending_stream);
	// 		pending_stream = [];
	// 		dispatch_blob(blobParts, "stream");
	// 	}
	// }

	// async function record(): Promise<void> {
	// 	recording = true;
	// 	dispatch("start_recording");
	// 	if (!inited) await prepare_audio();
	// 	header = undefined;
	// 	if (streaming) {
	// 		recorder.start(STREAM_TIMESLICE);
	// 	} else {
	// 		recorder.start();
	// 	}
	// }

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
		<AudioRecorder
			{label}
			{i18n}
			{dispatch}
			{waveformColor}
			{waveformProgressColor}
		/>
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

	<AudioPlayer
		{value}
		{label}
		{autoplay}
		{i18n}
		{dispatch}
		{waveformColor}
		{waveformProgressColor}
		interactive
	/>
{/if}
