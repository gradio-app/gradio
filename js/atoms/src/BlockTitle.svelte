<script lang="ts">
	import { default as Info } from "./Info.svelte";
	export let show_label = true;
	export let info: string | undefined = undefined;
	export let rtl = false;
</script>

<span
	class:hide={!show_label}
	class:has-info={info != null}
	class:sr-only={!show_label}
	data-testid="block-info"
	dir={rtl ? "rtl" : "ltr"}
>
	<slot />
</span>
{#if info}
	<Info {info} />
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

	span[dir="rtl"] {
		display: block;
	}

	.hide {
		margin: 0;
		height: 0;
	}

	.sr-only {
		clip: rect(0, 0, 0, 0);
		position: absolute;
		margin: -1px;
		border-width: 0;
		padding: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
