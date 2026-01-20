<script lang="ts">
	let {
		visible = false,
		position = "sticky",
	}: {
		visible: boolean;
		position?: "sticky" | "absolute";
	} = $props();
</script>

{#if visible}
	<div class="scroll-fade" class:absolute={position === "absolute"}></div>
{/if}

<style>
	.scroll-fade {
		position: sticky;
		bottom: calc(0px - var(--size-2-5));
		left: 0;
		right: 0;
		height: var(--size-6);
		background: linear-gradient(
			to top,
			var(--block-background-fill) 30%,
			transparent
		);
		pointer-events: none;
		margin-top: calc(0px - var(--size-6));
	}

	.scroll-fade.absolute {
		position: absolute;
		bottom: 0;
		margin-top: 0;
		z-index: var(--layer-2);
	}
</style>
