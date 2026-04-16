<script lang="ts">
	import { onMount } from "svelte";
	import * as SPLAT from "gsplat";
	import type { FileData } from "@gradio/client";
	import PlyWorker from "./ply.worker.ts?worker";
	import type { ParseResponse } from "./ply.worker";

	let {
		value,
		zoom_speed,
		pan_speed
	}: {
		value: FileData;
		zoom_speed: number;
		pan_speed: number;
	} = $props();

	let url = $derived(value?.url);
	let path = $derived(value?.path);

	let canvas: HTMLCanvasElement;
	let scene: SPLAT.Scene;
	let camera: SPLAT.Camera;
	let renderer = $state<SPLAT.WebGLRenderer | null>(null);
	let controls: SPLAT.OrbitControls;
	let mounted = $state(false);
	let frameId: number | null = null;
	let abort: AbortController | null = null;
	let worker: Worker | null = null;

	let loading = $state(false);
	let error = $state<string | null>(null);

	function dispose_load(): void {
		abort?.abort();
		abort = null;
		worker?.terminate();
		worker = null;
	}

	function stop_frame(): void {
		if (frameId !== null) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}
	}

	function start_frame(): void {
		if (frameId !== null) return;
		const tick = (): void => {
			if (!renderer) {
				frameId = null;
				return;
			}
			controls.update();
			renderer.render(scene, camera);
			frameId = requestAnimationFrame(tick);
		};
		frameId = requestAnimationFrame(tick);
	}

	async function load_ply(target_url: string): Promise<void> {
		const controller = new AbortController();
		abort = controller;
		const res = await fetch(target_url, { signal: controller.signal });
		if (!res.ok) throw new Error(`Failed to fetch .ply (${res.status})`);
		const buffer = await res.arrayBuffer();
		if (controller.signal.aborted) return;

		const w = new PlyWorker();
		worker = w;

		await new Promise<void>((resolve, reject) => {
			controller.signal.addEventListener("abort", () => {
				w.terminate();
				reject(new DOMException("Aborted", "AbortError"));
			});
			w.onmessage = (e: MessageEvent<ParseResponse>) => {
				if (controller.signal.aborted) return;
				if (!e.data.ok) {
					reject(new Error(e.data.error));
					return;
				}
				try {
					const splat_data = SPLAT.SplatData.Deserialize(e.data.data);
					const splat = new SPLAT.Splat(splat_data);
					scene.addObject(splat);
					resolve();
				} catch (err) {
					reject(err);
				}
			};
			w.onerror = (e) => reject(new Error(e.message || "Worker error"));
			w.postMessage({ buffer, format: "" }, [buffer]);
		});
	}

	async function load(target_url: string): Promise<void> {
		if (target_url.endsWith(".ply")) {
			await load_ply(target_url);
		} else if (target_url.endsWith(".splat")) {
			const controller = new AbortController();
			abort = controller;
			await SPLAT.Loader.LoadAsync(target_url, scene, undefined);
			if (controller.signal.aborted) return;
		} else {
			throw new Error("Unsupported file type");
		}
	}

	async function reset_scene(): Promise<void> {
		dispose_load();
		stop_frame();

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

		if (!url) return;

		loading = true;
		error = null;
		const target_url = url;
		try {
			await load(target_url);
			if (url !== target_url) return;
			loading = false;
			start_frame();
		} catch (err) {
			if ((err as Error).name === "AbortError") return;
			loading = false;
			error = (err as Error).message || "Failed to load 3D model";
			console.error("Model3D: failed to load", err);
		}
	}

	onMount(() => {
		if (value != null) {
			reset_scene();
		}
		mounted = true;

		return () => {
			dispose_load();
			stop_frame();
			if (renderer) {
				renderer.dispose();
				renderer = null;
			}
		};
	});

	$effect(() => {
		if (canvas && mounted && path) {
			reset_scene();
		}
	});
</script>

<div class="canvas-wrap">
	<canvas bind:this={canvas}></canvas>
	{#if loading}
		<div class="overlay" data-testid="model3d-loading">
			<div class="spinner"></div>
			<div class="overlay-label">Loading 3D model…</div>
		</div>
	{:else if error}
		<div class="overlay error" data-testid="model3d-error" role="alert">
			<div class="overlay-label">{error}</div>
		</div>
	{/if}
</div>

<style>
	.canvas-wrap {
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
	}
	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
		background: var(--block-background-fill);
		color: var(--body-text-color);
		pointer-events: none;
	}
	.overlay.error {
		color: var(--error-text-color, var(--color-red-600));
		padding: var(--size-4);
		text-align: center;
	}
	.overlay-label {
		font-size: var(--text-sm);
	}
	.spinner {
		width: 28px;
		height: 28px;
		border: 3px solid var(--border-color-primary);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.9s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
