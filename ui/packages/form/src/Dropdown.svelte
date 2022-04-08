<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockTitle } from "@gradio/atoms";

	export let label: string;
	export let value: string | undefined = undefined;
	export let choices: Array<string>;
	export let style: string = "";
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{ change: string }>();

	$: dispatch("change", value);
</script>

<Block>
	<label>
		<BlockTitle>{label}</BlockTitle>
		<select class="gr-box gr-input w-full" bind:value {disabled}>
			{#each choices as choice, i}
				<option>{choice}</option>
			{/each}
		</select>
	</label>
</Block>
