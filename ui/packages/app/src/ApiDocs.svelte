<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import type { ComponentMeta, Dependency } from "./components/types";
	import { post_data } from "./api";
	import Loader from "./components/StatusTracker/Loader.svelte";
	import api_logo from "/static/img/api-logo.svg";
	import clear from "/static/img/clear.svg";
	import python from "/static/img/python.svg";
	import javascript from "/static/img/javascript.svg";

	const dispatch = createEventDispatcher();

	onMount(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	});

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

	let current_language = "python";
	let just_copied = -1;
	let isRunning = false;

	let dependency_inputs = dependencies.map((dependency) =>
		dependency.inputs.map((_id) => {
			let default_data = instance_map[_id].documentation?.example_data;
			if (default_data === undefined) {
				default_data = "";
			} else if (typeof default_data === "object") {
				default_data = JSON.stringify(default_data);
			}
			return default_data;
		})
	);
	let dependency_outputs: any[][] = dependencies.map(
		(dependency) => new Array(dependency.outputs.length)
	);
	let dependency_failures: boolean[][] = dependencies.map((dependency) =>
		new Array(dependency.inputs.length).fill(false)
	);

	const run = async (index: number) => {
		isRunning = true;
		let dependency = dependencies[index];
		let attempted_component_index = 0;
		try {
			var inputs = dependency_inputs[index].map((input_val, i) => {
				attempted_component_index = i;
				let component = instance_map[dependency.inputs[i]];
				input_val = represent_value(input_val, component.documentation?.type);
				dependency_failures[index][attempted_component_index] = false;
				return input_val;
			});
		} catch (err) {
			dependency_failures[index][attempted_component_index] = true;
			isRunning = false;
			return;
		}
		let [response, status_code] = await post_data(
			`${root}run/${dependency.api_name}`,
			{
				data: inputs
			}
		);
		isRunning = false;
		if (status_code == 200) {
			dependency_outputs[index] = response.data.map(
				(output_val: any, i: number) => {
					let component = instance_map[dependency.outputs[i]];
					console.log(
						component.documentation?.type,
						output_val,
						represent_value(output_val, component.documentation?.type, "js")
					);
					return represent_value(
						output_val,
						component.documentation?.type,
						"js"
					);
				}
			);
		} else {
			dependency_failures[index] = new Array(
				dependency_failures[index].length
			).fill(true);
		}
	};

	const represent_value = (
		value: string,
		type: string | undefined,
		lang: "js" | "py" | null = null
	) => {
		if (type === undefined) {
			return lang === "py" ? "None" : null;
		}
		if (type === "string") {
			return lang === null ? value : '"' + value + '"';
		} else if (type === "number") {
			return lang === null ? parseFloat(value) : value;
		} else if (type === "boolean") {
			if (lang === "py") {
				return value === "true" ? "True" : "False";
			} else if (lang === "js") {
				return value;
			} else {
				return value === "true";
			}
		} else {
			// assume object type
			if (lang === null) {
				return value === "" ? null : JSON.parse(value);
			} else if (typeof value === "string") {
				if (value === "") {
					return lang === "py" ? "None" : "null";
				}
				return value;
			} else {
				return JSON.stringify(value);
			}
		}
	};
</script>

