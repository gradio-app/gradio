<script lang="ts">
	import { type FileData } from "@gradio/client";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let size: "sm" | "lg" = "lg";
	export let value: string | null = null;
	export let link: string | null = null;
	export let icon: FileData | null = null;
	export let disabled = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
</script>

{#if link && link.length > 0}
	<a
		href={link}
		rel="noopener noreferrer"
		class:hidden={!visible}
		class:disabled
		aria-disabled={disabled}
		class="{size} {variant} {elem_classes.join(' ')}"
		style:flex-grow={scale}
		style:pointer-events={disabled ? "none" : null}
		style:width={scale === 0 ? "fit-content" : null}
		style:min-width={typeof min_width === "number"
			? `calc(min(${min_width}px, 100%))`
			: null}
		id={elem_id}
	>
		{#if icon}
			<img class="button-icon" src={icon.url} alt={`${value} icon`} />
		{/if}
		<slot />
	</a>
{:else}
	<button
		on:click
		class:hidden={!visible}
		class="{size} {variant} {elem_classes.join(' ')}"
		style:flex-grow={scale}
		style:width={scale === 0 ? "fit-content" : null}
		style:min-width={typeof min_width === "number"
			? `calc(min(${min_width}px, 100%))`
			: null}
		id={elem_id}
		{disabled}
	>
		{#if icon}
			<img class="button-icon" src={icon.url} alt={`${value} icon`} />
		{/if}
		<slot />
	</button>
{/if}

<style>
	button,
	a {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition: var(--button-transition);
		box-shadow: var(--button-shadow);
		padding: var(--size-0-5) var(--size-2);
		text-align: center;
	}

	button:hover,
	button[disabled],
	a:hover,
	a.disabled {
		box-shadow: var(--button-shadow-hover);
	}

	button:active,
	a:active {
		box-shadow: var(--button-shadow-active);
	}

	button[disabled],
	a.disabled {
		opacity: 0.5;
		filter: grayscale(30%);
		cursor: not-allowed;
	}

	.hidden {
		display: none;
	}

	.primary {
		border: var(--button-border-width) solid var(--button-primary-border-color);
		background: var(--button-primary-background-fill);
		color: var(--button-primary-text-color);
	}
	.primary:hover,
	.primary[disabled] {
		border-color: var(--button-primary-border-color-hover);
		background: var(--button-primary-background-fill-hover);
		color: var(--button-primary-text-color-hover);
	}

	.secondary {
		border: var(--button-border-width) solid
			var(--button-secondary-border-color);
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
	}

	.secondary:hover,
	.secondary[disabled] {
		border-color: var(--button-secondary-border-color-hover);
		background: var(--button-secondary-background-fill-hover);
		color: var(--button-secondary-text-color-hover);
	}

	.stop {
		border: var(--button-border-width) solid var(--button-cancel-border-color);
		background: var(--button-cancel-background-fill);
		color: var(--button-cancel-text-color);
	}

	.stop:hover,
	.stop[disabled] {
		border-color: var(--button-cancel-border-color-hover);
		background: var(--button-cancel-background-fill-hover);
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

	.button-icon {
		width: var(--text-xl);
		height: var(--text-xl);
		margin-right: var(--spacing-xl);
	}
</style>
