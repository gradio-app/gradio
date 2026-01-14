<script lang="ts">
	import { onDestroy, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import { prepare_files, type FileData, type Client } from "@gradio/client";
	import { BlockLabel, ShareButton, CustomButton } from "@gradio/atoms";
	import { Music } from "@gradio/icons";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { StreamingBar } from "@gradio/statustracker";
	import AudioPlayer from "../player/AudioPlayer.svelte";

	import type { IBlobEvent, IMediaRecorder } from "extendable-media-recorder";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import AudioRecorder from "../recorder/AudioRecorder.svelte";
	import StreamAudio from "../streaming/StreamAudio.svelte";
	import { init_media_recorder } from "../streaming/media_recorder";
	import type { IMediaRecorderConstructor } from "extendable-media-recorder";
	import { SelectSource } from "@gradio/atoms";
	import type { WaveformOptions, SubtitleData } from "../shared/types";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	let {
		value = $bindable(null),
		subtitles = null,
		label,
		root,
		loop,
		show_label = true,
		buttons = ["download", "share"],
		on_custom_button_click = null,
		sources = ["microphone", "upload"],
		pending = false,
		streaming = false,
		i18n,
		waveform_settings,
		trim_region_settings = {},
		waveform_options = {},
		dragging = $bindable(false),
		active_source = $bindable<"microphone" | "upload">("microphone"),
		handle_reset_value = () => {},
		editable = true,
		max_file_size = null,
		upload,
		stream_handler,
		stream_every = 0.1,
		uploading = $bindable(false),
		recording = $bindable(false),
		class_name = "",
		upload_promise = $bindable(),
		initial_value = $bindable(),
		playback_position = $bindable(0),
		time_limit = null,
		stream_state = "closed",
		onchange,
		onstream,
		onedit,
		onplay,
		onpause,
		onstop,
		ondrag,
		onerror,
		onupload,
		onclear,
		onstart_recording,
		onpause_recording,
		onstop_recording,
		onclose_stream
	}: {
		value?: null | FileData;
		subtitles?: null | FileData | SubtitleData[];
		label: string;
		root: string;
		loop?: boolean;
		show_label?: boolean;
		buttons?: (string | CustomButtonType)[];
		on_custom_button_click?: ((id: number) => void) | null;
		sources?:
			| ["microphone"]
			| ["upload"]
			| ["microphone", "upload"]
			| ["upload", "microphone"];
		pending?: boolean;
		streaming?: boolean;
		i18n: I18nFormatter;
		waveform_settings: Record<string, any>;
		trim_region_settings?: Record<string, any>;
		waveform_options?: WaveformOptions;
		dragging?: boolean;
		active_source?: "microphone" | "upload";
		handle_reset_value?: () => void;
		editable?: boolean;
		max_file_size?: number | null;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		stream_every?: number;
		uploading?: boolean;
		recording?: boolean;
		class_name?: string;
		upload_promise?: Promise<any> | null;
		initial_value?: FileData | null;
		playback_position?: number;
		time_limit?: number | null;
		stream_state?: "open" | "waiting" | "closed";
		onchange?: (value: FileData | null) => void;
		onstream?: (value: FileData) => void;
		onedit?: () => void;
		onplay?: () => void;
		onpause?: () => void;
		onstop?: () => void;
		ondrag?: (dragging: boolean) => void;
		onerror?: (error: string) => void;
		onupload?: (value: FileData) => void;
		onclear?: () => void;
		onstart_recording?: () => void;
		onpause_recording?: () => void;
		onstop_recording?: () => void;
		onclose_stream?: () => void;
	} = $props();

	$effect(() => {
		ondrag?.(dragging);
	});

	// TODO: make use of this
	// export let type: "normal" | "numpy" = "normal";
	let recorder: IMediaRecorder;
	let mode = $state("");
	let header: Uint8Array | undefined = undefined;
	let pending_stream: Uint8Array[] = [];
	let submit_pending_stream_on_pending_end = false;
	let inited = false;
	let streaming_media_recorder: IMediaRecorderConstructor;

	const NUM_HEADER_BYTES = 44;
	let audio_chunks: Blob[] = [];
	const is_browser = typeof window !== "undefined";
	if (is_browser && streaming) {
		init_media_recorder().then((a) => {
			streaming_media_recorder = a;
		});
	}

	const to_blob_parts = (parts: Uint8Array[] | Blob[]): BlobPart[] =>
		parts.map((part) => {
			if (part instanceof Blob) return part;
			return part.slice();
		});

	const dispatch_blob = async (
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	): Promise<void> => {
		let _audio_blob = new File(to_blob_parts(blobs), "audio.wav", {
			type: "audio/wav"
		});
		if (_audio_blob.size === 0) {
			return;
		}
		const val = await prepare_files([_audio_blob], event === "stream");
		initial_value = value;
		value = (
			(await upload(val, root, undefined, max_file_size || undefined))?.filter(
				Boolean
			) as FileData[]
		)[0];
		if (event === "stream") {
			onstream?.(value);
		} else if (event === "change") {
			onchange?.(value);
		} else if (event === "stop_recording") {
			onstop_recording?.();
		}
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
				onerror?.(i18n("audio.no_device_support"));
				return;
			}
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				onerror?.(i18n("audio.allow_recording_access"));
				return;
			}
			throw err;
		}
		if (stream == null) return;
		if (streaming) {
			recorder = new streaming_media_recorder(stream, {
				mimeType: "audio/wav"
			});

			recorder.addEventListener("dataavailable", handle_chunk);
		} else {
			recorder = new MediaRecorder(stream);
			recorder.addEventListener("dataavailable", (event) => {
				audio_chunks.push(event.data);
			});
		}
		recorder.addEventListener("stop", async () => {
			recording = false;
			recorder.stop();
			await dispatch_blob(audio_chunks, "change");
			await dispatch_blob(audio_chunks, "stop_recording");
			audio_chunks = [];
		});
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
			if (!recording || stream_state === "waiting") return;
			dispatch_blob(blobParts, "stream");
			pending_stream = [];
		}
	}

	$effect(() => {
		if (submit_pending_stream_on_pending_end && pending === false) {
			submit_pending_stream_on_pending_end = false;
			if (header && pending_stream) {
				let blobParts: Uint8Array[] = [header].concat(pending_stream);
				pending_stream = [];
				dispatch_blob(blobParts, "stream");
			}
		}
	});

	async function record(): Promise<void> {
		recording = true;
		onstart_recording?.();
		if (!inited) await prepare_audio();

		header = undefined;
		if (streaming && recorder.state != "recording") {
			recorder.start(stream_every * 1000);
		}
	}

	function clear(): void {
		onchange?.(null);
		onclear?.();
		mode = "";
		value = null;
	}

	function handle_load(detail: FileData): void {
		value = detail;
		onchange?.(detail);
		onupload?.(detail);
	}

	async function stop(): Promise<void> {
		recording = false;

		if (streaming) {
			onclose_stream?.();
			onstop_recording?.();
			recorder.stop();

			if (pending) {
				submit_pending_stream_on_pending_end = true;
			}
			dispatch_blob(audio_chunks, "stop_recording");
			onclear?.();
			mode = "";
		}
	}

	$effect(() => {
		if (!recording && recorder) stop();
	});

	$effect(() => {
		if (recording && recorder) record();
	});
