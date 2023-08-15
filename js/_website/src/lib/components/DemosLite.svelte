<script lang="ts" type="module">
	import { svgCopy, svgCheck } from "$lib/assets/copy.js";
	export let name: string;
	export let code: string;
	export let highlighted_code: string;

	let copied = false;
	function copy(code: string) {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	createGradioApp({
		target: document.getElementById("hello-world"),
				code: `
import gradio as gr

def greet(name):
		return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")

demo.launch()
`,
				info: true,
				container: true,
				isEmbed: false,
				initialHeight: "300px",
				eager: false,
				themeMode: null,
				autoScroll: false,
				controlPageTitle: false,
				appMode: true
			});
</script>

<div class="codeblock bg-gray-50 mx-auto p-3 my-3" id="{name}_code">
	<a
		class="clipboard-button"
		href="https://colab.research.google.com/github/gradio-app/gradio/blob/main/demo/{name}/run.ipynb"
		target="_blank"
		style="right:30px"
	>
		<img src="https://colab.research.google.com/assets/colab-badge.svg" />
	</a>
	<button class="clipboard-button" type="button" on:click={() => copy(code)}>
		{#if !copied}
			{@html svgCopy}
		{:else}
			{@html svgCheck}
		{/if}
	</button>
	<div class="interactive-banner">
		<p class="text-white">Interactive</p>
	</div>
	<pre class=" max-h-80 overflow-auto" contenteditable="true"><code class="code language-python"
			>{@html highlighted_code}</code
		>
</pre>
</div>

{#key name}
	<div id="hello-world" />
{/key}

<style>
	[contenteditable] {
  outline: 0.5px solid transparent;
}
</style>