<script lang="ts">
	import { getSaliencyColor } from "../utils";
	import { BlockTitle } from "@gradio/atoms";

	export let label: string;
	export let original: boolean;
	export let interpretation: [number, number];
</script>

<div class="input-checkbox inline-block">
	<BlockTitle>{label}</BlockTitle>
	<button
		class="checkbox-item py-2 px-3 rounded cursor-pointer flex gap-1"
		class:selected={original}
	>
		<div
			class="checkbox w-4 h-4 bg-white flex items-center justify-center border border-gray-400 box-border"
			style={"background-color: " + getSaliencyColor(interpretation[0])}
		/>
		<div
			class="checkbox w-4 h-4 bg-white flex items-center justify-center border border-gray-400 box-border"
			style={"background-color: " + getSaliencyColor(interpretation[1])}
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
	</button>
</div>

<style lang="postcss">
	.selected .check {
		@apply opacity-100;
	}
	.input-checkbox {
		.checkbox-item {
			@apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
		}
		.checkbox-item.selected {
			@apply bg-amber-500 dark:bg-red-600 text-white;
		}
	}
</style>
