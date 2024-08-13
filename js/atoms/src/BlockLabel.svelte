<script lang="ts">
	export let label: string | null = null;
	export let Icon: any;
	export let show_label = true;
	export let disable = false;
	export let float = true;
	export let info: string | undefined = undefined;
</script>

<label
	for=""
	class:hide={!show_label}
	class:sr-only={!show_label}
	class:float
	class:hide-label={disable}
	data-testid="block-label"
>
	<div class="label-content">
		<span>
			<Icon />
		</span>
		{label}
	</div>
	{#if info}
		<div class="info-wrapper">
			<div class="separator"></div>
			<div class="info">{info}</div>
		</div>
	{/if}
</label>

<style>
	label {
		display: inline-block;
		z-index: var(--layer-2);
		box-shadow: var(--block-label-shadow);
		border: var(--block-label-border-width) solid var(--border-color-primary);
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
	.label-content {
		display: inline-flex;
		align-items: center;
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
		height: 0;
	}

	span {
		opacity: 0.8;
		margin-right: var(--size-2);
		width: calc(var(--block-label-text-size) - 1px);
		height: calc(var(--block-label-text-size) - 1px);
	}
	.hide-label {
		box-shadow: none;
		border-width: 0;
		background: transparent;
		overflow: visible;
	}
	.info-wrapper {
		max-width: var(--size-52);
	}
	.separator {
		width: 100%;
		height: 1px;
		background-color: var(--border-color-primary);
		margin: 4px 0;
		opacity: 0.5;
	}
	.info {
		font-size: 0.9em;
		opacity: 0.7;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
</style>
