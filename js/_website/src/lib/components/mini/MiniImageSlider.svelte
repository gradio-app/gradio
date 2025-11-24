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
			<img
				src="/dog_blurred.jpg"
				alt="Blurred"
				class="absolute inset-0 w-full h-full object-cover pointer-events-none"
				draggable="false"
			/>

			<img
				src="/dog.jpg"
				alt="Original"
				class="absolute inset-0 w-full h-full object-cover pointer-events-none"
				style="clip-path: inset(0 0 0 {image_slider_position}%)"
				draggable="false"
			/>
			<div
				class="absolute top-0 bottom-0 w-px bg-orange-500 pointer-events-none"
				style="left: {image_slider_position}%"
			></div>

			<div
				class="absolute top-0 bottom-0 w-7 cursor-grab active:cursor-grabbing"
				class:cursor-grabbing={is_dragging_image_slider}
				style="left: calc({image_slider_position}% - 14px)"
			>
				<div
					class="image-slider-handle absolute top-1/2 -translate-x-[0%] -translate-y-1/2 w-7 h-6 rounded bg-orange-500 flex items-center justify-center shadow-md"
					class:opacity-0={is_dragging_image_slider}
				>
					<span
						class="text-white text-[9px] leading-none"
						style="transform: rotate(135deg); text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);"
						>◢</span
					>
					<span class="w-px h-full bg-white/10 mx-0.5"></span>
					<span
						class="text-white text-[9px] leading-none"
						style="transform: rotate(-45deg); text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);"
						>◢</span
					>
				</div>
			</div>
		</div>
	</div>
	<a
		href="/docs/gradio/imageslider"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		ImageSlider
	</a>
</div>

<style>
	.image-slider-handle {
		box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.3);
		transition: opacity 0.2s;
	}

	.image-slider-container {
		cursor: grab;
	}

	.image-slider-container:active {
		cursor: grabbing;
	}
</style>
