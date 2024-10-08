<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseTextbox } from "./shared/Textbox.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import TextBox from "./shared/Textbox.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: string;
		submit: never;
		blur: never;
		select: SelectData;
		input: never;
		focus: never;
		stop: never;
		clear_status: LoadingStatus;
	}>;
	export let label = "Textbox";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = "";
	export let lines: number;
	export let placeholder = "";
	export let show_label: boolean;
	export let max_lines: number;
	export let type: "text" | "password" | "email" = "text";
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let submit_btn: string | boolean | null = null;
	export let stop_btn: string | boolean | null = null;
	export let show_copy_button = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let value_is_output = false;
	export let rtl = false;
	export let text_align: "left" | "right" | undefined = undefined;
	export let autofocus = false;
	export let autoscroll = true;
	export let interactive: boolean;
	export let root: string;
	export let max_length: number | undefined = undefined;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={false}
	padding={container}
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
	{/if}

	<TextBox
		bind:value
		bind:value_is_output
		{label}
		{info}
		{root}
		{show_label}
		{lines}
		{type}
		{rtl}
		{text_align}
		max_lines={!max_lines ? lines + 1 : max_lines}
		{placeholder}
		{submit_btn}
		{stop_btn}
		{show_copy_button}
		{autofocus}
		{container}
		{autoscroll}
		{max_length}
		on:change={() => gradio.dispatch("change", value)}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:blur={() => gradio.dispatch("blur")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:focus={() => gradio.dispatch("focus")}
		on:stop={() => gradio.dispatch("stop")}
		disabled={!interactive}
	/>
</Block>
