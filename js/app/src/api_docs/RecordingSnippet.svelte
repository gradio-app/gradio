<script lang="ts">
	import type { Dependency, Payload } from "../types";
	import CopyButton from "./CopyButton.svelte";
	import { Block } from "@gradio/atoms";
	import { represent_value } from "./utils";

	export let dependencies: Dependency[];
	export let root: string;
	export let current_language: "python" | "javascript";
	export let endpoints_info: any;

	let python_code: HTMLElement;
	let js_code: HTMLElement;
	export let api_calls: Payload[] = [];

	function format_api_call(call: Payload): string {
		const api_name = `/${dependencies[call.fn_index].api_name}`;
		const params = call.data
			.map((param, index) => {
				const param_info = endpoints_info[api_name].parameters[index];
				const param_name = param_info.parameter_name;
				const python_type = param_info.python_type.type;
				return `  ${param_name}=${represent_value(
					param as string,
					python_type,
					"py"
				)}`;
			})
			.join(",\n");
		if (params) {
			return `${params},\n`;
		}
		return `${params}`;
	}
</script>

<div class="container">
	<!-- <EndpointDetail {named} api_name={dependency.api_name} /> -->
	<Block border_mode={"focus"}>
		<code>
			{#if current_language === "python"}
				<div class="copy">
					<CopyButton code={python_code?.innerText} />
				</div>
				<div bind:this={python_code}>
					<pre><span class="highlight">from</span> gradio_client <span
							class="highlight">import</span
						> Client, file

client = Client(<span class="token string">"{root}"</span>)
{#each api_calls as call}<!--
-->
client.<span class="highlight"
								>predict(
{format_api_call(call)}  api_name=<span class="api-name"
									>"/{dependencies[call.fn_index].api_name}"</span
								>
)
</span>{/each}</pre>
				</div>
			{:else if current_language === "javascript"}
				<div class="copy">
					<CopyButton code={js_code?.innerText} />
				</div>
				<div bind:this={js_code}>
					<pre>import &lbrace; Client &rbrace; from "@gradio/client";

const app = await Client.connect(<span class="token string">"{root}"</span>);
{#each api_calls as call}<!--
-->
{#if dependencies[call.fn_index].backend_fn}client.predict(<span
									class="api-name"
									>"/{dependencies[call.fn_index].api_name}"</span
								>", {JSON.stringify(call.data, null, 2)});{/if}
						{/each}</pre>
				</div>{/if}
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

	.api-name {
		color: var(--color-accent);
	}
</style>
