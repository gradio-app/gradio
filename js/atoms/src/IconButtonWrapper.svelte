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
		gap: var(--size-1);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background-fill);
		padding: var(--spacing-xs);
	}
</style>
