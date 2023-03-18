<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let original: string;
	export let interpretation: Array<number>;
	export let choices: Array<string>;
	export let label: string = "";
</script>

<div class="input-radio">
	<BlockTitle>{label}</BlockTitle>
	{#each choices as choice, i}
		<button class="radio-item" class:selected={original === choice}>
			<div
				class="radio-circle"
				style={"background-color: " + getSaliencyColor(interpretation[i])}
			/>
			{choice}
		</button>
	{/each}
</div>

<style>
	.input-radio {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.radio-item {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		transition: 150ms;
		cursor: pointer;
		border-radius: var(--radius-md);
		background: var(--background-fill-primary);
		padding: var(--size-2) var(--size-3);
		font-weight: var(--weight-semibold);
	}

	.radio-item:hover {
		box-shadow: var(--shadow-drop-lg);
	}
	.radio-circle {
		box-sizing: border-box;
		border-radius: var(--radius-full);
		width: var(--size-4);
		height: var(--size-4);
	}
	.radio-item.selected {
		box-shadow: var(--shadow-drop);
		background: var(--color-accent-base);
		color: white;
	}
</style>
