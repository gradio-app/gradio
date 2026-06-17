<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import { BlockLabel, IconButtonWrapper, IconButton } from "@gradio/atoms";
	import { Clear, Image as ImageIcon } from "@gradio/icons";
	import { FullscreenButton } from "@gradio/atoms";
	import {
		type SelectData,
		type I18nFormatter,
		type ValueData
	} from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";
	import Webcam from "./Webcam.svelte";

	import { Upload, UploadProgress } from "@gradio/upload";
	import { FileData, type Client } from "@gradio/client";
	import { SelectSource } from "@gradio/atoms";
	import Image from "./Image.svelte";
	import type { Base64File, WebcamOptions } from "./types";

	type source_type = "upload" | "webcam" | "clipboard" | "microphone" | null;

	let {
		value = $bindable<null | FileData | Base64File>(null),
		label = undefined,
		show_label,
		sources = ["upload", "clipboard", "webcam"],
		streaming = false,
		pending = $bindable(false),
		webcam_options,
		selectable = false,
		root,
		i18n,
		max_file_size = null,
		upload,
		stream_handler,
		stream_every,
		time_limit,
		show_fullscreen_button = true,
		stream_state = "closed",
		upload_promise = $bindable(),
		onerror,
		uploading = $bindable(false),
		active_source = $bindable<source_type>(null),
		fullscreen = $bindable(false),
		dragging = $bindable(false),
		onchange,
		onstream,
		onclear,
		ondrag,
		onupload,
		onselect,
		onfullscreen,
		onclose_stream,
		children
	}: {
		value?: null | FileData | Base64File;
		label?: string;
		show_label: boolean;
		sources?: source_type[];
		streaming?: boolean;
		pending?: boolean;
		webcam_options: WebcamOptions;
		selectable?: boolean;
		root: string;
		i18n: I18nFormatter;
		max_file_size?: number | null;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		stream_every: number;
		time_limit: number;
		show_fullscreen_button?: boolean;
		stream_state?: "open" | "waiting" | "closed";
		upload_promise?: Promise<any> | null;
		onerror?: (error: string) => void;
		uploading?: boolean;
		active_source?: source_type;
		fullscreen?: boolean;
		dragging?: boolean;
		onchange?: (value?: null | FileData | Base64File) => void;
		onstream?: (value: ValueData) => void;
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onupload?: () => void;
		onselect?: (value: SelectData) => void;
		onfullscreen?: (fullscreen: boolean) => void;
		onclose_stream?: () => void;
		children?: Snippet;
	} = $props();

	let upload_input: Upload;

	let files = $state<FileData[]>([]);
	let upload_id = $state("");

	async function handle_upload(detail: FileData): Promise<void> {
		if (!streaming) {
			if (detail.path?.toLowerCase().endsWith(".svg") && detail.url) {
				const response = await fetch(detail.url);
				const svgContent = await response.text();
				value = {
					...detail,
					url: `data:image/svg+xml,${encodeURIComponent(svgContent)}`
				};
			} else {
				value = detail;
			}

			await tick();
			onupload?.();
		}
	}

	function handle_clear(): void {
		value = null;
		onclear?.();
		onchange?.(null);
	}

	function handle_remove_image_click(event: MouseEvent): void {
		handle_clear();
		event.stopPropagation();
	}

	async function handle_save(
		img_blob: Blob | any,
		event: "change" | "stream" | "upload"
	): Promise<void> {
		if (event === "stream") {
			onstream?.({
				value: { url: img_blob } as Base64File,
				is_value_data: true
			});
			return;
		}
		upload_id = Math.random().toString(36).substring(2, 15);
		const f_ = new File([img_blob], `image.${streaming ? "jpeg" : "png"}`);
		files = [
			new FileData({
				path: f_.name,
				orig_name: f_.name,
				blob: f_,
				size: f_.size,
				mime_type: f_.type,
				is_stream: false
			})
		];
		pending = true;
		const f = await upload_input.load_files([f_], upload_id);
		if (event === "change" || event === "upload") {
			value = f?.[0] || null;
			await tick();
			onchange?.();
		}
		pending = false;
	}

	let active_streaming = $derived(streaming && active_source === "webcam");
	$effect(() => {
		if (uploading && !active_streaming) value = null;
	});
	$effect(() => {
		ondrag?.(dragging);
	});

	function handle_click(evt: MouseEvent): void {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			onselect?.({ index: coordinates, value: null });
		}
	}

	$effect(() => {
		if (!active_source && sources) {
			active_source = sources[0];
		}
	});

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

	let image_container: HTMLElement;

	function on_drag_over(evt: DragEvent): void {
		evt.preventDefault();
		evt.stopPropagation();
		if (evt.dataTransfer) {
			evt.dataTransfer.dropEffect = "copy";
		}

		dragging = true;
	}

	async function on_drop(evt: DragEvent): Promise<void> {
		evt.preventDefault();
		evt.stopPropagation();
		dragging = false;

		if (value) {
			handle_clear();
			await tick();
		}

		active_source = "upload";
		await tick();
		upload_input.load_files_from_drop(evt);
	}
</script>

<BlockLabel {show_label} Icon={ImageIcon} label={label || "Image"} />

<div data-testid="image" class="image-container" bind:this={image_container}>
	<IconButtonWrapper>
		{#if value?.url && !active_streaming}
			{#if show_fullscreen_button}
				<FullscreenButton
					{fullscreen}
					onclick={(is_fullscreen) => {
						fullscreen = is_fullscreen;
						onfullscreen?.(is_fullscreen);
					}}
				/>
			{/if}
			<IconButton
				Icon={Clear}
				label="Remove Image"
				onclick={handle_remove_image_click}
			/>
		{/if}
	</IconButtonWrapper>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="upload-container"
		class:reduced-height={sources.length > 1}
		style:width={value ? "auto" : "100%"}
		ondragover={on_drag_over}
		ondrop={on_drop}
	>
		<Upload
			bind:upload_promise
			hidden={value !== null || active_source === "webcam"}
			bind:this={upload_input}
			bind:uploading
			bind:dragging
			filetype={active_source === "clipboard" ? "clipboard" : "image/*"}
			onload={handle_upload}
			{onerror}
			{root}
			{max_file_size}
			disable_click={!sources.includes("upload") || value !== null}
			{upload}
			{stream_handler}
			aria_label={i18n("image.drop_to_upload")}
		>
			{#if value === null}
				{#if children}{@render children()}{/if}
			{/if}
		</Upload>
		{#if active_source === "webcam" && !streaming && pending}
			<UploadProgress {root} {upload_id} {stream_handler} {files} />
		{:else if active_source === "webcam" && (streaming || (!streaming && !value))}
			<Webcam
				{root}
				{value}
				oncapture={(detail) => handle_save(detail, "change")}
				onstream={(detail) => handle_save(detail, "stream")}
				{onerror}
				{onclose_stream}
				{stream_state}
				mirror_webcam={webcam_options.mirror}
				{stream_every}
				{streaming}
				mode="image"
				include_audio={false}
				{i18n}
				{upload}
				{time_limit}
				webcam_constraints={webcam_options.constraints}
			/>
		{:else if value !== null && !streaming}
			<!-- svelte-ignore a11y-click-events-have-key-events-->
			<!-- svelte-ignore a11y-no-static-element-interactions-->
			<div class:selectable class="image-frame" onclick={handle_click}>
				<Image src={value.url} restProps={{ alt: value.alt_text }} />
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

	.image-frame {
		object-fit: cover;
		width: 100%;
		height: 100%;
	}
</style>
