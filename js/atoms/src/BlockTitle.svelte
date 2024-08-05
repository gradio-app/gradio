<script lang="ts">
	import { default as Info } from "./Info.svelte";
	export let show_label = true;
	export let info: string | undefined = undefined;
	export let info_only = false;
</script>

<span
	class:sr-only={!show_label}
	class:hide={!show_label}
	class:has-info={info != null}
	data-testid="block-info"
	class:info_only
>
	<slot />
</span>
{#if info}
	<span class:info={info_only}>
		<Info>{info}</Info>
	</span>
{/if}

<style>
	span.has-info {
		margin-bottom: var(--spacing-xs);
	}
	span:not(.has-info) {
		margin-bottom: var(--spacing-lg);
	}
	span {
		display: inline-block;
		position: relative;
		z-index: var(--layer-4);
		border: solid var(--block-title-border-width)
			var(--block-title-border-color);
		border-radius: var(--block-title-radius);
		background: var(--block-title-background-fill);
		padding: var(--block-title-padding);
		color: var(--block-title-text-color);
		font-weight: var(--block-title-text-weight);
		font-size: var(--block-title-text-size);
		line-height: var(--line-sm);
	}

	.info_only {
		display: none;
	}

	.hide {
		margin: 0;
		height: 0;
	}
	.info {
		margin-bottom: calc(var(--size-4) * -1) !important;
	}
</style>
