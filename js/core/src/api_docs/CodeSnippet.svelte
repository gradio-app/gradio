<script lang="ts">
	import type { ComponentMeta, Dependency } from "../types";
	import CopyButton from "./CopyButton.svelte";
	import { represent_value, is_potentially_nested_file_data } from "./utils";
	import { Block } from "@gradio/atoms";
	import EndpointDetail from "./EndpointDetail.svelte";

	interface EndpointParameter {
		label: string;
		type: string;
		python_type: { type: string };
		component: string;
		example_input: string;
		serializer: string;
	}

	export let dependency: Dependency;
	export let dependency_index: number;
	export let root: string;
	export let space_id: string | null;
	export let endpoint_parameters: any;
	export let named: boolean;
	export let username: string | null;
	export let current_language: "python" | "javascript" | "bash";

	let python_code: HTMLElement;
	let js_code: HTMLElement;
	let bash_post_code: HTMLElement;
	let bash_get_code: HTMLElement;

	let has_file_path = endpoint_parameters.some((param: EndpointParameter) =>
		is_potentially_nested_file_data(param.example_input)
	);
	let blob_components = ["Audio", "File", "Image", "Video"];
	let blob_examples: any[] = endpoint_parameters.filter(
		(param: EndpointParameter) => blob_components.includes(param.component)
	);
</script>

<div class="container">
	{#if named}
		<EndpointDetail {named} api_name={dependency.api_name} />
	{:else}
		<EndpointDetail {named} fn_index={dependency_index} />
	{/if}
	{#if current_language === "python"}
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={python_code?.innerText} />
				</div>
				<div bind:this={python_code}>
					<pre><span class="highlight">from</span> gradio_client <span
							class="highlight">import</span
						> Client{#if has_file_path}, handle_file{/if}

client = Client(<span class="token string">"{space_id || root}"</span
						>{#if username !== null}, auth=("{username}", **password**){/if})
result = client.<span class="highlight">predict</span
						>(<!--
-->{#each endpoint_parameters as { python_type, example_input, parameter_name, parameter_has_default, parameter_default }, i}<!--
        -->
		{parameter_name
								? parameter_name + "="
								: ""}<span
								>{represent_value(
									parameter_has_default ? parameter_default : example_input,
									python_type.type,
									"py"
								)}</span
							>,{/each}<!--

		-->
		api_name=<span class="api-name">"/{dependency.api_name}"</span><!--
		-->
)
<span class="highlight">print</span>(result)</pre>
				</div>
			</code>
		</Block>
	{:else if current_language === "javascript"}
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={js_code?.innerText} />
				</div>
				<div bind:this={js_code}>
					<pre>import &lbrace; Client &rbrace; from "@gradio/client";
{#each blob_examples as { component, example_input }, i}<!--
-->
const response_{i} = await fetch("{example_input.url}");
const example{component} = await response_{i}.blob();
						{/each}<!--
-->
const client = await Client.connect(<span class="token string"
							>"{space_id || root}"</span
						>{#if username !== null}, &lbrace;auth: ["{username}", **password**]&rbrace;{/if});
const result = await client.predict({#if named}<span class="api-name"
								>"/{dependency.api_name}"</span
							>{:else}{dependency_index}{/if}, &lbrace; <!--
-->{#each endpoint_parameters as { label, parameter_name, type, python_type, component, example_input, serializer }, i}<!--
		-->{#if blob_components.includes(component)}<!--
	-->
				<span
									class="example-inputs"
									>{parameter_name}: example{component}</span
								>, <!--
		--><span class="desc"><!--
		--></span
								><!--
		-->{:else}<!--
	-->		
		<span class="example-inputs"
									>{parameter_name}: {represent_value(
										example_input,
										python_type.type,
										"js"
									)}</span
								>, <!--
--><!--
-->{/if}
						{/each}
&rbrace;);

console.log(result.data);
</pre>
				</div>
			</code>
		</Block>
	{:else if current_language === "bash"}
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={bash_post_code?.innerText}></CopyButton>
				</div>

				<div bind:this={bash_post_code}>
					<pre>curl -X POST {root}call/{dependency.api_name} -s -H "Content-Type: application/json" -d '{"{"}
  "data": [{#each endpoint_parameters as { label, parameter_name, type, python_type, component, example_input, serializer }, i}
							<!-- 
-->{represent_value(
								example_input,
								python_type.type,
								"bash"
							)}{#if i < endpoint_parameters.length - 1},
							{/if}
						{/each}
]{"}"}' \
  | awk -F'"' '{"{"} print $4{"}"}'  \
  | read EVENT_ID; curl -N {root}call/{dependency.api_name}/$EVENT_ID</pre>
				</div>
			</code>
		</Block>
	{/if}
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

	.desc {
		color: var(--body-text-color-subdued);
	}

	.api-name {
		color: var(--color-accent);
	}
</style>
