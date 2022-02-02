<script>
	export let value, setValue, theme;
	export let choices;

	const toggleChoice = (choice) => {
		if (value.includes(choice)) {
			value.splice(value.indexOf(choice), 1);
		} else {
			value.push(choice);
		}
		setValue(value);
	};
</script>

<div class="input-checkbox-group flex flex-wrap gap-2" {theme}>
	{#each choices as choice, i}
		<button
			class="checkbox-item py-2 px-3 font-semibold rounded cursor-pointer flex items-center gap-2"
			class:selected={value.includes(choice)}
			key={i}
			on:click={() => toggleChoice(choice)}
		>
			<div class="checkbox w-4 h-4 bg-white flex items-center justify-center">
				<svg class="check opacity-0 h-3 w-4" viewBox="-10 -10 20 20">
					<line
						x1="-7.5"
						y1="0"
						x2="-2.5"
						y2="5"
						stroke="white"
						stroke-width="4"
						stroke-linecap="round"
					/>
					<line
						x1="-2.5"
						y1="5"
						x2="7.5"
						y2="-7.5"
						stroke="white"
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
	.input-checkbox-group[theme="default"] {
		.checkbox-item {
			@apply bg-white dark:bg-gray-800 shadow transition hover:shadow-md;
		}
		.checkbox {
			@apply bg-gray-100 dark:bg-gray-400 transition;
		}
		.checkbox-item.selected {
			@apply bg-yellow-500 dark:bg-red-600 text-white;
		}
		.selected .checkbox {
			@apply bg-yellow-600 dark:bg-red-700;
		}
	}
</style>
