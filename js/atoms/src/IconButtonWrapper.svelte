<script>
	export let top_panel = true;
	export let display_top_corner = false;
</script>

<div
	class={`icon-button-wrapper ${top_panel ? "top-panel" : ""} ${display_top_corner ? "display-top-corner" : "hide-top-corner"}`}
>
	<slot></slot>
</div>

<style>
	.icon-button-wrapper {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		z-index: var(--layer-3);
		gap: var(--spacing-sm);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		background: var(--block-background-fill);
		padding: var(--spacing-xxs);
	}

	.icon-button-wrapper.hide-top-corner {
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
	}

	.icon-button-wrapper.display-top-corner {
		border-radius: var(--radius-sm) 0 0 var(--radius-sm);
		top: var(--spacing-sm);
		right: -1px;
	}

	.icon-button-wrapper:not(.top-panel) {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
	}

	.top-panel {
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		margin: 0;
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

	.icon-button-wrapper
		:global(a.download-link:not(:last-child):not(.no-border *)::after),
	.icon-button-wrapper
		:global(button:not(:last-child):not(.no-border *)::after) {
		content: "";
		position: absolute;
		right: -4.5px;
		top: 15%;
		height: 70%;
		width: 1px;
		background-color: var(--border-color-primary);
	}

	.icon-button-wrapper :global(> *) {
		height: 100%;
	}
</style>
