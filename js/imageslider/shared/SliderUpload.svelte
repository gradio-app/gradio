<svelte:options accessors={true} />

<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import Image from "./Image.svelte";
	import { type Client } from "@gradio/client";

	import type { FileData } from "@gradio/client";

	export let value: [FileData | null, FileData | null] = [null, null];
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let label: string;
	export let show_label: boolean;
	export let i18n: I18nFormatter;
	export let root: string;
	export let upload_count = 1;
	export let dragging: boolean;
	export let max_height: number;
	export let max_file_size: number | null = null;
</script>

<Image
	slider_color="var(--border-color-primary)"
	position={0.5}
	bind:value
	bind:dragging
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
	{max_height}
	{i18n}
>
	<slot />
</Image>
