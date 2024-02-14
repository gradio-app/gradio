<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { dequal } from "dequal";

	export let value: FileData | null;
	export let clear_color: [number, number, number, number] = [0, 0, 0, 0];
	export let label = "";
	export let show_label: boolean;
	export let i18n: I18nFormatter;
	export let zoom_speed = 1;
	export let pan_speed = 1;
	// alpha, beta, radius
	export let camera_position: [number | null, number | null, number | null] = [
		null,
		null,
		null
	];

	let current_settings = { camera_position, zoom_speed, pan_speed };

	let canvas3dgs: any;
	let canvas3d: any;
	let use_3dgs = false;
	let resolved_url: string | undefined;

	async function loadCanvas3D(): Promise<any> {
		const module = await import("./Canvas3D.svelte");
		return module.default;
	}

	async function loadCanvas3DGS(): Promise<any> {
		const module = await import("./Canvas3DGS.svelte");
		return module.default;
	}

	function handle_undo(): void {
		canvas3d.reset_camera_position(camera_position, zoom_speed, pan_speed);
	}

	$: {
		if (
			!dequal(current_settings.camera_position, camera_position) ||
			current_settings.zoom_speed !== zoom_speed ||
			current_settings.pan_speed !== pan_speed
		) {
			canvas3d.reset_camera_position(camera_position, zoom_speed, pan_speed);
			current_settings = { camera_position, zoom_speed, pan_speed };
		}
	}

	$: {
		if (value) {
			use_3dgs = value?.path.endsWith(".splat") || value?.path.endsWith(".ply");
			if (use_3dgs) {
				loadCanvas3DGS().then((module) => {
					canvas3dgs = module;
				});
			} else {
				loadCanvas3D().then((module) => {
					canvas3d = module;
				});
			}
		}
	}
</script>

<BlockLabel
	{show_label}
	Icon={File}
	label={label || i18n("3D_model.3d_model")}
/>
{#if value}
	<div class="model3D">
		<div class="buttons">
			<IconButton Icon={Undo} label="Undo" on:click={() => handle_undo()} />
			<a
				href={resolved_url}
				target={window.__is_colab__ ? "_blank" : null}
				download={window.__is_colab__ ? null : value.orig_name || value.path}
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</a>
		</div>

		{#if use_3dgs}
			<svelte:component
				this={canvas3dgs}
				bind:resolved_url
				{value}
				{zoom_speed}
				{pan_speed}
			/>
		{:else}
			<svelte:component
				this={canvas3d}
				bind:resolved_url
				{value}
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
	}
	.model3D :global(canvas) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
	.buttons {
		display: flex;
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}
</style>
