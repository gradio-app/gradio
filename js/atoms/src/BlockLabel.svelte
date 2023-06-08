<script lang="ts">
	export let label: string | null = null;
	export let Icon: any;
	export let show_label: boolean = true;
	export let disable: boolean = false;
	export let float: boolean = true;
</script>

<div
	class:hide={!show_label}
	class:sr-only={!show_label}
	class:float
	class:hide-label={disable}
>
	<span>
		<Icon />
	</span>

	{label}
</div>

<style>
	div {
		display: inline-flex;
		align-items: center;
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
	div.float {
		position: absolute;
		top: var(--block-label-margin);
		left: var(--block-label-margin);
	}
	div:not(.float) {
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
</style>
