<script lang="ts">
	import type { ComponentMeta, Dependency } from "./components/types";
	import { post_data } from "./api";
	import Accordion from "./components/Accordion/Accordion.svelte";
	import Tabs from "./components/Tabs/Tabs.svelte";
	import TabItem from "./components/TabItem/Tabs.svelte";

	export let instance_map: {
		[id: number]: ComponentMeta;
	};
	export let dependencies: Array<Dependency>;
	export let root: string;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	let just_copied = -1;

	let dependency_inputs = dependencies.map((dependency) =>
		dependency.inputs.map((_id) => {
			let default_data = instance_map[_id].documentation?.example_input_data;
			if (default_data === undefined) {
				default_data = "";
			}
			return default_data;
		})
	);
	let dependency_outputs: any[][] = dependencies.map(
		(dependency) => new Array(dependency.outputs.length)
	);
	const run = async (index: number) => {
		let dependency = dependencies[index];
		let inputs = dependency_inputs[index].map((input_val, i) => {
			let component = instance_map[dependency.inputs[i]];
			if (component.documentation?.entered_input_preprocess) {
				input_val =
					component.documentation?.entered_input_preprocess(input_val);
			}
			return input_val;
		});
		let response = await post_data(`${root}run/${dependency.api_name}`, {
			data: inputs
		});
		dependency_outputs[index] = response[0].data;
	};
</script>

<div>
	{#if dependencies.some((d) => d.api_name)}
		<h2 class="text-3xl text-center mb-6">
			API Docs for
			<span class="italic text-amber-500">
				{root}
			</span>
		</h2>
		<div class="flex flex-col gap-6">
			{#each dependencies as dependency, dependency_index}
				{#if dependency.api_name}
					<div
						class="bg-gray-50 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6 rounded"
					>
						<h3 class="text-2xl text-amber-500 font-semibold mb-2">
							POST /run/{dependency.api_name}
						</h3>
						<div class="mb-6">
							Full URL: <span class="underline"
								>{root}run/{dependency.api_name}</span
							>
							<button
								class="ml-1 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
								on:click={() => {
									navigator.clipboard.writeText(
										root + "run/" + dependency.api_name
									);
									just_copied = dependency_index;
									setTimeout(() => {
										just_copied = -1;
									}, 500);
								}}
							>
								{#if just_copied === dependency_index}copied!{:else}copy{/if}
							</button>
						</div>
						<h4 class="text-xl mt-6 mb-4">Input Payload</h4>
						<div class="block bg-gray-100 dark:bg-gray-700 p-4 font-mono">
							&#123;<br />
							&nbsp;&nbsp;"data": [<br />
							{#each dependency.inputs as component_id, component_index}
								&nbsp;&nbsp;&nbsp;&nbsp;<input
									class="text-inherit bg-inherit bg-gray-50 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5"
									type="text"
									bind:value={dependency_inputs[dependency_index][
										component_index
									]}
								/>
								: {instance_map[component_id].documentation?.input_type},
								<span class="text-pink-400 dark:text-pink-600"
									>// represents {instance_map[component_id].documentation
										?.input_description} of
									{((label) => {
										return label ? "'" + label + "'" : "the";
									})(instance_map[component_id].props.label)}

									<span class="capitalize"
										>{instance_map[component_id].props.name}</span
									> component
								</span>
								<br />
							{/each}
							&nbsp;&nbsp;]<br />
							&#125;
						</div>
						<button
							on:click={run.bind(null, dependency_index)}
							class="bg-amber-600 hover:bg-amber-500 transition-colors p-2 block w-full"
							>Run</button
						>
						<h4 class="text-xl mt-6 mb-4">Response Object</h4>
						<div class="block mb-4 bg-gray-100 dark:bg-gray-700 p-4 font-mono">
							&#123;<br />
							&nbsp;&nbsp;"data": [<br />
							{#each dependency.outputs as component_id, component_index}
								&nbsp;&nbsp;&nbsp;&nbsp;{#if dependency_outputs[dependency_index][component_index] !== undefined}
									<input
									disabled
										class="text-inherit bg-inherit bg-gray-50 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5"
										type="text"
										bind:value={dependency_outputs[dependency_index][
											component_index
										]}
									/> :
								{/if}
								{instance_map[component_id].documentation?.input_type},
								<span class="text-pink-400 dark:text-pink-600"
									>// represents {instance_map[component_id].documentation
										?.input_description} of
									{((label) => {
										return label ? "'" + label + "'" : "the";
									})(instance_map[component_id].props.label)}

									<span class="capitalize"
										>{instance_map[component_id].props.name}</span
									> component
								</span>
								<br />
							{/each}
							&nbsp;&nbsp;],<br />
							&nbsp;&nbsp;"duration": (float)
							<span class="text-pink-400 dark:text-pink-600">
								// number of seconds to run function call</span
							><br />
							&#125;
						</div>
							<Tabs selected={0}>
								<TabItem label="Python" id={0}>
									<code><pre>import requests

response = requests.post("{root + "run/" + dependency.api_name}", json=&lbrace;
    data: [{#each dependency_inputs[dependency_index] as component_value, component_index}
	    {instance_map[dependencies[dependency_index].inputs[component_index
	]].documentation?.input_type?.includes("string") ? `"${component_value}"` : component_value},{/each}
	]
&rbrace;).json()
data = response["data"]</pre></code>
								</TabItem>
								<TabItem label="JS" id={1}>
									<code><pre>fetch("{root + "run/" + dependency.api_name}", &lbrace;
	method: "POST",
	body: JSON.stringify([{#each dependency_inputs[dependency_index] as component_value, component_index}
		{instance_map[dependencies[dependency_index].inputs[component_index
		]].documentation?.input_type?.includes("string") ? `"${component_value}"` : component_value},{/each}
	]),
	headers: &lbrace; "Content-Type": "application/json" &rbrace;&rbrace;
).then(
	r => r.json()
).then(
	r => &lbrace;
		let data = r.data;
	&rbrace;
)</pre></code>										
								</TabItem>
								<TabItem label="Gradio Client" id={2}>
									<code>
										Hello World
									</code>

								</TabItem>
							</Tabs>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<h2 class="text-3xl text-center mb-6">
			There are no named API Routes for
			<span class="italic text-amber-500">
				{root}
			</span>
		</h2>
		<div>
			To expose an API endpoint of your app in these API docs, set the <span
				class="italic text-amber-500"
			>
				api_name
			</span>
			parameter of the event listener. For more information, see the "API Page"
			<a
				href="https://gradio.app/sharing_your_app/#api-page"
				class="text-amber-500"
			>
				section</a
			>
			in the guides. To hide this API page, set
			<span class="italic text-amber-500"> show_api=False </span>
			in the <span class="italic text-amber-500"> Blocks.launch()</span> method.
		</div>
	{/if}
</div>
