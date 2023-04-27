<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let original: Array<string>;
	export let interpretation: Array<[number, number]>;
	export let choices: Array<string>;
	export let label: string = "";
</script>

<div class="input-checkbox-group">
	<BlockTitle>{label}</BlockTitle>
	{#each choices as choice, i}
		<button class="checkbox-item" class:selected={original.includes(choice)}>
			<div
				class="checkbox"
				style={"background-color: " + getSaliencyColor(interpretation[i][0])}
			/>
			<div
				class="checkbox"
				style={"background-color: " + getSaliencyColor(interpretation[i][1])}
			>
				<svg viewBox="-10 -10 20 20">
					<line
						x1="-7.5"
						y1="0"
						x2="-2.5"
						y2="5"
						stroke="black"
						stroke-width="4"
						stroke-linecap="round"
					/>
					<line
						x1="-2.5"
						y1="5"
						x2="7.5"
						y2="-7.5"
						stroke="black"
						stroke-width="4"
						stroke-linecap="round"
					/>
				</svg>
			</div>
			{choice}
		</button>
	{/each}
</div>

<style lang="postcss">
	svg {
		width: var(--size-4);
		height: var(--size-3);
	}
	.selected svg {
		opacity: 1;
	}
	.input-checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		transition: 150ms;
		cursor: pointer;
		box-shadow: var(--shadow-drop);
		border-radius: var(--radius-md);
		background: var(--background-fill-primary);
		padding: var(--size-2) var(--size-3);
		font-weight: var(--weight-semibold);
	}

	.checkbox-item:hover {
		box-shadow: var(--shadow-drop-lg);
	}

	.checkbox {
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--border-color-primary);
		background: var(--background-fill-primary);
		width: var(--size-4);
		height: var(--size-4);
	}
	.checkbox-item.selected {
		background: var(--color-accent-base);
		color: white;
	}
	.selected .checkbox {
		background: var(--color-accent-base);
	}

	.checkbox-item {
		transition: 150ms;
		box-shadow: var(--shadow-drop);
		background: var(--background-fill-primary);
	}

	.checkbox-item.selected {
		background: var(--color-accent-base);
		color: white;
	}
</style>
