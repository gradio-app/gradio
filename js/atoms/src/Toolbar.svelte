<script lang="ts">
</script>

<div>
	<slot />
</div>

<style>
	div {
		display: flex;
		position: absolute;
		bottom: var(--size-2);
		margin: auto;
		justify-content: center;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
		position: absolute;
		bottom: var(--size-2);
		left: 50%;
		transform: translateX(-50%);
		align-items: center;
		box-shadow: var(--shadow-drop);
		border-radius: var(--radius-sm);
		padding: 2px 4px;
		color: var(--block-label-text-color);
	}
</style>
