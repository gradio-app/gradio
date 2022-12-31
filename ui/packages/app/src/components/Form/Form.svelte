<div class="form">
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-direction: inherit;
		flex-wrap: wrap;
		gap: 1px;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		background: var(--color-border-primary);
		overflow: hidden;
	}

	div :global(.block) {
		box-shadow: none !important;
		border-width: 0px !important;
		border-radius: 0px !important;
	}
</style>
