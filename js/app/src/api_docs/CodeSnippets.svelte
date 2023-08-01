<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import CopyButton from "./CopyButton.svelte";
	import { represent_value } from "./utils";
	import { Block } from "@gradio/atoms";
	import EndpointDetail from "./EndpointDetail.svelte";

	export let dependency: Dependency;
	export let dependency_index: number;
	export let root: string;
	export let dependency_failures: boolean[][];
	export let endpoint_parameters: any;
	export let js_parameters: any;
	export let named: boolean;

	export let current_language: "python" | "javascript";

	let python_code: HTMLElement;
	let js_code: HTMLElement;

	let blob_components = ["Audio", "File", "Image", "Video"];
	let blob_examples: any[] = endpoint_parameters.filter(
		(param: {
			label: string;
			type: string;
			python_type: {
				type: string;
				description: string;
			};
			component: string;
			example_input: string;
			serializer: string;
		}) => blob_components.includes(param.component)
	);
	let submit_line: string;
	let return_line: string;
	$: if (dependency.types.generator) {
		submit_line = `# This api route streams outputs
result = client.submit(`;
		return_line = `)
result.wait(timeout=None)

# Get the final output. outputs() returns a list of all streamed results.
print(result.outputs()[-1])
	`;
	} else {
		submit_line = `result = client.predict(`;
		return_line = `)
print(result)`;
	}
</script>

<div class="container">
	{#if named}
		<EndpointDetail {named} api_name={dependency.api_name} />
	{:else}
		<EndpointDetail {named} fn_index={dependency_index} />
	{/if}
	<Block>
		<code>
			{#if current_language === "python"}
				<div class="copy">
					<CopyButton code={python_code?.innerText} />
				</div>
				<div bind:this={python_code}>
					<pre>from gradio_client import Client

client = Client(<span class="token string">"{root}"</span>)
{submit_line}<!--
-->{#each endpoint_parameters as { label, type, python_type, component, example_input, serializer }, i}<!--
        -->
				<span
								class="example-inputs"
								>{represent_value(example_input, python_type.type, "py")}</span
							>,<!--
			-->{#if dependency_failures[dependency_index][i]}<!--
			--><span
									class="error">ERROR</span
								><!--
				-->{/if}<!--
			--><span class="desc"
								><!--
			-->	# {python_type.type} {#if python_type.description}({python_type.description})
								{/if}<!--
			-->in '{label}' <!--
			-->{component} component<!--
			--></span
							><!--
        -->
						{/each}
				{#if named}
							api_name="/{dependency.api_name}"
						{:else}
							fn_index={dependency_index}
						{/if}
{return_line}</pre>
				</div>
			{:else if current_language === "javascript"}
				<div class="copy">
					<CopyButton code={js_code?.innerText} />
				</div>
				<div bind:this={js_code}>
					<pre>import &lbrace; client &rbrace; from "@gradio/client";
{#each blob_examples as { label, type, python_type, component, example_input, serializer }, i}<!--
-->
const response_{i} = await fetch("{example_input}");
const example{component} = await response_{i}.blob();
						{/each}<!--
-->
const app = await client(<span class="token string">"{root}"</span>);
const result = await app.predict({#if named}"/{dependency.api_name}"{:else}{dependency_index}{/if}, [<!--
-->{#each endpoint_parameters as { label, type, python_type, component, example_input, serializer }, i}<!--
		-->{#if blob_components.includes(component)}<!--
	-->
				<span
									class="example-inputs">example{component}</span
								>, <!--
		--><span class="desc"
									><!--
		-->	// blob <!--
		-->in '{label}' <!--
		-->{component} component<!--
		--></span
								><!--
		-->{:else}<!--
	-->		
				<span class="example-inputs"
									>{represent_value(
										example_input,
										python_type.type,
										"js"
									)}</span
								>, <!--
--><span class="desc"
									><!--
-->// {js_parameters[i]
										.type} {#if js_parameters[i].description}({js_parameters[i]
											.description}){/if}<!--
--> in '{label}' <!--
-->{component} component<!--
--></span
								><!--
-->{/if}
						{/each}
	]);

console.log(result.data);
</pre>
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
		display: block;
	}

	.copy {
		position: absolute;
		top: 0;
		right: 0;
		margin-top: -5px;
		margin-right: -5px;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
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
