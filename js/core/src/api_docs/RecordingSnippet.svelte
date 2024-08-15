<script lang="ts">
	import type { Dependency, Payload } from "../types";
	import CopyButton from "./CopyButton.svelte";
	import { Block } from "@gradio/atoms";
	import { represent_value } from "./utils";
	import { onMount, tick } from "svelte";

	export let dependencies: Dependency[];
	export let short_root: string;
	export let root: string;
	export let current_language: "python" | "javascript" | "bash";
	export let username: string | null;

	let python_code: HTMLElement;
	let python_code_text: string;
	let js_code: HTMLElement;
	let bash_code: HTMLElement;

	export let api_calls: Payload[] = [];

	async function get_info(): Promise<{
		named_endpoints: any;
		unnamed_endpoints: any;
	}> {
		let response = await fetch(root + "info/?all_endpoints=true");
		let data = await response.json();
		return data;
	}

	let endpoints_info: any;
	let py_zipped: { call: string; api_name: string }[] = [];
	let js_zipped: { call: string; api_name: string }[] = [];
	let bash_zipped: { call: string; api_name: string }[] = [];

	function format_api_call(call: Payload, lang: "py" | "js" | "bash"): string {
		const api_name = `/${dependencies[call.fn_index].api_name}`;
		// If an input is undefined (distinct from null) then it corresponds to a State component.
		let call_data_excluding_state = call.data.filter(
			(d) => typeof d !== "undefined"
		);

		const params = call_data_excluding_state
			.map((param, index) => {
				if (endpoints_info[api_name]) {
					const param_info = endpoints_info[api_name].parameters[index];
					if (!param_info) {
						return undefined;
					}
					const param_name = param_info.parameter_name;
					const python_type = param_info.python_type.type;
					if (lang === "py") {
						return `  ${param_name}=${represent_value(
							param as string,
							python_type,
							"py"
						)}`;
					} else if (lang === "js") {
						return `    ${param_name}: ${represent_value(
							param as string,
							python_type,
							"js"
						)}`;
					} else if (lang === "bash") {
						return `    ${represent_value(
							param as string,
							python_type,
							"bash"
						)}`;
					}
				}
				return `  ${represent_value(param as string, undefined, lang)}`;
			})
			.filter((d) => typeof d !== "undefined")
			.join(",\n");
		if (params) {
			if (lang === "py") {
				return `${params},\n`;
			} else if (lang === "js") {
				return `{\n${params},\n}`;
			} else if (lang === "bash") {
				return `\n${params}\n`;
			}
		}
		if (lang === "py") {
			return "";
		}
		return "\n";
	}

	onMount(async () => {
		const data = await get_info();
		endpoints_info = data["named_endpoints"];
		let py_api_calls: string[] = api_calls.map((call) =>
			format_api_call(call, "py")
		);
		let js_api_calls: string[] = api_calls.map((call) =>
			format_api_call(call, "js")
		);
		let bash_api_calls: string[] = api_calls.map((call) =>
			format_api_call(call, "bash")
		);
		let api_names: string[] = api_calls.map(
			(call) => dependencies[call.fn_index].api_name || ""
		);
		py_zipped = py_api_calls.map((call, index) => ({
			call,
			api_name: api_names[index]
		}));
		js_zipped = js_api_calls.map((call, index) => ({
			call,
			api_name: api_names[index]
		}));
		bash_zipped = bash_api_calls.map((call, index) => ({
			call,
			api_name: api_names[index]
		}));

		await tick();

		python_code_text = python_code.innerText;
	});
</script>

<div class="container">
	<!-- <EndpointDetail {named} api_name={dependency.api_name} /> -->
	<Block border_mode={"focus"}>
		{#if current_language === "python"}
			<code>
				<div class="copy">
					<CopyButton code={python_code_text} />
				</div>
				<div bind:this={python_code}>
					<pre><span class="highlight">from</span> gradio_client <span
							class="highlight">import</span
						> Client, file

client = Client(<span class="token string">"{short_root}"</span
						>{#if username !== null}, auth=("{username}", **password**){/if})
{#each py_zipped as { call, api_name }}<!--
-->
client.<span class="highlight"
								>predict(
{call}  api_name=<span class="api-name">"/{api_name}"</span>
)
</span>{/each}</pre>
				</div>
			</code>
		{:else if current_language === "javascript"}
			<code>
				<div class="copy">
					<CopyButton code={js_code?.innerText} />
				</div>
				<div bind:this={js_code}>
					<pre>import &lbrace; Client &rbrace; from "@gradio/client";

const app = await Client.connect(<span class="token string">"{short_root}"</span
						>{#if username !== null}, &lbrace;auth: ["{username}", **password**]&rbrace;{/if});
					{#each js_zipped as { call, api_name }}<!--
					-->
await client.predict(<span
								class="api-name">
  "/{api_name}"</span
							>{#if call},
							{/if}{call});
						{/each}</pre>
				</div>
			</code>
		{:else if current_language === "bash"}
			<code>
				<div class="copy">
					<CopyButton code={bash_code?.innerText} />
				</div>
				<div bind:this={bash_code}>
					{#each bash_zipped as { call, api_name }}
						<pre>curl -X POST {short_root}call/{api_name} -s -H "Content-Type: application/json" -d '{"{"} 
	"data": [{call}]{"}"}' \
  | awk -F'"' '{"{"} print $4{"}"}' \
  | read EVENT_ID; curl -N {short_root}call/{api_name}/$EVENT_ID</pre>
						<br />
					{/each}
				</div>
			</code>
		{/if}
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
