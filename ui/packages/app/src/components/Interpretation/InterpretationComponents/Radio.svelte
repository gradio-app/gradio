<script lang="ts">
	import { getSaliencyColor } from "../utils";

	export let original: string;
	export let interpretation: Array<number>;
	export let theme: string;
	export let choices: Array<string>;
</script>

<div class="input-radio flex flex-wrap gap-2" {theme}>
	{#each choices as choice, i}
		<button
			class="radio-item py-2 px-3 font-semibold rounded cursor-pointer flex items-center gap-2"
			class:selected={original === choice}
		>
			<div
				class="radio-circle w-4 h-4 rounded-full box-border"
				style={"background-color: " + getSaliencyColor(interpretation[i])}
			/>
			{choice}
		</button>
	{/each}
</div>

<style lang="postcss">
	.input-radio[theme="default"] {
		.radio-item {
			@apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
		}
		.radio-circle {
			@apply w-4 h-4  rounded-full box-border;
		}
		.radio-item.selected {
			@apply bg-amber-500 dark:bg-red-600 text-white shadow;
		}
	}
</style>
