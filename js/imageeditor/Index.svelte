<svelte:options accessors={true} immutable={true} />

<script lang="ts">
	import type { Brush, Eraser } from "./shared/brush/types";
	import type { EditorData, ImageBlobs } from "./InteractiveImageEditor.svelte";

	import { FileData } from "@gradio/client";

	import type { Gradio, SelectData } from "@gradio/utils";
	import { BaseStaticImage as StaticImage } from "@gradio/image";
	import InteractiveImageEditor from "./InteractiveImageEditor.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { tick } from "svelte";
	import type {
		LayerOptions,
		Transform,
		Source,
		WebcamOptions
	} from "./shared/types";
	import type { CommandNode } from "./shared/core/commands";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: EditorData | null = {
		background: null,
		layers: [],
		composite: null
	};
	export let label: string;
	export let show_label: boolean;
	export let show_download_button: boolean;
	export let root: string;
	export let value_is_output = false;

	export let height = 350;
	export let width: number | undefined;

	export let _selectable = false;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let show_share_button = false;
	export let sources: Source[] = [];
	export let interactive: boolean;
	export let placeholder: string | undefined;
	export let brush: Brush;
	export let eraser: Eraser;
	export let transforms: Transform[] = [];
	export let layers: LayerOptions;
	export let attached_events: string[] = [];
	export let server: {
		accept_blobs: (a: any) => void;
	};
	export let canvas_size: [number, number];
	export let fixed_canvas = false;
	export let show_fullscreen_button = true;
	export let full_history: CommandNode | null = null;
	export let gradio: Gradio<{
		change: never;
		error: string;
		input: never;
		edit: never;
		drag: never;
		apply: never;
		upload: never;
		clear: never;
		select: SelectData;
		share: ShareData;
		clear_status: LoadingStatus;
	}>;
	export let border_region = 0;
	export let webcam_options: WebcamOptions;
	export let theme_mode: "dark" | "light";

	let editor_instance: InteractiveImageEditor;
	let image_id: null | string = null;

	export async function get_value(): Promise<ImageBlobs | { id: string }> {
		if (image_id) {
			const val = { id: image_id };
			image_id = null;
			return val;
		}

		const blobs = await editor_instance.get_data();

		return blobs;
	}

	let is_dragging: boolean;
	$: value && handle_change();
	const is_browser = typeof window !== "undefined";
	const raf = is_browser
		? window.requestAnimationFrame
		: (cb: (...args: any[]) => void) => cb();

	function wait_for_next_frame(): Promise<void> {
		return new Promise((resolve) => {
			raf(() => raf(() => resolve()));
		});
	}

	async function handle_change(): Promise<void> {
		await wait_for_next_frame();

		if (
			value &&
			(value.background || value.layers?.length || value.composite)
		) {
			gradio.dispatch("change");
		}
	}

	function handle_save(): void {
		gradio.dispatch("apply");
	}

	function handle_history_change(): void {
		gradio.dispatch("change");
		if (!value_is_output) {
			gradio.dispatch("input");
			tick().then((_) => (value_is_output = false));
		}
	}

	$: has_value = value?.background || value?.layers?.length || value?.composite;

	$: normalised_background = value?.background
		? new FileData(value.background)
		: null;
	$: normalised_composite = value?.composite
		? new FileData(value.composite)
		: null;
	$: normalised_layers =
		value?.layers?.map((layer) => new FileData(layer)) || [];
</script>

{#if !interactive}
	<Block
		{visible}
		variant={"solid"}
		border_mode={is_dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		{height}
		{width}
		allow_overflow={true}
		overflow_behavior="visible"
		{container}
		{scale}
		{min_width}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
		<StaticImage
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			value={value?.composite || null}
			{label}
			{show_label}
			{show_download_button}
			selectable={_selectable}
			{show_share_button}
			i18n={gradio.i18n}
			{show_fullscreen_button}
		/>
	</Block>
{:else}
	<Block
		{visible}
		variant={has_value ? "solid" : "dashed"}
		border_mode={is_dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		{height}
		{width}
		allow_overflow={true}
		overflow_behavior="visible"
		{container}
		{scale}
		{min_width}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>

		<InteractiveImageEditor
			{border_region}
			bind:is_dragging
			{canvas_size}
			on:change={() => handle_history_change()}
			bind:image_id
			layers={normalised_layers}
			composite={normalised_composite}
			background={normalised_background}
			bind:this={editor_instance}
			{root}
			{sources}
			{label}
			{show_label}
			{fixed_canvas}
			on:save={(e) => handle_save()}
			on:edit={() => gradio.dispatch("edit")}
			on:clear={() => gradio.dispatch("clear")}
			on:drag={({ detail }) => (is_dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:receive_null={() =>
				(value = {
					background: null,
					layers: [],
					composite: null
				})}
			on:error
			{brush}
			{eraser}
			changeable={attached_events.includes("apply")}
			realtime={attached_events.includes("change") ||
				attached_events.includes("input")}
			i18n={gradio.i18n}
			{transforms}
			accept_blobs={server.accept_blobs}
			layer_options={layers}
			upload={(...args) => gradio.client.upload(...args)}
			{placeholder}
			bind:full_history
			{webcam_options}
			{show_download_button}
			{theme_mode}
			on:download_error={(e) => gradio.dispatch("error", e.detail)}
		></InteractiveImageEditor>
	</Block>
{/if}
