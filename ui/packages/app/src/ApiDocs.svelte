<script lang="ts">
	import type { ComponentMeta, Dependency } from "./components/types";
	import { post_data } from "./api";
	import Tabs from "./components/Tabs/Tabs.svelte";
	import Loader from "./components/StatusTracker/Loader.svelte";
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
	let isRunning = false;

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
		isRunning = true;
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
		isRunning = false;
		dependency_outputs[index] = response[0].data;
	};
</script>

{#if dependencies.some((d) => d.api_name)}
	<h2 class="text-2xl px-6 py-4 border-b">
		API Docs for
		<span class="italic text-orange-500">
			{root}
		</span>
	</h2>
	<div class="flex flex-col gap-6">
		{#each dependencies as dependency, dependency_index}
			{#if dependency.api_name}
				<div
					class="bg-gradient-to-b from-orange-200/10 via-white to-white p-6 rounded"
				>
					<h3 class="text-xl text-orange-500 font-bold">
						<span
							class="bg-orange-100 px-1 rounded text-lg border-orange-200 border mr-1 font-semibold"
							>POST</span
						>
						/run/{dependency.api_name}
					</h3>
					<div class="mb-6">
						Endpoint URL: <span class="underline"
							>{root}run/{dependency.api_name}</span
						>
						<button
							class="gr-button ml-2 !py-0"
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
					<h4 class="text-lg font-bold mt-6 mb-4">Input Payload</h4>
					<div
						class="block bg-white border dark:bg-gray-700 p-4 font-mono text-sm rounded-lg"
					>
						&#123;<br />
						&nbsp;&nbsp;"data": [<br />
						{#each dependency.inputs as component_id, component_index}
							&nbsp;&nbsp;&nbsp;&nbsp;<input
								class="bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300"
								type="text"
								bind:value={dependency_inputs[dependency_index][
									component_index
								]}
							/>
							<span class="text-gray-500">
								: {instance_map[component_id].documentation?.input_type},</span
							>
							<span class="text-gray-400"
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
						class="gr-button gr-button-lg gr-button-primary w-full mt-4"
						>Run</button
					>
					<h4 class="text-lg font-bold mt-6 mb-4">Response Object</h4>
					<div
						class="bg-white border dark:bg-gray-700 p-4 font-mono text-sm rounded-lg flex flex-col"
					>
						<div class={isRunning ? "hidden" : ""}>
							"data": [<br />
							{#each dependency.outputs as component_id, component_index}
								&nbsp;&nbsp;&nbsp;&nbsp;{#if dependency_outputs[dependency_index][component_index] !== undefined}
									<input
										disabled
										class="text-inherit bg-inherit bg-gray-50 dark:bg-gray-600 border-none w-64 px-1 py-0.5 my-0.5 text-sm"
										type="text"
										bind:value={dependency_outputs[dependency_index][
											component_index
										]}
									/> :
								{/if}
								<span class="text-gray-500">
									{instance_map[component_id].documentation?.input_type},
								</span>
								<span class="text-gray-400"
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
							],<br />
							"duration": (float)
							<span class="text-gray-400">
								// number of seconds to run function call</span
							>
						</div>
						{#if isRunning}
							<div class="self-center justify-self-center">
								<Loader margin={false} />
							</div>
						{/if}
					</div>
					<h4 class="text-lg font-bold mt-6 mb-4">Code examples</h4>
					<Tabs selected={0}>
						<TabItem label="Python" id={0}>
							<code class="text-sm"
								><pre>import requests

response = requests.post("{root + "run/" + dependency.api_name}", json=&lbrace;
    data: [{#each dependency_inputs[dependency_index] as component_value, component_index}
										{instance_map[
											dependencies[dependency_index].inputs[component_index]
										].documentation?.input_type?.includes("string")
											? `"${component_value}"`
											: component_value},{/each}
	]
&rbrace;).json()
data = response["data"]</pre></code
							>
						</TabItem>
						<TabItem label="JS" id={1}>
							<code class="text-sm"
								><pre>fetch("{root + "run/" + dependency.api_name}", &lbrace;
	method: "POST",
	body: JSON.stringify([{#each dependency_inputs[dependency_index] as component_value, component_index}
										{instance_map[
											dependencies[dependency_index].inputs[component_index]
										].documentation?.input_type?.includes("string")
											? `"${component_value}"`
											: component_value},{/each}
	]),
	headers: &lbrace; "Content-Type": "application/json" &rbrace;&rbrace;
).then(
	r => r.json()
).then(
	r => &lbrace;
		let data = r.data;
	&rbrace;
)</pre></code
							>
						</TabItem>
						<TabItem label="Gradio Client" id={2}>
							<code class="text-sm"> Hello World </code>
						</TabItem>
					</Tabs>
				</div>
			{/if}
		{/each}
	</div>
{:else}
	<h2 class="text-3xl text-center mb-6">
		There are no named API Routes for
		<span class="italic text-orange-500">
			{root}
		</span>
	</h2>
	<div>
		To expose an API endpoint of your app in these API docs, set the <span
			class="italic text-orange-500"
		>
			api_name
		</span>
		parameter of the event listener. For more information, see the "API Page"
		<a
			href="https://gradio.app/sharing_your_app/#api-page"
			class="text-orange-500"
		>
			section</a
		>
		in the guides. To hide this API page, set
		<span class="italic text-orange-500"> show_api=False </span>
		in the <span class="italic text-orange-500"> Blocks.launch()</span> method.
	</div>
{/if}
