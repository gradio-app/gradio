<script lang="ts">
	import type { FileData } from "@gradio/client";
	import type Canvas3D from "./Canvas3D.svelte";
	import Canvas3DComponent from "./Canvas3D.svelte";
	import Canvas3DGSComponent from "./Canvas3DGS.svelte";
	import { load_ply_point_cloud, type PointCloudData } from "./point-cloud";

	let {
		value,
		display_mode,
		clear_color,
		camera_position,
		zoom_speed,
		pan_speed
	}: {
		value: FileData;
		display_mode: "solid" | "point_cloud" | "wireframe";
		clear_color: [number, number, number, number];
		camera_position: [number | null, number | null, number | null];
		zoom_speed: number;
		pan_speed: number;
	} = $props();

	let canvas3d = $state<Canvas3D | undefined>();
	let point_cloud = $state<PointCloudData | null>(null);
	let renderer = $state<"loading" | "point_cloud" | "gs">("loading");
	let loaded_url: string | undefined;

	$effect(() => {
		if (!value?.url || value.url === loaded_url) return;

		const load_url = value.url;
		loaded_url = load_url;
		renderer = "loading";
		point_cloud = null;

		load_ply_point_cloud(load_url)
			.then((loaded_point_cloud) => {
				if (loaded_url !== load_url) return;
				point_cloud = loaded_point_cloud;
				renderer = loaded_point_cloud ? "point_cloud" : "gs";
			})
			.catch(() => {
				if (loaded_url === load_url) {
					renderer = "gs";
				}
			});
	});

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

{#if renderer === "point_cloud" && point_cloud}
	<Canvas3DComponent
		bind:this={canvas3d}
		{value}
		{display_mode}
		{clear_color}
		{camera_position}
		{zoom_speed}
		{pan_speed}
		{point_cloud}
	/>
{:else if renderer === "gs"}
	<Canvas3DGSComponent {value} {zoom_speed} {pan_speed} />
{/if}
