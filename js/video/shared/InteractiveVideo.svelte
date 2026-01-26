<script lang="ts">
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { Webcam } from "@gradio/image";
	import { Video } from "@gradio/icons";
	import type { WebcamOptions } from "./utils";
	import { prettyBytes, playable } from "./utils";
	import Player from "./Player.svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import { SelectSource } from "@gradio/atoms";
	import type { Snippet } from "svelte";

	interface Props {
		value?: FileData | null;
		subtitle?: FileData | null;
		sources?:
			| ["webcam"]
			| ["upload"]
			| ["webcam", "upload"]
			| ["upload", "webcam"];
		label?: string;
		show_download_button?: boolean;
		show_label?: boolean;
		webcam_options: WebcamOptions;
		include_audio: boolean;
		autoplay: boolean;
		root: string;
		i18n: I18nFormatter;
		active_source?: "webcam" | "upload";
		handle_reset_value?: () => void;
		max_file_size?: number | null;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		loop: boolean;
		uploading?: boolean;
		upload_promise?: Promise<any> | null;
		playback_position?: number;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		onchange?: (value: FileData | null) => void;
		onclear?: () => void;
		onplay?: () => void;
		onpause?: () => void;
		onend?: () => void;
		ondrag?: (dragging: boolean) => void;
		onerror?: (error: string) => void;
		onupload?: (value: FileData) => void;
		onstart_recording?: () => void;
		onstop_recording?: () => void;
		onstop?: () => void;
		children?: Snippet;
	}

	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	let {
		value = $bindable(null),
		subtitle = null,
		sources = ["webcam", "upload"],
		label = undefined,
		show_download_button = false,
		show_label = true,
		webcam_options,
		include_audio,
		autoplay,
		root,
		i18n,
		active_source: initial_active_source = "webcam",
		handle_reset_value = () => {},
		max_file_size = null,
		upload,
		stream_handler,
		loop,
		uploading = $bindable(),
		upload_promise = $bindable(),
		playback_position = $bindable(),
		buttons = null,
		on_custom_button_click = null,
		onchange,
		onclear,
		onplay,
		onpause,
		onend,
		ondrag,
		onerror,
		onupload,
		onstart_recording,
		onstop_recording,
		onstop,
		children
	}: Props = $props();

	let has_change_history = $state(false);
	let active_source = $state<"webcam" | "upload">(initial_active_source ?? "webcam");

	$effect(() => {
		if (initial_active_source) {
			active_source = initial_active_source;
		}
	});

	function handle_load(detail: FileData | null): void {
		value = detail;
		onchange?.(detail);
		if (detail) {
			onupload?.(detail);
		}
	}

	function handle_clear(): void {
		value = null;
		onchange?.(null);
		onclear?.();
	}

	function handle_change(video: FileData): void {
		has_change_history = true;
		onchange?.(video);
	}

	function handle_capture({
		detail
	}: CustomEvent<FileData | any | null>): void {
		onchange?.(detail);
	}

	let dragging = $state(false);

	$effect(() => {
		ondrag?.(dragging);
	});
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
<div data-testid="video" class="video-container">
	{#if value === null || value?.url === undefined}
		<div class="upload-container">
			{#if active_source === "upload"}
				<Upload
					bind:upload_promise
					bind:dragging
					bind:uploading
					filetype="video/x-m4v,video/*"
					onload={handle_load}
					{max_file_size}
					onerror={(detail) => onerror?.(detail)}
					{root}
					{upload}
					{stream_handler}
					aria_label={i18n("video.drop_to_upload")}
				>
					{#if children}
						{@render children()}
					{/if}
				</Upload>
			{:else if active_source === "webcam"}
				<Webcam
					{root}
					mirror_webcam={webcam_options.mirror}
					webcam_constraints={webcam_options.constraints}
					{include_audio}
					mode="video"
					on:error={({ detail }) => onerror?.(detail)}
					on:capture={handle_capture}
					on:start_recording={() => onstart_recording?.()}
					on:stop_recording={() => onstop_recording?.()}
					{i18n}
					{upload}
					stream_every={1}
				/>
			{/if}
		</div>
	{:else if value?.url}
		{#key value?.url}
			<Player
				{upload}
				{root}
				interactive
				{autoplay}
				src={value.url}
				subtitle={subtitle?.url}
				is_stream={false}
				onplay={() => onplay?.()}
				onpause={() => onpause?.()}
				onstop={() => onstop?.()}
				onend={() => onend?.()}
				onerror={(error) => onerror?.(error)}
				mirror={webcam_options.mirror && active_source === "webcam"}
				{label}
				handle_change={handle_change}
				{handle_reset_value}
				{loop}
				{value}
				{i18n}
				{show_download_button}
				handle_clear={handle_clear}
				{has_change_history}
				bind:playback_position
			/>
		{/key}
	{:else if value.size}
		<div class="file-name">{value.orig_name || value.url}</div>
		<div class="file-size">
			{prettyBytes(value.size)}
		</div>
	{/if}

	<SelectSource {sources} bind:active_source handle_clear={handle_clear} />
</div>

<style>
	.file-name {
		padding: var(--size-6);
		font-size: var(--text-xxl);
		word-break: break-all;
	}

	.file-size {
		padding: var(--size-2);
		font-size: var(--text-xl);
	}

	.upload-container {
		height: 100%;
		width: 100%;
	}

	.video-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
