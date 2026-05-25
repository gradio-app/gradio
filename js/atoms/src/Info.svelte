<script lang="ts">
	import { render_inline_markdown } from "./inline-markdown";
	export let info: string;
</script>

<div class="info-text">
	{@html render_inline_markdown(info)}
</div>

<style>
	.info-text {
		font-weight: var(--block-info-text-weight);
		font-size: var(--block-info-text-size);
		line-height: var(--line-sm);
		color: var(--block-info-text-color);
		margin-bottom: var(--spacing-md);
	}
	.info-text :global(a) {
		color: var(--link-text-color);
		text-decoration: underline;
	}
	.info-text :global(code) {
		background: var(--code-background-fill);
		padding: 0.1em 0.3em;
		border-radius: 3px;
		font-size: 0.9em;
	}
</style>
