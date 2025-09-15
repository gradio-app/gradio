<script lang="ts">
	import type { GalleryImage, GalleryVideo } from "./types";

	export let value: (GalleryImage | GalleryVideo)[] | null;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class="container"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{#if value && value.length > 0}
		<div class="images-wrapper">
			{#each value.slice(0, 3) as item}
				{#if "image" in item && item.image}
					<div class="image-container">
						<img src={item.image.url} alt={item.caption || ""} />
						{#if item.caption}
							<span class="caption">{item.caption}</span>
						{/if}
					</div>
				{:else if "video" in item && item.video}
					<div class="image-container">
						<video
							src={item.video.url}
							controls={false}
							muted
							preload="metadata"
						/>
						{#if item.caption}
							<span class="caption">{item.caption}</span>
						{/if}
					</div>
				{/if}
			{/each}
			{#if value.length > 3}
				<div class="more-indicator">…</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.container {
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.container.selected {
		border: 2px solid var(--border-color-accent);
	}

	.images-wrapper {
		display: flex;
		gap: var(--spacing-sm);
	}

	.container.table .images-wrapper {
		flex-direction: row;
		align-items: center;
		padding: var(--spacing-sm);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		background: var(--background-fill-secondary);
	}

	.container.gallery .images-wrapper {
		flex-direction: row;
		gap: 0;
	}

	.image-container {
		position: relative;
		flex-shrink: 0;
	}

	.container.table .image-container {
		width: var(--size-12);
		height: var(--size-12);
	}

	.container.gallery .image-container {
		width: var(--size-20);
		height: var(--size-20);
		margin-left: calc(-1 * var(--size-8));
	}

	.container.gallery .image-container:first-child {
		margin-left: 0;
	}

	.more-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		font-weight: bold;
		color: var(--border-color-primary);
	}

	.container.table .more-indicator {
		width: var(--size-12);
		height: var(--size-12);
	}

	.container.gallery .more-indicator {
		width: var(--size-20);
		height: var(--size-20);
		margin-left: calc(-1 * var(--size-8));
		margin-right: calc(-1 * var(--size-6));
	}

	.image-container img,
	.image-container video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-md);
	}

	.caption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: var(--spacing-xs);
		font-size: var(--text-xs);
		text-align: center;
		border-radius: 0 0 var(--radius-md) var(--radius-md);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.container.table .caption {
		display: none;
	}
</style>
