<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	export let value: FileData | null;
	export let clearColor: Array<number>;
	export let label: string = "";
	export let show_label: boolean;

	import { onMount, afterUpdate } from "svelte";
	import * as BABYLON from "babylonjs";
	import * as BABYLON_LOADERS from "babylonjs-loaders";

	BABYLON_LOADERS.OBJFileLoader.IMPORT_VERTEX_COLORS = true;

	let canvas: HTMLCanvasElement;
	let scene: BABYLON.Scene;
	let engine: BABYLON.Engine | null;

	onMount(() => {
		engine = new BABYLON.Engine(canvas, true);
		window.addEventListener("resize", () => {
			engine?.resize();
		});
	});

	afterUpdate(() => {
		if (scene) {
			scene.dispose();
			engine?.stopRenderLoop();
			engine?.dispose();
			engine = null;
			engine = new BABYLON.Engine(canvas, true);
			window.addEventListener("resize", () => {
				engine?.resize();
			});
		}
		addNewModel();
	});

	function addNewModel() {
		scene = new BABYLON.Scene(engine!);
		scene.createDefaultCameraOrLight();
		scene.clearColor = clearColor
			? (scene.clearColor = new BABYLON.Color4(
					clearColor[0],
					clearColor[1],
					clearColor[2],
					clearColor[3]
			  ))
			: new BABYLON.Color4(0.2, 0.2, 0.2, 1);

		engine?.runRenderLoop(() => {
			scene.render();
		});

		if (!value) return;

		let url: string;
		if (value.is_file) {
			url = value.data;
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
			"." + value["name"].split(".")[1]
		);
	}
</script>

<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

{#if value}
	<canvas class="w-full h-full object-contain" bind:this={canvas} />
{:else}
	<div class="h-full min-h-[16rem] flex justify-center items-center">
		<div class="h-10 dark:text-white opacity-50"><File /></div>
	</div>
{/if}
