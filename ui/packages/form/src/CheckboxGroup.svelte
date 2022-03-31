<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let value: Array<string> = [];
	export let choices: Array<string>;
	export let theme: string = "default";
	export let disabled: boolean = false;
	export let label: string;

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

<fieldset class="gr-box bg-white flex">
	<span class="gr-label"> {label} </span>

	<div class="flex flex-wrap gap-2">
		{#each choices as choice, i}
			<label class="gr-box-sm">
				<input
					on:change={() => toggleChoice(choice)}
					type="checkbox"
					name="test"
					class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
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
