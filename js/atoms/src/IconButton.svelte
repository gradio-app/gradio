<script lang="ts">
	import { type ComponentType } from "svelte";
	export let Icon: ComponentType;
	export let label = "";
	export let show_label = false;
	export let pending = false;
	export let size: "small" | "large" = "small";
	export let padded = true;
</script>

<button on:click aria-label={label} title={label} class:pending class:padded>
	{#if show_label}<span>{label}</span>{/if}
	<div class:small={size === "small"} class:large={size === "large"}>
		<Icon />
	</div>
</button>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1px;
		z-index: var(--layer-2);

		border-radius: var(--radius-sm);
		color: var(--block-label-text-color);
		border: 1px solid transparent;
	}

	.padded {
		padding: 2px;
		background: var(--background-fill-primary);

		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
	}

	button:hover {
		cursor: pointer;
		color: var(--color-accent);
	}

	.padded:hover {
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
		display: flex;
		align-items: flex-end;
	}

	.small {
		width: 14px;
		height: 14px;
	}

	.large {
		width: 22px;
		height: 22px;
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
