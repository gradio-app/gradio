<svelte:options accessors={true} />

<script lang="ts">
	import type { Brush, Eraser } from "./shared/tools/Brush.svelte";
	import type {
		EditorData,
		ImageBlobs
	} from "./shared/InteractiveImageEditor.svelte";

	import type { Gradio, SelectData } from "@gradio/utils";
	import { BaseStaticImage as StaticImage } from "@gradio/image";
	import InteractiveImageEditor from "./shared/InteractiveImageEditor.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { normalise_file } from "@gradio/client";

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

	export let height: number | undefined;
	export let width: number | undefined;

	export let _selectable = false;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let show_share_button = false;
	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let proxy_url: string;
	export let interactive: boolean;

	export let brush: Brush;
	export let eraser: Eraser;
	export let crop_size: [number, number] | `${string}:${string}` | null = null;
	export let transforms: "crop"[] = ["crop"];

	export let attached_events: string[] = [];

	export let gradio: Gradio<{
		change: never;
		error: string;
		input: never;
		edit: never;
		stream: never;
		drag: never;
		upload: never;
		clear: never;
		select: SelectData;
		share: ShareData;
	}>;

	let editor_instance: InteractiveImageEditor;

	export async function get_value(): Promise<ImageBlobs> {
		// @ts-ignore
		loading_status = { status: "pending" };
		const blobs = await editor_instance.get_data();
		// @ts-ignore
		loading_status = { status: "complete" };

		return blobs;
	}

	let dragging: boolean;

	$: value && handle_change();

	function handle_change(): void {
		if (
			value &&
			(value.background || value.layers?.length || value.composite)
		) {
			gradio.dispatch("change");
		}
	}

	function handle_save(): void {
		gradio.dispatch("change");
		gradio.dispatch("input");
	}
</script>

{#if !interactive}
	<Block
		{visible}
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		height={height || undefined}
		{width}
		allow_overflow={false}
		{container}
		{scale}
		{min_width}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
		/>
		<StaticImage
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			value={normalise_file(value?.composite || null, root, proxy_url)}
			{label}
			{show_label}
			{show_download_button}
			selectable={_selectable}
			{show_share_button}
			i18n={gradio.i18n}
		/>
	</Block>
{:else}
	<Block
		{visible}
		variant={value === null ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
		height={height || undefined}
		{width}
		allow_overflow={false}
		{container}
		{scale}
		{min_width}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
		/>

		<InteractiveImageEditor
			{crop_size}
			{value}
			bind:this={editor_instance}
			{root}
			{sources}
			on:save={(e) => handle_save()}
			on:edit={() => gradio.dispatch("edit")}
			on:clear={() => gradio.dispatch("clear")}
			on:stream={() => gradio.dispatch("stream")}
			on:drag={({ detail }) => (dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				gradio.dispatch("error", detail);
			}}
			on:error
			{brush}
			{eraser}
			{proxy_url}
			changeable={attached_events.includes("change")}
			i18n={gradio.i18n}
			{transforms}
		></InteractiveImageEditor>
	</Block>
{/if}
