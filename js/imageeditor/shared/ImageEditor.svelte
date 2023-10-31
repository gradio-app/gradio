<script lang="ts">
	import type { Brush, EditorData } from "./types";
	import { createEventDispatcher, tick } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import { Image, Brush as Paint, Chat as Crop } from "@gradio/icons";
	import type { SelectData, I18nFormatter } from "@gradio/utils";
	import { get_coordinates_of_clicked_image } from "./utils";

	import Webcam from "./Webcam.svelte";

	import { Upload } from "@gradio/upload";
	import { type FileData, normalise_file } from "@gradio/client";
	import ClearImage from "./ClearImage.svelte";
	import Pixi from "./Pixi.svelte";
	import EditorTools from "./EditorTools.svelte";

	export let value: EditorData = {
		background: null,
		layers: [],
		composite: null
	};
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let streaming = false;
	export let pending = false;
	export let mirror_webcam: boolean;
	export let selectable = false;
	export let root: string;
	export let i18n: I18nFormatter;
	export let transforms: ("crop" | "rotate")[];
	export let brush: Brush;

	let upload: Upload;
	export let active_tool: "webcam" | null = null;

	function handle_upload({ detail }: CustomEvent<FileData>): void {
		value.background = normalise_file(detail, root, null);
	}

	async function handle_save(img_blob: Blob | any): Promise<void> {
		pending = true;
		const f = await upload.load_files([new File([img_blob], `webcam.png`)]);

		value.background = f?.[0] || null;
		if (!streaming) active_tool = null;

		await tick();

		dispatch(streaming ? "stream" : "change");
		pending = false;
	}

	// $: value && !value.url && (value = normalise_file(value, root, null));

	const dispatch = createEventDispatcher<{
		change?: never;
		stream?: never;
		clear?: never;
		drag: boolean;
		upload?: never;
		select: SelectData;
	}>();

	let dragging = false;

	$: dispatch("drag", dragging);

	function handle_click(evt: MouseEvent): void {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	}

	interface PathData {
		path: { x: number; y: number }[];
		color: string;
		size: number;
	}

	const layers: PathData[][] = [];
	let current_layer = 0;
	function add_layer(): void {
		layers.push([]);
	}

	async function handle_source(
		source: (typeof sources)[number]
	): Promise<void> {
		switch (source) {
			case "clipboard":
				navigator.clipboard.read().then(async (items) => {
					for (let i = 0; i < items.length; i++) {
						const type = items[i].types.find((t) => t.startsWith("image/"));
						if (type) {
							items[i].getType(type).then(async (blob) => {
								const f = await upload.load_files([
									new File([blob], `clipboard.${type.replace("image/", "")}`)
								]);
								f;
								value.background = f?.[0] || null;
							});
							break;
						}
					}
				});
				break;
			case "webcam":
				active_tool = "webcam";
				break;
			case "upload":
				upload.open_file_upload();
				break;
			default:
				break;
		}
	}

	let brush_size = brush.default_size;
	let brush_color = brush.default_color;
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />

<div data-testid="image" class="image-container">
	<ClearImage
		on:remove_image={() =>
			(value = { background: null, layers: [], composite: null })}
	/>

	<Pixi
		bg={value?.background?.url}
		layers={value?.layers}
		composite={value?.composite}
		{brush_size}
		{brush_color}
		antialias={brush?.antialias}
	/>
	<div class="upload-container">
		<Upload
			hidden={true}
			bind:this={upload}
			bind:dragging
			filetype="image/*"
			on:load={handle_upload}
			on:error
			{root}
			disable_click={!sources.includes("upload")}
		></Upload>
		{#if active_tool === "webcam"}
			<Webcam
				on:capture={(e) => handle_save(e.detail)}
				on:stream={(e) => handle_save(e.detail)}
				on:error
				on:drag
				on:upload={(e) => handle_save(e.detail)}
				{mirror_webcam}
				{streaming}
				mode="image"
				include_audio={false}
				{i18n}
			/>
		{:else if value !== null && !streaming}
			<!-- svelte-ignore a11y-click-events-have-key-events-->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions-->
			<!-- <img
				src={value.url}
				alt={value.alt_text}
				on:click={handle_click}
				class:selectable
			/> -->
		{/if}
	</div>
	<EditorTools
		{sources}
		{brush}
		{transforms}
		{i18n}
		{layers}
		on:set_source={(e) => handle_source(e.detail)}
	/>
</div>

<style>
	img {
		width: var(--size-full);
		height: var(--size-full);
	}

	.upload-container {
		height: 100%;
		flex-shrink: 1;
		max-height: 100%;
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
