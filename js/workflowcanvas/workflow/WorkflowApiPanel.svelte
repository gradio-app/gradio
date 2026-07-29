<script lang="ts">
	import { onMount } from "svelte";
	import CodeIcon from "./icons/CodeIcon.svelte";

	interface ApiParam {
		label: string;
		parameter_name?: string;
		type: string;
		python_type: string;
	}
	interface ApiEndpoint {
		api_name: string;
		label: string;
		parameters: ApiParam[];
		returns: ApiParam[];
		/** Set when the endpoint's function takes a `gr.OAuthToken`. */
		oauth_token?: "required" | "optional";
	}

	const OAUTH_TOKEN_PLACEHOLDER = "hf_...";

	let {
		server = {},
		workflowName = "Workflow",
		onClose
	}: {
		server?: Record<string, any>;
		workflowName?: string;
		onClose: () => void;
	} = $props();

	type Lang = "python" | "javascript" | "bash";
	const LANGS: { key: Lang; label: string }[] = [
		{ key: "python", label: "Python" },
		{ key: "javascript", label: "JavaScript" },
		{ key: "bash", label: "curl" }
	];

	let endpoints = $state<ApiEndpoint[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let lang = $state<Lang>("python");
	let copied = $state<string | null>(null);

	// The Workflow app is served at the site root, so the API base is the
	// current origin (+ any sub-path the app is mounted under, minus a trailing
	// slash).
	const root =
		typeof window !== "undefined"
			? (window.location.origin + window.location.pathname).replace(/\/$/, "")
			: "";

	onMount(async () => {
		try {
			if (!server?.get_workflow_api) {
				throw new Error("This server does not expose a workflow API.");
			}
			const raw = await server.get_workflow_api();
			const parsed = JSON.parse(raw);
			endpoints = parsed.endpoints ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	});

	const EXAMPLE_FILE_URL = "https://example.com/file";

	function isFileParam(p: ApiParam): boolean {
		return (
			p.python_type === "filepath" || p.python_type.startsWith("list[filepath")
		);
	}

	function example(p: ApiParam): string {
		if (isFileParam(p)) {
			// Each client takes a file differently: `handle_file` wraps a URL for
			// the Python and JS clients, while a raw request has to spell out the
			// FileData payload those helpers produce.
			if (lang === "python") return `handle_file('${EXAMPLE_FILE_URL}')`;
			if (lang === "javascript") return `handle_file("${EXAMPLE_FILE_URL}")`;
			return `{"path": "${EXAMPLE_FILE_URL}", "meta": {"_type": "gradio.FileData"}}`;
		}
		if (p.python_type === "float") return "3";
		if (p.python_type === "bool") return lang === "python" ? "True" : "true";
		if (p.python_type === "dict") return "{}";
		return '"Hello!!"';
	}

	function pySnippet(ep: ApiEndpoint): string {
		const imports = ep.parameters.some(isFileParam)
			? "from gradio_client import Client, handle_file"
			: "from gradio_client import Client";
		const args = ep.parameters.map((p) => `\t\t${paramName(p)}=${example(p)},`);
		const client = ep.oauth_token
			? `client = Client("${root}", oauth_token="${OAUTH_TOKEN_PLACEHOLDER}")`
			: `client = Client("${root}")`;
		return [
			imports,
			"",
			client,
			"result = client.predict(",
			...args,
			`\t\tapi_name="${ep.api_name}"`,
			")",
			"print(result)"
		].join("\n");
	}

	function jsSnippet(ep: ApiEndpoint): string {
		const args = ep.parameters
			.map((p) => `\t${paramName(p)}: ${example(p)}`)
			.join(",\n");
		const connect = ep.oauth_token
			? `const client = await Client.connect("${root}", { oauth_token: "${OAUTH_TOKEN_PLACEHOLDER}" });`
			: `const client = await Client.connect("${root}");`;
		const imports = ep.parameters.some(isFileParam)
			? 'import { Client, handle_file } from "@gradio/client";'
			: 'import { Client } from "@gradio/client";';
		return [
			imports,
			"",
			connect,
			`const result = await client.predict("${ep.api_name}", {`,
			args,
			"});",
			"console.log(result.data);"
		].join("\n");
	}

	function bashSnippet(ep: ApiEndpoint): string {
		const data = ep.parameters.map((p) => example(p)).join(", ");
		const body = ep.oauth_token
			? `{"data": [${data}], "oauth_token": "${OAUTH_TOKEN_PLACEHOLDER}"}`
			: `{"data": [${data}]}`;
		return [
			`curl -X POST ${root}/gradio_api/call${ep.api_name} \\`,
			`\t-H "Content-Type: application/json" \\`,
			`\t-d '${body}' \\`,
			`\t| awk -F'"' '{ print $4 }' \\`,
			`\t| xargs -I {} curl -N ${root}/gradio_api/call${ep.api_name}/{}`
		].join("\n");
	}

	function argName(label: string): string {
		return (
			label
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "_")
				.replace(/^_+|_+$/g, "") || "value"
		);
	}

	function paramName(param: ApiParam): string {
		return param.parameter_name || argName(param.label);
	}

	function snippet(ep: ApiEndpoint): string {
		if (lang === "python") return pySnippet(ep);
		if (lang === "javascript") return jsSnippet(ep);
		return bashSnippet(ep);
	}

	// `_build_endpoint_fn` synthesizes the same token parameter into every
	// subgraph endpoint, so the note belongs to the panel rather than being
	// repeated on each card. Still derived from the endpoint data instead of
	// assumed: a mixed set degrades to naming the endpoints it applies to rather
	// than over-claiming, and a required token isn't described as optional.
	const tokenEndpoints = $derived(endpoints.filter((ep) => ep.oauth_token));
	const tokenNote = $derived.by(() => {
		if (tokenEndpoints.length === 0) return null;
		const all = tokenEndpoints.length === endpoints.length;
		const required = tokenEndpoints.some((ep) => ep.oauth_token === "required");
		return {
			subject: all
				? "Each endpoint runs"
				: `${tokenEndpoints.map((ep) => ep.api_name).join(", ")} run`,
			pronoun: all ? "it" : "they",
			verb: required
				? all
					? "requires"
					: "require"
				: all
					? "(optionally) takes"
					: "(optionally) take"
		};
	});

	async function copy(ep: ApiEndpoint): Promise<void> {
		try {
			await navigator.clipboard.writeText(snippet(ep));
			copied = ep.api_name;
			setTimeout(() => {
				if (copied === ep.api_name) copied = null;
			}, 1400);
		} catch {
			/* clipboard unavailable */
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="api-overlay" onclick={onClose}>
	<div class="api-panel" onclick={(e) => e.stopPropagation()}>
		<div class="api-header">
			<div class="api-title">
				<span class="api-glyph"><CodeIcon /></span>
				<div>
					<div class="api-title-main">API</div>
					<div class="api-title-sub">
						Call <strong>{workflowName}</strong> programmatically — one endpoint per
						subgraph
					</div>
				</div>
			</div>
			<button class="api-close" onclick={onClose} title="Close">&times;</button>
		</div>

		<div class="api-langs">
			{#each LANGS as l}
				<button
					class="api-lang"
					class:active={lang === l.key}
					onclick={() => (lang = l.key)}>{l.label}</button
				>
			{/each}
		</div>

		<div class="api-body">
			{#if loading}
				<div class="api-empty">Loading API…</div>
			{:else if error}
				<div class="api-empty api-error">{error}</div>
			{:else if endpoints.length === 0}
				<div class="api-empty">
					No API endpoints yet — wire a component into an output port to expose
					one.
				</div>
			{:else}
				{#each endpoints as ep}
					<div class="api-endpoint">
						<div class="api-endpoint-head">
							<span class="api-method">POST</span>
							<span class="api-name">{ep.api_name}</span>
						</div>

						<div class="api-io">
							<div class="api-io-col">
								<div class="api-io-label">
									Accepts {ep.parameters.length} parameter{ep.parameters
										.length === 1
										? ""
										: "s"}
								</div>
								{#each ep.parameters as p}
									<div class="api-port">
										<span class="api-port-name">{paramName(p)}</span>
										<span class="api-port-type">{p.python_type}</span>
									</div>
								{:else}
									<div class="api-port api-port-empty">no inputs</div>
								{/each}
							</div>
							<div class="api-io-col">
								<div class="api-io-label">Returns</div>
								{#each ep.returns as r}
									<div class="api-port">
										<span class="api-port-name">{paramName(r)}</span>
										<span class="api-port-type">{r.python_type}</span>
									</div>
								{/each}
							</div>
						</div>

						<div class="api-code-wrap">
							<button class="api-copy" onclick={() => copy(ep)}>
								{copied === ep.api_name ? "Copied!" : "Copy"}
							</button>
							<pre class="api-code"><code>{snippet(ep)}</code></pre>
						</div>
					</div>
				{/each}

				{#if tokenNote}
					<div class="api-note">
						<span class="api-note-label">oauth_token</span>
						<span>
							{tokenNote.subject} the workflow on your behalf, so {tokenNote.pronoun}
							{tokenNote.verb}
							your
							<a
								href="https://huggingface.co/settings/tokens"
								target="_blank"
								rel="noreferrer">Hugging Face token</a
							>.
						</span>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.api-overlay {
		position: fixed;
		inset: 0;
		background: rgba(8, 9, 13, 0.72);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--size-6);
	}
	.api-panel {
		width: min(720px, 100%);
		max-height: 86vh;
		display: flex;
		flex-direction: column;
		background: #101118;
		border: 1px solid #2a2b38;
		border-radius: var(--radius-xl);
		box-shadow: 0 var(--size-6) 60px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}
	.api-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: var(--size-4) 18px;
		border-bottom: 1px solid #1e1f2a;
	}
	.api-title {
		display: flex;
		gap: var(--size-3);
		align-items: center;
	}
	.api-glyph {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-accent, #f97316);
		background: #1a1b25;
		border: 1px solid #2a2b38;
		border-radius: var(--radius-lg);
		padding: var(--size-2) var(--size-2-5);
	}
	.api-title-main {
		font-family: "Manrope", sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: #e6e7ec;
	}
	.api-title-sub {
		font-family: "Manrope", sans-serif;
		font-size: var(--size-3);
		color: #8a8c98;
		margin-top: 2px;
	}
	.api-title-sub strong {
		color: #a0a2ae;
		font-weight: 600;
	}
	.api-close {
		background: transparent;
		border: none;
		color: #6b6e78;
		font-size: 22px;
		line-height: 1;
		cursor: pointer;
		padding: 0 var(--size-1);
	}
	.api-close:hover {
		color: #e6e7ec;
	}
	.api-langs {
		display: flex;
		gap: var(--size-1);
		padding: var(--size-2-5) 18px;
		border-bottom: 1px solid #1e1f2a;
	}
	.api-lang {
		font-family: "Manrope", sans-serif;
		font-size: var(--size-3);
		font-weight: 500;
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-full);
		border: 1px solid transparent;
		background: transparent;
		color: #6b6e78;
		cursor: pointer;
	}
	.api-lang:hover {
		color: #a0a2ae;
	}
	.api-lang.active {
		background: #1a1b25;
		border-color: #2a2b38;
		color: #e6e7ec;
	}
	.api-body {
		overflow-y: auto;
		padding: var(--size-4) 18px;
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}
	.api-empty {
		font-family: "Manrope", sans-serif;
		font-size: 13px;
		color: #8a8c98;
		text-align: center;
		padding: var(--size-8) 0;
	}
	.api-error {
		color: #f87171;
	}
	.api-endpoint {
		border: 1px solid #1e1f2a;
		border-radius: var(--size-2-5);
		overflow: hidden;
		/* `.api-body` is a column flex container, and `overflow: hidden` above
		 * resolves this card's automatic minimum size to 0 — so without this the
		 * cards shrink to fit the panel and clip their code blocks mid-line
		 * instead of letting the body scroll. */
		flex-shrink: 0;
	}
	.api-endpoint-head {
		display: flex;
		align-items: center;
		gap: var(--size-2-5);
		padding: var(--size-2-5) var(--size-3);
		background: #16171f;
		border-bottom: 1px solid #1e1f2a;
	}
	.api-method {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: #1a1b25;
		background: var(--color-accent, #f97316);
		border-radius: var(--radius-sm);
		padding: 2px var(--size-1-5);
	}
	.api-name {
		font-family: "JetBrains Mono", monospace;
		font-size: 13px;
		color: #e6e7ec;
		flex: 1;
	}
	.api-code-wrap {
		position: relative;
	}
	.api-copy {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		z-index: 1;
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		padding: var(--size-1) var(--size-2-5);
		border: 1px solid #2a2b38;
		border-radius: var(--radius-md);
		/* Opaque, not transparent: it sits over a scrollable code block. */
		background: #16171f;
		color: #a0a2ae;
		cursor: pointer;
	}
	.api-copy:hover {
		background: #1a1b25;
		color: #e6e7ec;
	}
	.api-io {
		display: flex;
		gap: var(--size-6);
		padding: var(--size-3);
		border-bottom: 1px solid #1e1f2a;
	}
	.api-io-col {
		flex: 1;
		min-width: 0;
	}
	.api-io-label {
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #6b6e78;
		margin-bottom: var(--size-1-5);
	}
	.api-port {
		display: flex;
		justify-content: space-between;
		gap: var(--size-2);
		font-family: "JetBrains Mono", monospace;
		font-size: var(--size-3);
		padding: 3px 0;
	}
	.api-port-name {
		color: #c5c7d0;
	}
	.api-port-type {
		color: var(--color-accent, #f97316);
	}
	.api-port-empty {
		color: #5a5d68;
		font-style: italic;
	}
	/* Panel-level, below every endpoint card — the token isn't one of the
	 * endpoint's own parameters, so it shouldn't read as one. */
	.api-note {
		display: flex;
		gap: var(--size-2-5);
		align-items: baseline;
		padding: var(--size-3);
		border: 1px solid #1e1f2a;
		border-radius: var(--size-2-5);
		flex-shrink: 0;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		line-height: 1.5;
		color: #8a8c98;
	}
	.api-note a {
		color: var(--color-accent, #f97316);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.api-note-label {
		flex-shrink: 0;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: var(--color-accent, #f97316);
		background: #1a1b25;
		border: 1px solid #2a2b38;
		border-radius: var(--radius-sm);
		padding: 2px var(--size-1-5);
	}

	.api-code {
		margin: 0;
		/* Right padding clears the absolutely positioned Copy button. */
		padding: var(--size-3) 76px var(--size-3) 14px;
		background: #0b0c12;
		font-family: "JetBrains Mono", monospace;
		font-size: var(--size-3);
		line-height: 1.55;
		color: #c5c7d0;
		/* Scroll a long snippet inside its own block rather than letting the card
		 * grow unbounded — and never clip it. */
		max-height: 320px;
		overflow: auto;
		white-space: pre;
		tab-size: 2;
	}
	.api-code code {
		font-family: inherit;
	}
</style>
