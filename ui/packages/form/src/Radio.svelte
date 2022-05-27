<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { create_classes } from "@gradio/utils";

	export let value: string;
	export let style: Record<string, string> = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let show_label: boolean;
	export let elem_id: string;

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);
</script>

<BlockTitle {show_label}>{label}</BlockTitle>

<div class="flex flex-wrap gap-2">
	{#each choices as choice, i (i)}
		<label
			class:!cursor-not-allowed={disabled}
			class={"gr-input-label flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer shadow-sm checked:shadow-inner" +
				create_classes(style)}
		>
			<input
				{disabled}
				bind:group={value}
				type="radio"
				name="radio-{elem_id}"
				class="gr-check-radio gr-radio"
				value={choice}
			/> <span class="ml-2">{choice}</span></label
		>
	{/each}
</div>
