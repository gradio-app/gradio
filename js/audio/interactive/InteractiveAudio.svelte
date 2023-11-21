<script lang="ts">
	import { onDestroy, createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import { upload, prepare_files, type FileData } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	import AudioPlayer from "../player/AudioPlayer.svelte";

	import type { IBlobEvent, IMediaRecorder } from "extendable-media-recorder";
	import type { I18nFormatter } from "js/app/src/gradio_helper";
	import AudioRecorder from "../recorder/AudioRecorder.svelte";
	import StreamAudio from "../streaming/StreamAudio.svelte";
	import { SelectSource } from "@gradio/atoms";
	import type { WaveformOptions } from "../shared/types";

	export let value: null | FileData = null;
	export let label: string;
	export let root: string;
	export let show_label = true;
	export let sources:
		| ["microphone"]
		| ["upload"]
		| ["microphone", "upload"]
		| ["upload", "microphone"] = ["microphone", "upload"];
	export let pending = false;
	export let streaming = false;
	export let i18n: I18nFormatter;
	export let waveform_settings: Record<string, any>;
	export let trim_region_settings = {};
	export let waveform_options: WaveformOptions = {};
	export let dragging: boolean;
	export let active_source: "microphone" | "upload";
	export let handle_reset_value: () => void = () => {};

	$: dispatch("drag", dragging);

	// TODO: make use of this
	// export let type: "normal" | "numpy" = "normal";
	let recording = false;
	let recorder: IMediaRecorder;
	let mode = "";
	let header: Uint8Array | undefined = undefined;
	let pending_stream: Uint8Array[] = [];
	let submit_pending_stream_on_pending_end = false;
	let inited = false;

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
			import("extendable-media-recorder-wav-encoder")
		];
	}

	if (streaming) {
		get_modules();
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		stream: FileData;
		edit: never;
		play: never;
		pause: never;
		stop: never;
		end: never;
		drag: boolean;
		error: string;
		upload: FileData;
		clear: undefined;
		start_recording: undefined;
		pause_recording: undefined;
		stop_recording: undefined;
	}>();

	const dispatch_blob = async (
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	): Promise<void> => {
		let _audio_blob = new File(blobs, "audio.wav");
		const val = await prepare_files([_audio_blob], event === "stream");
		value = ((await upload(val, root))?.filter(Boolean) as FileData[])[0];

		dispatch(event, value);
	};

	onDestroy(() => {
		if (streaming && recorder && recorder.state !== "inactive") {
			recorder.stop();
		}
	});

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
		recording = true;
		dispatch("start_recording");
		if (!inited) await prepare_audio();
		header = undefined;
		if (streaming) {
			recorder.start(STREAM_TIMESLICE);
		}
	}

	function clear(): void {
		dispatch("change", null);
		dispatch("clear");
		mode = "";
		value = null;
	}

	function handle_load({ detail }: { detail: FileData }): void {
		value = detail;
		dispatch("change", detail);
		dispatch("upload", detail);
	}

	function stop(): void {
		recording = false;

		if (streaming) {
			dispatch("stop_recording");
			recorder.stop();
			if (pending) {
				submit_pending_stream_on_pending_end = true;
			}
			dispatch_blob(audio_chunks, "stop_recording");
			dispatch("clear");
			mode = "";
		}
	}
</script>

<BlockLabel
	{show_label}
	Icon={Music}
	float={active_source === "upload" && value === null}
	label={label || i18n("audio.audio")}
/>
{#if value === null || streaming}
	{#if active_source === "microphone"}
		<ModifyUpload {i18n} on:clear={clear} absolute={true} />
		{#if streaming}
			<StreamAudio {record} {recording} {stop} {i18n} {waveform_settings} />
		{:else}
			<AudioRecorder
				bind:mode
				{i18n}
				{dispatch_blob}
				{waveform_settings}
				{waveform_options}
				{handle_reset_value}
			/>
		{/if}
	{:else if active_source === "upload"}
		<!-- explicitly listed out audio mimetypes due to iOS bug not recognizing audio/* -->
		<Upload
			filetype="audio/aac,audio/midi,audio/mpeg,audio/ogg,audio/wav,audio/x-wav,audio/opus,audio/webm,audio/flac,audio/vnd.rn-realaudio,audio/x-ms-wma,audio/x-aiff,audio/amr,audio/*"
			on:load={handle_load}
			bind:dragging
			on:error={({ detail }) => dispatch("error", detail)}
			{root}
			include_sources={sources.length > 1}
		>
			<slot />
		</Upload>
	{/if}
{:else}
	<ModifyUpload
		{i18n}
		on:clear={clear}
		on:edit={() => (mode = "edit")}
		absolute={true}
	/>

	<AudioPlayer
		bind:mode
		{value}
		{label}
		{i18n}
		{dispatch_blob}
		{waveform_settings}
		{waveform_options}
		{trim_region_settings}
		{handle_reset_value}
		interactive
		on:stop
		on:play
		on:pause
		on:edit
	/>
{/if}

<SelectSource {sources} bind:active_source handle_clear={clear} />
