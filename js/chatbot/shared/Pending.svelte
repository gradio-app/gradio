<script lang="ts">
	import { Image } from "@gradio/image/shared";
	import type { FileData } from "@gradio/client";

	export let layout = "bubble";
	export let avatar_images: [FileData | null, FileData | null] = [null, null];
</script>

<div class="container">
	{#if avatar_images[1] !== null}
		<div class="avatar-container">
			<Image class="avatar-image" src={avatar_images[1].url} alt="bot avatar" />
		</div>
	{/if}

	<div
		class="message bot pending {layout}"
		class:with_avatar={avatar_images[1] !== null}
		class:with_opposite_avatar={avatar_images[0] !== null}
		role="status"
		aria-label="Loading response"
		aria-live="polite"
	>
		<div class="message-content">
			<span class="sr-only">Loading content</span>
			<div class="dots">
				<div class="dot" />
				<div class="dot" />
				<div class="dot" />
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		margin: calc(var(--spacing-xl) * 2);
	}

	.bubble.pending {
		border-width: 1px;
		border-radius: var(--radius-lg);
		border-bottom-left-radius: 0;
		border-color: var(--border-color-primary);
		background-color: var(--background-fill-secondary);
		box-shadow: var(--shadow-drop);
		align-self: flex-start;
		width: fit-content;
		margin-bottom: var(--spacing-xl);
	}

	.bubble.with_opposite_avatar {
		margin-right: calc(var(--spacing-xxl) + 35px + var(--spacing-xxl));
	}

	.panel.pending {
		margin: 0;
		padding: calc(var(--spacing-lg) * 2) calc(var(--spacing-lg) * 2);
		width: 100%;
		border: none;
		background: none;
		box-shadow: none;
		border-radius: 0;
	}

	.panel.with_avatar {
		padding-left: calc(var(--spacing-xl) * 2) !important;
		padding-right: calc(var(--spacing-xl) * 2) !important;
	}

	.avatar-container {
		align-self: flex-start;
		position: relative;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		width: 35px;
		height: 35px;
		flex-shrink: 0;
		bottom: 0;
		border-radius: 50%;
		border: 1px solid var(--border-color-primary);
		margin-right: var(--spacing-xxl);
	}

	.avatar-container:not(.thumbnail-item) :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		padding: var(--size-1-5);
	}

	.message-content {
		padding: var(--spacing-sm) var(--spacing-xl);
		min-height: var(--size-8);
		display: flex;
		align-items: center;
	}

	.dots {
		display: flex;
		gap: var(--spacing-xs);
		align-items: center;
	}

	.dot {
		width: var(--size-1-5);
		height: var(--size-1-5);
		margin-right: var(--spacing-xs);
		border-radius: 50%;
		background-color: var(--body-text-color);
		opacity: 0.5;
		animation: pulse 1.5s infinite;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}
</style>
