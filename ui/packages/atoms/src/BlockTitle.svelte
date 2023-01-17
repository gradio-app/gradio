<script lang="ts">
	export let show_label: boolean = true;
</script>

<span class:sr-only={!show_label} class:hide={!show_label}>
	<slot />
</span>

<style>
	span {
		display: block;
		position: relative;
		z-index: var(--layer-4);
		margin-bottom: var(--size-2);
		color: var(--color-text-label);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	.hide {
		margin: 0;
		height: 0;
	}
</style>
