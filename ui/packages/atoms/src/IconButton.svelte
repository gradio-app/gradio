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
		border: 1px solid var(--icon_button-border-color-base);
		border-radius: var(--rounded);
		background: var(--color-background-primary);
		width: var(--size-5);
		height: var(--size-5);
		color: var(--color-text-label);
	}

	button:hover {
		border: 1px solid var(--icon_button-border-color-hover);
		color: var(--color-text-label);
	}

	div {
		width: 60%;
		height: 60%;
	}
</style>
