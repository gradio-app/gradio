<script lang="ts">
	import type { Dependency, Payload } from "../types";
	import CopyButton from "./CopyButton.svelte";
	import { Block } from "@gradio/atoms";
	import EndpointDetail from "./EndpointDetail.svelte";

	export let dependency: Dependency;
	export let current_language:
		| "python"
		| "javascript"
		| "bash"
		| "skill"
		| "mcp";
	export let api_description: string | null = null;
	export let analytics: Record<string, any>;
	export let markdown_code_snippets: Record<string, Record<string, string>>;
	export let code_snippets: Record<string, string>;
	export let last_api_call: Payload | null = null;

	$: markdown_code_snippets[
		dependency.api_name as keyof typeof markdown_code_snippets
	] = {
		python: code_snippets.python || "",
		javascript: code_snippets.javascript || "",
		bash: code_snippets.bash || ""
	};

	function escape_html(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}

	function highlight_python(code: string): string {
		let html = escape_html(code);
		html = html.replace(
			/\b(from|import|print)\b/g,
			'<span class="kw">$1</span>'
		);
		html = html.replace(
			/(Client\()("[^"]*")(\))/g,
			'$1<span class="str">$2</span>$3'
		);
		html = html.replace(
			/(api_name=)("[^"]*")/g,
			'$1<span class="api-name">$2</span>'
		);
		return html;
	}

	function highlight_javascript(code: string): string {
		let html = escape_html(code);
		html = html.replace(
			/\b(import|from|const|await)\b/g,
			'<span class="kw">$1</span>'
		);
		html = html.replace(
			/(Client\.connect\()("[^"]*")(\))/g,
			'$1<span class="str">$2</span>$3'
		);
		html = html.replace(
			/(\.predict\()("[^"]*")/g,
			'$1<span class="api-name">$2</span>'
		);
		return html;
	}

	function highlight_bash(code: string): string {
		return escape_html(code);
	}

	$: python_html = highlight_python(code_snippets.python || "");
	$: js_html = highlight_javascript(code_snippets.javascript || "");
	$: bash_html = highlight_bash(code_snippets.bash || "");
</script>

<div class="container">
	<EndpointDetail
		api_name={dependency.api_name}
		description={api_description}
		{analytics}
		{last_api_call}
		dependency_id={dependency.id}
	/>
	<div class:hidden={current_language !== "python"}>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={code_snippets.python || ""} />
				</div>
				<pre>{@html python_html}</pre>
			</code>
		</Block>
	</div>
	<div class:hidden={current_language !== "javascript"}>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={code_snippets.javascript || ""} />
				</div>
				<pre>{@html js_html}</pre>
			</code>
		</Block>
	</div>
	<div class:hidden={current_language !== "bash"}>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={code_snippets.bash || ""} />
				</div>
				<pre>{@html bash_html}</pre>
			</code>
		</Block>
	</div>
</div>

<style>
	code pre {
		overflow-x: auto;
		color: var(--body-text-color);
		font-family: var(--font-mono);
		tab-size: 2;
	}

	code {
		position: relative;
		display: block;
	}

	.copy {
		position: absolute;
		top: 0;
		right: 0;
		margin-top: -5px;
		margin-right: -5px;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
	}

	:global(.api-name) {
		color: var(--color-accent);
	}

	:global(.str) {
		color: var(--color-accent-base);
	}

	.hidden {
		display: none;
	}
</style>
