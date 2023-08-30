<script lang="ts">
	import { createEventDispatcher, tick, onMount } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import { add_new_model } from "../shared/utils";

	export let value: null | FileData;
	export let clear_color: [number, number, number, number] = [0, 0, 0, 0];
	export let label = "";
	export let show_label: boolean;
	export let zoom_speed = 1;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];

	let mounted = false;

	onMount(() => {
		if (value != null) {
			add_new_model(
				canvas,
				scene,
				engine,
				value,
				clear_color,
				camera_position,
				zoom_speed
			);
		}
		mounted = true;
	});

	$: ({ data, is_file, name } = value || {
		data: undefined,
		is_file: undefined,
		name: undefined
	});

	$: canvas &&
		mounted &&
		data != null &&
		is_file &&
		add_new_model(
			canvas,
			scene,
			engine,
			value,
			clear_color,
			camera_position,
			zoom_speed
		);

	async function handle_upload({
		detail
	}: CustomEvent<FileData>): Promise<void> {
		value = detail;
		await tick();
		dispatch("change", value);
		add_new_model(
			canvas,
			scene,
			engine,
			value,
			clear_color,
			camera_position,
			zoom_speed
		);
	}

	async function handle_clear(): Promise<void> {
		if (scene && engine) {
			scene.dispose();
			engine.dispose();
		}
		value = null;
		await tick();
		dispatch("clear");
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		drag: boolean;
	}>();

	let dragging = false;

	import * as BABYLON from "babylonjs";
	import * as BABYLON_LOADERS from "babylonjs-loaders";

	BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS = true;

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;
	let engine: BABYLON.Engine;

	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

{#if value === null}
	<Upload on:load={handle_upload} filetype=".obj, .gltf, .glb" bind:dragging>
		<slot />
	</Upload>
{:else}
	<div class="input-model">
		<ModifyUpload on:clear={handle_clear} absolute />
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
