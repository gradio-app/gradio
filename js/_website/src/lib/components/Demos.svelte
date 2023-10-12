<script lang="ts">
	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let on_main: boolean = false;
	$: on_main;
</script>

<div class="codeblock" id="{name}_code">
	<a
		class="clipboard-button m-2"
		href="https://colab.research.google.com/github/gradio-app/gradio/blob/main/demo/{name}/run.ipynb"
		target="_blank"
		style="right:30px"
	>
		<img src="https://colab.research.google.com/assets/colab-badge.svg" />
	</a>
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
