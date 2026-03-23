<script lang="ts">
	import { tick } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData, Client } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import type CanvasRobot from "./CanvasRobot.svelte";

	let {
		value = $bindable(),
		joint_states = null,
		clear_color = [0, 0, 0, 0],
		camera_position = [null, null, null],
		zoom_speed = 1,
		pan_speed = 1,
		show_joint_names = false,
		label = "",
		show_label,
		root,
		i18n,
		max_file_size = null,
		uploading = $bindable(),
		upload_promise = $bindable(),
		upload,
		stream_handler,
		onchange,
		onclear,
		ondrag,
		onload,
		onerror
	}: {
		value?: FileData | null;
		joint_states?: Record<string, number> | null;
		clear_color?: [number, number, number, number];
		camera_position?: [number | null, number | null, number | null];
		zoom_speed?: number;
		pan_speed?: number;
		show_joint_names?: boolean;
		label?: string;
		show_label: boolean;
		root: string;
		i18n: I18nFormatter;
		max_file_size?: number | null;
		uploading?: boolean;
		upload_promise?: Promise<(FileData | null)[]> | null;
		upload: Client["upload"];
		stream_handler: Client["stream"];
		onchange?: (value: FileData | null) => void;
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onload?: (value: FileData) => void;
		onerror?: (error: string) => void;
	} = $props();

	let CanvasRobotComponent = $state<typeof CanvasRobot>();
	let canvas_robot = $state<CanvasRobot | undefined>();
	let dragging = $state(false);

	$effect(() => {
		if (value) {
			import("./CanvasRobot.svelte").then((module) => {
				CanvasRobotComponent = module.default;
			});
		}
	});

	$effect(() => {
		ondrag?.(dragging);
	});

	async function handle_upload(detail: FileData): Promise<void> {
		value = detail;
		await tick();
		onchange?.(value);
		onload?.(value as FileData);
	}

	async function handle_clear(): Promise<void> {
		value = null;
		await tick();
		onclear?.();
		onchange?.(null);
	}

	function handle_undo(): void {
		canvas_robot?.reset_camera_position();
	}

	function handle_error(error: string): void {
		onerror?.(error);
	}
</script>

<BlockLabel {show_label} Icon={File} label={label || "Robot Viewer"} />

{#if value == null}
	<Upload
		bind:upload_promise
		{upload}
		{stream_handler}
		onload={handle_upload}
		{root}
		{max_file_size}
		filetype={[".urdf", ".xml", ".mjcf"]}
		bind:dragging
		bind:uploading
		onerror={handle_error}
		aria_label="Drop robot file to upload"
	>
		<slot />
	</Upload>
{:else}
	<div class="input-model">
		<ModifyUpload
			undoable={true}
			onclear={handle_clear}
			{i18n}
			onundo={handle_undo}
		/>

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
	.input-model {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
		border-radius: var(--block-radius);
		overflow: hidden;
	}

	.input-model :global(canvas) {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
		overflow: hidden;
	}
</style>
