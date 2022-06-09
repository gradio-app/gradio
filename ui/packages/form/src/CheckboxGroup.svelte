<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { get_styles } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let value: Array<string> = [];
	export let style: Styles = {};
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{ change: Array<string> }>();

	const toggleChoice = (choice: string) => {
		if (value.includes(choice)) {
			value.splice(value.indexOf(choice), 1);
		} else {
			value.push(choice);
		}
		dispatch("change", value);
		value = value;
	};

	$: ({ rounded, border, item_container } = get_styles(style, [
		"rounded",
		"border",
		"item_container"
	]));
</script>

<BlockTitle {show_label}>{label}</BlockTitle>

<div class="flex flex-wrap gap-2" data-testid="checkbox-group">
	{#each choices as choice, i}
		<label
			class:!cursor-not-allowed={disabled}
			class="gr-input-label flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer bg-white shadow-sm checked:shadow-inner {item_container}"
		>
			<input
				{disabled}
				on:change={() => toggleChoice(choice)}
				checked={value.includes(choice)}
				type="checkbox"
				name="test"
				class="gr-check-radio gr-checkbox {rounded} {border}"
			/> <span class="ml-2">{choice}</span></label
		>
	{/each}
</div>
