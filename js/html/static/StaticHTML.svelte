<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let value: string = "";
	export let label: string | undefined = undefined;
	export let show_label = false;
	export let show_share_button = false;
	export let elem_classes: string[] = [];
	export let visible = true;
	export let i18n: I18nFormatter | undefined = undefined;
	export let gradio: { dispatch: () => void } | undefined = undefined;

	const dispatch = createEventDispatcher<{ load: undefined }>();

	$: if (value !== undefined) {
		dispatch("load");
	}
</script>

{#if visible}
	<div
		class="prose gradio-html {elem_classes.join(' ')}"
		class:hide={!visible}
	>
		{@html value}
	</div>
{/if}

<style>
	.hide {
		display: none;
	}

	.gradio-html {
		word-break: break-word;
	}

	.gradio-html :global(h1) {
		font-size: var(--text-xxl);
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
	}

	.gradio-html :global(h2) {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
	}

	.gradio-html :global(h3) {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
	}

	.gradio-html :global(p) {
		margin-bottom: var(--spacing-lg);
	}

	.gradio-html :global(a) {
		color: var(--color-text-link);
		text-decoration: underline;
	}
</style>
