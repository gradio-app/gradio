<script lang="ts">
	let selected_gallery_image: string | null = null;

	function select_gallery_image(src: string, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		selected_gallery_image = selected_gallery_image === src ? null : src;
	}
</script>

<div class="flex flex-col items-center w-full h-full pb-2">
	<div class="flex-1 flex items-center justify-center w-full px-2">
		<div class="mini-gallery-container">
			{#if selected_gallery_image}
				<button
					class="mini-gallery-large"
					on:click={(e) => select_gallery_image(selected_gallery_image, e)}
				>
					<img src={selected_gallery_image} alt="Selected" />
				</button>
			{:else}
				<div class="mini-gallery-grid">
					<button class="mini-gallery-item" on:click={(e) => select_gallery_image("/dog.jpg", e)}>
						<img src="/dog.jpg" alt="Gallery 1" />
					</button>
					<button
						class="mini-gallery-item"
						on:click={(e) => select_gallery_image("/dog_blurred.jpg", e)}
					>
						<img src="/dog_blurred.jpg" alt="Gallery 2" />
					</button>
					<button class="mini-gallery-item" on:click={(e) => select_gallery_image("/dog.jpg", e)}>
						<img src="/dog.jpg" alt="Gallery 3" />
					</button>
					<button
						class="mini-gallery-item"
						on:click={(e) => select_gallery_image("/dog_blurred.jpg", e)}
					>
						<img src="/dog_blurred.jpg" alt="Gallery 4" />
					</button>
				</div>
			{/if}
		</div>
	</div>
	<a
		href="/docs/gallery"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Gallery
	</a>
</div>
