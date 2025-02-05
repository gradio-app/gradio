<script lang="ts">
	import "./prism.css";

	import Prism from "prismjs";
	import "prismjs/components/prism-python";
	import "prismjs/components/prism-typescript";

	import { onMount } from "svelte";

	interface Param {
		type: string | null;
		description: string;
		default: string | null;
		name?: string;
	}

	export let docs: Record<string, Param>;
	export let lang: "python" | "typescript" = "python";
	export let linkify: string[] = [];
	export let header: string | null;
	export let anchor_links: string | boolean = false;

	let component_root: HTMLElement;
	let _docs: Param[];
	let all_open = false;

	$: _docs = highlight_code(docs, lang);

	function create_slug(name: string, anchor_links: string | boolean): string {
		let prefix = "param-";
		if (typeof anchor_links === "string") {
			prefix += anchor_links + "-";
		}
		return prefix + name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	}

	function highlight(code: string, lang: "python" | "typescript"): string {
		let highlighted = Prism.highlight(code, Prism.languages[lang], lang);

		for (const link of linkify) {
			highlighted = highlighted.replace(
				new RegExp(link, "g"),
				`<a href="#h-${link.toLocaleLowerCase()}">${link}</a>`
			);
		}

		return highlighted;
	}

	function highlight_code(
		_docs: typeof docs,
		lang: "python" | "typescript"
	): Param[] {
		if (!_docs) {
			return [];
		}
		return Object.entries(_docs).map(
			([name, { type, description, default: _default }]) => {
				let highlighted_type = type ? highlight(type, lang) : null;

				return {
					name: name,
					type: highlighted_type,
					description: description,
					default: _default ? highlight(_default, lang) : null
				};
			}
		);
	}

	function toggle_all(): void {
		all_open = !all_open;
		const details = component_root.querySelectorAll(".param");
		details.forEach((detail) => {
			if (detail instanceof HTMLDetailsElement) {
				detail.open = all_open;
			}
		});
	}

	function render_links(description: string): string {
		const escaped = description
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");

		const markdown_links = escaped.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank">$1</a>'
		);
		return markdown_links;
	}

	onMount(() => {
		if (window.location.hash) {
			open_parameter_from_hash(window.location.hash);
		}

		window.addEventListener("hashchange", (e) => {
			open_parameter_from_hash(window.location.hash);
		});
	});

	function open_parameter_from_hash(hash: string): void {
		if (!component_root) return;

		const id = hash.slice(1);
		const detail = component_root.querySelector(`#${id}`);

		if (detail instanceof HTMLDetailsElement) {
			detail.open = true;
			detail.scrollIntoView({ behavior: "smooth" });
		}
	}
</script>

<div class="wrap" bind:this={component_root}>
	{#if header !== null}
		<div class="header">
			<span class="title">{header}</span>
			<button
				class="toggle-all"
				on:click={toggle_all}
				title={all_open ? "Close All" : "Open All"}
			>
				▼
			</button>
		</div>
	{/if}
	{#if _docs}
		{#each _docs as { type, description, default: _default, name } (name)}
			<details
				class="param md"
				id={anchor_links ? create_slug(name || "", anchor_links) : undefined}
			>
				<summary class="type">
					{#if anchor_links}
						<a
							href="#{create_slug(name || '', anchor_links)}"
							class="param-link"
						>
							<span class="link-icon">🔗</span>
						</a>
					{/if}
					<pre class="language-{lang}"><code
							>{name}{#if type}: {@html type}{/if}</code
						></pre>
				</summary>
				{#if _default}
					<div class="default" class:last={!description}>
						<span style:padding-right={"4px"}>default</span>
						<code>= {@html _default}</code>
					</div>
				{/if}
				{#if description}
					<div class="description">
						<p>{@html render_links(description)}</p>
					</div>
				{/if}
			</details>
		{/each}
	{/if}
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.7rem 1rem;
		border-bottom: 1px solid var(--table-border-color);
	}

	.title {
		font-size: var(--scale-0);
		font-weight: 600;
		color: var(--body-text-color);
	}

	.toggle-all {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		color: var(--body-text-color);
		font-size: 0.7em;
		line-height: 1;
		opacity: 0.7;
		transition:
			opacity 0.2s ease,
			transform 0.3s ease;
	}

	.toggle-all:hover {
		opacity: 1;
	}

	:global(.wrap[data-all-open="true"]) .toggle-all {
		transform: rotate(180deg);
	}

	.default :global(pre),
	.default :global(.highlight) {
		display: inline-block;
	}

	.wrap :global(pre),
	.wrap :global(.highlight) {
		margin: 0 !important;
		background: transparent !important;
		font-family: var(--font-mono);
		font-weight: 400;
		padding: 0 !important;
	}

	.wrap :global(pre a) {
		color: var(--link-text-color-hover);
		text-decoration: underline;
	}

	.wrap :global(pre a:hover) {
		color: var(--link-text-color-hover);
	}

	.default > span {
		text-transform: uppercase;
		font-size: 0.7rem;
		font-weight: 600;
	}

	.default > code {
		border: none;
	}
	code {
		background: none;
		font-family: var(--font-mono);
	}

	.wrap {
		padding: 0rem;
		border-radius: 5px;
		border: 1px solid #eee;
		overflow: hidden;
		position: relative;
		margin: 0;
		box-shadow: var(--block-shadow);
		border-width: var(--block-border-width);
		border-color: var(--block-border-color);
		border-radius: var(--block-radius);
		width: 100%;
		line-height: var(--line-sm);
		color: var(--body-text-color);
	}

	.type {
		position: relative;
		padding: 0.7rem 1rem;
		padding-left: 2rem;
		background: var(--table-odd-background-fill);
		border-bottom: 0px solid var(--table-border-color);
		list-style: none;
	}

	.type::after {
		content: "▼";
		position: absolute;
		top: 50%;
		right: 15px;
		transform: translateY(-50%);
		transition: transform 0.3s ease;
		font-size: 0.7em;
		opacity: 0.7;
	}

	details[open] .type::after {
		transform: translateY(-50%) rotate(180deg);
	}

	.default {
		padding: 0.2rem 1rem 0.3rem 1rem;
		border-bottom: 1px solid var(--table-border-color);
		background: var(--block-background-fill);
	}

	.default.last {
		border-bottom: none;
	}

	.description {
		padding: 0.7rem 1rem;
		font-size: var(--scale-00);
		font-family: var(--font-sans);
		background: var(--block-background-fill);
	}

	.param {
		border-bottom: 1px solid var(--table-border-color);
	}

	.param:last-child {
		border-bottom: none;
	}

	details[open] .type {
		border-bottom-width: 1px;
	}

	.param.md code {
		background: none;
	}

	details > summary {
		cursor: pointer;
	}

	details > summary::-webkit-details-marker {
		display: none;
	}

	.param-link {
		opacity: 0;
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translateY(-50%);
		transition: opacity 0.2s;
		color: var(--body-text-color);
		text-decoration: none;
	}

	.link-icon {
		font-size: 14px;
	}

	.type:hover .param-link {
		opacity: 0.7;
	}

	.param-link:hover {
		opacity: 1 !important;
	}
</style>
