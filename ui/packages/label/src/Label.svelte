<script lang="ts">
	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let style: string = "";
</script>

<div class="output-label space-y-3">
	<!-- <div
		class="output-class font-bold text-2xl py-6 px-4 flex-grow flex items-center justify-center"
		class:no-confidence={!("confidences" in value)}
	>
		{value.label}
	</div> -->
	{#if value.confidences}
		{#each value.confidences as confidence_set}
			<div
				class="flex items-start justify-between font-mono text-xs leading-none"
			>
				<div class="flex-1">
					<div
						class="h-1 mb-1 rounded bg-gradient-to-r 
					from-orange-400 
					to-orange-200 
					dark:from-orange-400 
					dark:to-orange-600"
						style="width: calc(
							{Math.round(confidence_set.confidence * 100)}"
					/>
					<span class="leading-snug">{confidence_set.label}</span>
				</div>
				{#if value.confidences}
					<span class="pl-2 flex-none"
						>{Math.round(confidence_set.confidence * 100)}%</span
					>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<!-- <style lang="postcss">
	.output-label[theme="default"] {
		.label {
			@apply text-base h-7;
		}
		.confidence {
			@apply font-mono box-border border-b-2 border-gray-300 bg-gray-200 dark:bg-gray-500 dark:border-gray-600 text-sm h-7 font-semibold rounded;
		}
		.confidence:first-child {
			@apply bg-amber-500 dark:bg-red-600 border-red-700 text-white;
		}
	}
</style> -->
