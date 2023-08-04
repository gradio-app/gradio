<script lang="ts">
	export let Icon: any;
	export let label = "";
	export let show_label = false;
	export let pending = false;
</script>

<button on:click aria-label={label} title={label} class:pending>
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
		padding: 2px;
		color: var(--block-label-text-color);
	}

	button:hover {
		cursor: pointer;
		border: 2px solid var(--button-secondary-border-color-hover);
		padding: 1px;
		color: var(--block-label-text-color);
	}

	span {
		padding: 0px 1px;
		font-size: 10px;
	}

	div {
		padding: 2px;
		width: 14px;
		height: 14px;
	}

	.pending {
		animation: flash 0.5s infinite;
	}

	@keyframes flash {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}
</style>
