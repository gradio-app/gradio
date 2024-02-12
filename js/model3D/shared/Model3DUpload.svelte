<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import Canvas3D from "./Canvas3D.svelte";
	import Canvas3DGS from "./Canvas3DGS.svelte";

	export let value: null | FileData;
	export let clear_color: [number, number, number, number] = [0, 0, 0, 0];
	export let label = "";
	export let show_label: boolean;
	export let root: string;
	export let i18n: I18nFormatter;
	export let zoom_speed = 1;
	export let pan_speed = 1;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];

	async function handle_upload({
		detail
	}: CustomEvent<FileData>): Promise<void> {
		value = detail;
		await tick();
		dispatch("change", value);
		dispatch("load", value);
	}

	async function handle_clear(): Promise<void> {
		value = null;
		await tick();
		dispatch("clear");
		dispatch("change");
	}

	let canvas3d: Canvas3D;
	let canvas3dgs: Canvas3DGS;
	let use_3dgs = false;

	async function handle_undo(): Promise<void> {
		canvas3d.reset_camera_position(camera_position, zoom_speed, pan_speed);
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		drag: boolean;
		load: FileData;
	}>();

	let dragging = false;

	$: dispatch("drag", dragging);

	$: {
		if (value) {
			use_3dgs = value?.path.endsWith(".splat") || value?.path.endsWith(".ply");
		}
	}
</script>

<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

{#if value === null}
	<Upload
		on:load={handle_upload}
		{root}
		filetype={[".stl", ".obj", ".gltf", ".glb", "model/obj", ".splat", ".ply"]}
		bind:dragging
	>
		<slot />
	</Upload>
{:else}
	<div class="input-model">
		<ModifyUpload
			undoable
			on:clear={handle_clear}
			{i18n}
			on:undo={handle_undo}
			absolute
		/>

		{#if use_3dgs}
			<Canvas3DGS bind:this={canvas3dgs} {value} {zoom_speed} {pan_speed} />
		{:else}
			<Canvas3D
				bind:this={canvas3d}
				{value}
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
	}

	.input-model :global(canvas) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
</style>
