<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { dequal } from "dequal";
	import {
		load_renderer_component,
		model3d_renderer_loaders,
		renderer_for_model3d_path,
		type Canvas3DComponentType,
		type Canvas3DGSComponentType,
		type Canvas3DLike,
		type Canvas3DPLYComponentType,
		type Model3DCanvasComponent
	} from "./renderer-loader";

	let {
		value,
		display_mode = "solid",
		clear_color = [0, 0, 0, 0],
		label = "",
		show_label,
		i18n,
		zoom_speed = 1,
		pan_speed = 1,
		camera_position = [null, null, null],
		has_change_history = false
	}: {
		value: FileData | null;
		display_mode?: "solid" | "point_cloud" | "wireframe";
		clear_color?: [number, number, number, number];
		label?: string;
		show_label: boolean;
		i18n: I18nFormatter;
		zoom_speed?: number;
		pan_speed?: number;
		camera_position?: [number | null, number | null, number | null];
		has_change_history?: boolean;
	} = $props();

	let current_settings = $state({ camera_position, zoom_speed, pan_speed });
	let use_3dgs = $state(false);
	let use_ply = $state(false);
	let Canvas3DGSComponent = $state<Canvas3DGSComponentType>();
	let Canvas3DPLYComponent = $state<Canvas3DPLYComponentType>();
	let Canvas3DComponent = $state<Canvas3DComponentType>();
	let canvas3d = $state<Canvas3DLike | undefined>();
	let reset_camera_available = $state(false);

	$effect(() => {
		if (!value) {
			use_ply = false;
			use_3dgs = false;
			reset_camera_available = false;
			return;
		}

		const renderer = renderer_for_model3d_path(value.path);
		use_ply = renderer === "ply";
		use_3dgs = renderer !== "mesh";
		reset_camera_available = false;

		return load_renderer_component<Model3DCanvasComponent>(
			renderer,
			model3d_renderer_loaders,
			(renderer, component) => {
				if (renderer === "ply") {
					Canvas3DPLYComponent = component as Canvas3DPLYComponentType;
				} else if (renderer === "splat") {
					Canvas3DGSComponent = component as Canvas3DGSComponentType;
				} else {
					Canvas3DComponent = component as Canvas3DComponentType;
				}
			}
		);
	});

	function handle_undo(): void {
		canvas3d?.reset_camera_position();
	}

	$effect(() => {
		if (
			!dequal(current_settings.camera_position, camera_position) ||
			current_settings.zoom_speed !== zoom_speed ||
			current_settings.pan_speed !== pan_speed
		) {
			canvas3d?.update_camera(camera_position, zoom_speed, pan_speed);
			current_settings = { camera_position, zoom_speed, pan_speed };
		}
	});
</script>

<BlockLabel
	{show_label}
	Icon={File}
	label={label || i18n("3D_model.3d_model")}
/>
{#if value}
	<div class="model3D" data-testid="model3d">
		<IconButtonWrapper>
			{#if !use_3dgs || (use_ply && reset_camera_available)}
				<!-- Canvas3DGS is the only renderer here without reset_camera_position. -->
				<IconButton
					Icon={Undo}
					label="Undo"
					onclick={() => handle_undo()}
					disabled={!has_change_history}
				/>
			{/if}
			<a
				href={value.url}
				target={window.__is_colab__ ? "_blank" : null}
				download={window.__is_colab__ ? null : value.orig_name || value.path}
				data-testid="model3d-download-link"
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</a>
		</IconButtonWrapper>

		{#if use_ply}
			<svelte:component
				this={Canvas3DPLYComponent}
				bind:this={canvas3d}
				{value}
				{display_mode}
				{clear_color}
				{camera_position}
				{zoom_speed}
				{pan_speed}
				bind:reset_camera_available
			/>
		{:else if use_3dgs}
			<svelte:component
				this={Canvas3DGSComponent}
				{value}
				{zoom_speed}
				{pan_speed}
			/>
		{:else}
			<svelte:component
				this={Canvas3DComponent}
				bind:this={canvas3d}
				{value}
				{display_mode}
				{clear_color}
				{camera_position}
				{zoom_speed}
				{pan_speed}
			/>
		{/if}
	</div>
{/if}

<style>
	.model3D {
		display: flex;
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
		border-radius: var(--block-radius);
		overflow: hidden;
	}
	.model3D :global(canvas) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
</style>
