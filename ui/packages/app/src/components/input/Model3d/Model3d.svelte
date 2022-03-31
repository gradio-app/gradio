<script lang="ts">
	import Upload from "../../utils/Upload.svelte";
	import { _ } from "svelte-i18n";

	interface Data {
		data: string;
		name: string;
		size: number;
	}

	interface FileData {
		name: string;
		size: number;
		data: string;
		is_example: false;
	}

	export let value: Data;
	export let setValue: (val: null | Data) => null | Data;
	export let theme: string;

	function handle_load(v: string | FileData | (string | FileData)[] | null) {
		setValue(v as Data);
		return v;
	}

	import { onMount, afterUpdate } from "svelte";
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

{#if value === null}
	<Upload load={handle_load} {theme} filetype=".obj, .gltf, .glb">
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
