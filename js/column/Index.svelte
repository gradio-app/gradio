<script context="module" lang="ts">
	export { default as BaseColumn } from "./BaseColumn.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import BaseColumn from "./BaseColumn.svelte";

	let props = $props();

	const gradio = new Gradio<{}, { variant: "default" | "panel" | "compact" }>(
		props,
	);
</script>

<BaseColumn {...gradio.shared}>
	<slot />
</BaseColumn>

<style>
	div {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: var(--layout-gap);
	}

	div > :global(*),
	div > :global(.form > *) {
		width: var(--size-full);
	}

	.hide {
		display: none;
	}

	.compact > :global(*),
	.compact :global(.box) {
		border-radius: 0;
	}

	.compact,
	.panel {
		border: solid var(--panel-border-width) var(--panel-border-color);
		border-radius: var(--container-radius);
		background: var(--panel-background-fill);
		padding: var(--spacing-lg);
	}
</style>
