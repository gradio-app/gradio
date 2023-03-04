<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import CopyButton from "./CopyButton.svelte";
	import { represent_value } from "./utils";

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

	let python_code: HTMLElement;
	let js_code: HTMLElement;
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
<code>
	{#if current_language === "python"}
		<div class="copy">
			<CopyButton code={python_code?.innerText} />
		</div>
		<div bind:this={python_code}>
			<pre>import requests

response = requests.post(<span class="token string"
					>"{root + "run/" + dependency.api_name}"</span
				>, json=&lbrace;
	"data": [{#each dependency_inputs[dependency_index] as component_value, component_index}<br
					/><!--
        -->		<span class="token string"
						>{represent_value(
							component_value,
							instance_map[
								dependencies[dependency_index].inputs[component_index]
							].documentation?.type?.input_payload ||
								instance_map[
									dependencies[dependency_index].inputs[component_index]
								].documentation?.type?.payload,
							"py"
						)}</span
					>,{/each}
	]
&rbrace;).json()

data = response[<span class="token string">"data"</span>]</pre>
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
	{:else if current_language === "gradio client"}
		<pre class="client">Hello World</pre>
	{/if}
</code>

<style>
	h4 {
		display: flex;
		align-items: center;
		margin-top: var(--size-8);
		margin-bottom: var(--size-3);
		color: var(--color-text-body);
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
		color: var(--color-text-subdued);
		color: var(--color-text-body);
		font-size: var(--scale-0);
		line-height: 1;
		user-select: none;
		text-transform: capitalize;
	}

	.current-lang {
		border: 1px solid var(--color-text-subdued);
		color: var(--color-text-body);
	}

	.inactive-lang {
		cursor: pointer;
		color: var(--color-text-subdued);
	}

	.inactive-lang:hover,
	.inactive-lang:focus {
		box-shadow: var(--shadow-drop);
		color: var(--color-text-body);
	}

	.snippet img {
		margin-right: var(--size-1-5);
		width: var(--size-3);
	}

	code pre {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-md);
		background-color: var(--color-background-tertiary);
		padding: var(--size-4);
		overflow-x: auto;
		color: var(--color-text-body);
		font-size: var(--scale-00);
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
		margin: 1rem;
	}
</style>
