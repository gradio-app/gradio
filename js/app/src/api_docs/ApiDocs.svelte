<script lang="ts">
	/* eslint-disable */
	import { onMount, createEventDispatcher } from "svelte";
	import type { ComponentMeta, Dependency } from "../types";
	import { post_data } from "@gradio/client";
	import NoApi from "./NoApi.svelte";
	import type { client } from "@gradio/client";

	import { represent_value } from "./utils";

	import ApiBanner from "./ApiBanner.svelte";
	import ResponseObject from "./ResponseObject.svelte";
	import InstallSnippet from "./InstallSnippet.svelte";
	import CodeSnippets from "./CodeSnippets.svelte";

	import python from "./img/python.svg";
	import javascript from "./img/javascript.svg";

	export let instance_map: {
		[id: number]: ComponentMeta;
	};
	export let dependencies: Dependency[];
	export let root: string;
	export let app: Awaited<ReturnType<typeof client>>;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	let current_language: "python" | "javascript" = "python";

	const langs = [
		["python", python],
		["javascript", javascript]
	] as const;

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

	async function get_info(): Promise<{
		named_endpoints: any;
		unnamed_endpoints: any;
	}> {
		let response = await fetch(root + "info");
		let data = await response.json();
		return data;
	}
	async function get_js_info(): Promise<Record<string, any>> {
		let js_api_info = await app.view_api();
		return js_api_info;
	}

	let info: {
		named_endpoints: any;
		unnamed_endpoints: any;
	};

	let js_info: Record<string, any>;

	get_info().then((data) => (info = data));

	get_js_info().then((js_api_info) => (js_info = js_api_info));

	async function run(index: number): Promise<void> {
		is_running = true;
		let dependency = dependencies[index];
		let attempted_component_index = 0;
		try {
			var inputs = dependency_inputs[index].map((input_val, i) => {
				attempted_component_index = i;
				let component = instance_map[dependency.inputs[i]];
				// @ts-ignore
				input_val = represent_value(
					input_val,
					component.documentation?.type?.input_payload ||
						component.documentation?.type?.payload
				);
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

					return represent_value(
						output_val,
						component.documentation?.type?.response_object ||
							component.documentation?.type?.payload,
						"js"
					);
				}
			);
		} else {
			dependency_failures[index] = new Array(
				dependency_failures[index].length
			).fill(true);
		}
	}

	onMount(() => {
		document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}
		return () => {
			document.body.style.overflow = "auto";
		};
	});
</script>

{#if info}
	{#if Object.keys(info.named_endpoints).length + Object.keys(info.unnamed_endpoints).length}
		<div class="banner-wrap">
			<ApiBanner
				on:close
				{root}
				api_count={Object.keys(info.named_endpoints).length +
					Object.keys(info.unnamed_endpoints).length}
			/>
		</div>
		<div class="docs-wrap">
			<div class="client-doc">
				<p>
					Use the <a
						href="https://gradio.app/docs/#python-client"
						target="_blank"><code class="library">gradio_client</code></a
					>
					Python library or the
					<a href="https://gradio.app/docs/#javascript-client" target="_blank"
						><code class="library">@gradio/client</code></a
					> Javascript package to query the demo via API.
				</p>
			</div>
			<div class="endpoint">
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
				<InstallSnippet {current_language} />

				{#if Object.keys(info.named_endpoints).length}
					<h2 class="header">Named Endpoints</h2>
				{/if}

				{#each dependencies as dependency, dependency_index}
					{#if dependency.api_name}
						<div class="endpoint-container">
							<CodeSnippets
								named={true}
								endpoint_parameters={info.named_endpoints[
									"/" + dependency.api_name
								].parameters}
								js_parameters={js_info.named_endpoints[
									"/" + dependency.api_name
								].parameters}
								{dependency}
								{dependency_index}
								{current_language}
								{root}
								{dependency_failures}
							/>

							<!-- <TryButton
							named={true}
							{dependency_index}
							{run}
						/> -->

							<ResponseObject
								endpoint_returns={info.named_endpoints[
									"/" + dependency.api_name
								].returns}
								js_returns={js_info.named_endpoints["/" + dependency.api_name]
									.returns}
								{is_running}
								{current_language}
							/>
						</div>
					{/if}
				{/each}

				{#if Object.keys(info.unnamed_endpoints).length}
					<h2 class="header">Unnamed Endpoints</h2>
				{/if}

				{#each dependencies as dependency, dependency_index}
					{#if info.unnamed_endpoints[dependency_index]}
						<div class="endpoint-container">
							<CodeSnippets
								named={false}
								endpoint_parameters={info.unnamed_endpoints[dependency_index]
									.parameters}
								js_parameters={js_info.unnamed_endpoints[dependency_index]
									.parameters}
								{dependency}
								{dependency_index}
								{current_language}
								{root}
								{dependency_failures}
							/>

							<ResponseObject
								endpoint_returns={info.unnamed_endpoints[dependency_index]
									.returns}
								js_returns={js_info.unnamed_endpoints[dependency_index].returns}
								{is_running}
								{current_language}
							/>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<NoApi {root} on:close />
	{/if}
{/if}

<style>
	.banner-wrap {
		position: relative;
		border-bottom: 1px solid var(--border-color-primary);
		padding: var(--size-4) var(--size-6);
		font-size: var(--text-md);
	}

	@media (--screen-md) {
		.banner-wrap {
			font-size: var(--text-xl);
		}
	}

	.docs-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
	}

	.endpoint {
		border-radius: var(--radius-md);
		background: var(--background-fill-primary);
		padding: var(--size-6);
		padding-top: var(--size-1);
		font-size: var(--text-md);
	}

	.client-doc {
		padding-top: var(--size-6);
		padding-right: var(--size-6);
		padding-left: var(--size-6);
		font-size: var(--text-md);
	}

	.library {
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding-right: var(--size-1);
		padding-bottom: var(--size-1);
		padding-left: var(--size-1);
		color: var(--color-accent);
	}

	.snippets {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-4);
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

	.header {
		margin-top: var(--size-6);
		font-size: var(--text-xl);
	}

	.endpoint-container {
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-xl);
		padding: var(--size-3);
		padding-top: 0;
	}
</style>
