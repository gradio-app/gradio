<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let value: string;
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let show_label: boolean;
	export let elem_id: string;

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);

	$: ({ item_container } = get_styles(style, ["item_container"]));
</script>

<BlockTitle {show_label}>{label}</BlockTitle>

<div class="flex flex-wrap gap-2">
	{#each choices as choice, i (i)}
		<label
			class:!cursor-not-allowed={disabled}
			class="gr-input-label flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer bg-white shadow-sm checked:shadow-inner {item_container}"
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
