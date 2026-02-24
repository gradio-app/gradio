<script lang="ts">
	import { Block } from "@gradio/atoms";
	import CopyButton from "./CopyButton.svelte";

	export let space_id: string | null;

	$: effective_space_id = space_id || "abidlabs/en2fr";
	$: skill_id = effective_space_id.replace("/", "-");
	$: install_gradio = "pip install --upgrade gradio";
	$: install_cmd_claude = `gradio skills add ${effective_space_id} --claude`;
	$: install_cmd_cursor = `gradio skills add ${effective_space_id} --cursor`;
	$: install_cmd_codex = `gradio skills add ${effective_space_id} --codex`;

	$: skill_preview = `---
name: ${skill_id}
description: Use the ${effective_space_id} Gradio Space via API. Provides Python, JavaScript, and cURL usage examples.
---

# ${effective_space_id}

This skill describes how to use the ${effective_space_id} Gradio Space programmatically.

## API Endpoints
...`;
</script>

<div class="skill-content">
	<p class="padded">
		1. Make sure you are using the latest version of Gradio:
	</p>
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={install_gradio} />
			</div>
			<div>
				<pre>$ {install_gradio}</pre>
			</div>
		</code>
	</Block>

	<p class="padded">
		2. Install the usage of this Space as a Skill for your coding agent by
		running this in your terminal:
	</p>
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={install_cmd_claude} />
			</div>
			<div>
				<pre>$ {install_cmd_claude}</pre>
			</div>
		</code>
	</Block>
	<p class="hint">
		Instead of <span class="inline-code">--claude</span>, you can use <span
			class="inline-code">--cursor</span
		>, <span class="inline-code">--codex</span>, or <span class="inline-code"
			>--opencode</span
		>. Combine flags to install for multiple agents. Use <span
			class="inline-code">--global</span
		> to install user-level instead of per-project.
	</p>

	<p class="padded">
		3. This will add a skill to your coding agent that describes how to use
		this Space via Python, JavaScript, and cURL API. The skill will look like
		this:
	</p>
	<Block>
		<code>
			<div class="copy">
				<CopyButton code={skill_preview} />
			</div>
			<div>
				<pre>{skill_preview}</pre>
			</div>
		</code>
	</Block>
</div>

<style>
	.skill-content {
		margin-top: var(--size-2);
	}

	p.padded {
		padding: 15px 0px;
		font-size: var(--text-lg);
	}

	.hint {
		margin-top: var(--size-2);
		color: var(--body-text-color);
		opacity: 0.8;
		font-size: var(--text-md);
		line-height: 1.6;
	}

	.inline-code {
		display: inline;
		font-family: var(--font-mono);
		font-size: var(--text-md);
		background: var(--background-fill-secondary);
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}

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
</style>
