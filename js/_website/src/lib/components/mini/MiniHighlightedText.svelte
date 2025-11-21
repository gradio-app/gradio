<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="gradio-highlighted-text">
			<span class="highlight-positive">Good</span>
			<span class="highlight-neutral">sentiment</span>
			<span class="highlight-negative">bad</span>
		</div>
	</div>
	<a
		href="/docs/gradio/highlightedtext"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		HighlightedText
	</a>
</div>

<style>
	.gradio-highlighted-text {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.highlight-positive {
		background-color: rgb(187 247 208);
		color: rgb(22 101 52);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.highlight-neutral {
		background-color: rgb(229 231 235);
		color: rgb(31 41 55);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.highlight-negative {
		background-color: rgb(254 202 202);
		color: rgb(153 27 27);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	:global(.dark) .highlight-positive {
		background-color: rgb(22 101 52);
		color: rgb(187 247 208);
	}

	:global(.dark) .highlight-neutral {
		background-color: rgb(64 64 64);
		color: rgb(229 231 235);
	}

	:global(.dark) .highlight-negative {
		background-color: rgb(153 27 27);
		color: rgb(254 202 202);
	}
</style>
