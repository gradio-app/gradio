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
		transition: var(--button-transition);
		box-shadow: var(--button-shadow);
		padding: var(--size-0-5) var(--size-2);
		text-align: center;
	}

	button:hover,
	button[disabled] {
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
		border: var(--button-border-width) solid var(--button-primary-border-color);
		background: var(--button-primary-background);
		color: var(--button-primary-text-color);
	}
	.primary:hover,
	.primary[disabled] {
		border-color: var(--button-primary-border-color-hover);
		background: var(--button-primary-background-hover);
		color: var(--button-primary-text-color-hover);
	}

	.secondary {
		border: var(--button-border-width) solid
			var(--button-secondary-border-color);
		background: var(--button-secondary-background);
		color: var(--button-secondary-text-color);
	}

	.secondary:hover,
	.secondary[disabled] {
		border-color: var(--button-secondary-border-color-hover);
		background: var(--button-secondary-background-hover);
		color: var(--button-secondary-text-color-hover);
	}

	.stop {
		border: var(--button-border-width) solid var(--button-cancel-border-color);
		background: var(--button-cancel-background);
		color: var(--button-cancel-text-color);
	}

	.stop:hover,
	.stop[disabled] {
		border-color: var(--button-cancel-border-color-hover);
		background: var(--button-cancel-background-hover);
		color: var(--button-cancel-text-color-hover);
	}

	.sm {
		border-radius: var(--button-small-radius);
		padding: var(--button-small-padding);
		font-weight: var(--button-small-text-weight);
		font-size: var(--button-small-text-size);
	}

	.lg {
		border-radius: var(--button-large-radius);
		padding: var(--button-large-padding);
		font-weight: var(--button-large-text-weight);
		font-size: var(--button-large-text-size);
	}
</style>
