<script lang="ts">
	import { createEventDispatcher, tick, afterUpdate } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { Block, BlockLabel } from "@gradio/atoms";

	import file_icon from "./file.svg";

	export let value: null | FileData;

	export let drop_text: string = "Drop a file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";
	export let label: string = "";
	export let style: string;

	afterUpdate(() => {
		if (value != null && value.is_example) {
			addNewModel();
		}
	});

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		dispatch("change", value);
		addNewModel();
	}

	async function handle_clear({ detail }: CustomEvent<null>) {
		value = null;
		await tick();
		dispatch("clear");
	}

	const dispatch =
		createEventDispatcher<{ change: FileData | null; clear: undefined }>();

	let dragging = false;

	import * as BABYLON from "babylonjs";
	import "babylonjs-loaders";

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;

	function addNewModel() {
		const engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);
		scene.createDefaultCameraOrLight();
		scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
		engine.runRenderLoop(() => {
			scene.render();
		});

		window.addEventListener("resize", () => {
			engine.resize();
		});

		let url: string
		if (value.is_example) {
			url = value.data
		} else {
			let base64_model_content = value.data;
			let raw_content = BABYLON.Tools.DecodeBase64(base64_model_content);
			let blob = new Blob([raw_content]);
			url = URL.createObjectURL(blob);
		}
		
		BABYLON.SceneLoader.Append(
			"",
			url,
			scene,
			() => {
				scene.createDefaultCamera(true, true, true);
			},
			undefined,
			undefined,
			"." + value.name.split(".")[1]
		);
	}
</script>

<Block
	variant={value === null ? "dashed" : "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
>
	<BlockLabel image={file_icon} label={label || "3D Model File"} />

	{#if value === null}
		<Upload on:load={handle_upload} filetype=".obj, .gltf, .glb" bind:dragging>
			{drop_text}
			<br />- {or_text} -<br />
			{upload_text}
		</Upload>
	{:else}
		<ModifyUpload on:clear={handle_clear} absolute />
		<div
			class="input-model w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
		>
			<canvas class="w-full h-full object-contain" bind:this={canvas} />
		</div>
	{/if}
</Block>
