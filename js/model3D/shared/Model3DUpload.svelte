<script lang="ts">
	import { tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import type Canvas3DGS from "./Canvas3DGS.svelte";
	import type Canvas3DPLY from "./Canvas3DPLY.svelte";
	import type Canvas3D from "./Canvas3D.svelte";
	import {
		load_renderer_component,
		renderer_for_model3d_path
	} from "./renderer-loader";

	type Canvas3DLike = Canvas3D | Canvas3DPLY;
	type Model3DCanvasComponent =
		| typeof Canvas3D
		| typeof Canvas3DGS
		| typeof Canvas3DPLY;

	let {
		value = $bindable(),
		display_mode = "solid",
		clear_color = [0, 0, 0, 0],
		label = "",
		show_label,
		root,
		i18n,
		zoom_speed = 1,
		pan_speed = 1,
		max_file_size = null,
		uploading = $bindable(),
		upload_promise = $bindable(),
		camera_position = [null, null, null],
		upload,
		stream_handler,
		onchange,
		onclear,
		ondrag,
		onload,
		onerror
	}: {
		value?: FileData | null;
		display_mode?: "solid" | "point_cloud" | "wireframe";
		clear_color?: [number, number, number, number];
		label?: string;
		show_label: boolean;
		root: string;
		i18n: I18nFormatter;
		zoom_speed?: number;
		pan_speed?: number;
		max_file_size?: number | null;
		uploading?: boolean;
		upload_promise?: Promise<(FileData | null)[]> | null;
		camera_position?: [number | null, number | null, number | null];
		upload: Client["upload"];
		stream_handler: Client["stream"];
		onchange?: (value: FileData | null) => void;
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onload?: (value: FileData) => void;
		onerror?: (error: string) => void;
	} = $props();

	let use_3dgs = $state(false);
	let use_ply = $state(false);
	let Canvas3DGSComponent = $state<typeof Canvas3DGS>();
	let Canvas3DPLYComponent = $state<typeof Canvas3DPLY>();
	let Canvas3DComponent = $state<typeof Canvas3D>();
	let canvas3d = $state<Canvas3DLike | undefined>();
	let reset_camera_available = $state(false);
	let dragging = $state(false);

	async function loadCanvas3D(): Promise<typeof Canvas3D> {
		const module = await import("./Canvas3D.svelte");
		return module.default;
	}
	async function loadCanvas3DGS(): Promise<typeof Canvas3DGS> {
		const module = await import("./Canvas3DGS.svelte");
		return module.default;
	}
	async function loadCanvas3DPLY(): Promise<typeof Canvas3DPLY> {
		const module = await import("./Canvas3DPLY.svelte");
		return module.default;
	}

	$effect(() => {
		if (!value) {
			use_ply = false;
			use_3dgs = false;
			reset_camera_available = false;
			return;
		}

		const renderer = renderer_for_model3d_path(value.path);
		use_ply = renderer === "ply";
		use_3dgs = renderer !== "mesh";
		reset_camera_available = false;

		return load_renderer_component<Model3DCanvasComponent>(
			renderer,
			{
				mesh: loadCanvas3D,
				ply: loadCanvas3DPLY,
				splat: loadCanvas3DGS
			},
			(renderer, component) => {
				if (renderer === "ply") {
					Canvas3DPLYComponent = component as typeof Canvas3DPLY;
				} else if (renderer === "splat") {
					Canvas3DGSComponent = component as typeof Canvas3DGS;
				} else {
					Canvas3DComponent = component as typeof Canvas3D;
				}
			}
		);
	});

	$effect(() => {
		ondrag?.(dragging);
	});

	async function handle_upload(detail: FileData): Promise<void> {
		value = detail;
		await tick();
		onchange?.(value);
		onload?.(value as FileData);
	}

	async function handle_clear(): Promise<void> {
		value = null;
		await tick();
		onclear?.();
		onchange?.(null);
	}

	async function handle_undo(): Promise<void> {
		canvas3d?.reset_camera_position();
	}

	function handle_error(error: string): void {
		onerror?.(error);
	}
</script>

<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

{#if value == null}
	<Upload
		bind:upload_promise
		{upload}
		{stream_handler}
		onload={handle_upload}
		{root}
		{max_file_size}
		filetype={[".stl", ".obj", ".gltf", ".glb", "model/obj", ".splat", ".ply"]}
		bind:dragging
		bind:uploading
		onerror={handle_error}
		aria_label={i18n("model3d.drop_to_upload")}
	>
		<slot />
	</Upload>
{:else}
	<div class="input-model">
		<ModifyUpload
			undoable={!use_3dgs || (use_ply && reset_camera_available)}
			onclear={handle_clear}
			{i18n}
			onundo={handle_undo}
		/>

		{#if use_ply}
			<svelte:component
				this={Canvas3DPLYComponent}
				bind:this={canvas3d}
				{value}
				{display_mode}
				{clear_color}
				{camera_position}
				{zoom_speed}
				{pan_speed}
				bind:reset_camera_available
			/>
		{:else if use_3dgs}
			<svelte:component
				this={Canvas3DGSComponent}
				{value}
				{zoom_speed}
				{pan_speed}
			/>
		{:else}
			<svelte:component
				this={Canvas3DComponent}
				bind:this={canvas3d}
				{value}
				{display_mode}
				{clear_color}
				{camera_position}
				{zoom_speed}
				{pan_speed}
			/>
		{/if}
	</div>
{/if}

<style>
	.input-model {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
		border-radius: var(--block-radius);
		overflow: hidden;
	}

	.input-model :global(canvas) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
</style>