</script>

<BlockLabel
	{show_label}
	Icon={Music}
	float={active_source === "upload" && value === null}
	label={label || i18n("audio.audio")}
/>
<div
	class="audio-container {class_name}"
	data-testid={label ? "waveform-" + label : "unlabelled-audio"}
>
	<StreamingBar {time_limit} />
	{#if value == null || streaming}
		{#if active_source === "microphone"}
			<ModifyUpload {i18n} onclear={clear} />
			{#if streaming}
				<StreamAudio
					{record}
					{recording}
					{stop}
					{i18n}
					{waveform_settings}
					{waveform_options}
					waiting={stream_state === "waiting"}
				/>
			{:else}
				<AudioRecorder
					bind:mode
					{i18n}
					{editable}
					{recording}
					{dispatch_blob}
					{waveform_settings}
					{waveform_options}
					{handle_reset_value}
					onstartrecording={() => onstart_recording?.()}
					onpauserecording={() => onpause_recording?.()}
					onstoprecording={() => onstop_recording?.()}
				/>
			{/if}
		{:else if active_source === "upload"}
			<!-- explicitly listed out audio mimetypes due to iOS bug not recognizing audio/* -->
			<Upload
				bind:upload_promise
				filetype="audio/aac,audio/midi,audio/mpeg,audio/ogg,audio/wav,audio/x-wav,audio/opus,audio/webm,audio/flac,audio/vnd.rn-realaudio,audio/x-ms-wma,audio/x-aiff,audio/amr,audio/*"
				onload={handle_load}
				bind:dragging
				bind:uploading
				onerror={(detail: string) => onerror?.(detail)}
				{root}
				{max_file_size}
				{upload}
				{stream_handler}
				aria_label={i18n("audio.drop_to_upload")}
			>
				<slot />
			</Upload>
		{/if}
	{:else}
		<ModifyUpload
			{i18n}
			onclear={clear}
			onedit={() => {
				mode = "edit";
				onedit?.();
			}}
			download={buttons === null
				? value.url
				: buttons.some((btn) => typeof btn === "string" && btn === "download")
					? value.url
					: null}
		>
			{#if value !== null && buttons}
				{#each buttons as btn}
					{#if typeof btn === "string"}
						{#if btn === "share"}
							<ShareButton
								{i18n}
								onerror={onerror}
								onshare={() => {}}
								formatter={async (fileData: FileData) => {
									if (!fileData || !fileData.url) return "";
									let url = await uploadToHuggingFace(fileData.url, "url");
									return `<audio controls src="${url}"></audio>`;
								}}
								{value}
							/>
						{/if}
					{:else}
						<CustomButton
							button={btn}
							on_click={(id: number) => {
								if (on_custom_button_click) {
									on_custom_button_click(id);
								}
							}}
						/>
					{/if}
				{/each}
			{/if}
		</ModifyUpload>

		<AudioPlayer
			bind:mode
			{value}
			subtitles={Array.isArray(subtitles) ? subtitles : subtitles?.url}
			{label}
			{i18n}
			{dispatch_blob}
			{waveform_settings}
			{waveform_options}
			{trim_region_settings}
			{handle_reset_value}
			{editable}
			{loop}
			bind:playback_position
			interactive
			onstop={onstop}
			onplay={onplay}
			onpause={onpause}
			onedit={onedit}
		/>
	{/if}
	<SelectSource {sources} bind:active_source handle_clear={clear} />
</div>

<style>
	.audio-container {
		height: calc(var(--size-full) - var(--size-6));
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
</style>
