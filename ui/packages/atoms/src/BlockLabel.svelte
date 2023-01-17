<script lang="ts">
	import { get_styles } from "@gradio/utils";

	export let label: string | null = null;
	export let Icon: any;
	export let show_label: boolean = true;
	export let disable: boolean = false;

	$: ({ styles } = get_styles({ label_container: !disable }, [
		"label_container"
	]));
</script>

<div class:hide={!show_label} class:sr-only={!show_label} style={styles}>
	<span>
		<Icon />
	</span>

	{label}
</div>

<style>
	div {
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		align-items: center;
		z-index: var(--layer-2);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-left: none;
		border-radius: 0px 0px var(--radius-lg) 0px;
		background: var(--block_label-background);
		padding: var(--size-1) var(--size-2);
		pointer-events: none;
		color: var(--color-text-label);
		font-size: var(--scale-000);
		line-height: var(--line-sm);
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
