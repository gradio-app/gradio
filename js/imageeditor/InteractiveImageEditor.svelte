<script lang="ts" context="module">
	export interface EditorData {
		background: FileData | null;
		layers: FileData[] | null;
		composite: FileData | null;
	}

	export interface ImageBlobs {
		background: FileData | null;
		layers: FileData[];
		composite: FileData | null;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { type I18nFormatter } from "@gradio/utils";
	import { prepare_files, type FileData, type Client } from "@gradio/client";
	import { type CommandNode } from "./shared/utils/commands";
	import ImageEditor from "./shared/ImageEditor.svelte";
	// import Layers from "./layers/Layers.svelte";
	import { type Brush as IBrush, type Eraser } from "./shared/brush/types";
	// import { type Eraser } from "./tools/Brush.svelte";
	import { type Tool as ToolbarTool } from "./shared/Toolbar.svelte";

	// import { Tools, Crop, Brush, Sources } from "./tools";
	import { BlockLabel } from "@gradio/atoms";
	import { Image as ImageIcon } from "@gradio/icons";
	import { inject } from "./shared/utils/parse_placeholder";
	// import Sources from "./shared/image/Sources.svelte";
	import {
		type LayerOptions,
		type Transform,
		type Source,
		type WebcamOptions
	} from "./shared/types";

	export let brush: IBrush;
	export let eraser: Eraser;
	export let sources: Source[];
	export let i18n: I18nFormatter;
	export let root: string;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let changeable = false;
	export let theme_mode: "dark" | "light";

	export let layers: FileData[];
	export let composite: FileData | null;
	export let background: FileData | null;

	export let layer_options: LayerOptions;
	export let transforms: Transform[];
	export let accept_blobs: (a: any) => void;

	export let canvas_size: [number, number];
	export let fixed_canvas = false;
	export let realtime: boolean;
	export let upload: Client["upload"];
	export let is_dragging: boolean;
	export let placeholder: string | undefined = undefined;
	export let border_region: number;
	export let full_history: CommandNode | null = null;
	export let webcam_options: WebcamOptions;
	export let show_download_button = false;

	const dispatch = createEventDispatcher<{
		clear?: never;
		upload?: never;
		change?: never;
		receive_null?: never;
	}>();

	let editor: ImageEditor;
	let has_drawn = false;

	function is_not_null(o: Blob | null): o is Blob {
		return !!o;
	}

	function is_file_data(o: null | FileData): o is FileData {
		return !!o;
	}

	$: if (background_image) dispatch("upload");

	export async function get_data(): Promise<ImageBlobs> {
		let blobs;
		try {
			blobs = await editor.get_blobs();
		} catch (e) {
			return { background: null, layers: [], composite: null };
		}

		const bg = blobs.background
			? upload(
					await prepare_files([new File([blobs.background], "background.png")]),
					root
				)
			: Promise.resolve(null);

		const layers = blobs.layers
			.filter(is_not_null)
			.map(async (blob, i) =>
				upload(await prepare_files([new File([blob], `layer_${i}.png`)]), root)
			);

		const composite = blobs.composite
			? upload(
					await prepare_files([new File([blobs.composite], "composite.png")]),
					root
				)
			: Promise.resolve(null);

		const [background, composite_, ...layers_] = await Promise.all([
			bg,
			composite,
			...layers
		]);

		return {
			background: Array.isArray(background) ? background[0] : background,
			layers: layers_
				.flatMap((layer) => (Array.isArray(layer) ? layer : [layer]))
				.filter(is_file_data),
			composite: Array.isArray(composite_) ? composite_[0] : composite_
		};
	}

	function handle_value(value: EditorData | null): void {
		if (!editor) return;
		if (value == null) {
			editor.handle_remove();
			dispatch("receive_null");
		}
	}

	$: handle_value({ layers, composite, background });

	let background_image = false;
	let history = false;

	export let image_id: null | string = null;

	type BinaryImages = [string, string, File, number | null][];

	function nextframe(): Promise<void> {
		return new Promise((resolve) => setTimeout(() => resolve(), 30));
	}

	let uploading = false;
	let pending = false;
	async function handle_change(e: CustomEvent<Blob | any>): Promise<void> {
		if (!realtime) return;
		if (uploading) {
			pending = true;
			return;
		}
		uploading = true;
		await nextframe();
		const blobs = await editor.get_blobs();
		const images: BinaryImages = [];
		let id = Math.random().toString(36).substring(2);
		if (blobs.background)
			images.push([
				id,
				"background",
				new File([blobs.background], "background.png"),
				null
			]);
		if (blobs.composite)
			images.push([
				id,
				"composite",
				new File([blobs.composite], "composite.png"),
				null
			]);
		blobs.layers.forEach((layer, i) => {
			if (layer)
				images.push([
					id as string,
					`layer`,
					new File([layer], `layer_${i}.png`),
					i
				]);
		});
		await Promise.all(
			images.map(async ([image_id, type, data, index]) => {
				return accept_blobs({
					binary: true,
					data: { file: data, id: image_id, type, index }
				});
			})
		);
		image_id = id;
		dispatch("change");
		await nextframe();
		uploading = false;
		if (pending) {
			pending = false;
			uploading = false;
			handle_change(e);
		}
	}

	$: [heading, paragraph] = placeholder ? inject(placeholder) : [false, false];

	let current_tool: ToolbarTool;
</script>

<BlockLabel
	{show_label}
	Icon={ImageIcon}
	label={label || i18n("image.image")}
/>
<ImageEditor
	{transforms}
	{composite}
	{layers}
	{background}
	on:history
	{canvas_size}
	bind:this={editor}
	{changeable}
	on:save
	on:change={handle_change}
	on:clear={() => dispatch("clear")}
	on:download_error
	{sources}
	{full_history}
	bind:background_image
	bind:current_tool
	brush_options={brush}
	eraser_options={eraser}
	{fixed_canvas}
	{border_region}
	{layer_options}
	{i18n}
	{root}
	{upload}
	bind:is_dragging
	bind:has_drawn
	{webcam_options}
	{show_download_button}
	{theme_mode}
>
	{#if !background_image && current_tool === "image" && !has_drawn}
		<div class="empty wrap">
			{#if sources && sources.length}
				{#if heading || paragraph}
					{#if heading}
						<h2>{heading}</h2>
					{/if}
					{#if paragraph}
						<p>{paragraph}</p>
					{/if}
				{:else}
					<div>Upload an image</div>
				{/if}
			{/if}

			{#if sources && sources.length && brush && !placeholder}
				<div class="or">or</div>
			{/if}
			{#if brush && !placeholder}
				<div>select the draw tool to start</div>
			{/if}
		</div>
	{/if}
</ImageEditor>

<style>
	h2 {
		font-size: var(--text-xl);
	}

	p,
	h2 {
		white-space: pre-line;
	}

	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: absolute;
		height: 100%;
		width: 100%;
		left: 0;
		right: 0;
		margin: auto;
		z-index: var(--layer-1);
		text-align: center;
		color: var(--color-grey-500) !important;
		cursor: pointer;
	}

	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		line-height: var(--line-md);
		font-size: var(--text-md);
	}

	.or {
		color: var(--body-text-color-subdued);
	}
</style>
