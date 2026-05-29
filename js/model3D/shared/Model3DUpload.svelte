<script lang="ts">
	import { tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import type Canvas3DGS from "./Canvas3DGS.svelte";
	import type Canvas3D from "./Canvas3D.svelte";

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
	let Canvas3DGSComponent = $state<typeof Canvas3DGS>();
	let Canvas3DComponent = $state<typeof Canvas3D>();
	let canvas3d = $state<Canvas3D | undefined>();
	let dragging = $state(false);

	// Guard to prevent re-resolving on internal state changes
	let render_guard = $state(false);

	async function loadCanvas3D(): Promise<typeof Canvas3D> {
		const module = await import("./Canvas3D.svelte");
		return module.default;
	}
	async function loadCanvas3DGS(): Promise<typeof Canvas3DGS> {
		const module = await import("./Canvas3DGS.svelte");
		return module.default;
	}

	$effect(() => {
		if (value) {
			render_guard = false;
		}
	});

	$effect(() => {
		if (value && !render_guard) {
			const path = value.path || value.url || "";
			render_guard = true;
			if (path.endsWith(".splat")) {
				use_3dgs = true;
				Canvas3DGSComponent = undefined;
				loadCanvas3DGS().then((component) => {
					Canvas3DGSComponent = component;
				});
			} else if (path.endsWith(".ply")) {
				// Try Canvas3DGS first; simple point clouds fall back via onerror
				use_3dgs = true;
				Canvas3DGSComponent = undefined;
				loadCanvas3DGS().then((component) => {
					Canvas3DGSComponent = component;
				});
			} else {
				use_3dgs = false;
				Canvas3DComponent = undefined;
				loadCanvas3D().then((component) => {
					Canvas3DComponent = component;
				});
			}
		}
	});

	// Fallback: when gsplat fails for a .ply file, switch to Canvas3D
	function handleGsplatError(_message?: string): void {
		const path = value?.path || value?.url || "";
		if (path.endsWith(".ply") && use_3dgs) {
			use_3dgs = false;
			Canvas3DComponent = undefined;
			loadCanvas3D().then((component) => {
				Canvas3DComponent = component;
			});
		}
	}

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
			undoable={!use_3dgs}
			onclear={handle_clear}
			{i18n}
			onundo={handle_undo}
		/>

		{#if use_3dgs}
			<svelte:component
				this={Canvas3DGSComponent}
				{value}
				{zoom_speed}
				{pan_speed}
				onerror={handleGsplatError}
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
