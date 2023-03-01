<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import { represent_value } from "./utils";
	import { Block } from "@gradio/atoms";

	import python from "./img/python.svg";
	import javascript from "./img/javascript.svg";

	export let dependency: Dependency;
	export let dependencies: Dependency[];
	export let dependency_index: number;
	export let instance_map: {
		[id: number]: ComponentMeta;
	};
	export let root: string;
	export let dependency_inputs: string[][];

	export let current_language: "python" | "javascript";

	const langs = [
		["python", python],
		["javascript", javascript]
	] as const;
</script>

<h4>
	<svg width="1em" height="1em" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6Zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6Z"
		/>
	</svg>
	Code snippets
</h4>
<div class="snippets">
	{#each langs as [language, img]}
		<li
			class="snippet
  {current_language === language ? 'current-lang' : 'inactive-lang'}"
			on:click={() => (current_language = language)}
		>
			<img src={img} alt="" />
			{language}
		</li>
	{/each}
</div>

<Block>
	<code>
		{#if current_language === "python"}
			<pre>import requests

response = requests.post("{root + "run/" + dependency.api_name}", json=&lbrace;
	"data": [{#each dependency_inputs[dependency_index] as component_value, component_index}<br
					/><!--
        -->		{represent_value(
						component_value,
						instance_map[dependencies[dependency_index].inputs[component_index]]
							.documentation?.type,
						"py"
					)},{/each}
	]
&rbrace;).json()

data = response["data"]</pre>
		{:else if current_language === "javascript"}
			<pre>const response = await fetch("{root +
					"run/" +
					dependency.api_name}", &lbrace;
	method: "POST",
	headers: &lbrace; "Content-Type": "application/json" &rbrace;,
	body: JSON.stringify(&lbrace;
		data: [{#each dependency_inputs[dependency_index] as component_value, component_index}<br
					/><!--
-->			{represent_value(
						component_value,
						instance_map[dependencies[dependency_index].inputs[component_index]]
							.documentation?.type,
						"js"
					)},{/each}
		]
	&rbrace;)
&rbrace;);

const data = await data.json();
</pre>
		{:else if current_language === "gradio client"}
			<pre class="client">Hello World</pre>
		{/if}
	</code>
</Block>

<style>
	h4 {
		display: flex;
		align-items: center;
		margin-top: var(--size-8);
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
		border: 1px solid var(--color-border-primary);

		border-radius: var(--radius-md);
		padding: var(--size-1) var(--size-1-5);
		color: var(--text-color-subdued);
		color: var(--body-text-color);
		line-height: 1;
		user-select: none;
		text-transform: capitalize;
	}

	.current-lang {
		border: 1px solid var(--text-color-subdued);
		color: var(--body-text-color);
	}

	.inactive-lang {
		cursor: pointer;
		color: var(--text-color-subdued);
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
</style>
