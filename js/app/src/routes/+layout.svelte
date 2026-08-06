<script lang="ts">
	import "@gradio/theme/reset.css";
	import "@gradio/theme/global.css";
	import "@gradio/theme/pollen.css";
	import "@gradio/theme/typography.css";
	import "@gradio/theme/gradio-style.scss";
	import type { Snippet } from "svelte";

	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}

<style>
	:global(body) {
		background: var(--body-background-fill);
		color: var(--body-text-color);
	}

	@media (prefers-color-scheme: dark) {
		:global(body:not(.theme-loaded)) {
			background: var(--neutral-950);
		}
	}
</style>
