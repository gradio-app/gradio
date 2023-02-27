<script lang="ts">
	import { default as Info } from "./Info.svelte";
	export let show_label: boolean = true;
	export let info: string | undefined = undefined;
</script>

<span class:sr-only={!show_label} class:hide={!show_label}>
	<slot />
	{#if info}
		<Info>{info}</Info>
	{/if}
</span>

<style>
	span {
		display: block;
		position: relative;
		z-index: var(--layer-4);
		margin-bottom: var(--size-2);
		color: var(--color-text-label);
		font-size: var(--text-xs);
		line-height: var(--line-sm);
	}

	.hide {
		margin: 0;
		height: 0;
	}
</style>
