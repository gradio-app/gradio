<script lang="ts">
	export let Icon: any;
</script>

<button on:click>
	<div><Icon /></div>
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--size-5);
		width: var(--size-5);
		border-radius: var(--icon_button-border-radius);
		box-shadow: var(--icon_button-shadow);
		border: 1px solid var(--icon_button-border-color-base);
		background: var(--icon_button-background-base);
		color: var(--icon_button-icon-color-base);
		z-index: var(--layer-1);
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
