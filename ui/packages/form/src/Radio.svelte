<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle, Box } from "@gradio/atoms";

	export let value: string;
	export let theme: string = "default";
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;

	const dispatch = createEventDispatcher();

	function handle_change(choice: string) {
		dispatch("change", choice);
		value = choice;
	}

	$: console.log(value);
</script>

<fieldset class="gr-box gr-panel">
	<BlockTitle>{label}</BlockTitle>

	<div class="flex flex-wrap gap-2">
		{#each choices as choice, i}
			<label class="gr-box gr-box-sm ">
				<input
					{disabled}
					bind:group={value}
					type="radio"
					name="test"
					class="rounded-full gr-check-radio "
					value={choice}
				/> <span class="ml-2">{choice}</span></label
			>
		{/each}
	</div>
</fieldset>
