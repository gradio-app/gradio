<script lang="ts">
	import { onMount, createEventDispatcher } from "svelte";
	import type { ComponentMeta, Dependency } from "../components/types";
	import { post_data } from "../api";
	import NoApi from "./NoApi.svelte";
	import api_logo from "./img/api-logo.svg";
	import clear from "./img/clear.svg";
	import { represent_value } from "./utils";

	import EndpointDetail from "./EndpointDetail.svelte";
	import InputPayload from "./InputPayload.svelte";
	import ResponseObject from "./ResponseObject.svelte";
	import CodeSnippets from "./CodeSnippets.svelte";

	const dispatch = createEventDispatcher();

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

	let current_language: "javascript" | "python" = "python";
	let is_running = false;

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

	let active_api_count = dependencies.filter((d) => d.api_name).length;

	const run = async (index: number) => {
		is_running = true;
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
			is_running = false;
			return;
		}
		let [response, status_code] = await post_data(
			`${root}run/${dependency.api_name}`,
			{
				data: inputs
			}
		);
		is_running = false;
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

	onMount(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	});
</script>

{#if active_api_count}
	<div
		class="wrap px-6 py-4 border-b border-gray-100 dark:border-gray-900 relative text-sm md:text-lg"
	>
		<h2 class="h2-1 font-semibold flex">
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
		{#if active_api_count > 1}
			<div>
				{active_api_count} API endpoints:
			</div>
		{/if}
	</div>
	<div class="flex flex-col gap-6">
		{#each dependencies as dependency, dependency_index}
			{#if dependency.api_name}
				<div
					class="bg-gradient-to-b dark:from-orange-200/5 from-orange-200/20 via-transparent to-transparent p-6 rounded"
				>
					<EndpointDetail
						{dependency_index}
						{root}
						api_name={dependency.api_name}
					/>

					<InputPayload
						{dependency}
						{dependency_failures}
						{dependency_index}
						{dependency_inputs}
						{instance_map}
						{run}
					/>

					<ResponseObject
						{instance_map}
						{dependency}
						{dependency_index}
						{is_running}
						{dependency_outputs}
					/>
					<CodeSnippets
						{instance_map}
						{dependency}
						{dependency_index}
						{current_language}
						{root}
						{dependency_inputs}
						{dependencies}
					/>
				</div>
			{/if}
		{/each}
	</div>
{:else}
	<NoApi {root} on:close />
{/if}

<style>
	.wrap {
		/* px-6 py-4 border-b border-gray-100 dark:border-gray-900 relative text-sm md:text-lg */
	}

	.h2-1 {
		/* font-semibold flex */
	}
</style>
