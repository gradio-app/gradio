<script lang="ts">
	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let style: string = "";

	console.log(value);
</script>

<div class="output-label space-y-4">
	{#if value.confidences}
		{#each value.confidences as confidence_set}
			<div
				class="flex items-start justify-between font-mono text-sm leading-none group"
			>
				<div class="flex-1">
					<div
						class="h-1 mb-1 rounded bg-gradient-to-r 
						group-hover:from-orange-500
					from-orange-400 
					to-orange-200
					dark:from-orange-400 
					dark:to-orange-600"
						style="width: {confidence_set.confidence * 100}%"
					/>
					<div
						class="flex items-baseline space-x-2 group-hover:text-orange-500"
					>
						<div class="leading-snug">{confidence_set.label}</div>
						{#if value.confidences}
							<div class="flex-1 border border-dashed border-gray-100 px-4" />
							<div class="text-right ml-auto">
								{Math.round(confidence_set.confidence * 100)}%
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
