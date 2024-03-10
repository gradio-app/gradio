<script lang="ts">
	import { onMount } from "svelte";
	import * as SPLAT from "gsplat";
	import type { FileData } from "@gradio/client";
	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let value: FileData;
	export let zoom_speed: number;
	export let pan_speed: number;

	$: url = value.url;

	/* URL resolution for the Wasm mode. */
	export let resolved_url: typeof url = undefined; // Exposed to be bound to the download link in the parent component.
	// The prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved url for the old `url` has to be discarded,
	// This variable `latest_url` is used to pick up only the value resolved for the latest `url`.
	let latest_url: typeof url;
	$: {
		// In normal (non-Wasm) Gradio, the original `url` should be used immediately
		// without waiting for `resolve_wasm_src()` to resolve.
		// If it waits, a blank element is displayed until the async task finishes
		// and it leads to undesirable flickering.
		// So set `resolved_url` immediately above, and update it with the resolved values below later.
		resolved_url = url;

		if (url) {
			latest_url = url;
			const resolving_url = url;
			resolve_wasm_src(url).then((resolved) => {
				if (latest_url === resolving_url) {
					resolved_url = resolved ?? undefined;
				} else {
					resolved && URL.revokeObjectURL(resolved);
				}
			});
		}
	}

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
			if (!resolved_url) {
				throw new Error("No resolved URL");
			}
			loading = true;
			if (resolved_url.endsWith(".ply")) {
				await SPLAT.PLYLoader.LoadAsync(resolved_url, scene, undefined);
			} else if (resolved_url.endsWith(".splat")) {
				await SPLAT.Loader.LoadAsync(resolved_url, scene, undefined);
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
