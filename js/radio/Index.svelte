<script context="module" lang="ts">
	export { default as BaseRadio } from "./shared/Radio.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import BaseRadio from "./shared/Radio.svelte";
	import type { RadioEvents, RadioProps } from "./types";

	const props = $props();

	const gradio = new Gradio<RadioEvents, RadioProps>(props);

	let disabled = $derived(!gradio.shared.interactive);

	let old_value = $state(gradio.props.value);
	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	type="fieldset"
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	rtl={gradio.props.rtl}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>

	<BlockTitle show_label={gradio.shared.show_label} info={gradio.props.info}
		>{gradio.shared.label || gradio.i18n("radio.radio")}</BlockTitle
	>

	<div class="wrap">
		{#each gradio.props.choices as [display_value, internal_value], i (i)}
			<BaseRadio
				{display_value}
				{internal_value}
				bind:selected={gradio.props.value}
				{disabled}
				rtl={gradio.props.rtl}
				on_input={() => {
					gradio.dispatch("input");
					gradio.dispatch("select", {
						value: internal_value,
						index: i,
					});
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
