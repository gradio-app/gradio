<script lang="ts">
	export let Icon: any;
	export let label = "";
	export let show_label: boolean = false;
</script>

<button on:click aria-label={label}>
	{#if show_label}<span>{label}</span>{/if}
	<div><Icon /></div>
</button>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1px;
		z-index: var(--layer-1);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--radius-sm);
		background: var(--background-fill-primary);
		color: var(--block-label-text-color);
		padding: 2px;
	}

	button:hover {
		cursor: pointer;
		padding: 1px;
		border: 2px solid var(--button-secondary-border-color-hover);
		color: var(--block-label-text-color);
	}

	span {
		font-size: 10px;
		padding: 0px 1px;
	}

	div {
		width: 14px;
		height: 14px;
		padding: 2px;
	}
</style>
