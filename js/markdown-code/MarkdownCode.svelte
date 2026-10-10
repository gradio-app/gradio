<script lang="ts">
	import { onMount, tick } from "svelte";
	import {
		assign_heading_ids,
		create_marked,
		escape,
		escapeTags,
		track_open_elements
	} from "./utils";
	import { sanitize_fragment } from "@gradio/sanitize";
	import "./prism.css";
	import type { ThemeMode } from "@gradio/core";

	let {
		chatbot = true,
		message,
		sanitize_html = true,
		latex_delimiters = [],
		render_markdown = true,
		line_breaks = true,
		header_links = false,
		allow_tags = false,
		theme_mode = "system",
		onload
	}: {
		chatbot?: boolean;
		message: string;
		sanitize_html?: boolean;
		latex_delimiters?: {
			left: string;
			right: string;
			display: boolean;
		}[];
		render_markdown?: boolean | undefined;
		line_breaks?: boolean;
		header_links?: boolean;
		allow_tags?: string[] | boolean | undefined;
		theme_mode?: ThemeMode;
		onload?: () => void;
	} = $props();

	let el: HTMLSpanElement;

	const marked = create_marked({
		header_links,
		line_breaks,
		latex_delimiters: latex_delimiters || []
	});

	let latest_message = "";
	let latest_settings = "";
	let rendering = false;

	$effect(() => {
		latest_message = message;
		latest_settings = JSON.stringify([
			render_markdown,
			sanitize_html,
			allow_tags,
			latex_delimiters,
			theme_mode
		]);
		if (!rendering) {
			render_latest();
		}
	});

	// Only one render runs at a time. Updates that arrive meanwhile collapse
	// into the latest message, so a slow render does not queue up a backlog.
	async function render_latest(): Promise<void> {
		rendering = true;
		try {
			let value: string;
			let settings: string;
			do {
				value = latest_message;
				settings = latest_settings;
				await render(value, settings);
			} while (value !== latest_message || settings !== latest_settings);
		} finally {
			rendering = false;
		}
		onload?.();
	}

	interface Block {
		key: string;
		nodes: ChildNode[];
	}

	// The rendered top-level blocks, in order. Only the blocks that differ from
	// the previous render are rebuilt, so the work per streamed update stays
	// proportional to the change rather than to the whole message.
	let blocks: Block[] = [];

	async function render(value: string, settings: string): Promise<void> {
		const next = value && value.trim() ? split_blocks(value, settings) : [];

		let start = 0;
		while (
			start < blocks.length &&
			start < next.length &&
			blocks[start].key === next[start].key
		) {
			start++;
		}
		let end = 0;
		while (
			end < blocks.length - start &&
			end < next.length - start &&
			blocks[blocks.length - 1 - end].key === next[next.length - 1 - end].key
		) {
			end++;
		}

		const added: Block[] = [];
		const fragment = document.createDocumentFragment();
		for (const block of next.slice(start, next.length - end)) {
			const rendered = await block.render();
			added.push({ key: block.key, nodes: Array.from(rendered.childNodes) });
			fragment.append(rendered);
		}
		if (!el) return;

		const kept_after = blocks.slice(blocks.length - end);
		for (const block of blocks.slice(start, blocks.length - end)) {
			for (const node of block.nodes) node.remove();
		}
		const anchor = kept_after.find((block) => block.nodes.length)?.nodes[0];
		el.insertBefore(fragment, anchor ?? null);
		blocks = [...blocks.slice(0, start), ...added, ...kept_after];

		await render_mermaid(added.flatMap((block) => block.nodes));
	}

	function split_blocks(
		value: string,
		settings: string
	): { key: string; render: () => Promise<DocumentFragment> }[] {
		if (!render_markdown) {
			return [
				{
					key: [settings, value].join("\0"),
					render: async () => to_fragment(value, value)
				}
			];
		}

		const latexBlocks: string[] = [];
		let parsedValue = value;
		latex_delimiters.forEach((delimiter) => {
			const leftDelimiter = escapeRegExp(delimiter.left);
			const rightDelimiter = escapeRegExp(delimiter.right);
			const regex = new RegExp(
				`${leftDelimiter}([\\s\\S]+?)${rightDelimiter}`,
				"g"
			);
			parsedValue = parsedValue.replace(regex, (match) => {
				latexBlocks.push(match);
				return `%%%LATEX_BLOCK_${latexBlocks.length - 1}%%%`;
			});
		});
		const restore_latex = (
			text: string,
			encode: (latex: string) => string = (latex) => latex
		): string =>
			text.replace(/%%%LATEX_BLOCK_(\d+)%%%/g, (match, p1) =>
				encode(latexBlocks[parseInt(p1, 10)])
			);

		const tokens = marked.lexer(parsedValue);
		const top_level = tokens.filter((token) => token.type !== "space");
		// A reference definition can change how an earlier block renders.
		const links = JSON.stringify(tokens.links);
		const heading_ids = header_links
			? assign_heading_ids(marked, top_level)
			: [];

		// Raw HTML can leave an element open across blocks (e.g. <details>
		// around markdown), so blocks are grouped until it is closed again and
		// each group is parsed as one piece of HTML.
		const groups: number[][] = [];
		const open_elements: string[] = [];
		top_level.forEach((token, i) => {
			if (open_elements.length > 0) {
				groups[groups.length - 1].push(i);
			} else {
				groups.push([i]);
			}
			track_open_elements(marked, token, open_elements);
		});

		return groups.map((group) => {
			const group_tokens = group.map((i) => top_level[i]);
			const source = restore_latex(
				group_tokens.map((token) => token.raw).join("")
			);
			const ids = group.map((i) => heading_ids[i]?.join(" ")).join(" ");
			return {
				key: [settings, links, ids, source].join("\0"),
				render: async () => {
					// marked.parse() would run walkTokens itself; it does the
					// async syntax highlighting of code blocks.
					if (marked.defaults.walkTokens) {
						await Promise.all(
							marked.walkTokens(group_tokens, marked.defaults.walkTokens)
						);
					}
					const html = restore_latex(marked.parser(group_tokens), escape);
					return to_fragment(html, source);
				}
			};
		});
	}

	async function to_fragment(
		html: string,
		source: string
	): Promise<DocumentFragment> {
		if (allow_tags) {
			html = escapeTags(html, allow_tags);
		}

		let fragment: DocumentFragment;
		if (sanitize_html && sanitize_fragment) {
			fragment = sanitize_fragment(html);
		} else {
			const template = document.createElement("template");
			template.innerHTML = html;
			fragment = template.content;
		}

		if (has_math_syntax(source)) {
			const [, { default: render_math_in_element }] = await Promise.all([
				import("katex/dist/katex.min.css"),
				import("katex/contrib/auto-render")
			]);
			// auto-render only walks child nodes, so a fragment works here.
			render_math_in_element(fragment as unknown as HTMLElement, {
				delimiters: latex_delimiters,
				throwOnError: false
			});
		}
		return fragment;
	}

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

	async function render_mermaid(nodes: Node[]): Promise<void> {
		const mermaidDivs = nodes.flatMap((node) =>
			node instanceof Element
				? [
						...(node.matches(".mermaid") ? [node] : []),
						...node.querySelectorAll(".mermaid")
					]
				: []
		);
		if (mermaidDivs.length > 0) {
			await tick();
			const { default: mermaid } = await import("mermaid");

			mermaid.initialize({
				startOnLoad: false,
				theme: theme_mode === "dark" ? "dark" : "default",
				securityLevel: "antiscript"
			});
			await mermaid.run({
				nodes: mermaidDivs.map((node) => node as HTMLElement)
			});
		}
	}
</script>

<span class:chatbot bind:this={el} class="md" class:prose={render_markdown}
></span>

<style>
	span {
		/* `anywhere`, not `break-word`: it also lowers min-content width, so
		   markdown in a table/flex container shrinks to fit instead of forcing
		   the container to overflow. */
		overflow-wrap: anywhere;
	}

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
