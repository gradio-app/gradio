<script lang="ts">
	import { get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "primary" | "secondary" | "stop" | "plain" = "secondary";
	export let size: "sm" | "lg" = "lg";

	$: ({ classes } = get_styles(style, ["full_width"]));
</script>

<button
	on:click
	class:!hidden={!visible}
	class="{size} {variant}
		{classes}"
	id={elem_id}
>
	<slot />
</button>

<style>
	button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		box-shadow: var(--shadow-drop);
		text-align: center;
		padding: var(--size-0-5) var(--size-2);
	}

	button:hover {
		box-shadow: var(--shadow-drop-lg);
	}

	.hidden {
		display: none;
	}
	.primary {
		border: 1px solid var(--button-primary-border-color-base);
		background: var(--button-primary-background-base);
		color: var(--button-primary-text-color-base);
	}
	.primary:hover {
		background: var(--button-primary-background-hover);
		color: var(--button-primary-text-color-hover);
		border-color: var(--button-primary-border-color-hover);
	}

	.primary:focus {
		background: var(--button-primary-background-focus);
		color: var(--button-primary-text-color-focus);
		border-color: var(--button-primary-border-color-focus);
	}

	.secondary {
		border: 1px solid var(--button-secondary-border-color-base);
		background: var(--button-secondary-background-base);
		color: var(--button-secondary-text-color-base);
	}

	.secondary:hover {
		background: var(--button-secondary-background-hover);
		color: var(--button-secondary-text-color-hover);
		border-color: var(--button-secondary-border-color-hover);
	}

	.secondary:focus {
		background: var(--button-secondary-background-focus);
		color: var(--button-secondary-text-color-focus);
		border-color: var(--button-secondary-border-color-focus);
	}

	.stop {
		border: 1px solid var(--button-cancel-border-color-base);
		background: var(--button-cancel-background-base);
		color: var(--button-cancel-text-color-base);
	}

	.stop:hover {
		background: var(--button-cancel-background-hover);
		color: var(--button-cancel-text-color-hover);
		border-color: var(--button-cancel-border-color-hover);
	}

	.stop:focus {
		background: var(--button-cancel-background-focus);
		color: var(--button-cancel-text-color-focus);
		border-color: var(--button-cancel-border-color-focus);
	}

	.sm {
		padding: var(--size-1) var(--size-3);
		font-size: var(--button-small-text-size);
		border-radius: var(--button-small-radius);
		font-weight: var(--button-small-text-weight);
	}

	.lg {
		padding: var(--size-2) var(--size-4);
		font-size: var(--button-large-text-size);
		line-height: var(--line-md);
		border-radius: var(--button-large-radius);
		font-weight: var(--button-large-text-weight);
	}
</style>
