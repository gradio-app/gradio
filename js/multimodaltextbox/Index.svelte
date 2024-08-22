<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseMultimodalTextbox } from "./shared/MultimodalTextbox.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import MultimodalTextbox from "./shared/MultimodalTextbox.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { FileData } from "@gradio/client";

	export let gradio: Gradio<{
		change: typeof value;
		submit: never;
		blur: never;
		select: SelectData;
		input: never;
		focus: never;
		error: string;
		clear_status: LoadingStatus;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: { text: string; files: FileData[] } = {
		text: "",
		files: []
	};
	export let file_types: string[] | null = null;
	export let lines: number;
	export let placeholder = "";
	export let label = "MultimodalTextbox";
	export let info: string | undefined = undefined;
	export let show_label: boolean;
	export let max_lines: number;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let submit_btn: string | null = null;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let value_is_output = false;
	export let rtl = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autofocus = false;
	export let autoscroll = true;
	export let interactive: boolean;
	export let root: string;
	export let file_count: "single" | "multiple" | "directory";

	let dragging: boolean;
</script>

<Block
	{visible}
	{elem_id}
	elem_classes={[...elem_classes, "multimodal-textbox"]}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={container}
	border_mode={dragging ? "focus" : "base"}
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
	{/if}

	<MultimodalTextbox
		bind:value
		bind:value_is_output
		bind:dragging
		{file_types}
		{root}
		{label}
		{info}
		{show_label}
		{lines}
		{rtl}
		{text_align}
		max_lines={!max_lines ? lines + 1 : max_lines}
		{placeholder}
		{submit_btn}
		{autofocus}
		{container}
		{autoscroll}
		{file_count}
		max_file_size={gradio.max_file_size}
		on:change={() => gradio.dispatch("change", value)}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:blur={() => gradio.dispatch("blur")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:focus={() => gradio.dispatch("focus")}
		on:error={({ detail }) => {
			gradio.dispatch("error", detail);
		}}
		disabled={!interactive}
		upload={gradio.client.upload}
		stream_handler={gradio.client.stream}
	/>
</Block>

<style>
	:global(.form .block.multimodal-textbox) {
		box-shadow: var(--block-shadow) !important;
		border-width: var(--block-border-width) !important;
		border-radius: var(--block-radius) !important;
	}
</style>
