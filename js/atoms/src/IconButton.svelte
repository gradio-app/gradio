<script lang="ts">
	import { type ComponentType } from "svelte";
	export let Icon: ComponentType;
	export let label = "";
	export let show_label = false;
	export let pending = false;
	export let size: "small" | "large" = "small";
	export let padded = true;
	export let highlight = false;
	export let disabled = false;
	export let hasPopup = false;
	export let color = "var(--block-label-text-color)";
	export let transparent = false;
	export let background = "var(--background-fill-primary)";
	$: _color = highlight ? "var(--color-accent)" : color;
</script>

<button
	{disabled}
	on:click
	aria-label={label}
	aria-haspopup={hasPopup}
	title={label}
	class:pending
	class:padded
	class:highlight
	class:transparent
	style:color={!disabled && _color ? _color : "var(--block-label-text-color)"}
	style:--bg-color={!disabled ? background : "auto"}
>
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
		/* background: var(--background-fill-primary); */
		border-radius: var(--radius-sm);
		color: var(--block-label-text-color);
		border: 1px solid transparent;
	}

	button[disabled] {
		opacity: 0.5;
		box-shadow: none;
	}

	button[disabled]:hover {
		cursor: not-allowed;
		/* border: 1px solid var(--button-secondary-border-color); */
		/* padding: 2px; */
	}

	.padded {
		padding: 2px;
		background: var(--bg-color);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
	}

	/* .padded {
		padding: 2px;
		background: var(--background-fill-primary);

		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
	} */

	/* .padded {
		padding: 2px;
		background: var(--background-fill-primary);

		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
	} */

	button:hover,
	button.highlight {
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

	.transparent {
		background: transparent;
		border: none;
		box-shadow: none;
	}
</style>
