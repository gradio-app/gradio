<script lang="ts">
	import { get_styles } from "@gradio/utils";

	export let label: string | null = null;
	export let Icon: any;
	export let show_label: boolean = true;
	export let disable: boolean = false;

	$: ({ classes } = get_styles({ label_container: !disable }, [
		"label_container"
	]));
</script>

<div class:hide={!show_label} class:sr-only={!show_label} class={classes}>
	<span>
		<Icon />
	</span>

	{label}
</div>

<style>
	div {
		display: flex;
		align-items: center;
		pointer-events: none;
		position: absolute;
		left: 0;
		top: 0;
		padding: var(--size-1) var(--size-2);
		border-radius: 0px 0px var(--block_label-border-radius) 0px;
		box-shadow: var(--block_label-shadow);
		font-size: var(--scale-000);
		line-height: var(--line-sm);
		color: var(--color-text-label);
		z-index: var(--layer-2);
		border: var(--block_label-border-width) solid
			var(--block_label-border-color);
		border-left: none;
		border-top: none;
		background: var(--block_label-background);
	}

	.hide {
		height: 0;
	}

	span {
		margin-right: var(--size-2);
		height: var(--size-3);
		width: var(--size-3);
		opacity: 0.8;
	}
</style>
