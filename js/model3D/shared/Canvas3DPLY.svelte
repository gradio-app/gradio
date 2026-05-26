<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { onDestroy } from "svelte";
	import type Canvas3D from "./Canvas3D.svelte";
	import type Canvas3DGS from "./Canvas3DGS.svelte";
	import { load_ply_point_cloud, type PointCloudData } from "./point-cloud";

	let {
		value,
		display_mode,
		clear_color,
		camera_position,
		zoom_speed,
		pan_speed,
		reset_camera_available = $bindable(false)
	}: {
		value: FileData;
		display_mode: "solid" | "point_cloud" | "wireframe";
		clear_color: [number, number, number, number];
		camera_position: [number | null, number | null, number | null];
		zoom_speed: number;
		pan_speed: number;
		reset_camera_available?: boolean;
	} = $props();

	let canvas3d = $state<Canvas3D | undefined>();
	let Canvas3DComponent = $state<typeof Canvas3D>();
	let Canvas3DGSComponent = $state<typeof Canvas3DGS>();
	let point_cloud = $state<PointCloudData | null>(null);
	let gs_value = $state<FileData | undefined>();
	let renderer = $state<"loading" | "point_cloud" | "gs">("loading");
	let loaded_url: string | undefined;
	let fallback_url: string | undefined;
	let loadToken = 0;

	async function loadCanvas3D(): Promise<typeof Canvas3D> {
		const module = await import("./Canvas3D.svelte");
		return module.default;
	}

	async function loadCanvas3DGS(): Promise<typeof Canvas3DGS> {
		const module = await import("./Canvas3DGS.svelte");
		return module.default;
	}

	function revoke_object_url(url: string | undefined): void {
		if (
			url &&
			typeof URL !== "undefined" &&
			typeof URL.revokeObjectURL === "function"
		) {
			URL.revokeObjectURL(url);
		}
	}

	function revoke_fallback_url(): void {
		revoke_object_url(fallback_url);
		fallback_url = undefined;
	}

	$effect(() => {
		if (!value?.url) {
			loadToken++;
			loaded_url = undefined;
			revoke_fallback_url();
			gs_value = undefined;
			renderer = "loading";
			point_cloud = null;
			reset_camera_available = false;
			return;
		}
		if (value.url === loaded_url) return;

		const load_url = value.url;
		const currentToken = ++loadToken;
		loaded_url = load_url;
		revoke_fallback_url();
		gs_value = value;
		renderer = "loading";
		point_cloud = null;
		reset_camera_available = false;

		void load_renderer(load_url, currentToken);
	});

	async function load_renderer(
		load_url: string,
		currentToken: number
	): Promise<void> {
		let pending_fallback_url: string | undefined;
		try {
			const loaded = await load_ply_point_cloud(load_url);
			pending_fallback_url = loaded.fallback_url;
			if (currentToken !== loadToken) {
				revoke_object_url(pending_fallback_url);
				pending_fallback_url = undefined;
				return;
			}

			point_cloud = loaded.point_cloud;
			if (loaded.point_cloud) {
				Canvas3DComponent ??= await loadCanvas3D();
				if (currentToken !== loadToken) return;
				renderer = "point_cloud";
				reset_camera_available = true;
			} else {
				Canvas3DGSComponent ??= await loadCanvas3DGS();
				if (currentToken !== loadToken) {
					revoke_object_url(pending_fallback_url);
					pending_fallback_url = undefined;
					return;
				}
				if (loaded.fallback_url) {
					revoke_fallback_url();
					fallback_url = loaded.fallback_url;
					pending_fallback_url = undefined;
					gs_value = { ...value, url: loaded.fallback_url };
				} else {
					gs_value = value;
				}
				renderer = "gs";
				reset_camera_available = false;
			}
		} catch {
			revoke_object_url(pending_fallback_url);
			if (currentToken !== loadToken) return;
			Canvas3DGSComponent ??= await loadCanvas3DGS();
			if (currentToken !== loadToken) return;
			renderer = "gs";
			reset_camera_available = false;
		}
	}

	onDestroy(revoke_fallback_url);

	export function update_camera(
		camera_position: [number | null, number | null, number | null],
		zoom_speed: number,
		pan_speed: number
	): void {
		canvas3d?.update_camera(camera_position, zoom_speed, pan_speed);
	}

	export function reset_camera_position(): void {
		canvas3d?.reset_camera_position();
	}
</script>

{#if renderer === "point_cloud" && point_cloud && Canvas3DComponent}
	<svelte:component
		this={Canvas3DComponent}
		bind:this={canvas3d}
		{value}
		{display_mode}
		{clear_color}
		{camera_position}
		{zoom_speed}
		{pan_speed}
		{point_cloud}
	/>
{:else if renderer === "gs" && Canvas3DGSComponent && gs_value}
	<svelte:component
		this={Canvas3DGSComponent}
		value={gs_value}
		{zoom_speed}
		{pan_speed}
	/>
{/if}
