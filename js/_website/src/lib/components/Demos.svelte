<script lang="ts">
	import { svgCopy, svgCheck } from "$lib/assets/copy.js";

	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let on_main: boolean = false;

	let copied = false;
	function copy(code: string) {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
	$: on_main;
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
	<pre class=" max-h-80 overflow-auto"><code class="code language-python"
			>{@html highlighted_code}</code
		>
</pre>
</div>

{#key name}
	{#if on_main}
		<gradio-app space={"gradio/" + name + "_main"} />
	{:else}
		<gradio-app space={"gradio/" + name} />
	{/if}
{/key}
