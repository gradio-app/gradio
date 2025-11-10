<script lang="ts">
	import WHEEL from "$lib/json/wheel.json";
	import { theme } from "$lib/stores/theme";
	import { update_gradio_theme } from "$lib/utils";
	import { onMount } from "svelte";

	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let url_version: string;

	$: url_version;

	onMount(() => {
		update_gradio_theme($theme);
	});

	$: if (typeof window !== "undefined" && $theme) {
		update_gradio_theme($theme);
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="{WHEEL.gradio_lite_url}/dist/lite.css" />
</svelte:head>

<div class="hidden lg:block py-2 max-h-[750px] overflow-y-scroll">
	{#key name}
		<button
			class="hidden lg:block open-btn bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold px-2 rounded mx-4 my-2"
			on:click={() => {
				let code_b64 = btoa(code);
				window.open("/playground?demo=Blank&code=" + code_b64, "_blank");
			}}
		>
			Open in 🎢 ↗
		</button>

		<gradio-lite playground shared-worker layout="vertical" class="p-2">
			{code}
		</gradio-lite>
	{/key}
</div>

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
	.open-btn {
		position: absolute;
		top: 3%;
		right: 0;
		font-weight: 500;
	}
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
