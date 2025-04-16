<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import InteractiveImage from "./shared/SliderUpload.svelte";
	import StaticImage from "./shared/StaticImage.svelte";
	import type { FileData } from "@gradio/client";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [FileData | null, FileData | null] = [null, null];
	export let label: string;
	export let show_download_button: boolean;
	export let show_label: boolean;
	export let root: string;
	export let height: number | undefined;
	export let width: number | undefined;
	export let loading_status: LoadingStatus;
	export let interactive: boolean;
	export let position: number;
	export let upload_count = 2;
	export let slider_color = "var(--border-color-primary)";

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
</script>

{#if interactive}
	<InteractiveImage
		{slider_color}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{label}
		{show_label}
		{loading_status}
		{height}
		{width}
		{root}
		{gradio}
		{position}
		{upload_count}
		upload={(...args) => gradio.client.upload(...args)}
		stream_handler={gradio.client?.stream}
	/>
{:else}
	<StaticImage
		{slider_color}
		i18n={gradio.i18n}
		{elem_id}
		{elem_classes}
		{visible}
		bind:value
		{label}
		{show_label}
		{show_download_button}
		{loading_status}
		{height}
		{width}
		{root}
		{gradio}
		{position}
		layer_images={true}
		{upload_count}
	/>
{/if}
