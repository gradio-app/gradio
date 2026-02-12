<script lang="ts">
	import { MarkdownCode as Markdown } from "@gradio/markdown-code";
	export let info: string;
</script>

<div>
	<Markdown message={info} sanitize_html={true} />
</div>

<style>
	div > :global(.md.prose) {
		font-weight: var(--block-info-text-weight);
		font-size: var(--block-info-text-size);
		line-height: var(--line-sm);
	}
	div > :global(.md.prose *) {
		color: var(--block-info-text-color);
	}
	div {
		margin-bottom: var(--spacing-md);
	}
</style>
