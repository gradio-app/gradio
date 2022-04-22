<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let style: string = "";
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);
</script>

<fieldset
	class="form gr-box overflow-hidden border-solid border border-gray-200 gr-panel"
	class:!rounded-none={form_position === "mid"}
	class:!rounded-b-none={form_position === "first"}
	class:!rounded-t-none={form_position === "last"}
>
	<BlockTitle>{label}</BlockTitle>

	<div class="flex flex-wrap gap-2">
		{#each choices as choice, i}
			<label
				class:!cursor-not-allowed={disabled}
				class="flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer bg-white shadow-sm checked:shadow-inner"
			>
				<input
					{disabled}
					bind:group={value}
					type="radio"
					name="test"
					class="rounded-full border-gray-300 text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
					value={choice}
				/> <span class="ml-2">{choice}</span></label
			>
		{/each}
	</div>
</fieldset>
