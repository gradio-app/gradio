<script lang="ts">
	import { onMount, untrack } from "svelte";
	import * as SPLAT from "gsplat";
	import type { FileData } from "@gradio/client";

	let {
		value,
		zoom_speed,
		pan_speed
	}: {
		value: FileData;
		zoom_speed: number;
		pan_speed: number;
	} = $props();

	let path = $derived(value?.path);

	let canvas: HTMLCanvasElement;
	let scene: SPLAT.Scene;
	let camera: SPLAT.Camera;
	let renderer: SPLAT.WebGLRenderer | null = null;
	let controls: SPLAT.OrbitControls;
	let mounted = false;
	let frameId: number | null = null;
	let active_path: string | undefined;
	let load_token = 0;

	let loading = $state(false);
	let error = $state<string | null>(null);

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

	async function reset_scene(target_url: string): Promise<void> {
		const token = ++load_token;
		stop_frame();

		if (renderer !== null) {
			try {
				renderer.dispose();
			} catch (err) {
				console.warn("Model3D: renderer dispose failed", err);
			}
			renderer = null;
		}

		try {
			scene = new SPLAT.Scene();
			camera = new SPLAT.Camera();
			renderer = new SPLAT.WebGLRenderer(canvas);
			controls = new SPLAT.OrbitControls(camera, canvas);
			controls.zoomSpeed = zoom_speed;
			controls.panSpeed = pan_speed;
		} catch (err) {
			error = (err as Error).message || "Failed to initialise 3D viewer";
			console.error("Model3D: scene init failed", err);
			return;
		}

		loading = true;
		error = null;
		try {
			if (target_url.endsWith(".ply")) {
				await SPLAT.PLYLoader.LoadAsync(target_url, scene, undefined);
			} else if (target_url.endsWith(".splat")) {
				await SPLAT.Loader.LoadAsync(target_url, scene, undefined);
			} else {
				throw new Error("Unsupported file type");
			}
			if (token !== load_token) return;
			loading = false;
			start_frame();
		} catch (err) {
			if (token !== load_token) return;
			loading = false;
			error = (err as Error).message || "Failed to load 3D model";
			console.error("Model3D: failed to load", err);
		}
	}

	onMount(() => {
		mounted = true;

		return () => {
			load_token++;
			stop_frame();
			if (renderer) {
				try {
					renderer.dispose();
				} catch {
					/* noop */
				}
				renderer = null;
			}
		};
	});

	$effect(() => {
		const next = path;
		if (!next) return;
		if (!canvas) return;
		if (next === active_path) return;
		active_path = next;
		untrack(() => {
			if (mounted) reset_scene(next);
		});
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
