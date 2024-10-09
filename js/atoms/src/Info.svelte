<script lang="ts">
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	export let info: string;
	export let root: string;
</script>

<div>
	<Markdown {root} message={info} sanitize_html={true} />
</div>

<style>
	div {
		margin-bottom: var(--spacing-lg);
		color: var(--block-info-text-color);
		font-weight: var(--block-info-text-weight);
		font-size: var(--block-info-text-size);
		line-height: var(--line-sm);
	}
</style>
