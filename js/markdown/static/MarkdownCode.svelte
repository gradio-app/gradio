<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import "katex/dist/katex.min.css";

	import { marked } from "./utils";
	const dispatch = createEventDispatcher();

	import "./prism.css";
	// import "./prism-dark.css";

	// const code_highlight_css = {
	// 	light: (): Promise<typeof import("prismjs/themes/prism.css")> =>
	// 		import("prismjs/themes/prism.css"),
	// 	dark: (): Promise<typeof import("prismjs/themes/prism.css")> =>
	// 		import("prismjs/themes/prism-dark.css")
	// };

	export let chatbot = true;
	export let message: string;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	let el: HTMLSpanElement;

	DOMPurify.addHook("afterSanitizeAttributes", function (node) {
		if ("target" in node) {
			node.setAttribute("target", "_blank");
			node.setAttribute("rel", "noopener noreferrer");
		}
	});

	$: el && html && render_html(message);

	$: html =
		message && message.trim() ? DOMPurify.sanitize(marked.parse(message)) : "";

	async function render_html(value: string): Promise<void> {
		if (latex_delimiters.length > 0) {
			render_math_in_element(el, {
				delimiters: latex_delimiters,
				throwOnError: false
			});
		}
	}
</script>

<span class:chatbot bind:this={el} class="md">
	{@html html}
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
</style>
