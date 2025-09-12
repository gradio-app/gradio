<script lang="ts">
	import { onMount } from "svelte";
	import * as SPLAT from "gsplat";
	import type { FileData } from "@gradio/client";

	export let value: FileData;
	export let zoom_speed: number;
	export let pan_speed: number;

	$: url = value.url;

	let canvas: HTMLCanvasElement;
	let scene: SPLAT.Scene;
	let camera: SPLAT.Camera;
	let renderer: SPLAT.WebGLRenderer | null = null;
	let controls: SPLAT.OrbitControls;
	let mounted = false;
	let frameId: number | null = null;

	function reset_scene(): void {
		if (frameId !== null) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}

		if (renderer !== null) {
			renderer.dispose();
			renderer = null;
		}

		scene = new SPLAT.Scene();
		camera = new SPLAT.Camera();
		renderer = new SPLAT.WebGLRenderer(canvas);
		controls = new SPLAT.OrbitControls(camera, canvas);
		controls.zoomSpeed = zoom_speed;
		controls.panSpeed = pan_speed;

		if (!value) {
			return;
		}

		let loading = false;
		const load = async (): Promise<void> => {
			if (loading) {
				console.error("Already loading");
				return;
			}
			if (!url) {
				throw new Error("No resolved URL");
			}
			loading = true;
			if (url.endsWith(".ply")) {
				await SPLAT.PLYLoader.LoadAsync(url, scene, undefined);
			} else if (url.endsWith(".splat")) {
				await SPLAT.Loader.LoadAsync(url, scene, undefined);
			} else {
				throw new Error("Unsupported file type");
			}
			loading = false;
		};

		const frame = (): void => {
			if (!renderer) {
				return;
			}

			if (loading) {
				frameId = requestAnimationFrame(frame);
				return;
			}

			controls.update();
			renderer.render(scene, camera);

			frameId = requestAnimationFrame(frame);
		};

		load();
		frameId = requestAnimationFrame(frame);
	}

	onMount(() => {
		if (value != null) {
			reset_scene();
		}
		mounted = true;

		return () => {
			if (renderer) {
				renderer.dispose();
			}
		};
	});

	$: ({ path } = value || {
		path: undefined
	});

	$: canvas && mounted && path && reset_scene();
</script>

<canvas bind:this={canvas}></canvas>
