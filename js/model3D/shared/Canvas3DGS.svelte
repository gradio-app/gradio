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

	let url = $derived(value?.url);

	let canvas: HTMLCanvasElement;
	let scene: SPLAT.Scene;
	let camera: SPLAT.Camera;
	let renderer: SPLAT.WebGLRenderer | null = null;
	let controls: SPLAT.OrbitControls;
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

	function normalize_ply_buffer(buffer: ArrayBuffer): ArrayBuffer {
		const bytes = new Uint8Array(buffer);
		let offset = 0;
		if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
			offset = 3;
		}
		if (
			bytes[offset] === 0x70 &&
			bytes[offset + 1] === 0x6c &&
			bytes[offset + 2] === 0x79 &&
			bytes[offset + 3] === 0x0d &&
			bytes[offset + 4] === 0x0a
		) {
			const out = new Uint8Array(bytes.length - offset - 1);
			out.set(bytes.subarray(offset, offset + 3), 0);
			out[3] = 0x0a;
			out.set(bytes.subarray(offset + 5), 4);
			return out.buffer;
		}
		if (offset > 0) {
			return bytes.subarray(offset).slice().buffer;
		}
		return buffer;
	}

	async function load_ply(target_url: string): Promise<void> {
		const res = await fetch(target_url);
		if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
		const buffer = await res.arrayBuffer();
		const normalized = normalize_ply_buffer(buffer);
		try {
			SPLAT.PLYLoader.LoadFromArrayBuffer(normalized, scene);
		} catch (err) {
			const bytes = new Uint8Array(normalized);
			const head = Array.from(bytes.slice(0, 16))
				.map((b) => b.toString(16).padStart(2, "0"))
				.join(" ");
			const sample = new TextDecoder().decode(bytes.slice(0, 500));
			console.error(
				`Model3D: PLY parse failed. url=${target_url} size=${bytes.length} first16=${head} sample=${JSON.stringify(sample)}`
			);
			throw err;
		}
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
				await load_ply(target_url);
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
		const next = url;
		if (!next) return;
		if (!canvas) return;
		if (next === active_path) return;
		active_path = next;
		untrack(() => reset_scene(next));
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
