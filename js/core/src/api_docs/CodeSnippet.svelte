<script lang="ts">
	import type { ComponentMeta, Dependency, Payload } from "../types";
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
	export let root: string;
	export let api_prefix: string;
	export let space_id: string | null;
	export let endpoint_parameters: any;
	export let username: string | null;
	export let current_language: "python" | "javascript" | "bash" | "mcp";
	export let api_description: string | null = null;
	export let analytics: Record<string, any>;
	export let markdown_code_snippets: Record<string, Record<string, string>>;
<<<<<<< HEAD
=======
	export let last_api_call: Payload | null = null;
>>>>>>> main

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

	$: normalised_api_prefix = api_prefix ? api_prefix : "/";
	$: normalised_root = root.replace(/\/$/, "");

<<<<<<< HEAD
=======
	$: is_most_recently_used = last_api_call?.fn_index === dependency.id;

	$: actual_data =
		is_most_recently_used && last_api_call?.data
			? last_api_call.data.filter((d) => typeof d !== "undefined")
			: null;

	function getParameterValue(param: any, index: number): any {
		if (
			is_most_recently_used &&
			actual_data &&
			actual_data[index] !== undefined
		) {
			return actual_data[index];
		}
		return param.parameter_has_default !== undefined &&
			param.parameter_has_default
			? param.parameter_default
			: param.example_input;
	}

>>>>>>> main
	$: markdown_code_snippets[
		dependency.api_name as keyof typeof markdown_code_snippets
	] = {
		python: python_code?.innerText || "",
		javascript: js_code?.innerText || "",
		bash: bash_post_code?.innerText || ""
	};
</script>

<div class="container">
	<EndpointDetail
		api_name={dependency.api_name}
		description={api_description}
		{analytics}
		{last_api_call}
		dependency_id={dependency.id}
	/>
	<div class:hidden={current_language !== "python"}>
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
-->{#each endpoint_parameters as param, i}<!--
		-->
	{param.parameter_name
								? param.parameter_name + "="
								: ""}<span
								class:recent-value={is_most_recently_used &&
									actual_data?.[i] !== undefined}
								>{represent_value(
									getParameterValue(param, i),
									param.python_type.type,
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
	</div>
	<div class:hidden={current_language !== "javascript"}>
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
	const result = await client.predict(<span class="api-name"
							>"/{dependency.api_name}"</span
						>, &lbrace; <!--
	-->{#each endpoint_parameters as param, i}<!--
			-->{#if blob_components.includes(param.component)}<!--
		-->
					<span
									class="example-inputs"
									>{param.parameter_name}: example{param.component}</span
								>, <!--
			--><span class="desc"><!--
			--></span
								><!--
			-->{:else}<!--
		-->		
			<span
									class="example-inputs {is_most_recently_used &&
									actual_data?.[i] !== undefined
										? 'recent-value'
										: ''}"
									>{param.parameter_name}: {represent_value(
										getParameterValue(param, i),
										param.python_type.type,
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
	</div>
	<div class:hidden={current_language !== "bash"}>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={bash_post_code?.innerText}></CopyButton>
				</div>

				<div bind:this={bash_post_code}>
					<pre>curl -X POST {normalised_root}{normalised_api_prefix}/call/{dependency.api_name} -s -H "Content-Type: application/json" -d '{"{"}
	"data": [{#each endpoint_parameters as param, i}
							<!-- 
	--><span
								class={is_most_recently_used && actual_data?.[i] !== undefined
									? "recent-value"
									: ""}
								>{represent_value(
									getParameterValue(param, i),
									param.python_type.type,
									"bash"
								)}</span
							>{#if i < endpoint_parameters.length - 1},
							{/if}
						{/each}
	]{"}"}' \
	| awk -F'"' '{"{"} print $4{"}"}'  \
	| read EVENT_ID; curl -N {normalised_root}{normalised_api_prefix}/call/{dependency.api_name}/$EVENT_ID</pre>
				</div>
			</code>
		</Block>
	</div>
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

<<<<<<< HEAD
=======
	.recent-value {
		color: #fd7b00;
		background: #fff4e6;
		border: 1px solid #ffd9b3;
		border-radius: var(--radius-sm);
		padding: 1px 4px;
		font-weight: var(--weight-medium);
	}

>>>>>>> main
	.hidden {
		display: none;
	}
</style>
