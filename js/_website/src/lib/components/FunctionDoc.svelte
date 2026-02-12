<script lang="ts">
	export let fn: any;
	import anchor from "../assets/img/anchor.svg";
	import ParamTable from "./ParamTable.svelte";
</script>

<!-- name, signature, description, params -->

<div class="obj">
	<div class="flex flex-row items-center justify-between">
		<h3
			class="group text-3xl font-light py-4"
			id="{fn.parent
				.toLowerCase()
				.replace('gradio.', '')}-{fn.name.toLowerCase()}"
		>
			{fn.name}
			<a
				href="#{fn.parent
					.toLowerCase()
					.replace('gradio.', '')}-{fn.name.toLowerCase()}"
				class="invisible group-hover-visible"
				><img class="anchor-img" src={anchor} /></a
			>
		</h3>
	</div>

	{#if fn.override_signature}
		<div class="codeblock">
			<pre><code class="code language-python">{fn.override_signature}</code
				></pre>
		</div>
	{:else}
		<div class="codeblock">
			<pre><code class="code language-python"
					>{fn.parent}.<span>{fn.name}&lpar;</span
					><!--
        -->{#each fn.parameters as param}<!--
        -->{#if !("kwargs" in param) && !("default" in param) && param.name != "self"}<!--
            -->{param.name}, <!--
        -->{/if}<!--
        -->{/each}<!--  
        -->···<span
						>&rpar;</span
					></code
				></pre>
		</div>
	{/if}

	<h4
		class="mt-8 text-xl text-orange-500 font-light group"
		id="{fn.name.toLowerCase()}-description"
	>
		Description
		<a
			href="#{fn.name.toLowerCase()}-description"
			class="invisible group-hover-visible"
			><img class="anchor-img-small" src={anchor} /></a
		>
	</h4>
	<p class="mb-2 text-lg">{@html fn.description}</p>

	{#if fn.example}
		<h4
			class="mt-4 text-xl text-orange-500 font-light group"
			id="{fn.name.toLowerCase()}-example-usage"
		>
			Example Usage
			<a
				href="#{fn.name.toLowerCase()}-example-usage"
				class="invisible group-hover-visible"
				><img class="anchor-img-small" src={anchor} /></a
			>
		</h4>
		<div class="codeblock">
			<pre><code class="code language-python">{@html fn.example}</code></pre>
		</div>
	{/if}

	{#if (fn.parameters.length > 0 && fn.parameters[0].name != "self") || fn.parameters.length > 1}
		<ParamTable
			parameters={fn.parameters}
			anchor_links={fn.name.toLowerCase()}
		/>
	{/if}
</div>
