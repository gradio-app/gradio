<script context="module" lang="ts">
	export { default as MarkdownCode } from "./shared/MarkdownCode.svelte";
	export { default as BaseMarkdown } from "./shared/Markdown.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import Markdown from "./shared/Markdown.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

	export let label: string;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = "";
	export let loading_status: LoadingStatus;
	export let rtl = false;
	export let sanitize_html = true;
	export let line_breaks = false;
	export let gradio: Gradio<{
		change: never;
		clear_status: LoadingStatus;
	}>;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let header_links = false;
	export let height: number | string | undefined = undefined;
	export let show_copy_button = false;

	$: label, gradio.dispatch("change");
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	container={false}
	allow_overflow={true}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		variant="center"
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<div class:pending={loading_status?.status === "pending"}>
		<Markdown
			min_height={loading_status && loading_status.status !== "complete"}
			{value}
			{elem_classes}
			{visible}
			{rtl}
			on:change={() => gradio.dispatch("change")}
			{latex_delimiters}
			{sanitize_html}
			{line_breaks}
			{header_links}
			{height}
			{show_copy_button}
			root={gradio.root}
		/>
	</div>
</Block>

<style>
	div {
		transition: 150ms;
	}

	.pending {
		opacity: 0.2;
	}
</style>
