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
		padding: var(--spacing-xxs);
		border-radius: var(--radius-sm);
	}

	.icon-button-wrapper :global(button:not(:last-child)) {
		position: relative;
		margin-right: var(--spacing-xs);
	}

	.icon-button-wrapper :global(button:not(:last-child)::after) {
		content: "";
		position: absolute;
		right: calc(var(--spacing-sm) * -1);
		top: 15%;
		height: 70%;
		width: 1px;
		background-color: var(--border-color-primary);
	}
</style>
