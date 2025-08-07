<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseDialogue } from "./Dialogue.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData, CopyData } from "@gradio/utils";
	import Dialogue from "./Dialogue.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { DialogueLine } from "./utils";
	export let gradio: Gradio<{
		change: DialogueLine[] | string;
		submit: never;
		blur: never;
		select: SelectData;
		input: never;
		focus: never;
		clear_status: LoadingStatus;
		copy: CopyData;
	}>;

	export let server: {
		format: (body: DialogueLine[]) => Promise<string>;
		unformat: (body: object) => Promise<DialogueLine[]>;
	};

	export let label = "Dialogue";
	export let speakers: string[] = [];
	export let tags: string[] = [];
	export let info: string | undefined = undefined;
	export let placeholder: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: DialogueLine[] | string = [];
	export let show_label: boolean;
	export let max_lines: number | undefined = undefined;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let show_copy_button = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let value_is_output = false;
	export let interactive: boolean;
	export let show_submit_button = true;
</script>

<!-- svelte-ignore missing-declaration -->
<Block
	{visible}
	{elem_id}
	{elem_classes}
	{scale}
	{min_width}
	allow_overflow={true}
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

	<Dialogue
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		{max_lines}
		{show_copy_button}
		{container}
		{speakers}
		{tags}
		{placeholder}
		{show_submit_button}
		{server}
		on:change={() => gradio.dispatch("change", value)}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:blur={() => gradio.dispatch("blur")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:focus={() => gradio.dispatch("focus")}
		on:copy={(e) => gradio.dispatch("copy", e.detail)}
		disabled={!interactive}
	/>
</Block>
