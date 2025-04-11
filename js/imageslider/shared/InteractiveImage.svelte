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

	$: value, gradio.dispatch("change");

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
	{root}
	on:edit={() => gradio.dispatch("edit")}
	on:clear={() => gradio.dispatch("clear")}
	on:stream={() => gradio.dispatch("stream")}
	on:drag={({ detail }) => (dragging = detail)}
	on:upload={handle_upload}
	on:select={({ detail }) => gradio.dispatch("select", detail)}
	on:share={({ detail }) => gradio.dispatch("share", detail)}
	{label}
	{show_label}
	{upload_count}
	{stream_handler}
	{upload}
>
	<slot />
</Image>
