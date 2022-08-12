<script lang="ts">
	import { createEventDispatcher, tick, afterUpdate, onMount } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	export let value: null | FileData;

	export let drop_text: string = "Drop a file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";
	export let label: string = "";
	export let show_label: boolean;

	onMount(() => {
		if (value != null) {
			addNewModel();
		}
	});

	afterUpdate(() => {
		if (value != null && value.is_file) {
			addNewModel();
		}
	});

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		dispatch("change", value);
		addNewModel();
	}

	async function handle_clear() {
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

	function addNewModel() {
		if (scene && engine) {
			scene.dispose();
			engine.dispose();
		}

		engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);
		scene.createDefaultCameraOrLight();
		scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
		engine.runRenderLoop(() => {
			scene.render();
		});

		window.addEventListener("resize", () => {
			engine.resize();
		});

		if (!value) return;

		let url: string;
		if (value.is_file) {
			url = value.name;
		} else {
			let base64_model_content = value.data;
			let raw_content = BABYLON.Tools.DecodeBase64(base64_model_content);
			let blob = new Blob([raw_content]);
			url = URL.createObjectURL(blob);
		}

		BABYLON.SceneLoader.Append(
			url,
			"",
			scene,
			() => {
				scene.createDefaultCamera(true, true, true);
			},
			undefined,
			undefined,
			"." + value.name.split(".")[1]
		);
	}

	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

{#if value === null}
	<Upload on:load={handle_upload} filetype=".obj, .gltf, .glb" bind:dragging>
		{drop_text}
		<br />- {or_text} -<br />
		{upload_text}
	</Upload>
{:else}
	<div
		class="input-model w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	>
		<ModifyUpload on:clear={handle_clear} absolute />
		<canvas class="w-full h-full object-contain" bind:this={canvas} />
	</div>
{/if}
