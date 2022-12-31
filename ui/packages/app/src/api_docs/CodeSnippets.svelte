<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
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
</script>

<h4 class="font-bold mt-8 mb-3 flex items-center">
	<svg width="1em" height="1em" viewBox="0 0 24 24" class="mr-1.5">
		<path
			fill="currentColor"
			d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6Zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6Z"
		/>
	</svg>
	Code snippets
</h4>
<div class="flex space-x-2 items-center mb-3">
	{#each langs as [language, img]}
		<li
			class="flex items-center border rounded-lg px-1.5 py-1 leading-none select-none text-smd capitalize
  {current_language === language
				? 'border-gray-400 text-gray-800 dark:bg-gray-700'
				: 'text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 hover:shadow-sm'}"
			on:click={() => (current_language = language)}
		>
			<img src={img} class="mr-1.5 w-3" alt="" />
			{language}
		</li>
	{/each}
</div>
<code
	class="bg-white border dark:bg-gray-800 p-4 font-mono text-sm rounded-lg flex flex-col overflow-x-auto"
>
	{#if current_language === "python"}
		<pre>import requests

response = requests.post("{root + "run/" + dependency.api_name}", json=&lbrace;
"data": [{#each dependency_inputs[dependency_index] as component_value, component_index}<br
				/><!--
        -->    {represent_value(
					component_value,
					instance_map[dependencies[dependency_index].inputs[component_index]]
						.documentation?.type,
					"py"
				)},{/each}
]&rbrace;).json()

data = response["data"]</pre>
	{:else if current_language === "javascript"}
		<pre>fetch("{root + "run/" + dependency.api_name}", &lbrace;
method: "POST",
headers: &lbrace; "Content-Type": "application/json" &rbrace;,
body: JSON.stringify(&lbrace;
data: [{#each dependency_inputs[dependency_index] as component_value, component_index}<br
				/><!--
-->      {represent_value(
					component_value,
					instance_map[dependencies[dependency_index].inputs[component_index]]
						.documentation?.type,
					"js"
				)},{/each}
]
&rbrace;)&rbrace;)
.then(r =&gt; r.json())
.then(
r =&gt; &lbrace;
let data = r.data;
&rbrace;
)</pre>
	{:else if current_language === "gradio client"}
		<pre class="break-words whitespace-pre-wrap">Hello World</pre>
	{/if}
</code>
