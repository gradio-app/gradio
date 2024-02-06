<script lang="ts">
	import { createEventDispatcher, tick, onMount } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import { add_new_model, reset_camera_position } from "./utils";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";

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

	let resolved_value: typeof value;

	/* URL resolution for the Wasm mode. */
	// The `value` prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved value for the old `value` has to be discarded,
	// This variable `latest_value` is used to pick up only the value resolved for the latest `value` prop.
	let latest_value: typeof value;
	$: {
		// In normal (non-Wasm) Gradio, the original `value` should be used immediately
		// without waiting for `resolve_wasm_src()` to resolve.
		// If it waits, a blank element is displayed until the async task finishes
		// and it leads to undesirable flickering.
		// So set `resolved_value` immediately above, and update it with the resolved values below later.
		resolved_value = value;

		if (value?.url) {
			latest_value = value;
			const resolving_value = value;
			resolve_wasm_src(value.url).then((resolved_url) => {
				if (latest_value === resolving_value) {
					resolved_value = {
						...resolving_value,
						url: resolved_url ?? undefined
					};
				} else {
					resolved_url && URL.revokeObjectURL(resolved_url);
				}
			});
		}
	}

	let mounted = false;
	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;
	let engine: BABYLON.Engine;

	function reset_scene(): void {
		scene = add_new_model(
			canvas,
			scene,
			engine,
			resolved_value,
			clear_color,
			camera_position,
			zoom_speed,
			pan_speed
		);
	}

	onMount(() => {
		if (resolved_value != null) {
			reset_scene();
		}
		mounted = true;
	});

	$: ({ path } = resolved_value || {
		path: undefined
	});

	$: canvas && mounted && path != null && resolved_value && reset_scene();

	async function handle_upload({
		detail
	}: CustomEvent<FileData>): Promise<void> {
		value = detail;
		await tick();
		reset_scene();
		dispatch("change", value);
		dispatch("load", value);
	}

	async function handle_clear(): Promise<void> {
		if (scene && engine) {
			scene.dispose();
			engine.dispose();
		}
		value = null;
		await tick();
		dispatch("clear");
		dispatch("change");
	}

	async function handle_undo(): Promise<void> {
		reset_camera_position(scene, camera_position, zoom_speed, pan_speed);
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		drag: boolean;
		load: FileData;
	}>();

	let dragging = false;

	import * as BABYLON from "babylonjs";
	import * as BABYLON_LOADERS from "babylonjs-loaders";
	import type { I18nFormatter } from "@gradio/utils";

	$: {
		if (
			BABYLON_LOADERS.OBJFileLoader != undefined &&
			!BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS
		) {
			BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS = true;
		}
	}

	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

{#if value === null}
	<Upload
		on:load={handle_upload}
		{root}
		filetype={[".stl", ".obj", ".gltf", ".glb", "model/obj"]}
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
		<canvas bind:this={canvas} />
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

	canvas {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
</style>
