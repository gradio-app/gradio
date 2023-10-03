<script>
	export let pending_message = false;
	export let layout = "bubble";
</script>

{#if pending_message}
	<div
		class="message pending"
		role="status"
		aria-label="Loading response"
		aria-live="polite"
		style:border-radius={layout === "bubble" ? "var(--radius-xxl)" : "none"}
		style:border={layout === "bubble"
			? "1px solid var(--border-color-accent)"
			: "none"}
	>
		<span class="sr-only">Loading content</span>
		<div class="dot-flashing" />
		&nbsp;
		<div class="dot-flashing" />
		&nbsp;
		<div class="dot-flashing" />
	</div>
{/if}

<style>
	.pending {
		background: var(--background-fill-secondary);
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		align-self: center;
		gap: 2px;
		width: 100%;
		padding: calc(var(--spacing-xxl) + var(--spacing-sm));
	}
	.dot-flashing {
		animation: dot-flashing 1s infinite linear alternate;
		border-radius: 5px;
		background-color: var(--body-text-color);
		width: 5px;
		height: 5px;
		color: var(--body-text-color);
	}
	.dot-flashing:nth-child(2) {
		animation-delay: 0.33s;
	}
	.dot-flashing:nth-child(3) {
		animation-delay: 0.66s;
	}
</style>
