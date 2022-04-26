<script lang="ts">
	import type { FileData } from "@gradio/upload";

	export let value: FileData;
	export let theme: string;
	export let clearColor: Array;

	import { onMount, afterUpdate } from "svelte";
	import * as BABYLON from "babylonjs";
	import "babylonjs-loaders";
	import { clear } from "@testing-library/user-event/dist/clear";

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;

	onMount(() => {
		const engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);
		scene.createDefaultCameraOrLight();
		scene.clearColor = clearColor
			? (scene.clearColor = new BABYLON.Color4(
					clearColor[0],
					clearColor[1],
					clearColor[2],
					clearColor[3]
			  ))
			: new BABYLON.Color4(0.2, 0.2, 0.2, 1);

		engine.runRenderLoop(() => {
			scene.render();
		});

		window.addEventListener("resize", () => {
			engine.resize();
		});
	});

	afterUpdate(() => {
		addNewModel();
	});

	function addNewModel() {
		for (let mesh of scene.meshes) {
			mesh.dispose();
		}

		let base64_model_content = value["data"];
		let raw_content = BABYLON.Tools.DecodeBase64(base64_model_content);
		let blob = new Blob([raw_content]);
		let url = URL.createObjectURL(blob);
		BABYLON.SceneLoader.Append(
			"",
			url,
			scene,
			() => {
				scene.createDefaultCamera(true, true, true);
			},
			undefined,
			undefined,
			"." + value["name"].split(".")[1]
		);
	}
</script>

<div
	class="output-model w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	{theme}
>
	<canvas class="w-full h-full object-contain" bind:this={canvas} />
</div>

<style lang="postcss">
</style>
