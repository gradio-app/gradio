<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { BlockLabel, IconButton, IconButtonWrapper } from "@gradio/atoms";
	import { File, Download, Undo } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import { dequal } from "dequal";
	import type CanvasRobot from "./CanvasRobot.svelte";

	let {
		value,
		joint_states = null,
		clear_color = [0, 0, 0, 0],
		camera_position = [null, null, null],
		zoom_speed = 1,
		pan_speed = 1,
		show_joint_names = false,
		label = "",
		show_label,
		i18n,
		has_change_history = false
	}: {
		value: FileData | null;
		joint_states?: Record<string, number> | null;
		clear_color?: [number, number, number, number];
		camera_position?: [number | null, number | null, number | null];
		zoom_speed?: number;
		pan_speed?: number;
		show_joint_names?: boolean;
		label?: string;
		show_label: boolean;
		i18n: I18nFormatter;
		has_change_history?: boolean;
	} = $props();

	let CanvasRobotComponent = $state<typeof CanvasRobot>();
	let canvas_robot = $state<CanvasRobot | undefined>();
	let current_settings = $state({ camera_position, zoom_speed, pan_speed });

	$effect(() => {
		if (value) {
			import("./CanvasRobot.svelte").then((module) => {
				CanvasRobotComponent = module.default;
			});
		}
	});

	$effect(() => {
		if (
			!dequal(current_settings.camera_position, camera_position) ||
			current_settings.zoom_speed !== zoom_speed ||
			current_settings.pan_speed !== pan_speed
		) {
			canvas_robot?.update_camera(camera_position, zoom_speed, pan_speed);
			current_settings = { camera_position, zoom_speed, pan_speed };
		}
	});

	function handle_undo(): void {
		canvas_robot?.reset_camera_position();
	}
</script>

<BlockLabel
	{show_label}
	Icon={File}
	label={label || "Robot Viewer"}
/>
{#if value}
	<div class="robot-viewer" data-testid="robot-viewer">
		<IconButtonWrapper>
			<IconButton
				Icon={Undo}
				label="Reset camera"
				onclick={() => handle_undo()}
				disabled={!has_change_history}
			/>
			<a
				href={value.url}
				target={window.__is_colab__ ? "_blank" : null}
				download={window.__is_colab__ ? null : value.orig_name || value.path}
			>
				<IconButton Icon={Download} label={i18n("common.download")} />
			</a>
		</IconButtonWrapper>

		<svelte:component
			this={CanvasRobotComponent}
			bind:this={canvas_robot}
			{value}
			{joint_states}
			{clear_color}
			{camera_position}
			{zoom_speed}
			{pan_speed}
			{show_joint_names}
		/>
	</div>
{/if}

<style>
	.robot-viewer {
		display: flex;
		position: relative;
		width: var(--size-full);
		height: var(--size-full);
		border-radius: var(--block-radius);
		overflow: hidden;
	}
	.robot-viewer :global(canvas) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
</style>
