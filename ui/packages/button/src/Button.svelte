<script lang="ts">
	import { get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let size: "sm" | "lg" = style.size || "lg";
	export let disabled: boolean = false;

	$: ({ styles } = get_styles(style, ["full_width"]));
</script>

<button
	on:click
	class:hide={!visible}
	class="{size} {variant}"
	style={styles}
	id={elem_id}
	{disabled}
>
	<slot />
</button>

<style>
	button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		box-shadow: var(--button-shadow);
		padding: var(--size-0-5) var(--size-2);
		text-align: center;
		transition: var(--button-transition)
	}

	button:hover, button[disabled] {
		box-shadow: var(--button-shadow-hover);
	}
	button:active {
		box-shadow: var(--button-shadow-active);
	}

	button[disabled] {
		opacity: 0.5;
		filter: grayscale(30%);
		cursor: not-allowed;
	}

	.hide {
		display: none;
	}

	.primary {
		border: var(--button-border-width) solid var(--button-primary-border-color-base);
		background: var(--button-primary-background-base);
		color: var(--button-primary-text-color-base);
	}
	.primary:hover,
	.primary[disabled] {
		border-color: var(--button-primary-border-color-hover);
		background: var(--button-primary-background-hover);
		color: var(--button-primary-text-color-hover);
	}

	.secondary {
		border: var(--button-border-width) solid var(--button-secondary-border-color-base);
		background: var(--button-secondary-background-base);
		color: var(--button-secondary-text-color-base);
	}

	.secondary:hover,
	.secondary[disabled] {
		border-color: var(--button-secondary-border-color-hover);
		background: var(--button-secondary-background-hover);
		color: var(--button-secondary-text-color-hover);
	}

	.stop {
		border: var(--button-border-width) solid var(--button-cancel-border-color-base);
		background: var(--button-cancel-background-base);
		color: var(--button-cancel-text-color-base);
	}

	.stop:hover,
	.stop[disabled] {
		border-color: var(--button-cancel-border-color-hover);
		background: var(--button-cancel-background-hover);
		color: var(--button-cancel-text-color-hover);
	}

	.sm {
		border-radius: var(--radius-button-small);
		padding: var(--spacing-sm) var(--spacing-lg);
		font-weight: var(--weight-regular);
		font-size: var(--text-xs);
	}

	.lg {
		border-radius: var(--radius-button-large);
		padding: var(--spacing-lg) var(--spacing-xxl);
		font-weight: var(--weight-bold);
		font-size: var(--text-sm);
		line-height: var(--line-md);
	}
</style>
