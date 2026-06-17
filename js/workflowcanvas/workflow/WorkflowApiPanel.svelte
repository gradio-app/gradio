<script lang="ts">
	import { onMount } from "svelte";

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
	}

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

	function example(p: ApiParam): string {
		if (
			p.python_type === "filepath" ||
			p.python_type.startsWith("list[filepath")
		)
			return lang === "python"
				? `handle_file('https://example.com/file')`
				: `"https://example.com/file"`;
		if (p.python_type === "float") return "3";
		if (p.python_type === "bool") return lang === "python" ? "True" : "true";
		if (p.python_type === "dict") return "{}";
		return lang === "python" ? '"Hello!!"' : '"Hello!!"';
	}

	function pySnippet(ep: ApiEndpoint): string {
		const needsHandleFile = ep.parameters.some((p) =>
			p.python_type.includes("filepath")
		);
		const imports = needsHandleFile
			? "from gradio_client import Client, handle_file"
			: "from gradio_client import Client";
		const args = ep.parameters.map((p) => `\t\t${paramName(p)}=${example(p)},`);
		return [
			imports,
			"",
			`client = Client("${root}")`,
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
		return [
			'import { Client } from "@gradio/client";',
			"",
			`const client = await Client.connect("${root}");`,
			`const result = await client.predict("${ep.api_name}", {`,
			args,
			"});",
			"console.log(result.data);"
		].join("\n");
	}

	function bashSnippet(ep: ApiEndpoint): string {
		const data = ep.parameters.map((p) => example(p)).join(", ");
		return [
			`curl -X POST ${root}/gradio_api/call${ep.api_name} \\`,
			`\t-H "Content-Type: application/json" \\`,
			`\t-d '{"data": [${data}]}' \\`,
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
				<span class="api-glyph">&lt;/&gt;</span>
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
					No API endpoints yet — add an output node to expose one.
				</div>
			{:else}
				{#each endpoints as ep}
					<div class="api-endpoint">
						<div class="api-endpoint-head">
							<span class="api-method">POST</span>
							<span class="api-name">{ep.api_name}</span>
							<button class="api-copy" onclick={() => copy(ep)}>
								{copied === ep.api_name ? "Copied!" : "Copy"}
							</button>
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

						<pre class="api-code"><code>{snippet(ep)}</code></pre>
					</div>
				{/each}
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
		padding: 24px;
	}
	.api-panel {
		width: min(720px, 100%);
		max-height: 86vh;
		display: flex;
		flex-direction: column;
		background: #101118;
		border: 1px solid #2a2b38;
		border-radius: 12px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}
	.api-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 16px 18px;
		border-bottom: 1px solid #1e1f2a;
	}
	.api-title {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.api-glyph {
		font-family: "JetBrains Mono", monospace;
		font-size: 13px;
		color: var(--color-accent, #f97316);
		background: #1a1b25;
		border: 1px solid #2a2b38;
		border-radius: 8px;
		padding: 8px 9px;
		line-height: 1;
	}
	.api-title-main {
		font-family: "Manrope", sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: #e6e7ec;
	}
	.api-title-sub {
		font-family: "Manrope", sans-serif;
		font-size: 12px;
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
		padding: 0 4px;
	}
	.api-close:hover {
		color: #e6e7ec;
	}
	.api-langs {
		display: flex;
		gap: 4px;
		padding: 10px 18px;
		border-bottom: 1px solid #1e1f2a;
	}
	.api-lang {
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 500;
		padding: 4px 12px;
		border-radius: 999px;
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
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.api-empty {
		font-family: "Manrope", sans-serif;
		font-size: 13px;
		color: #8a8c98;
		text-align: center;
		padding: 32px 0;
	}
	.api-error {
		color: #f87171;
	}
	.api-endpoint {
		border: 1px solid #1e1f2a;
		border-radius: 10px;
		overflow: hidden;
	}
	.api-endpoint-head {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
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
		border-radius: 4px;
		padding: 2px 6px;
	}
	.api-name {
		font-family: "JetBrains Mono", monospace;
		font-size: 13px;
		color: #e6e7ec;
		flex: 1;
	}
	.api-copy {
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		padding: 4px 10px;
		border: 1px solid #2a2b38;
		border-radius: 6px;
		background: transparent;
		color: #a0a2ae;
		cursor: pointer;
	}
	.api-copy:hover {
		background: #1a1b25;
		color: #e6e7ec;
	}
	.api-io {
		display: flex;
		gap: 24px;
		padding: 12px;
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
		margin-bottom: 6px;
	}
	.api-port {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
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
	.api-code {
		margin: 0;
		padding: 12px 14px;
		background: #0b0c12;
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		line-height: 1.55;
		color: #c5c7d0;
		overflow-x: auto;
		white-space: pre;
		tab-size: 2;
	}
	.api-code code {
		font-family: inherit;
	}
</style>
