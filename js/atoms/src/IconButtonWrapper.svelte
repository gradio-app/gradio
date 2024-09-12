<div class="icon-button-wrapper">
	<slot></slot>
</div>

<style>
	.icon-button-wrapper {
		position: absolute;
		display: flex;
		flex-direction: row;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		z-index: var(--layer-2);
		gap: var(--spacing-sm);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-background-fill);
		padding: var(--spacing-xxs);
	}

	.icon-button-wrapper :global(button) {
		margin: var(--spacing-xxs);
		border-radius: var(--radius-xs);
		position: relative;
	}

	.icon-button-wrapper :global(a.download-link:not(:last-child)),
	.icon-button-wrapper :global(button:not(:last-child)) {
		margin-right: var(--spacing-xxs);
	}

	.icon-button-wrapper :global(a.download-link:not(:last-child)::after),
	.icon-button-wrapper :global(button:not(:last-child)::after) {
		content: "";
		position: absolute;
		right: -5px;
		top: 15%;
		height: 70%;
		width: 1px;
		background-color: var(--border-color-primary);
	}

	.icon-button-wrapper :global(a.download-link:not(:last-child)::after) {
		right: -3px;
	}
</style>
