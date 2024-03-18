<script lang="ts">
	import { Loader } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

	export let is_running: boolean;
	export let endpoint_returns: any;
	export let js_returns: any;
	export let current_language: "python" | "javascript";
</script>


	<div class:hide={is_running}>

	{#each endpoint_returns as { label, type, python_type, component, serializer }, i}
	<hr class="hr" />
	<div style="margin:10px;">
		<p>
			<span class="code">[{i}]</span>
			<span class="code highlight">{#if current_language === "python"}{python_type.type}{:else}{js_returns[i].type}{/if}</span>
		</p>
		<p class="desc">					
	The output value that appears in the "{label}" <!--
	-->{component}
		component<!--
	-->
		</p>
	</div>
	{/each}			
	</div>
	{#if is_running}
		<div class="load-wrap">
			<Loader margin={false} />
		</div>
	{/if}

<style>
	.hr {
		border: 0;
		height: 1px;
		background: var(--color-accent-soft);
	
	}
	.code {
		font-family: var(--font-mono);
		margin-right: 10px;
	}

	.highlight {
		background: var(--color-accent-soft);
		color: var(--color-accent);
		padding: var(--size-1);
	}

	.desc {
		color: var(--body-text-color-subdued);
		font-size: var(--text-lg);
	}

</style>
