<script lang="ts">
	import { afterUpdate, createEventDispatcher } from "svelte";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import "katex/dist/katex.min.css";
	import { marked } from "./utils";
	import "./prism.css";

	export let chatbot = true;
	export let message: string;
	export let sanitize_html = true;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[] = [];
	export let render_markdown = true;
	export let line_breaks = true;
	let el: HTMLSpanElement;
	let html: string;

	marked.use({ breaks: line_breaks });

	DOMPurify.addHook("afterSanitizeAttributes", function (node) {
		if ("target" in node) {
			node.setAttribute("target", "_blank");
			node.setAttribute("rel", "noopener noreferrer");
		}
	});

	function process_message(value: string): string {
		if (render_markdown) {
			value = marked.parse(value);
		}
		if (sanitize_html) {
			value = DOMPurify.sanitize(value);
		}
		return value;
	}

	$: if (message && message.trim()) {
		html = process_message(message);
	} else {
		html = "";
	}
	async function render_html(value: string): Promise<void> {
		if (latex_delimiters.length > 0 && value) {
			render_math_in_element(el, {
				delimiters: latex_delimiters,
				throwOnError: false
			});
		}
	}
	afterUpdate(() => render_html(message));
</script>

<span class:chatbot bind:this={el} class="md">
	{#if render_markdown}
		{@html html}
	{:else}
		{html}
	{/if}
</span>

<style>
	span :global(div[class*="code_wrap"]) {
		position: relative;
	}

	/* KaTeX */
	span :global(span.katex) {
		font-size: var(--text-lg);
		direction: ltr;
	}

	span :global(div[class*="code_wrap"] > button) {
		position: absolute;
		top: var(--spacing-sm);
		right: var(--spacing-sm);
		z-index: 1;
		cursor: pointer;
		border-bottom-left-radius: var(--radius-sm);
		padding: 5px;
		padding: var(--spacing-md);
		width: 25px;
		height: 25px;
	}

	span :global(code > button > span) {
		position: absolute;
		top: var(--spacing-sm);
		right: var(--spacing-sm);
		width: 12px;
		height: 12px;
	}

	span :global(.check) {
		position: absolute;
		top: 0;
		right: 0;
		opacity: 0;
		z-index: var(--layer-top);
		transition: opacity 0.2s;
		background: var(--background-fill-primary);
		padding: var(--size-1);
		width: 100%;
		height: 100%;
		color: var(--body-text-color);
	}

	span :global(pre) {
		position: relative;
	}

	span:not(.chatbot) :global(ul) {
		list-style-position: inside;
	}

	span:not(.chatbot) :global(ol) {
		list-style-position: inside;
	}
	span :global(p:not(:first-child)) {
		margin-top: var(--spacing-xxl);
	}
</style>
