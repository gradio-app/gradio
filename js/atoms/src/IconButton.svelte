<script lang="ts">
	import { type Component, type Snippet } from "svelte";

	let {
		Icon,
		label = "",
		show_label = false,
		pending = false,
		size = "small",
		padded = true,
		highlight = false,
		disabled = false,
		hasPopup = false,
		color = "var(--block-label-text-color)",
		transparent = false,
		background = "var(--block-background-fill)",
		border = "transparent",
		onclick,
		children
	}: {
		Icon: Component;
		label?: string;
		show_label?: boolean;
		pending?: boolean;
		size?: "x-small" | "small" | "large" | "medium";
		padded?: boolean;
		highlight?: boolean;
		disabled?: boolean;
		hasPopup?: boolean;
		color?: string;
		transparent?: boolean;
		background?: string;
		border?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	} = $props();

	let _color = $derived(highlight ? "var(--color-accent)" : color);
</script>

<button
	class="icon-button"
	{disabled}
	{onclick}
	aria-label={label}
	aria-haspopup={hasPopup}
	title={label}
	class:pending
	class:padded
	class:highlight
	class:transparent
	style:--border-color={border}
	style:color={!disabled && _color ? _color : "var(--block-label-text-color)"}
	style:--bg-color={!disabled ? background : "auto"}
>
	{#if show_label}<span>{label}</span>{/if}
	<div
		class:x-small={size === "x-small"}
		class:small={size === "small"}
		class:large={size === "large"}
		class:medium={size === "medium"}
	>
		<Icon />
		{#if children}{@render children()}{/if}
	</div>
</button>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1px;
		z-index: var(--layer-2);
		border-radius: var(--radius-xs);
		color: var(--block-label-text-color);
		border: 1px solid var(--border-color);
		padding: var(--spacing-xxs);
	}

	button:hover {
		background-color: var(--background-fill-secondary);
	}

	button[disabled] {
		opacity: 0.5;
		box-shadow: none;
	}

	button[disabled]:hover {
		cursor: not-allowed;
	}

	.padded {
		background: var(--bg-color);
	}

	button:hover,
	button.highlight {
		cursor: pointer;
		color: var(--color-accent);
	}

	.padded:hover {
		color: var(--block-label-text-color);
	}

	span {
		padding: 0px 1px;
		font-size: 10px;
	}

	div {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: filter 0.2s ease-in-out;
	}

	.x-small {
		width: 10px;
		height: 10px;
	}

	.small {
		width: 14px;
		height: 14px;
	}

	.medium {
		width: 20px;
		height: 20px;
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
