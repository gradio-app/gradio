<script lang="ts">
	let slider_value = 50;

	function handle_slider_input(e: Event) {
		slider_value = parseInt((e.target as HTMLInputElement).value);
	}
</script>

<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<div class="w-full px-4">
			<div class="flex items-center gap-2">
				<span class="text-xs text-gray-500 dark:text-gray-400">0</span>
				<input
					type="range"
					min="0"
					max="100"
					value={slider_value}
					on:input={handle_slider_input}
					class="gradio-slider flex-1"
					style="--range-progress: {slider_value}%"
				/>
				<span class="text-xs text-gray-500 dark:text-gray-400">100</span>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/slider"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Slider
	</a>
</div>

<style>
	.gradio-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		cursor: pointer;
		outline: none;
		border-radius: 9999px;
		background: transparent;
		height: 0.5rem;
	}

	.gradio-slider::-webkit-slider-runnable-track {
		height: 0.5rem;
		border-radius: 9999px;
		background: linear-gradient(
			to right,
			rgb(249 115 22) var(--range-progress),
			rgb(229 231 235) var(--range-progress)
		);
	}

	:global(.dark) .gradio-slider::-webkit-slider-runnable-track {
		background: linear-gradient(
			to right,
			rgb(249 115 22) var(--range-progress),
			rgb(64 64 64) var(--range-progress)
		);
	}

	.gradio-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		height: 1rem;
		width: 1rem;
		background-color: white;
		border-radius: 50%;
		margin-top: -4px;
		box-shadow:
			0 0 0 1px rgba(247, 246, 246, 0.739),
			1px 1px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	/* Firefox track */
	.gradio-slider::-moz-range-track {
		height: 0.5rem;
		background: rgb(229 231 235);
		border-radius: 9999px;
	}

	:global(.dark) .gradio-slider::-moz-range-track {
		background: rgb(64 64 64);
	}

	.gradio-slider::-moz-range-thumb {
		appearance: none;
		height: 1rem;
		width: 1rem;
		background-color: white;
		border-radius: 50%;
		border: none;
		box-shadow:
			0 0 0 1px rgba(247, 246, 246, 0.739),
			1px 1px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	/* Firefox progress */
	.gradio-slider::-moz-range-progress {
		height: 0.5rem;
		background-color: rgb(249 115 22);
		border-radius: 9999px;
	}
</style>
