<script lang="ts">
	import { get_styles } from "@gradio/utils";

	export let label: string | null = null;
	export let Icon: any;
	export let show_label: boolean = true;
	export let disable: boolean = false;
	export let float: boolean = true;

	$: ({ styles } = get_styles({ label_container: !disable }, [
		"label_container"
	]));
</script>

<div
	class:hide={!show_label}
	class:sr-only={!show_label}
	class:float
	style={styles}
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
		box-shadow: var(--block-shadow);
		border: var(--block-border-width) solid var(--color-border-primary);
		border-top: none;
		border-left: none;
		border-radius: var(--block-label-radius);
		background: var(--block-label-background);
		padding: var(--block-label-padding);
		pointer-events: none;
		color: var(--block-label-color);
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
		width: var(--size-3);
		height: var(--size-3);
	}
</style>
