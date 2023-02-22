<script lang="ts">
	import { get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "primary" | "secondary" | "stop" | "plain" = "secondary";
	export let size: "sm" | "lg" = "lg";
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
		box-shadow: var(--shadow-drop);
		padding: var(--size-0-5) var(--size-2);
		text-align: center;
	}

	button:hover,
	button[disabled] {
		box-shadow: var(--shadow-drop-lg);
	}

	button[disabled] {
		opacity: 0.5;
		filter: grayscale(30%);
		cursor: not-allowed;
	}

	.hide {
		display: none;
	}

	.plain {
		border: 1px solid var(--button-plain-border-color-base);
		background: var(--button-plain-background-base);
		color: var(--button-plain-text-color-base);
	}

	.plain:hover,
	.plain[disabled] {
		border: 1px solid var(--button-plain-border-color-hover);
		background: var(--button-plain-background-hover);
		color: var(--button-plain-text-color-hover);
	}
	.plain:focus {
		border: 1px solid var(--button-plain-border-color-focus);
		background: var(--button-plain-background-focus);
		color: var(--button-plain-text-color-focus);
	}
	.primary {
		border: 1px solid var(--button-primary-border-color-base);
		background: var(--button-primary-background-base);
		color: var(--button-primary-text-color-base);
	}
	.primary:hover,
	.primary[disabled] {
		border-color: var(--button-primary-border-color-hover);
		background: var(--button-primary-background-hover);
		color: var(--button-primary-text-color-hover);
	}

	.primary:focus {
		border-color: var(--button-primary-border-color-focus);
		background: var(--button-primary-background-focus);
		color: var(--button-primary-text-color-focus);
	}

	.secondary {
		border: 1px solid var(--button-secondary-border-color-base);
		background: var(--button-secondary-background-base);
		color: var(--button-secondary-text-color-base);
	}

	.secondary:hover,
	.secondary[disabled] {
		border-color: var(--button-secondary-border-color-hover);
		background: var(--button-secondary-background-hover);
		color: var(--button-secondary-text-color-hover);
	}

	.secondary:focus {
		border-color: var(--button-secondary-border-color-focus);
		background: var(--button-secondary-background-focus);
		color: var(--button-secondary-text-color-focus);
	}

	.stop {
		border: 1px solid var(--button-cancel-border-color-base);
		background: var(--button-cancel-background-base);
		color: var(--button-cancel-text-color-base);
	}

	.stop:hover,
	.stop[disabled] {
		border-color: var(--button-cancel-border-color-hover);
		background: var(--button-cancel-background-hover);
		color: var(--button-cancel-text-color-hover);
	}

	.stop:focus {
		border-color: var(--button-cancel-border-color-focus);
		background: var(--button-cancel-background-focus);
		color: var(--button-cancel-text-color-focus);
	}

	.sm {
		border-radius: var(--radius-sm);
		padding: var(--size-1) var(--size-3);
		font-weight: var(--weight-regular);
		font-size: var(--scale-00);
	}

	.lg {
		border-radius: var(--radius-lg);
		padding: var(--size-2) var(--size-4);
		font-weight: var(--weight-bold);
		font-size: var(--scale-0);
		line-height: var(--line-md);
	}
</style>
