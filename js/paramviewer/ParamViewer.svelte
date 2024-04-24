<script lang="ts">
	import "./prism.css";

	import Prism from "prismjs";
	import "prismjs/components/prism-python";
	import "prismjs/components/prism-typescript";

	interface Param {
		type: string | null;
		description: string;
		default: string | null;
		name?: string;
	}

	export let docs: Record<string, Param>;

	export let lang: "python" | "typescript" = "python";
	export let linkify: string[] = [];
	let _docs: Param[];

	$: {
		setTimeout(() => {
			_docs = highlight_code(docs, lang);
		}, 0);
	}
	$: show_desc = _docs && _docs.map((x) => false);

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
	let el = [];
</script>

<div class="wrap">
	{#if _docs}
		{#each _docs as { type, description, default: _default, name }, i (name)}
			<div class="param md" class:open={show_desc[i]}>
				<div class="type">
					<pre class="language-{lang}"><code bind:this={el[i]}
							>{name}{#if type}: {@html type}{/if}</code
						></pre>
					<button
						on:click={() => (show_desc[i] = !show_desc[i])}
						class="arrow"
						class:disabled={!description && !_default}
						class:hidden={!show_desc[i]}>▲</button
					>
				</div>
				{#if show_desc[i]}
					{#if _default}
						<div class="default" class:last={!description}>
							<span style:padding-right={"4px"}>default</span>
							<code>= {@html _default}</code>
						</div>
					{/if}
					{#if description}
						<div class="description"><p>{description}</p></div>
					{/if}
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.default :global(pre),
	.default :global(.highlight) {
		display: inline-block;
	}

	.disbaled {
		opacity: 0;
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
		background: var(--table-odd-background-fill);
		width: 100%;
		line-height: var(--line-sm);
		color: var(--body-text-color);
	}

	.type {
		position: relative;
		padding: 0.7rem 1rem;
		background: var(--table-odd-background-fill);
		border-bottom: 0px solid var(--table-border-color);
	}

	.arrow {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 15px;
		transform: rotate(180deg);
		height: 100;
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.arrow.hidden {
		transform: rotate(270deg);
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

	.param:last-child .description {
		border-bottom: none;
	}

	.open .type {
		border-bottom-width: 1px;
	}

	.param.md code {
		background: none;
	}
</style>
