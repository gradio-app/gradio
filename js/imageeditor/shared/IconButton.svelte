<script lang="ts">
	import { type ComponentType } from "svelte";
	import type { ColorInput } from "tinycolor2";
	export let Icon: ComponentType;
	export let label = "";
	export let show_label = false;
	export let pending = false;
	export let size: "small" | "large" | "medium" = "small";
	export let padded = true;
	export let highlight = false;
	export let disabled = false;
	export let hasPopup = false;
	export let color: string | ColorInput = "var(--block-label-text-color)";
	export let transparent = false;
	export let background = "var(--background-fill-primary)";
	export let offset = 0;
	export let label_position: "left" | "right" = "left";
	export let roundedness: "quite" | "very" = "quite";
	$: _color = highlight ? "var(--color-accent)" : color.toString();
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
	style:margin-left={offset + "px"}
	class="{roundedness}-round"
>
	{#if show_label && label_position === "left"}
		<span style="margin-left: 4px;">{label}</span>
	{/if}
	<div
		class:small={size === "small"}
		class:large={size === "large"}
		class:medium={size === "medium"}
	>
		<Icon />
	</div>
	{#if show_label && label_position === "right"}
		<span style="margin-right: 4px;">{label}</span>
	{/if}
</button>

<style>
	button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1px;
		z-index: var(--layer-2);
		/* background: var(--background-fill-primary); */
		/* border-radius: var(--radius-sm); */
		color: var(--block-label-text-color);
		border: 1px solid transparent;
	}

	.quite-round {
		border-radius: var(--radius-sm);
	}

	.very-round {
		border-radius: var(--radius-md);
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
