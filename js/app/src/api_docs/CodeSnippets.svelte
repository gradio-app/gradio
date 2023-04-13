<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import CopyButton from "./CopyButton.svelte";
	import { represent_value } from "./utils";
	import { Block } from "@gradio/atoms";
	import EndpointDetail from "./EndpointDetail.svelte";

	export let dependency: Dependency;
	export let dependencies: Dependency[];
	export let dependency_index: number;
	export let instance_map: {
		[id: number]: ComponentMeta;
	};
	export let root: string;
	export let dependency_inputs: string[][];
	export let dependency_failures: boolean[][];
	export let endpoint_parameters: {
		label: string;
		type_python: string;
		type_description: string;
		component: string;
		example_input: any;
	}[];
	export let named: boolean;

	export let current_language: "python" | "javascript";

	let python_code: HTMLElement;
	let js_code: HTMLElement;

</script>

<div class="container">

{#if named}
<EndpointDetail {named} api_name={dependency.api_name}/>
{:else}
<EndpointDetail {named} fn_index={dependency_index}/>
{/if}
<Block>
	<code>
		{#if current_language === "python"}
			<div class="copy">
				<CopyButton code={python_code?.innerText} />
			</div>
			<div bind:this={python_code}>
				<pre>from gradio_client import Client

client = Client(<span class="token string"
						>"{root}"</span
					>)
result = client.predict(<!--
-->{#each endpoint_parameters as {label, type_python, type_description, component, example_input}, i}<!--
        --><div class="second-level">
				<span class="example-inputs">{represent_value(example_input, 
						type_python,
						"py")}</span>,<!--
			-->{#if dependency_failures[dependency_index][i]}<!--
			--><span class="error">ERROR</span><!--
				-->{/if}<!--
			--><span class="desc"><!--
			-->	# {type_python} <!--
			-->representing {type_description} in '{label}' <!--
			-->{component} component<!--
			--></span><!--
        --></div>
	{/each}
				{#if named}
					api_name="/{dependency.api_name}"
				{:else}
					fn_index={dependency_index}
				{/if}
)
print(result)</pre>


			</div>
		{/if}
	</code>
</Block>
</div>

<style>
	code pre {
		overflow-x: auto;
		color: var(--body-text-color);
		font-family: var(--font-mono);
		tab-size: 2;
	}

	.token.string {
		display: contents;
		color: var(--color-accent-base);
	}

	code {
		position: relative;
	}

	.copy {
		position: absolute;
		top: 0;
		right: 0;
		margin-top: -5px;
		margin-right: -5px;
	}

	.container {
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
	}


	.error {
		color: var(--error-text-color);
	}

	.desc {
		color: var(--body-text-color-subdued);
	}

	.example-inputs {
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding-right: var(--size-1);
		padding-left: var(--size-1);
		color: var(--color-accent);
	}
</style>
