<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-4">
		<input type="number" value="42" class="gradio-number-input" readonly />
	</div>
	<a
		href="/docs/gradio/number"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
		>Number</a
	>
</div>

<style>
	.gradio-number-input {
		max-width: 6rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid rgb(209 213 219);
		border-radius: 0.375rem;
		background-color: white;
		color: rgb(31 41 55);
		font-size: 0.875rem;
		line-height: 1.25rem;
		transition: all 0.15s ease;
	}

	.gradio-number-input:focus {
		outline: none;
		border-color: rgb(249 115 22);
		box-shadow: 0 0 0 1px rgb(249 115 22);
	}

	:global(.dark) .gradio-number-input {
		border-color: rgb(64 64 64);
		background-color: rgb(23 23 23);
		color: rgb(229 231 235);
	}

	:global(.dark) .gradio-number-input:focus {
		border-color: rgb(249 115 22);
	}
</style>
