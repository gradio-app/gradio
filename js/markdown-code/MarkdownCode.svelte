<script lang="ts">
	import { afterUpdate, tick, onMount } from "svelte";
	import { create_marked } from "./utils";
	import { sanitize } from "@gradio/sanitize";
	import "./prism.css";
	import { standardHtmlAndSvgTags } from "./html-tags";
	import type { ThemeMode } from "@gradio/core";

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
	export let header_links = false;
	export let allow_tags: string[] | boolean = false;
	export let theme_mode: ThemeMode = "system";
	let el: HTMLSpanElement;
	let html: string;
	let katex_loaded = false;

	const marked = create_marked({
		header_links,
		line_breaks,
		latex_delimiters: latex_delimiters || []
	});

	function has_math_syntax(text: string): boolean {
		if (!latex_delimiters || latex_delimiters.length === 0) {
			return false;
		}

		return latex_delimiters.some(
			(delimiter) =>
				text.includes(delimiter.left) && text.includes(delimiter.right)
		);
	}

	function escapeRegExp(string: string): string {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function escapeTags(
		content: string,
		tagsToEscape: string[] | boolean
	): string {
		if (tagsToEscape === true) {
			// https://www.w3schools.com/tags/
			const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)([\s>])/g;
			return content.replace(tagRegex, (match, tagName, endChar) => {
				if (!standardHtmlAndSvgTags.includes(tagName.toLowerCase())) {
					return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
				}
				return match;
			});
		}

		if (Array.isArray(tagsToEscape)) {
			const tagPattern = tagsToEscape.map((tag) => ({
				open: new RegExp(`<(${tag})(\\s+[^>]*)?>`, "gi"),
				close: new RegExp(`</(${tag})>`, "gi")
			}));

			let result = content;

			tagPattern.forEach((pattern) => {
				result = result.replace(pattern.open, (match) =>
					match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
				);
				result = result.replace(pattern.close, (match) =>
					match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
				);
			});
			return result;
		}
		return content;
	}

	function process_message(value: string): string {
		let parsedValue = value;
		if (render_markdown) {
			const latexBlocks: string[] = [];
			latex_delimiters.forEach((delimiter, index) => {
				const leftDelimiter = escapeRegExp(delimiter.left);
				const rightDelimiter = escapeRegExp(delimiter.right);
				const regex = new RegExp(
					`${leftDelimiter}([\\s\\S]+?)${rightDelimiter}`,
					"g"
				);
				parsedValue = parsedValue.replace(regex, (match, p1) => {
					latexBlocks.push(match);
					return `%%%LATEX_BLOCK_${latexBlocks.length - 1}%%%`;
				});
			});

			parsedValue = marked.parse(parsedValue) as string;

			parsedValue = parsedValue.replace(
				/%%%LATEX_BLOCK_(\d+)%%%/g,
				(match, p1) => latexBlocks[parseInt(p1, 10)]
			);
		}

		if (allow_tags) {
			parsedValue = escapeTags(parsedValue, allow_tags);
		}

		if (sanitize_html && sanitize) {
			parsedValue = sanitize(parsedValue);
		}
		return parsedValue;
	}

	$: if (message && message.trim()) {
		html = process_message(message);
	} else {
		html = "";
	}

	async function render_html(value: string): Promise<void> {
		if (latex_delimiters.length > 0 && value && has_math_syntax(value)) {
			if (!katex_loaded) {
				await Promise.all([
					import("katex/dist/katex.min.css"),
					import("katex/contrib/auto-render")
				]).then(([, { default: render_math_in_element }]) => {
					katex_loaded = true;
					render_math_in_element(el, {
						delimiters: latex_delimiters,
						throwOnError: false
					});
				});
			} else {
				const { default: render_math_in_element } = await import(
					"katex/contrib/auto-render"
				);
				render_math_in_element(el, {
					delimiters: latex_delimiters,
					throwOnError: false
				});
			}
		}

		if (el) {
			const mermaidDivs = el.querySelectorAll(".mermaid");
			if (mermaidDivs.length > 0) {
				await tick();
				const { default: mermaid } = await import("mermaid");

				mermaid.initialize({
					startOnLoad: false,
					theme: theme_mode === "dark" ? "dark" : "default",
					securityLevel: "antiscript"
				});
				await mermaid.run({
					nodes: Array.from(mermaidDivs).map((node) => node as HTMLElement)
				});
			}
		}
	}

	afterUpdate(async () => {
		if (el && document.body.contains(el)) {
			await render_html(message);
		} else {
			console.error("Element is not in the DOM");
		}
	});
</script>

<span class:chatbot bind:this={el} class="md" class:prose={render_markdown}>
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
		z-index: 1;
		cursor: pointer;
		border-bottom-left-radius: var(--radius-sm);
		padding: var(--spacing-md);
		width: 25px;
		height: 25px;
		position: absolute;
		right: 0;
	}

	span :global(.check) {
		opacity: 0;
		z-index: var(--layer-top);
		transition: opacity 0.2s;
		background: var(--code-background-fill);
		color: var(--body-text-color);
		position: absolute;
		top: var(--size-1-5);
		left: var(--size-1-5);
	}

	span :global(p:not(:first-child)) {
		margin-top: var(--spacing-xxl);
	}

	span :global(.md-header-anchor) {
		/* position: absolute; */
		margin-left: -25px;
		padding-right: 8px;
		line-height: 1;
		color: var(--body-text-color-subdued);
		opacity: 0;
	}

	span :global(h1:hover .md-header-anchor),
	span :global(h2:hover .md-header-anchor),
	span :global(h3:hover .md-header-anchor),
	span :global(h4:hover .md-header-anchor),
	span :global(h5:hover .md-header-anchor),
	span :global(h6:hover .md-header-anchor) {
		opacity: 1;
	}

	span.md :global(.md-header-anchor > svg) {
		color: var(--body-text-color-subdued);
	}

	span :global(table) {
		word-break: break-word;
	}
</style>
