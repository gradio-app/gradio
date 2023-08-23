<script lang="ts">
	import { svgCopy, svgCheck } from "$lib/assets/copy.js";
	import { onMount } from 'svelte';
	export let name: string;
	export let code: string;
	export let highlighted_code: string;

	console.log(name);


	let copied = false;
	function copy(code: string) {
		navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
	
	let mounted = false;
	let target;
	let controller;
	onMount(() => {
	mounted = true;
	controller = createGradioApp({
		target: document.getElementById(name),
				requirements: [],
				code: code,
				info: true,
				container: true,
				isEmbed: true,
				initialHeight: "300px",
				eager: false,
				themeMode: null,
				autoScroll: false,
				controlPageTitle: false,
				appMode: true
			});
	
});
$: if (mounted) {
	controller.run_code(code);
}
</script>

<div class="codeblock bg-gray-50 mx-auto p-3 my-3" id="{name}_code">
	<a
		class="clipboard-button"
		href="https://colab.research.google.com/github/gradio-app/gradio/blob/main/demo/{name}/run.ipynb"
		target="_blank"
		style="right:95px; margin-top: 0"
	>
		<img src="https://colab.research.google.com/assets/colab-badge.svg" />
	</a>
	<button class="clipboard-button" style="right:75px; margin-top: 0" type="button" on:click={() => copy(code)}>
		{#if !copied}
			{@html svgCopy}
		{:else}
			{@html svgCheck}
		{/if}
	</button>
	<div class="interactive-banner">
		<p class="text-white">Interactive</p>
	</div>
	<pre class=" max-h-80 overflow-auto" bind:innerHTML={code} contenteditable="true">
		<code class="code language-python"
			>{@html highlighted_code}</code
		>
</pre>
</div>

{#key name}
	<div id="{name}" />
{/key}

<style>
	[contenteditable] {
  outline: 0.5px solid transparent;
}
</style>