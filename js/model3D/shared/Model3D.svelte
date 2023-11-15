<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import { add_new_model, reset_camera_position } from "./utils";
	import { onMount } from "svelte";
	import * as BABYLON from "babylonjs";
	import * as BABYLON_LOADERS from "babylonjs-loaders";
	import type { I18nFormatter } from "@gradio/utils";

	export let value: FileData | null;
	export let clear_color: [number, number, number, number] = [0, 0, 0, 0];
	export let label = "";
	export let show_label: boolean;
	export let i18n: I18nFormatter;
	export let zoom_speed = 1;
	export let pan_speed = 1;

	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];

	$: {
		if (
			BABYLON_LOADERS.OBJFileLoader != undefined &&
			!BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS
		) {
			BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS = true;
		}
	}

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;
	let engine: BABYLON.Engine | null;
	let mounted = false;

	onMount(() => {
		engine = new BABYLON.Engine(canvas, true);
		window.addEventListener("resize", () => {
			engine?.resize();
		});
		mounted = true;
	});

	$: ({ path } = value || {
		path: undefined
	});

	$: canvas && mounted && path && dispose();

	function dispose(): void {
		if (scene && !scene.isDisposed) {
			scene.dispose();
			engine?.stopRenderLoop();
			engine?.dispose();
			engine = null;
			engine = new BABYLON.Engine(canvas, true);
			window.addEventListener("resize", () => {
				engine?.resize();
			});
		}
		if (engine !== null) {
			scene = add_new_model(
				canvas,
				scene,
				engine,
				value,
				clear_color,
				camera_position,
				zoom_speed,
				pan_speed
			);
		}
	}

	function handle_undo(): void {
		reset_camera_position(scene, camera_position, zoom_speed, pan_speed);
	}

	$: if (scene)
		reset_camera_position(scene, camera_position, zoom_speed, pan_speed);
</script>

<BlockLabel
	{show_label}
	Icon={File}
	label={label || i18n("3D_model.3d_model")}
/>
{#if value}
	<div class="model3D">
		<div class="buttons">
			<IconButton Icon={Undo} label="Undo" on:click={() => handle_undo()} />
			<a
				href={value.url}
				target={window.__is_colab__ ? "_blank" : null}
				download={window.__is_colab__ ? null : value.orig_name || value.path}
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</a>
		</div>

		<canvas bind:this={canvas} />
	</div>
{/if}

<style>
	.model3D {
		display: flex;
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
	}
	canvas {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
	.buttons {
		display: flex;
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}
</style>
