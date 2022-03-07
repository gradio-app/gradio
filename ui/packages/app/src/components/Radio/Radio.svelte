<script lang="ts">
	export let value: string;
	export let setValue: (val: string) => string;
	export let theme: string;
	export let choices: Array<string>;
</script>

<div class="input-radio flex flex-wrap gap-2" {theme}>
	{#each choices as choice, i}
		<button
			class="radio-item py-2 px-3 font-semibold rounded cursor-pointer flex items-center gap-2"
			class:selected={value === choice}
			on:click={() => setValue(choice)}
		>
			<div class="radio-circle w-4 h-4 rounded-full box-border" />
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
			@apply bg-gray-50 dark:bg-gray-400 border-4 border-gray-200 dark:border-gray-600;
		}
		.radio-item.selected {
			@apply bg-amber-500 dark:bg-red-600 text-white shadow;
		}
		.radio-circle {
			@apply w-4 h-4 bg-white transition rounded-full box-border;
		}
		.selected .radio-circle {
			@apply border-amber-600 dark:border-red-700;
		}
	}
</style>
