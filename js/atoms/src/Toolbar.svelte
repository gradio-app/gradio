<script lang="ts">
	export let show_border = false;
</script>

<div class:show_border>
	<slot />
</div>

<style>
	div {
		border-top: 1px solid transparent;
		display: flex;
		max-height: 100%;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-sm);
		height: auto;
		align-items: flex-end;
		color: var(--block-label-text-color);
		flex-shrink: 0;
	}

	.show_border {
		border-top: 1px solid var(--block-border-color);
		margin-top: var(--spacing-xxl);
		box-shadow: var(--shadow-drop);
	}
</style>
