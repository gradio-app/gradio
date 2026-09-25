<script lang="ts">
	import Tooltip from "./Tooltip.svelte";

	let {
		label = null,
		Icon,
		show_label = true,
		disable = false,
		float = true,
		rtl = false,
		tooltip = undefined
	}: {
		label?: string | null;
		Icon: any;
		show_label?: boolean;
		disable?: boolean;
		float?: boolean;
		rtl?: boolean;
		tooltip?: string | null;
	} = $props();
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label
	class:hide={!show_label}
	class:sr-only={!show_label}
	class:float
	class:hide-label={disable}
	data-testid="block-label"
	dir={rtl ? "rtl" : "ltr"}
>
	<span>
		<Icon />
	</span>
	{#if tooltip}
		<Tooltip text={tooltip} label_text={label ?? ""}>{label}</Tooltip>
	{:else}
		{label}
	{/if}
</label>

<style>
	label {
		display: inline-flex;
		align-items: center;
		z-index: var(--layer-2);
		box-shadow: var(--block-label-shadow);
		border: var(--block-label-border-width) solid
			var(--block-label-border-color);
		border-top: none;
		border-left: none;
		border-radius: var(--block-label-radius);
		background: var(--block-label-background-fill);
		padding: var(--block-label-padding);
		pointer-events: none;
		color: var(--block-label-text-color);
		font-weight: var(--block-label-text-weight);
		font-size: var(--block-label-text-size);
		line-height: var(--line-sm);
	}
	:global(.gr-group) label {
		border-top-left-radius: 0;
	}

	label.float {
		position: absolute;
		top: var(--block-label-margin);
		left: var(--block-label-margin);
	}
	label:not(.float) {
		position: static;
		margin-top: var(--block-label-margin);
		margin-left: var(--block-label-margin);
	}

	.hide {
		display: none;
	}

	span {
		opacity: 0.8;
		margin-right: var(--size-2);
		width: calc(var(--block-label-text-size) - 1px);
		height: calc(var(--block-label-text-size) - 1px);
	}
	/* Keep the icon on the first line when an inline tooltip panel is open. */
	label:has(:global(.inline-panel)) {
		align-items: flex-start;
	}
	label:has(:global(.inline-panel)) > span {
		margin-top: calc(var(--block-label-text-size) * 0.2);
	}
	.hide-label {
		box-shadow: none;
		border-width: 0;
		background: transparent;
		overflow: visible;
	}

	label[dir="rtl"] {
		border: var(--block-label-border-width) solid
			var(--block-label-border-color);
		border-top: none;
		border-right: none;
		border-bottom-left-radius: var(--block-radius);
		border-bottom-right-radius: var(--block-label-radius);
		border-top-left-radius: var(--block-label-radius);
	}

	label[dir="rtl"] span {
		margin-left: var(--size-2);
		margin-right: 0;
	}
</style>