{#if dependencies.some((d) => d.api_name)}
	<h2
		class="text-sm md:text-lg px-6 py-4 border-b border-gray-100 dark:border-gray-900 font-semibold flex flex-wrap items-center relative"
	>
		<img src={api_logo} alt="" class="w-3.5 md:w-4 mr-1 md:mr-2" />
		API documentation for&nbsp;
		<div class="text-orange-500">
			{root}
		</div>
		<button
			class="absolute right-6 top-5 md:top-6"
			on:click={() => dispatch("close")}
			><img src={clear} alt="" class="w-3 dark:invert" /></button
		>
	</h2>
	<div class="flex flex-col gap-6">
		{#each dependencies as dependency, dependency_index}
			{#if dependency.api_name}
				<div
					class="bg-gradient-to-b from-orange-200/5 via-transparent to-transparent p-6 rounded"
				>
					<h3 class="text-lg font-bold mb-1.5">
						<span
							class="bg-orange-100 px-1 rounded text-sm border border-orange-200 mr-2 font-semibold text-orange-600 dark:bg-orange-400 dark:text-orange-900 dark:border-orange-600"
							>POST</span
						>
						/run/{dependency.api_name}
					</h3>
					<div class="text-sm md:text-base mb-6 text-gray-500">
						Endpoint: <span class="underline"
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
					<h4 class="font-bold mt-6 mb-3 flex items-center">
						<div
							class="flex items-center h-1 w-3 bg-gray-300 dark:bg-gray-500 rounded-full mr-2"
						>
							<div
								class="rounded-full h-1.5 w-1.5 bg-gray-700 dark:bg-gray-400"
							/>
						</div>
						Input Payload
					</h4>
					<div
						class="block bg-white border dark:bg-gray-800 p-4 font-mono text-sm rounded-lg"
					>
						&#123;<br />
						&nbsp;&nbsp;"data": [<br />
						{#each dependency.inputs as component_id, component_index}
							&nbsp;&nbsp;&nbsp;&nbsp;<input
								class="bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300 dark:ring-gray-500"
								type="text"
								bind:value={dependency_inputs[dependency_index][
									component_index
								]}
							/>
							{#if dependency_failures[dependency_index][component_index]}
								<span class="text-red-600">ERROR</span>
							{/if}
							<span class="text-gray-500">
								: {instance_map[component_id].documentation?.type},</span
							>
							<span class="text-gray-400"
								>// represents {instance_map[component_id].documentation
									?.description} of
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
					<h4 class="font-bold mt-6 mb-3 flex items-center">
						<div
							class="flex items-center h-1 w-3 bg-gray-300 dark:bg-gray-500 rounded-full mr-2"
						>
							<div
								class="rounded-full h-1.5 w-1.5 bg-gray-700 dark:bg-gray-400 ml-auto"
							/>
						</div>
						Response Object
					</h4>
					<div
						class="bg-white border dark:bg-gray-800 p-4 font-mono text-sm rounded-lg flex flex-col"
					>
						<div class={isRunning ? "hidden" : ""}>
							&#123;<br />
							&nbsp;&nbsp;"data": [<br />
							{#each dependency.outputs as component_id, component_index}
								&nbsp;&nbsp;&nbsp;&nbsp;{#if dependency_outputs[dependency_index][component_index] !== undefined}
									<input
										disabled
										class="bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300 dark:ring-gray-500"
										type="text"
										bind:value={dependency_outputs[dependency_index][
											component_index
										]}
									/> :
								{/if}
								<span class="text-gray-500">
									{instance_map[component_id].documentation?.type},
								</span>
								<span class="text-gray-400"
									>// represents {instance_map[component_id].documentation
										?.description} of
									{((label) => {
										return label ? "'" + label + "'" : "the";
									})(instance_map[component_id].props.label)}

									<span class="capitalize"
										>{instance_map[component_id].props.name}</span
									> component
								</span>
								<br />
							{/each}
							&nbsp;&nbsp;&nbsp;&nbsp;],<br />
							&nbsp;&nbsp;&nbsp;&nbsp;"duration": (float)
							<span class="text-gray-400">
								// number of seconds to run function call</span
							><br />
							&#125;
						</div>
						{#if isRunning}
							<div class="self-center justify-self-center">
								<Loader margin={false} />
							</div>
						{/if}
					</div>
					<h4 class="font-bold mt-8 mb-3 flex items-center">
						<svg width="1em" height="1em" viewBox="0 0 24 24" class="mr-1.5"
							><path
								fill="currentColor"
								d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6Zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6Z"
							/></svg
						>
						Code snippets
					</h4>
					<div class="flex space-x-2 items-center mb-3">
						{#each [["python", python], ["javascript", javascript]] as [language, img]}
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
										instance_map[
											dependencies[dependency_index].inputs[component_index]
										].documentation?.type,
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
										instance_map[
											dependencies[dependency_index].inputs[component_index]
										].documentation?.type,
										"js"
									)},{/each}
	]
  &rbrace;)&rbrace;)
.then(r => r.json())
.then(
  r => &lbrace;
    let data = r.data;
  &rbrace;
)</pre>
						{:else if current_language === "gradio client"}
							<pre class="break-words whitespace-pre-wrap">Hello World</pre>
						{/if}
					</code>
				</div>
			{/if}
		{/each}
	</div>
{:else}
	<div class="p-6">
		<h2 class="text-lg mb-4 font-semibold">
			No named API Routes found for
			<span class="italic text-orange-500">
				{root}
			</span>
			<button
				class="absolute right-6 top-5 md:top-6"
				on:click={() => dispatch("close")}
			>
				<img src={clear} alt="" class="w-3 dark:invert" />
			</button>
		</h2>
		<div>
			To expose an API endpoint of your app in this page, set the <span
				class="text-gray-800 text-sm bg-gray-200/80 dark:bg-gray-600 px-1 rounded font-mono"
			>
				api_name
			</span>
			parameter of the event listener.<br /> For more information, visit the
			<a
				href="https://gradio.app/sharing_your_app/#api-page"
				target="_blank"
				class="text-orange-500 hover:text-orange-600 underline"
				>API Page guide</a
			>. To hide the API documentation button and this page, set
			<span
				class="text-gray-800 text-sm bg-gray-200/80 dark:bg-gray-600 px-1 rounded font-mono"
			>
				show_api=False
			</span>
			in the
			<span
				class="text-gray-800 text-sm bg-gray-200/80 dark:bg-gray-600 px-1 rounded font-mono"
			>
				Blocks.launch()</span
			> method.
		</div>
	</div>
{/if}
