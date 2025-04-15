<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData, ShareData } from "@gradio/utils";
	import Image from "./Image.svelte";
	import { type Client } from "@gradio/client";
	import type { LoadingStatus } from "@gradio/statustracker";

	import type { FileData } from "@gradio/client";

	export let value: [FileData | null, FileData | null] = [null, null];
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let label: string;
	export let show_label: boolean;

	export let root: string;
	export let position: number;
	export let upload_count = 2;
	export let slider_color: string;
	export let dragging: boolean;
	export let uploading: boolean;
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
		clear_status: LoadingStatus;
	}>;
	export let max_file_size: number | null = null;

	// $: value, gradio.dispatch("change");

	$: console.log("value", value);

	async function handle_upload({
		detail,
	}: CustomEvent<[FileData, FileData]>): Promise<void> {
		value = detail;
		gradio.dispatch("upload");
	}
</script>

<Image
	{slider_color}
	{position}
	bind:value
	bind:dragging
	bind:uploading
	{root}
	on:edit
	on:clear
	on:stream
	on:drag={({ detail }) => (dragging = detail)}
	on:upload
	on:select
	on:share
	{label}
	{show_label}
	{upload_count}
	{stream_handler}
	{upload}
	{max_file_size}
>
	<slot />
</Image>
