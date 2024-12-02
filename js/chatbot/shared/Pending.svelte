<script lang="ts">
	export let layout = "bubble";
</script>

<div
	class="message bot pending {layout}"
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

<style>
	/* Default bubble styles */
	.bubble.pending {
		border-width: 1px;
		border-radius: var(--radius-lg);
		border-bottom-left-radius: 0;
		border-color: var(--border-color-primary);
		background-color: var(--background-fill-secondary);
		box-shadow: var(--shadow-drop);
		align-self: flex-start;
		width: fit-content;
		margin: calc(var(--spacing-xl) * 2);
		margin-bottom: var(--spacing-xl);
	}

	/* Panel styles */
	.panel.pending {
		margin: 0;
		padding: calc(var(--spacing-lg) * 2) calc(var(--spacing-lg) * 2);
		width: 100%;
		border: none;
		background: none;
		box-shadow: none;
		border-radius: 0;
	}

	/* Shared styles */
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
