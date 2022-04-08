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

<fieldset
	class="gr-box overflow-hidden border-solid border border-gray-200 gr-panel"
>
	<BlockTitle>{label}</BlockTitle>

	<div class="flex flex-wrap gap-2" data-testid="checkbox-group">
		{#each choices as choice, i}
			<label class="gr-box gr-box-sm ">
				<input
					{disabled}
					on:change={() => toggleChoice(choice)}
					checked={value.includes(choice)}
					type="checkbox"
					name="test"
					class="gr-check-radio rounded checked:shadow-inner"
				/> <span class="ml-2">{choice}</span></label
			>
		{/each}
	</div>
</fieldset>

<style lang="postcss">
	.selected .check {
		@apply opacity-100;
	}
	.input-checkbox-group[theme="default"] {
		.checkbox-item {
			@apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
		}
		.checkbox {
			@apply bg-gray-100 dark:bg-gray-400 transition;
		}
		.checkbox-item.selected {
			@apply bg-amber-500 dark:bg-red-600 text-white;
		}
		.selected .checkbox {
			@apply bg-amber-600 dark:bg-red-700;
		}
	}
</style>
