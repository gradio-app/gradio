<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as Webcam } from "./shared/Webcam.svelte";
	export { default as BaseImageUploader } from "./shared/ImageUploader.svelte";
	export { default as BaseStaticImage } from "./shared/ImagePreview.svelte";
	export { default as BaseExample } from "./Example.svelte";
	export { default as BaseImage } from "./shared/Image.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import StaticImage from "./shared/ImagePreview.svelte";
	import ImageUploader from "./shared/ImageUploader.svelte";

	import { Block, Empty, UploadText } from "@gradio/atoms";
	import { Image } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { FileData } from "@gradio/client";
	import type { LoadingStatus } from "@gradio/statustracker";

	type sources = "upload" | "webcam" | "clipboard" | null;

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	let old_value: null | FileData = null;
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
	export let interactive: boolean;
	export let streaming: boolean;
	export let pending: boolean;
	export let mirror_webcam: boolean;

	export let gradio: Gradio<{
		change: never;
		error: string;
		edit: never;
		stream: never;
		drag: never;
		upload: never;
		clear: never;
		select: SelectData;
		share: ShareData;
	}>;

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	let dragging: boolean;
	let active_source: sources = null;
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
			{value}
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

		<ImageUploader
			bind:active_source
			bind:value
			selectable={_selectable}
			{root}
			{sources}
			on:edit={() => gradio.dispatch("edit")}
			on:clear={() => {
				gradio.dispatch("clear");
			}}
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
			{label}
			{show_label}
			{pending}
			{streaming}
			{mirror_webcam}
			i18n={gradio.i18n}
		>
			{#if active_source === "upload" || !active_source}
				<UploadText i18n={gradio.i18n} type="image" />
			{:else if active_source === "clipboard"}
				<UploadText i18n={gradio.i18n} type="clipboard" mode="short" />
			{:else}
				<Empty unpadded_box={true} size="large"><Image /></Empty>
			{/if}
		</ImageUploader>
	</Block>
{/if}
