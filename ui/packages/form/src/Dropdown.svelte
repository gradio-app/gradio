<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Box, BlockTitle } from "@gradio/atoms";

	export let label: string;
	export let value: string | undefined = undefined;
	export let choices: Array<string>;

	const dispatch = createEventDispatcher<{ change: string }>();

	$: dispatch("change", value);
</script>

<Box>
	<label>
		<BlockTitle>{label}</BlockTitle>
		<select class="gr-box gr-input w-full" bind:value>
			{#each choices as choice, i}
				<option>{choice}</option>
			{/each}
		</select>
	</label>
</Box>
