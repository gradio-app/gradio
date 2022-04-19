<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";

	export let value: string;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let label: string;
	export let style: string = "";

	const dispatch = createEventDispatcher();

	$: dispatch("change", value);
</script>

<fieldset
	class="gr-box overflow-hidden border-solid border border-gray-200 gr-panel"
>
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
