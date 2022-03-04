<script lang="ts">
	import type { FileData } from "./types";
	import Upload from "../../utils/Upload.svelte";
	import ModifyUpload from "../../utils/ModifyUpload.svelte";
	import { prettyBytes } from "../../utils/helpers";
	import { _ } from "svelte-i18n";

	export let value: null | FileData | Array<FileData>;
	export let setValue: (
		val: Array<string | FileData> | string | FileData | null
	) => Array<string | FileData> | string | FileData | null;
	export let file_count: "single" | "multiple" | "directory";
	export let theme: string;
	export let static_src: string;

	import { onMount, afterUpdate} from 'svelte';
  import * as BABYLON from 'babylonjs';
  import 'babylonjs-loaders'
    
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
    
    window.addEventListener('resize', () => {
      engine.resize();
    });

    let base64_model_content = value["data"];
    let raw_content = BABYLON.Tools.DecodeBase64(base64_model_content);
    let blob = new Blob([raw_content]);
    let url = URL.createObjectURL(blob);
    BABYLON.SceneLoader.Append("", url, scene, () => {
      scene.createDefaultCamera(true, true, true);
    }, undefined, undefined, "." + value["name"].split(".")[1]);
  }
</script>

	{#if value === null}
	<Upload load={setValue} {theme} {file_count}>
		{$_("interface.drop_file")}
		<br />- {$_("interface.or")} -<br />
		{$_("interface.click_to_upload")}
	</Upload>
	{:else}
		<canvas class="w-full h-full object-fit" bind:this={canvas}></canvas>
	{/if}

<style lang="postcss">
</style>
