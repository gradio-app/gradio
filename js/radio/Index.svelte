<script context="module" lang="ts">
	export { default as BaseRadio } from "./shared/Radio.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { afterUpdate } from "svelte";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import BaseRadio from "./shared/Radio.svelte";

	export let gradio: Gradio<{
		change: never;
		select: SelectData;
		input: never;
		clear_status: LoadingStatus;
	}>;

	export let label = gradio.i18n("radio.radio");
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | null = null;
	export let choices: [string, string | number][] = [];
	export let show_label = true;
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let interactive = true;

	function handle_change(): void {
		gradio.dispatch("change");
	}

	$: value, handle_change();

	$: disabled = !interactive;
</script>

<Block
	{visible}
	type="fieldset"
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>

	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		{#each choices as [display_value, internal_value], i (i)}
			<BaseRadio
				{display_value}
				{internal_value}
				bind:selected={value}
				{disabled}
				on:input={() => {
					gradio.dispatch("select", { value: internal_value, index: i });
					gradio.dispatch("input");
				}}
			/>
		{/each}
	</div>
</Block>

<style>
	.wrap {
		display: flex;
		flex-wrap: wrap;
		gap: var(--checkbox-label-gap);
	}
</style>
