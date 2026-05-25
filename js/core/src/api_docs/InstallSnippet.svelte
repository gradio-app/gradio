<script lang="ts">
	import CopyButton from "./CopyButton.svelte";
	import { Block } from "@gradio/atoms";

	export let current_language:
		| "python"
		| "javascript"
		| "bash"
		| "skill"
		| "mcp"
		| "cli";
	export let cli_flavor: "hf" | "gradio" = "hf";

	let py_install = "pip install gradio_client";
	let js_install = "npm i -D @gradio/client";
	let bash_install = "curl --version";
	const hf_mac_install = "curl -LsSf https://hf.co/cli/install.sh | bash";
	const hf_win_install =
		'powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"';
	$: cli_install =
		cli_flavor === "hf"
			? "hf extensions install gradio-app/hf-gradio"
			: "pip install gradio --upgrade";
</script>

{#if current_language === "python"}
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={py_install} />
			</div>
			<div>
				<pre>$ {py_install}</pre>
			</div>
		</code>
	</Block>
{:else if current_language === "javascript"}
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={js_install} />
			</div>
			<div>
				<pre>$ {js_install}</pre>
			</div>
		</code>
	</Block>
{:else if current_language === "bash"}
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={bash_install} />
			</div>
			<div>
				<pre>$ {bash_install}</pre>
			</div>
		</code>
	</Block>
{:else if current_language === "cli"}
	{#if cli_flavor === "hf"}
		<p class="step">First, install the HF CLI.</p>
		<p class="os-label">On macOS and Linux:</p>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={hf_mac_install} />
				</div>
				<div>
					<pre>$ {hf_mac_install}</pre>
				</div>
			</code>
		</Block>
		<p class="os-label">On Windows:</p>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={hf_win_install} />
				</div>
				<div>
					<pre>$ {hf_win_install}</pre>
				</div>
			</code>
		</Block>
		<p class="step">Then, install the Gradio extension:</p>
	{/if}
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={cli_install} />
			</div>
			<div>
				<pre>$ {cli_install}</pre>
			</div>
		</code>
	</Block>
{/if}

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

	.step {
		margin-top: var(--size-3);
		margin-bottom: var(--size-2);
		font-weight: var(--weight-semibold);
		color: var(--body-text-color);
	}

	.os-label {
		margin-top: var(--size-2);
		margin-bottom: var(--size-1);
		font-size: var(--text-sm);
		color: var(--body-text-color-subdued);
	}
</style>
