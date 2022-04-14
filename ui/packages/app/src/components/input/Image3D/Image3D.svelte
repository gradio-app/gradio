<script lang="ts">
	import type { FileData } from "./types";
	import Upload from "../../utils/Upload.svelte";
	import { _ } from "svelte-i18n";

	export let value: FileData;
	export let setValue: (val: null | FileData) => null | FileData;
	export let theme: string;

	import { afterUpdate } from "svelte";
	import * as BABYLON from "babylonjs";
	import "babylonjs-loaders";

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;

	afterUpdate(() => {
		if (value != null) {
			addNewModel();
		}
	});

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
		if (value["is_example"]) {
			url = value["data"]
		} else {
			let base64_model_content = value["data"];
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
			"." + value["name"].split(".")[1]
		);
	}
</script>

{#if value === null}
	<Upload load={setValue} {theme} filetype=".obj, .gltf, .glb">
		{$_("interface.drop_file")}
		<br />- {$_("interface.or")} -<br />
		{$_("interface.click_to_upload")}
	</Upload>
{:else}
	<div
		class="input-model w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
		{theme}
	>
		<canvas class="w-full h-full object-contain" bind:this={canvas} />
	</div>
{/if}

<style lang="postcss">
</style>
