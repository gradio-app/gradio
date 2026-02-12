<script lang="ts">
	export let parameters = [] as any[];
	export let header = "Parameters";
	export let anchor_links: string | boolean = true;

	import ParamViewer from "@gradio/paramviewer/ParamViewer";

	interface OriginalParam {
		annotation: string | null;
		doc: string;
		default?: string | null;
		name: string;
	}

	interface NewParam {
		type: string | null;
		description: string;
		default: string | null;
		name?: string;
	}

	function decode_html_entities(text: string | null): string {
		if (text == null) {
			return "";
		}

		const entities: { [key: string]: string } = {
			"&quot;": '"',
			"&apos;": "'",
			"&amp;": "&",
			"&lt;": "<",
			"&gt;": ">",
			"&nbsp;": " ",
			"&iexcl;": "¡"
		};

		const decimal_regex = /&#(\d+);/g;
		const hex_regex = /&#x([0-9A-Fa-f]+);/g;
		const named_regex = new RegExp(Object.keys(entities).join("|"), "g");

		return text
			.replace(decimal_regex, (_, code) =>
				String.fromCharCode(parseInt(code, 10))
			)
			.replace(hex_regex, (_, code) => String.fromCharCode(parseInt(code, 16)))
			.replace(named_regex, (match) => entities[match]);
	}
	function convert_params(
		original_parameters: OriginalParam[]
	): Record<string, NewParam> {
		let new_parameters: Record<string, NewParam> = {};
		for (let param of original_parameters) {
			new_parameters[param.name] = {
				type: param.annotation
					? param.annotation
							.replaceAll("Sequence[", "list[")
							.replaceAll("AbstractSet[", "set[")
							.replaceAll("Mapping[", "dict[")
					: null,
				description: decode_html_entities(param.doc),
				default: param.default || null
			};
		}
		return new_parameters;
	}
	let new_parameters = convert_params(parameters);
</script>

<ParamViewer
	docs={new_parameters}
	{header}
	anchor_links={typeof anchor_links === "string"
		? anchor_links.toLowerCase()
		: anchor_links}
/>

<style>
	:global(.header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.7rem 1rem;
		border-bottom: 1px solid var(--table-border-color);
	}

	:global(.title) {
		font-size: var(--scale-0);
		font-weight: 600;
		color: var(--body-text-color);
	}

	:global(.toggle-all) {
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

	:global(.toggle-all:hover) {
		opacity: 1;
	}

	:global(.wrap[data-all-open="true"]) :global(.toggle-all) {
		transform: rotate(180deg);
	}

	:global(.default) :global(pre),
	:global(.default) :global(.highlight) {
		display: inline-block;
	}

	:global(.wrap) :global(pre),
	:global(.wrap) :global(.highlight) {
		margin: 0 !important;
		background: transparent !important;
		font-family: var(--font-mono);
		font-weight: 400;
		padding: 0 !important;
	}

	:global(.wrap) :global(pre a) {
		color: var(--link-text-color-hover);
		text-decoration: underline;
	}

	:global(.wrap) :global(pre a:hover) {
		color: var(--link-text-color-hover);
	}

	:global(.default) > span {
		text-transform: uppercase;
		font-size: 0.7rem;
		font-weight: 600;
	}

	:global(.default) > code {
		border: none;
	}
	:global(code) {
		background: none;
		font-family: var(--font-mono);
	}

	:global(.wrap) {
		padding: 0rem;
		border-radius: 5px;
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
		display: grid;
		grid-template-rows: auto 1fr;
	}

	:global(.type) {
		position: relative;
		padding: 0.7rem 1rem;
		padding-left: 2rem;
		background: var(--table-odd-background-fill);
		border-bottom: 0px solid var(--table-border-color);
		list-style: none;
	}

	:global(.type)::after {
		content: "▼";
		position: absolute;
		top: 50%;
		right: 15px;
		transform: translateY(-50%);
		transition: transform 0.3s ease;
		font-size: 0.7em;
		opacity: 0.7;
		background: transparent;
	}

	:global(details[open]) :global(.type)::after {
		transform: translateY(-50%) rotate(180deg);
	}

	:global(.default) {
		padding: 0.2rem 1rem 0.3rem 1rem;
		border-bottom: 1px solid var(--table-border-color);
		background: var(--block-background-fill);
	}

	:global(.default.last) {
		border-bottom: none;
	}

	:global(.description) {
		padding: 0.7rem 1rem;
		font-size: var(--scale-00);
		font-family: var(--font-sans);
		background: var(--block-background-fill);
	}

	:global(.param) {
		border-bottom: 1px solid var(--table-border-color);
	}

	:global(.param:last-child) {
		border-bottom: none;
	}

	:global(details[open]) :global(.type) {
		border-bottom-width: 1px;
	}

	:global(.param.md) :global(code) {
		background: none;
	}

	:global(details > summary) {
		cursor: pointer;
	}

	:global(details > summary::-webkit-details-marker) {
		display: none;
	}

	:global(.param-link) {
		opacity: 0;
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translateY(-50%);
		transition: opacity 0.2s;
		color: var(--body-text-color);
		text-decoration: none;
	}

	:global(.link-icon) {
		font-size: 14px;
	}

	:global(.type:hover) :global(.param-link) {
		opacity: 0.7;
	}

	:global(.param-link:hover) {
		opacity: 1 !important;
	}

	:global(.param-content) {
		overflow-y: auto;
	}

	/* Dark mode overrides */
	:global(.dark) :global(.wrap) {
		background-color: var(--neutral-800);
		border-color: var(--neutral-700);
		color: var(--neutral-100);
	}

	:global(.dark) :global(.header) {
		border-bottom-color: var(--neutral-700);
	}

	:global(.dark) :global(.title) {
		color: var(--neutral-100);
	}

	:global(.dark) :global(.toggle-all) {
		color: var(--neutral-100);
	}

	:global(.dark) :global(.type) {
		background: var(--neutral-900);
		border-bottom-color: var(--neutral-700);
		color: var(--neutral-100);
	}

	:global(.dark) :global(.type) :global(pre),
	:global(.dark) :global(.type) :global(code) {
		color: var(--neutral-100);
	}

	:global(.dark) :global(.default) {
		background: var(--neutral-800);
		border-bottom-color: var(--neutral-700);
		color: var(--neutral-100);
	}

	:global(.dark) :global(.default) :global(span) {
		color: var(--neutral-300);
	}

	:global(.dark) :global(.description) {
		background: var(--neutral-800);
		color: var(--neutral-100);
	}

	:global(.dark) :global(.param) {
		border-bottom-color: var(--neutral-700);
	}

	:global(.dark) :global(.param-link) {
		color: var(--neutral-100);
	}

	:global(.dark) :global(.type)::after {
		background: transparent;
		color: var(--neutral-100);
	}
</style>
