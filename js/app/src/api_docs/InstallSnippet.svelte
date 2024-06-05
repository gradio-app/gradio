<script lang="ts">
	import CopyButton from "./CopyButton.svelte";
	import { Block } from "@gradio/atoms";

	export let current_language: "python" | "javascript" | "bash";

	let py_install = "pip install gradio_client";
	let js_install = "npm i -D @gradio/client";
	let bash_install = "curl --version";
</script>

<Block border_mode="contrast">
	<code>
		{#if current_language === "python"}
			<div class="copy">
				<CopyButton code={py_install} />
			</div>
			<div>
				<pre>$ {py_install}</pre>
			</div>
		{:else if current_language === "javascript"}
			<div class="copy">
				<CopyButton code={js_install} />
			</div>
			<div>
				<pre>$ {js_install}</pre>
			</div>
		{:else if current_language === "bash"}
			<div class="copy">
				<CopyButton code={bash_install} />
			</div>
			<div>
				<pre>$ {bash_install}</pre>
			</div>
		{/if}
	</code>
</Block>

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
</style>
