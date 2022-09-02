<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let original: Array<string>;
	export let interpretation: Array<[number, number]>;
	export let choices: Array<string>;
	export let label: string;
</script>

<div class="input-checkbox-group flex flex-wrap gap-2">
	<BlockTitle>{label}</BlockTitle>
	{#each choices as choice, i}
		<button
			class="checkbox-item py-2 px-3 font-semibold rounded cursor-pointer flex items-center gap-1"
			class:selected={original.includes(choice)}
		>
			<div
				class="checkbox w-4 h-4 bg-white flex items-center justify-center border border-gray-400 box-border"
				style={"background-color: " + getSaliencyColor(interpretation[i][0])}
			/>
			<div
				class="checkbox w-4 h-4 bg-white flex items-center justify-center border border-gray-400 box-border"
				style={"background-color: " + getSaliencyColor(interpretation[i][1])}
			>
				<svg class="check h-3 w-4" viewBox="-10 -10 20 20">
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
	.selected .check {
		@apply opacity-100;
	}
	.input-checkbox-group {
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
