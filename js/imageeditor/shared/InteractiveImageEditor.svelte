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
	import {
		prepare_files,
		upload,
		normalise_file,
		type FileData
	} from "@gradio/client";
	import ImageEditor from "./ImageEditor.svelte";
	import Layers from "./layers/Layers.svelte";
	import { type Brush as IBrush } from "./tools/Brush.svelte";
	import { type Eraser } from "./tools/Brush.svelte";

	export let brush: IBrush;
	export let eraser: Eraser;
	import { Tools, Crop, Brush, type tool, Sources } from "./tools";
	export let sources: ("clipboard" | "webcam" | "upload")[];

	export let crop_size: [number, number] | `${string}:${string}` | null = null;
	export let i18n: I18nFormatter;
	export let root: string;
	export let proxy_url: string;
	export let changeable = false;
	export let value: EditorData = {
		background: null,
		layers: [],
		composite: null
	};

	let editor: ImageEditor;

	function is_not_null(o: Blob | null): o is Blob {
		return !!o;
	}

	function is_file_data(o: null | FileData): o is FileData {
		return !!o;
	}

	export async function get_data(): Promise<ImageBlobs> {
		const blobs = await editor.get_blobs();

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

	$: crop_constraint = crop_size;
	let bg = false;
	let history = false;
</script>

<ImageEditor bind:this={editor} {changeable} on:save bind:history {bg}>
	<Tools {i18n}>
		<Sources
			{i18n}
			{root}
			{sources}
			bind:bg
			background_file={normalise_file(value.background, root, proxy_url)}
		></Sources>
		<Crop {crop_constraint} />
		<Brush
			color_mode={brush.color_mode}
			default_color={brush.default_color}
			default_size={brush.default_size}
			colors={brush.colors}
			mode="draw"
		/>
		<Brush default_size={eraser.default_size} mode="erase" />
	</Tools>

	<Layers layer_files={normalise_file(value.layers, root, proxy_url)} />

	{#if !bg && !history}
		<div class="empty wrap">
			<div>Upload an image</div>
			<div class="or">or</div>
			<div>select the draw tool to start</div>
		</div>
	{/if}
</ImageEditor>

<style>
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
		z-index: var(--layer-top);
		text-align: center;
		color: var(--body-text-color);
	}

	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: var(--size-60);
		color: var(--block-label-text-color);
		line-height: var(--line-md);
		height: 100%;
		padding-top: var(--size-3);
		font-size: var(--text-lg);
		pointer-events: none;
		transform: translateY(-30px);
	}

	.or {
		color: var(--body-text-color-subdued);
	}
</style>
