<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockTitle } from "@gradio/atoms";

	export let label: string;
	export let value: string | undefined = undefined;
	export let choices: Array<string>;
	export let style: string = "";
	export let disabled: boolean = false;
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	const dispatch = createEventDispatcher<{ change: string }>();

	$: dispatch("change", value);
</script>

<Block {form_position}>
	<label>
		<BlockTitle>{label}</BlockTitle>
		<select
			class="gr-box gr-input w-full disabled:cursor-not-allowed"
			bind:value
			{disabled}
		>
			{#each choices as choice, i}
				<option>{choice}</option>
			{/each}
		</select>
	</label>
</Block>
