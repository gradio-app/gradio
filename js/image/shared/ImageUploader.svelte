<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image as ImageIcon } from "@gradio/icons";
	import {
		type SelectData,
		type I18nFormatter,
		type ValueData
	} from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";
	import Webcam from "./Webcam.svelte";

	import { Upload } from "@gradio/upload";
	import { FileData, type Client } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";
	import { SelectSource } from "@gradio/atoms";
	import Image from "./Image.svelte";
	import type { Base64File } from "./types";

	export let value: null | FileData | Base64File = null;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	type source_type = "upload" | "webcam" | "clipboard" | "microphone" | null;

	export let sources: source_type[] = ["upload", "clipboard", "webcam"];
	export let streaming = false;
	export let pending = false;
	export let mirror_webcam: boolean;
	export let selectable = false;
	export let root: string;
	export let i18n: I18nFormatter;
	export let max_file_size: number | null = null;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let stream_every: number;

	export let modify_stream: (state: "open" | "closed" | "waiting") => void;
	export let set_time_limit: (arg0: number) => void;

	let upload_input: Upload;
	export let uploading = false;
	export let active_source: source_type = null;

	function handle_upload({ detail }: CustomEvent<FileData>): void {
		// only trigger streaming event if streaming
		if (!streaming) {
			value = detail;
			dispatch("upload");
		}
	}

	function handle_clear(): void {
		value = null;
		dispatch("clear");
		dispatch("change", null);
	}

	async function handle_save(
		img_blob: Blob | any,
		event: "change" | "stream" | "upload"
	): Promise<void> {
		if (event === "stream") {
			dispatch("stream", {
				value: { url: img_blob } as Base64File,
				is_value_data: true
			});
			return;
		}
		pending = true;
		const f = await upload_input.load_files([
			new File([img_blob], `image/${streaming ? "jpeg" : "png"}`)
		]);

		if (event === "change" || event === "upload") {
			value = f?.[0] || null;
			await tick();
			dispatch("change");
		}
		pending = false;
	}

	$: active_streaming = streaming && active_source === "webcam";
	$: if (uploading && !active_streaming) value = null;

	const dispatch = createEventDispatcher<{
		change?: never;
		stream: ValueData;
		clear?: never;
		drag: boolean;
		upload?: never;
		select: SelectData;
		end_stream: never;
	}>();

	export let dragging = false;

	$: dispatch("drag", dragging);

	function handle_click(evt: MouseEvent): void {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	}

	$: if (!active_source && sources) {
		active_source = sources[0];
	}

	async function handle_select_source(
		source: (typeof sources)[number]
	): Promise<void> {
		switch (source) {
			case "clipboard":
				upload_input.paste_clipboard();
				break;
			default:
				break;
		}
	}
</script>

<BlockLabel {show_label} Icon={ImageIcon} label={label || "Image"} />

<div data-testid="image" class="image-container">
	{#if value?.url && !active_streaming}
		<ClearImage
			on:remove_image={() => {
				value = null;
				dispatch("clear");
			}}
		/>
	{/if}
	<div
		class="upload-container"
		class:reduced-height={sources.length > 1}
		style:width={value ? "auto" : "100%"}
	>
		<Upload
			hidden={value !== null || active_source === "webcam"}
			bind:this={upload_input}
			bind:uploading
			bind:dragging
			filetype={active_source === "clipboard" ? "clipboard" : "image/*"}
			on:load={handle_upload}
			on:error
			{root}
			{max_file_size}
			disable_click={!sources.includes("upload") || value !== null}
			{upload}
			{stream_handler}
		>
			{#if value === null}
				<slot />
			{/if}
		</Upload>
		{#if active_source === "webcam" && (streaming || (!streaming && !value))}
			<Webcam
				{root}
				{value}
				on:capture={(e) => handle_save(e.detail, "change")}
				on:stream={(e) => handle_save(e.detail, "stream")}
				on:error
				on:drag
				on:upload={(e) => handle_save(e.detail, "upload")}
				on:close_stream
				{mirror_webcam}
				{stream_every}
				{streaming}
				mode="image"
				include_audio={false}
				{i18n}
				{upload}
				bind:modify_stream
				bind:set_time_limit
			/>
		{:else if value !== null && !streaming}
			<!-- svelte-ignore a11y-click-events-have-key-events-->
			<!-- svelte-ignore a11y-no-static-element-interactions-->
			<div class:selectable class="image-frame" on:click={handle_click}>
				<Image src={value.url} alt={value.alt_text} />
			</div>
		{/if}
	</div>
	{#if sources.length > 1 || sources.includes("clipboard")}
		<SelectSource
			{sources}
			bind:active_source
			{handle_clear}
			handle_select={handle_select_source}
		/>
	{/if}
</div>

<style>
	.image-frame :global(img) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: scale-down;
	}

	.image-frame {
		object-fit: cover;
		width: 100%;
		height: 100%;
	}

	.upload-container {
		display: flex;
		align-items: center;
		justify-content: center;

		height: 100%;
		flex-shrink: 1;
		max-height: 100%;
	}

	.reduced-height {
		height: calc(100% - var(--size-10));
	}

	.image-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-height: 100%;
	}

	.selectable {
		cursor: crosshair;
	}
</style>
