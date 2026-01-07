<script lang="ts">
	import { type FileData } from "@gradio/client";
	import { Image } from "@gradio/image/shared";

	let {
		elem_id,
		elem_classes,
		visible,
		variant,
		size,
		value,
		link,
		link_target,
		icon,
		disabled,
		scale,
		min_width
	}: {
		elem_id: string | null;
		elem_classes: string[] | null;
		visible: boolean | "hidden";
		variant: "primary" | "secondary" | "stop" | "huggingface";
		size: "sm" | "md" | "lg";
		value: string | null;
		link: string | null;
		link_target: "_self" | "_blank" | "_parent" | "_top";
		icon: FileData | null;
		disabled: boolean;
		scale: number | null;
		min_width: number | undefined;
	} = $props();
</script>

{#if link && link.length > 0}
	<a
		href={link}
		target={link_target}
		rel={link_target === "_blank" ? "noopener noreferrer" : undefined}
		class:hidden={visible === false || visible === "hidden"}
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
			<Image
				src={icon.url}
				restProps={{ alt: `${value} icon`, class: "button-icon" }}
			/>
		{/if}
		<slot />
	</a>
{:else}
	<button
		on:click
		class:hidden={visible === false || visible === "hidden"}
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
			<Image
				restProps={{ alt: `${value} icon` }}
				class_names={[`button-icon ${value ? "right-padded" : ""}`]}
				src={icon.url}
			/>
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
		padding: var(--size-0-5) var(--size-2);
		text-align: center;
	}

	button:hover {
		transform: var(--button-transform-hover);
	}

	button:active,
	a:active {
		transform: var(--button-transform-active);
	}

	button[disabled],
	a.disabled {
		opacity: 0.5;
		filter: grayscale(30%);
		cursor: not-allowed;
		transform: none;
	}

	.hidden {
		display: none;
	}

	.primary {
		border: var(--button-border-width) solid var(--button-primary-border-color);
		background: var(--button-primary-background-fill);
		color: var(--button-primary-text-color);
		box-shadow: var(--button-primary-shadow);
	}
	.primary:hover,
	.primary[disabled] {
		background: var(--button-primary-background-fill-hover);
		color: var(--button-primary-text-color-hover);
	}

	.primary:hover {
		border-color: var(--button-primary-border-color-hover);
		box-shadow: var(--button-primary-shadow-hover);
	}
	.primary:active {
		box-shadow: var(--button-primary-shadow-active);
	}

	.primary[disabled] {
		border-color: var(--button-primary-border-color);
	}

	.secondary {
		border: var(--button-border-width) solid
			var(--button-secondary-border-color);
		background: var(--button-secondary-background-fill);
		color: var(--button-secondary-text-color);
		box-shadow: var(--button-secondary-shadow);
	}

	.secondary:hover,
	.secondary[disabled] {
		background: var(--button-secondary-background-fill-hover);
		color: var(--button-secondary-text-color-hover);
	}

	.secondary:hover {
		border-color: var(--button-secondary-border-color-hover);
		box-shadow: var(--button-secondary-shadow-hover);
	}
	.secondary:active {
		box-shadow: var(--button-secondary-shadow-active);
	}

	.secondary[disabled] {
		border-color: var(--button-secondary-border-color);
	}

	.stop {
		background: var(--button-cancel-background-fill);
		color: var(--button-cancel-text-color);
		border: var(--button-border-width) solid var(--button-cancel-border-color);
		box-shadow: var(--button-cancel-shadow);
	}

	.stop:hover,
	.stop[disabled] {
		background: var(--button-cancel-background-fill-hover);
	}

	.stop:hover {
		border-color: var(--button-cancel-border-color-hover);
		box-shadow: var(--button-cancel-shadow-hover);
	}
	.stop:active {
		box-shadow: var(--button-cancel-shadow-active);
	}

	.stop[disabled] {
		border-color: var(--button-cancel-border-color);
	}

	.sm {
		border-radius: var(--button-small-radius);
		padding: var(--button-small-padding);
		font-weight: var(--button-small-text-weight);
		font-size: var(--button-small-text-size);
	}

	.md {
		border-radius: var(--button-medium-radius);
		padding: var(--button-medium-padding);
		font-weight: var(--button-medium-text-weight);
		font-size: var(--button-medium-text-size);
	}

	.lg {
		border-radius: var(--button-large-radius);
		padding: var(--button-large-padding);
		font-weight: var(--button-large-text-weight);
		font-size: var(--button-large-text-size);
	}

	:global(.button-icon) {
		width: var(--text-xl);
		height: var(--text-xl);
	}
	:global(.button-icon.right-padded) {
		margin-right: var(--spacing-md);
	}

	.huggingface {
		background: rgb(20, 28, 46);
		color: white;
	}

	.huggingface:hover {
		background: rgb(40, 48, 66);
		color: white;
	}
</style>
