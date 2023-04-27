<script lang="ts">
	export let Icon: any;
	export let label = "";
</script>

<button on:click aria-label={label}>
	<div><Icon /></div>
</button>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: var(--layer-1);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--radius-sm);
		background: var(--background-fill-primary);
		width: var(--size-5);
		height: var(--size-5);
		color: var(--block-label-text-color);
	}

	button:hover {
		cursor: pointer;
		border: 2px solid var(--button-secondary-border-color-hover);
		color: var(--block-label-text-color);
	}

	div {
		width: 60%;
		height: 60%;
	}
</style>
