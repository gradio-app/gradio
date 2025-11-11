<script lang="ts">
	import WHEEL from "$lib/json/wheel.json";

	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let url_version: string;

	$: url_version;
</script>

<svelte:head>
	<link rel="stylesheet" href="{WHEEL.gradio_lite_url}/dist/lite.css" />
</svelte:head>

<div class="lg:hidden">
	<div class="codeblock" id="{name}_code">
		<pre class=" max-h-80 overflow-auto"><code class="code language-python"
				>{@html highlighted_code}</code
			>
		</pre>
	</div>
	{#key name}
		{#if url_version === "main"}
			<gradio-app space={"gradio/" + name + "_main"} />
		{:else}
			<gradio-app space={"gradio/" + name} />
		{/if}
	{/key}
</div>

<style>
	:global(.child-container) {
		flex-direction: column !important;
	}
	:global(.code-editor) {
		border-bottom: 1px solid rgb(229 231 235);
		height: 300px;
		overflow-y: scroll;
		flex: none !important;
	}
	:global(.dark .code-editor) {
		border-bottom: 1px solid rgb(64 64 64);
	}
</style>
