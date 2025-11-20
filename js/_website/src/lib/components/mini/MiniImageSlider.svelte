<script lang="ts">
	let image_slider_position = 50;
	let is_dragging_image_slider = false;
	let image_slider_container: HTMLElement | null = null;

	function handle_image_slider_mousedown(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		is_dragging_image_slider = true;
		image_slider_container = e.currentTarget as HTMLElement;
		update_image_slider_position(e);
	}

	function handle_image_slider_mousemove(e: MouseEvent) {
		if (!is_dragging_image_slider || !image_slider_container) return;
		update_image_slider_position(e);
	}

	function handle_image_slider_mouseup() {
		is_dragging_image_slider = false;
		image_slider_container = null;
	}

	function update_image_slider_position(e: MouseEvent) {
		if (!image_slider_container) return;
		const rect = image_slider_container.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
		image_slider_position = percentage;
	}
</script>

<svelte:window
	on:mousemove={handle_image_slider_mousemove}
	on:mouseup={handle_image_slider_mouseup}
/>

<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full">
		<div
			class="image-slider-container relative w-full h-32 overflow-hidden select-none rounded-lg"
			on:mousedown={handle_image_slider_mousedown}
			role="slider"
			tabindex="0"
			aria-valuenow={image_slider_position}
			aria-valuemin="0"
			aria-valuemax="100"
		>
			<!-- Base image (blurred) -->
			<img
				src="/dog_blurred.jpg"
				alt="Base"
				class="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
				draggable="false"
			/>

			<!-- Reveal image (sharp) -->
			<div
				class="absolute top-0 left-0 h-full overflow-hidden"
				style="width: {image_slider_position}%"
			>
				<img
					src="/dog.jpg"
					alt="Reveal"
					class="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
					style="width: calc(100vw * 0.48)"
					draggable="false"
				/>
			</div>

			<!-- Slider handle -->
			<div
				class="absolute top-0 h-full w-1 bg-white image-slider-handle"
				style="left: {image_slider_position}%"
			>
				<div
					class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-gray-300 shadow-lg flex items-center justify-center"
				>
					<div class="flex gap-0.5">
						<div class="w-0.5 h-3 bg-gray-400 rounded"></div>
						<div class="w-0.5 h-3 bg-gray-400 rounded"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<a
		href="/docs/imageslider"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		ImageSlider
	</a>
</div>
