<script lang="ts">
	export let value: string;
	export let theme: string;

	import { onMount, afterUpdate } from "svelte";
	import * as BABYLON from "babylonjs";
	import "babylonjs-loaders";

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;

	onMount(() => {
		const engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);
		scene.createDefaultCameraOrLight();
		const clearColor = value["clearColor"];
		scene.clearColor = new BABYLON.Color4(
			clearColor[0],
			clearColor[1],
			clearColor[2],
			clearColor[3]
		);
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
			value["extension"]
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
