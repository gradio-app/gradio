<div class="form">
	<slot />
</div>

<style>
	div {
		overflow: hidden;
		display: flex;
		border: 1px solid var(--color-border-primary);
		gap: 1px;
		border-radius: var(--radius-lg);
		flex-wrap: wrap;
		flex-direction: inherit;
		background: var(--color-border-primary);
	}

	div :global(.block) {
		border-width: 0px !important;
		border-radius: 0px !important;
		box-shadow: none !important;
	}
</style>
