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
		href="/docs/slider"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Slider
	</a>
</div>
