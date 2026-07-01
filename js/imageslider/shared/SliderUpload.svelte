<svelte:options accessors={true} />

<script lang="ts">
	import type { Snippet } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import Image from "./Image.svelte";
	import { type Client } from "@gradio/client";

	import type { FileData } from "@gradio/client";

	let {
		value = $bindable<[FileData | null, FileData | null]>([null, null]),
		upload,
		stream_handler,
		label,
		show_label,
		i18n,
		root,
		upload_count = 1,
		dragging = $bindable(false),
		max_height,
		max_file_size = null,
		upload_promise = $bindable(),
		onclear,
		ondrag,
		onupload,
		children
	}: {
		value?: [FileData | null, FileData | null];
		upload: Client["upload"];
		stream_handler: Client["stream"];
		label: string;
		show_label: boolean;
		i18n: I18nFormatter;
		root: string;
		upload_count?: number;
		dragging?: boolean;
		max_height: number;
		max_file_size?: number | null;
		upload_promise?: Promise<any>;
		onclear?: () => void;
		ondrag?: (dragging: boolean) => void;
		onupload?: (value: [FileData | null, FileData | null]) => void;
		children?: Snippet;
	} = $props();
</script>

<Image
	bind:upload_promise
	slider_color="var(--border-color-primary)"
	position={0.5}
	bind:value
	bind:dragging
	{root}
	{onclear}
	ondrag={(detail) => {
		dragging = detail;
		ondrag?.(detail);
	}}
	{onupload}
	{label}
	{show_label}
	{upload_count}
	{stream_handler}
	{upload}
	{max_file_size}
	{max_height}
	{i18n}
>
	{#if children}{@render children()}{/if}
</Image>
