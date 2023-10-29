<script lang="ts">
</script>

<div>
	<slot />
</div>

<style>
	div {
		display: flex;
		max-height: 100%;
		justify-content: center;
		gap: var(--spacing-sm);
		height: auto;
		align-items: center;
		box-shadow: var(--shadow-drop);
		padding: var(--spacing-xl) 0;
		color: var(--block-label-text-color);
		flex-shrink: 0;
	}
</style>
