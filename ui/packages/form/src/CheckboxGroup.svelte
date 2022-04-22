<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: Array<string> = [];
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let style: string = "";

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
</script>

<BlockTitle>{label}</BlockTitle>

<div class="flex flex-wrap gap-2" data-testid="checkbox-group">
	{#each choices as choice, i}
		<label
			class:!cursor-not-allowed={disabled}
			class="flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer bg-white shadow-sm checked:shadow-inner"
		>
			<input
				{disabled}
				on:change={() => toggleChoice(choice)}
				checked={value.includes(choice)}
				type="checkbox"
				name="test"
				class="rounded border-gray-300 text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
			/> <span class="ml-2">{choice}</span></label
		>
	{/each}
</div>
