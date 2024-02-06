<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import { add_new_model, reset_camera_position } from "./utils";
	import { onMount } from "svelte";
	import * as BABYLON from "babylonjs";
	import * as BABYLON_LOADERS from "babylonjs-loaders";
	import type { I18nFormatter } from "@gradio/utils";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";
	import { dequal } from "dequal";

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

	let current_settings = { camera_position, zoom_speed, pan_speed };

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

	onMount(() => {
		engine = new BABYLON.Engine(canvas, true);
		window.addEventListener("resize", () => {
			engine?.resize();
		});
		mounted = true;
	});

	$: ({ path } = resolved_value || {
		path: undefined
	});

	$: canvas && mounted && path && resolved_value && dispose();

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
				resolved_value,
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

	$: {
		if (
			scene &&
			(!dequal(current_settings.camera_position, camera_position) ||
				current_settings.zoom_speed !== zoom_speed ||
				current_settings.pan_speed !== pan_speed)
		) {
			reset_camera_position(scene, camera_position, zoom_speed, pan_speed);
			current_settings = { camera_position, zoom_speed, pan_speed };
		}
	}
</script>

<BlockLabel
	{show_label}
	Icon={File}
	label={label || i18n("3D_model.3d_model")}
/>
{#if resolved_value}
	<div class="model3D">
		<div class="buttons">
			<IconButton Icon={Undo} label="Undo" on:click={() => handle_undo()} />
			<a
				href={resolved_value.url}
				target={window.__is_colab__ ? "_blank" : null}
				download={window.__is_colab__
					? null
					: resolved_value.orig_name || resolved_value.path}
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
