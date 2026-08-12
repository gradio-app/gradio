<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { dequal } from "dequal";
	import type Canvas3DGS from "./Canvas3DGS.svelte";
	import type Canvas3D from "./Canvas3D.svelte";
	import { resolve_ply_source, type PlySource } from "./ply";

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
	let ply_data = $state<Uint8Array<ArrayBuffer>>();
	let Canvas3DGSComponent = $state<typeof Canvas3DGS>();
	let Canvas3DComponent = $state<typeof Canvas3D>();
	let canvas3d = $state<Canvas3D | undefined>();

	async function loadCanvas3D(): Promise<typeof Canvas3D> {
		const module = await import("./Canvas3D.svelte");
		return module.default;
	}
	async function loadCanvas3DGS(): Promise<typeof Canvas3DGS> {
		const module = await import("./Canvas3DGS.svelte");
		return module.default;
	}

	$effect(() => {
		const file = value;
		if (!file) return;

		const is_splat = file.path.endsWith(".splat");
		const is_ply = file.path.endsWith(".ply");
		// Assume a .ply is a splat until its header says otherwise, so the
		// toolbar doesn't change once the header has been read.
		use_3dgs = is_splat || is_ply;

		let stale = false;
		const use = (source: PlySource): void => {
			if (stale) return;
			use_3dgs = source.renderer === "gsplat";
			ply_data = source.renderer === "babylon" ? source.data : undefined;
			if (use_3dgs) {
				loadCanvas3DGS().then((component) => {
					Canvas3DGSComponent = component;
				});
			} else {
				loadCanvas3D().then((component) => {
					Canvas3DComponent = component;
				});
			}
		};

		if (is_ply && file.url) {
			resolve_ply_source(file.url).then(use);
		} else {
			use({ renderer: is_splat || is_ply ? "gsplat" : "babylon" });
		}

		return () => {
			stale = true;
		};
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
			{#if !use_3dgs}
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

		{#if use_3dgs}
			<Canvas3DGSComponent {value} {zoom_speed} {pan_speed} />
		{:else}
			<Canvas3DComponent
				bind:this={canvas3d}
				{value}
				{display_mode}
				{clear_color}
				{camera_position}
				{zoom_speed}
				{pan_speed}
				data={ply_data}
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
