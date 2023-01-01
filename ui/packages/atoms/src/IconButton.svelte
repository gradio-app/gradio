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
		box-shadow: var(--icon_button-shadow);
		border: 1px solid var(--icon_button-border-color-base);
		border-radius: var(--icon_button-border-radius);
		background: var(--icon_button-background-base);
		width: var(--size-5);
		height: var(--size-5);
		color: var(--icon_button-icon-color-base);
	}

	button:hover {
		border: 1px solid var(--icon_button-border-color-hover);
		color: var(--icon_button-icon-color-hover);
	}

	div {
		width: 60%;
		height: 60%;
	}
</style>
