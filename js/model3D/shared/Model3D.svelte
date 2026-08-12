<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { dequal } from "dequal";
	import type Canvas3D from "./Canvas3D.svelte";
	import { create_renderer } from "./renderer.svelte";

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
	let canvas3d = $state<Canvas3D | undefined>();

	const model = create_renderer(() => value);
	const GaussianCanvas = $derived(model.gsplat_component);
	const BabylonCanvas = $derived(model.babylon_component);

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
			{#if model.renderer === "babylon"}
				<!-- Canvas3DGS doesn't implement the undo method (reset_camera_position) -->
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

		{#if model.renderer === "gsplat" && GaussianCanvas}
			<GaussianCanvas {value} {zoom_speed} {pan_speed} />
		{:else if model.renderer === "babylon" && BabylonCanvas}
			<BabylonCanvas
				bind:this={canvas3d}
				{value}
				{display_mode}
				{clear_color}
				{camera_position}
				{zoom_speed}
				{pan_speed}
				data={model.data}
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
