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
					<button
						class="mini-gallery-item"
						on:click={(e) => select_gallery_image("/dog.jpg", e)}
					>
						<img src="/dog.jpg" alt="Gallery 1" />
					</button>
					<button
						class="mini-gallery-item"
						on:click={(e) => select_gallery_image("/dog_blurred.jpg", e)}
					>
						<img src="/dog_blurred.jpg" alt="Gallery 2" />
					</button>
					<button
						class="mini-gallery-item"
						on:click={(e) => select_gallery_image("/dog.jpg", e)}
					>
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
		href="/docs/gradio/gallery"
		class="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2 hover:text-orange-500 transition-colors"
	>
		Gallery
	</a>
</div>

<style>
	.mini-gallery-container {
		width: 100%;
		height: 100%;
		max-height: 120px;
		position: relative;
	}

	.mini-gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 0.5rem;
		width: 100%;
		height: 100%;
	}

	.mini-gallery-large {
		width: 100%;
		height: 100%;
		border-radius: 0.375rem;
		border: 2px solid rgb(249 115 22);
		background: rgb(249 250 251);
		overflow: hidden;
		padding: 0;
		cursor: pointer;
		box-shadow:
			inset 0 0 0 1px rgb(249 115 22),
			0 2px 8px 0 rgba(249, 115, 22, 0.3);
		transition: all 0.2s ease;
	}

	.mini-gallery-large:hover {
		transform: scale(0.98);
	}

	.mini-gallery-large img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}

	.mini-gallery-item {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 0.375rem;
		border: 1px solid rgb(229 231 235);
		background: rgb(249 250 251);
		overflow: hidden;
		box-shadow:
			inset 0 0 0 1px transparent,
			0 1px 3px 0 rgba(0, 0, 0, 0.1);
		transition: all 0.15s ease;
		padding: 0;
		cursor: pointer;
	}

	.mini-gallery-item:hover {
		border-color: rgb(249 115 22);
		box-shadow:
			inset 0 0 0 1px rgb(249 115 22),
			0 1px 3px 0 rgba(0, 0, 0, 0.1);
		filter: brightness(1.1);
		transform: scale(1.05);
	}

	.mini-gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	:global(.dark) .mini-gallery-large {
		background: rgb(38 38 38);
	}

	:global(.dark) .mini-gallery-item {
		border-color: rgb(64 64 64);
		background: rgb(38 38 38);
	}

	:global(.dark) .mini-gallery-item:hover {
		border-color: rgb(249 115 22);
	}
</style>
