<script lang="ts">
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
	// marked only renders header links if they were on when it was created.
	const use_header_links = header_links;

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
			let value = "";
			let settings = "";
			let done = true;
			do {
				value = latest_message;
				settings = latest_settings;
				try {
					done = await render(value, settings);
				} catch (error) {
					console.error(error);
					done = true;
				}
			} while (
				!done ||
				value !== latest_message ||
				settings !== latest_settings
			);
		} finally {
			rendering = false;
		}
		onload?.();
		draw_diagrams();
	}

	let drawing = false;
	let draw_again = false;

	// Mermaid is slow to load and to run, so diagrams are drawn apart from
	// the text, once it has caught up, and updates keep rendering meanwhile.
	async function draw_diagrams(): Promise<void> {
		if (drawing) {
			draw_again = true;
			return;
		}
		drawing = true;
		let drawn = false;
		try {
			do {
				draw_again = false;
				try {
					drawn = (await render_mermaid()) || drawn;
				} catch (error) {
					// mermaid still draws the other diagrams before it rejects.
					drawn = true;
					console.error(error);
				}
			} while (draw_again);
		} finally {
			drawing = false;
		}
		if (drawn) onload?.();
	}

	interface Block {
		key: string;
		nodes: ChildNode[];
	}

	// The rendered top-level blocks. Only the blocks that differ from the
	// previous render are rebuilt on each update.
	let blocks: Block[] = [];
	// What every block depends on: the settings and the reference links.
	let blocks_context = "";

	// Rendered nodes can be removed or replaced from outside (e.g. by a page
	// translation extension). The blocks cannot be reused then.
	function blocks_intact(): boolean {
		return blocks.every((block) =>
			block.nodes.every((node) => node.parentNode === el)
		);
	}

	async function render(value: string, settings: string): Promise<boolean> {
		const { context, blocks: next } =
			value && value.trim()
				? split_blocks(value, settings)
				: { context: settings, blocks: [] };
		const reuse = blocks_intact() && context === blocks_context;

		let start = 0;
		while (
			reuse &&
			start < blocks.length &&
			start < next.length &&
			blocks[start].key === next[start].key
		) {
			start++;
		}
		let end = 0;
		while (
			reuse &&
			end < blocks.length - start &&
			end < next.length - start &&
			blocks[blocks.length - 1 - end].key === next[next.length - 1 - end].key
		) {
			end++;
		}

		// All awaits happen before the DOM changes, so a failed render leaves
		// the blocks as they were.
		const changed = next.slice(start, next.length - end);
		const rendered = await Promise.all(changed.map((block) => block.render()));
		const added: Block[] = changed.map((block, i) => ({
			key: block.key,
			nodes: Array.from(rendered[i].childNodes)
		}));
		const fragment = document.createDocumentFragment();
		fragment.append(...rendered);
		if (!el) return true;
		// Nodes can also be removed while the blocks render. The next
		// attempt then rebuilds everything.
		if (reuse && !blocks_intact()) return false;

		const kept_after = blocks.slice(blocks.length - end);
		if (reuse) {
			for (const block of blocks.slice(start, blocks.length - end)) {
				for (const node of block.nodes) node.remove();
			}
			const anchor = kept_after.find((block) => block.nodes.length)?.nodes[0];
			el.insertBefore(fragment, anchor ?? null);
		} else {
			el.replaceChildren(fragment);
		}
		blocks = [...blocks.slice(0, start), ...added, ...kept_after];
		blocks_context = context;
		return true;
	}

	function split_blocks(
		value: string,
		settings: string
	): {
		context: string;
		blocks: { key: string; render: () => Promise<DocumentFragment> }[];
	} {
		if (!render_markdown) {
			return {
				context: settings,
				blocks: [{ key: value, render: async () => to_fragment(value, value) }]
			};
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
		const context = [settings, JSON.stringify(tokens.links)].join("\0");
		const heading_ids = use_header_links
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
			track_open_elements(marked, token, open_elements, allow_tags || false);
		});

		const next = groups.map((group) => {
			const group_tokens = group.map((i) => top_level[i]);
			const raws = group_tokens.map((token) => restore_latex(token.raw));
			const source = raws.join("");
			const ids = group.map((i) => heading_ids[i] ?? []);
			return {
				// Per token, so that text moving between the blocks of a group
				// changes the key.
				key: JSON.stringify([ids, raws]),
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
		return { context, blocks: next };
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
			try {
				const [, { default: render_math_in_element }] = await Promise.all([
					import("katex/dist/katex.min.css"),
					import("katex/contrib/auto-render")
				]);
				// auto-render only walks child nodes, so a fragment works here.
				render_math_in_element(fragment as unknown as HTMLElement, {
					delimiters: latex_delimiters,
					throwOnError: false
				});
			} catch (error) {
				console.error(error);
			}
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

	async function render_mermaid(): Promise<boolean> {
		// Mermaid marks each diagram it has tried, so only new ones are drawn.
		const mermaidDivs = el
			? Array.from(el.querySelectorAll(".mermaid:not([data-processed])"))
			: [];
		if (mermaidDivs.length > 0) {
			const { default: mermaid } = await import("mermaid");

			mermaid.initialize({
				startOnLoad: false,
				theme: theme_mode === "dark" ? "dark" : "default",
				securityLevel: "antiscript"
			});
			await mermaid.run({
				nodes: mermaidDivs.map((node) => node as HTMLElement)
			});
			return true;
		}
		return false;
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
