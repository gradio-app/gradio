<script lang="ts">
	export let show_label: boolean = true;
</script>

<span class:sr-only={!show_label} class:hide={!show_label}>
	<slot />
</span>

<style>
	span {
		position: relative;
		display: block;
		margin-bottom: var(--size-2);
		z-index: var(--layer-4);
		color: var(--color-text-label);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	.hide {
		height: 0;
		margin: 0;
	}
</style>
