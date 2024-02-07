<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseImageUploader } from "./shared/ImageUploader.svelte";
	export { default as BaseStaticImage } from "./shared/ImagePreview.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import ImagePreview from "./shared/ImagePreview.svelte";
	import ImageUploader from "./shared/ImageUploader.svelte";

	import { Block, UploadText } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { FileData } from "@gradio/client";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | FileData = null;
	export let label: string;
	export let show_label: boolean;
	export let show_download_button: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let interactive: boolean;
	export let root: string;

	export let gradio: Gradio<{
		change: never;
		upload: never;
		clear: never;
	}>;

	$: value, gradio.dispatch("change");

	let dragging: boolean;
</script>

{#if !interactive}
	<Block
		{visible}
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		{elem_id}
		{elem_classes}
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
		<ImagePreview
			{value}
			{label}
			{show_label}
			{show_download_button}
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
			bind:value
			{root}
			on:clear={() => gradio.dispatch("clear")}
			on:drag={({ detail }) => (dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			{label}
			{show_label}
		>
			<UploadText i18n={gradio.i18n} type="image" />
		</ImageUploader>
	</Block>
{/if}
