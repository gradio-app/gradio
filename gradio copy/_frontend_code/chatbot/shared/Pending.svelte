<script lang="ts">
	export let layout = "bubble";
</script>

<div
	class="message pending"
	role="status"
	aria-label="Loading response"
	aria-live="polite"
	style:border-radius={layout === "bubble" ? "var(--radius-xxl)" : "none"}
>
	<span class="sr-only">Loading content</span>
	<div class="dot-flashing" />
	&nbsp;
	<div class="dot-flashing" />
	&nbsp;
	<div class="dot-flashing" />
</div>

<style>
	.pending {
		background: var(--color-accent-soft);
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		align-self: center;
		gap: 2px;
		width: 100%;
		height: var(--size-16);
	}
	.dot-flashing {
		animation: flash 1s infinite ease-in-out;
		border-radius: 5px;
		background-color: var(--body-text-color);
		width: 7px;
		height: 7px;
		color: var(--body-text-color);
	}
	@keyframes flash {
		0%,
		100% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}

	.dot-flashing:nth-child(1) {
		animation-delay: 0s;
	}

	.dot-flashing:nth-child(2) {
		animation-delay: 0.33s;
	}
	.dot-flashing:nth-child(3) {
		animation-delay: 0.66s;
	}
</style>
