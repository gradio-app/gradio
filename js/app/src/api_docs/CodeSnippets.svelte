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


	export let current_language: "python" | "javascript";

	let python_code: HTMLElement;
	let js_code: HTMLElement;

	function format_label(label: unknown) {
		return label ? "'" + label + "'" : "the";
	}
</script>

<div class="container">

<EndpointDetail api_name={dependency.api_name} dependency_index={dependency_index}/>

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
-->{#each dependency_inputs[dependency_index] as component_value, component_index}<!--
        --><div class="second-level">
				<input
				class=""
				type="text"
				bind:value={dependency_inputs[dependency_index][component_index]}
			/><!--
			-->{#if dependency_failures[dependency_index][component_index]}<!--
			--><span class="error">ERROR</span><!--
				-->{/if}<!--
			--><span class="desc"><!--
			-->	# Type: _type. <!--
			-->Represents _description of _label _name component<!--
			--></span><!--
        --></div>
	{/each}
				api_name="/{dependency.api_name}"
)
print(result)</pre>


			</div>
		{:else if current_language === "javascript"}
			<div class="copy">
				<CopyButton code={js_code?.innerText} />
			</div>
			<div bind:this={js_code}>
				<pre>const response = await fetch(<span class="token string"
						>"{root + "run/" + dependency.api_name}"</span
					>, &lbrace;
	method: "POST",
	headers: &lbrace; "Content-Type": "application/json" &rbrace;,
	body: JSON.stringify(&lbrace;
		data: [{#each dependency_inputs[dependency_index] as component_value, component_index}<br
						/><!--
-->			<span class="token string"
							>{represent_value(
								component_value,
								instance_map[
									dependencies[dependency_index].inputs[component_index]
								].documentation?.type?.input_payload ||
									instance_map[
										dependencies[dependency_index].inputs[component_index]
									].documentation?.type?.payload,
								"js"
							)}</span
						>,{/each}
		]
	&rbrace;)
&rbrace;);

const data = await <span class="token string">response</span>.json();
</pre>
			</div>
		{/if}
	</code>
</Block>
</div>

<style>
	h4 {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-3);
		color: var(--body-text-color);
		font-weight: var(--weight-bold);
	}

	h4 svg {
		margin-right: var(--size-1-5);
	}

	.snippets {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-3);
	}

	.snippets > * + * {
		margin-left: var(--size-2);
	}

	.snippet {
		display: flex;
		align-items: center;
		border: 1px solid var(--border-color-primary);

		border-radius: var(--radius-md);
		padding: var(--size-1) var(--size-1-5);
		color: var(--body-text-color-subdued);
		color: var(--body-text-color);
		line-height: 1;
		user-select: none;
		text-transform: capitalize;
	}

	.current-lang {
		border: 1px solid var(--body-text-color-subdued);
		color: var(--body-text-color);
	}

	.inactive-lang {
		cursor: pointer;
		color: var(--body-text-color-subdued);
	}

	.inactive-lang:hover,
	.inactive-lang:focus {
		box-shadow: var(--shadow-drop);
		color: var(--body-text-color);
	}

	.snippet img {
		margin-right: var(--size-1-5);
		width: var(--size-3);
	}

	code pre {
		overflow-x: auto;
		color: var(--body-text-color);
		font-family: var(--font-mono);
		tab-size: 2;
	}

	.client {
		white-space: pre-wrap;
		overflow-wrap: break-word;
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

	input[type="text"] {
		--ring-color: transparent;
		margin: var(--size-1) 0;
		outline: none !important;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--radius-lg);
		background: var(--input-background-fill);
		padding: var(--size-1-5);
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
	}

	input:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	.error {
		color: var(--error-text-color);
	}

	.type {
		color: var(--block-label-text-color);
	}

	.desc {
		color: var(--body-text-color-subdued);
	}

	.name {
		text-transform: capitalize;
	}

	.hidden {
		visibility: hidden;
	}
</style>
