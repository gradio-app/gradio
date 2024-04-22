<script context="module" lang="ts">
	export { default as BaseDropdown } from "./shared/Dropdown.svelte";
	export { default as BaseMultiselect } from "./shared/Multiselect.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, KeyUpData, SelectData } from "@gradio/utils";
	import Multiselect from "./shared/Multiselect.svelte";
	import Dropdown from "./shared/Dropdown.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let label = "Dropdown";
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | string[] | undefined = undefined;
	export let value_is_output = false;
	export let multiselect = false;
	export let max_choices: number | null = null;
	export let choices: [string, string | number][];
	export let show_label: boolean;
	export let filterable: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let allow_custom_value = false;
	export let gradio: Gradio<{
		change: never;
		input: never;
		select: SelectData;
		blur: never;
		focus: never;
		key_up: KeyUpData;
		clear_status: LoadingStatus;
	}>;
	export let interactive: boolean;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	padding={container}
	allow_overflow={false}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>

	{#if multiselect}
		<Multiselect
			bind:value
			bind:value_is_output
			{choices}
			{max_choices}
			{label}
			{info}
			{show_label}
			{allow_custom_value}
			{filterable}
			{container}
			i18n={gradio.i18n}
			on:change={() => gradio.dispatch("change")}
			on:input={() => gradio.dispatch("input")}
			on:select={(e) => gradio.dispatch("select", e.detail)}
			on:blur={() => gradio.dispatch("blur")}
			on:focus={() => gradio.dispatch("focus")}
			on:key_up={() => gradio.dispatch("key_up")}
			disabled={!interactive}
		/>
	{:else}
		<Dropdown
			bind:value
			bind:value_is_output
			{choices}
			{label}
			{info}
			{show_label}
			{filterable}
			{allow_custom_value}
			{container}
			on:change={() => gradio.dispatch("change")}
			on:input={() => gradio.dispatch("input")}
			on:select={(e) => gradio.dispatch("select", e.detail)}
			on:blur={() => gradio.dispatch("blur")}
			on:focus={() => gradio.dispatch("focus")}
			on:key_up={(e) => gradio.dispatch("key_up", e.detail)}
			disabled={!interactive}
		/>
	{/if}
</Block>
