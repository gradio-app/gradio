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
	import { type I18nFormatter } from "@gradio/utils";
	import { prepare_files, type FileData, type Client } from "@gradio/client";
	import { type CommandNode } from "./shared/core/commands";
	import ImageEditor from "./shared/ImageEditor.svelte";
	import { type Brush as IBrush, type Eraser } from "./shared/brush/types";
	import { type Tool as ToolbarTool } from "./shared/Toolbar.svelte";

	import { BlockLabel } from "@gradio/atoms";
	import { Image as ImageIcon } from "@gradio/icons";
	import { inject } from "./shared/utils/parse_placeholder";
	import {
		type LayerOptions,
		type Transform,
		type Source,
		type WebcamOptions
	} from "./shared/types";

	let {
		brush,
		eraser,
		sources,
		i18n,
		root,
		label = undefined,
		show_label,
		changeable = false,
		theme_mode,
		layers,
		composite,
		background,
		layer_options,
		transforms,
		accept_blobs,
		canvas_size,
		fixed_canvas = false,
		realtime,
		upload,
		is_dragging = $bindable(),
		placeholder = undefined,
		border_region,
		full_history = $bindable(null),
		webcam_options,
		show_download_button = false,
		image_id = $bindable(null),
		onclear,
		onupload,
		onchange,
		oninput,
		onsave,
		onreceive_null,
		ondownload_error
	}: {
		brush: IBrush;
		eraser: Eraser;
		sources: Source[];
		i18n: I18nFormatter;
		root: string;
		label?: string;
		show_label: boolean;
		changeable?: boolean;
		theme_mode: "dark" | "light";
		layers: FileData[];
		composite: FileData | null;
		background: FileData | null;
		layer_options: LayerOptions;
		transforms: Transform[];
		accept_blobs: (a: any) => void;
		canvas_size: [number, number];
		fixed_canvas?: boolean;
		realtime: boolean;
		upload: Client["upload"];
		is_dragging?: boolean;
		placeholder?: string;
		border_region: number;
		full_history?: CommandNode | null;
		webcam_options: WebcamOptions;
		show_download_button?: boolean;
		image_id?: null | string;
		onclear?: () => void;
		onupload?: () => void;
		onchange?: () => void;
		oninput?: () => void;
		onsave?: () => void;
		onreceive_null?: () => void;
		ondownload_error?: (error: string) => void;
	} = $props();

	let editor: ImageEditor;
	let has_drawn = $state(false);

	function is_not_null(o: Blob | null): o is Blob {
		return !!o;
	}

	function is_file_data(o: null | FileData): o is FileData {
		return !!o;
	}

	$effect(() => {
		if (background_image) onupload?.();
	});

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
			onreceive_null?.();
		}
	}

	$effect(() => {
		handle_value({ layers, composite, background });
	});

	let background_image = $state(false);
	let can_undo = $state(false);

	type BinaryImages = [string, string, File, number | null][];

	function nextframe(): Promise<void> {
		return new Promise((resolve) => setTimeout(() => resolve(), 30));
	}

	let uploading = $state(false);
	let pending = $state(false);
	async function handle_change(): Promise<void> {
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
		onchange?.();
		await nextframe();
		uploading = false;
		if (pending) {
			pending = false;
			uploading = false;
			handle_change();
		}
	}

	let placeholder_parts = $derived(
		placeholder ? inject(placeholder) : [false, false]
	);
	let heading = $derived(placeholder_parts[0]);
	let paragraph = $derived(placeholder_parts[1]);

	let current_tool = $state<ToolbarTool>();
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
	{canvas_size}
	bind:this={editor}
	{changeable}
	{onsave}
	{oninput}
	onchange={handle_change}
	onclear={() => onclear?.()}
	{ondownload_error}
	{sources}
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
	bind:can_undo
	bind:full_history
>
	{#if current_tool === "image" && !can_undo}
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
