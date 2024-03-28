<script lang="ts">
	export let name: string;
	export let code: string;
	export let highlighted_code: string;
	export let url_version: string;
	$: url_version;
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/@gradio/lite/dist/lite.css"
	/>
</svelte:head>

{#if url_version === "main"}
	<div class="py-2 max-h-[750px] overflow-y-scroll">
		{#key name}
			<button
				class="open-btn bg-gray-200 text-gray-500 font-bold px-2 rounded mx-4 my-2"
				on:click={() => {
					let code_b64 = btoa(code);
					window.open("/playground?demo=Blank&code=" + code_b64, "_blank");
				}}
			>
				Open in 🎢 ↗
			</button>

			<gradio-lite playground shared-worker class="p-2">
				{code}
			</gradio-lite>
		{/key}
	</div>
{:else}
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
		{#if url_version === "3.50.2"}
			<gradio-app space={"gradio/" + name + "_3-x"} />
		{:else}
			<gradio-app space={"gradio/" + name} />
		{/if}
	{/key}
{/if}

<style>
	.open-btn {
		position: absolute;
		top: 3%;
		right: 0;
		background: #eaecef;
		color: #374151;
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
</style>
