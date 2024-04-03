<script lang="ts">
	/* eslint-disable */
	import { onMount, createEventDispatcher } from "svelte";
	import type { ComponentMeta, Dependency } from "../types";
	import { post_data } from "@gradio/client";
	import NoApi from "./NoApi.svelte";
	import type { client } from "@gradio/client";
	import type { Payload } from "../types";
	import { represent_value } from "./utils";

	import ApiBanner from "./ApiBanner.svelte";
	import Button from "../../../button/shared/Button.svelte";
	import ParametersSnippet from "./ParametersSnippet.svelte";
	import InstallSnippet from "./InstallSnippet.svelte";
	import CodeSnippet from "./CodeSnippet.svelte";
	import RecordingSnippet from "./RecordingSnippet.svelte";

	import python from "./img/python.svg";
	import javascript from "./img/javascript.svg";
	import ResponseSnippet from "./ResponseSnippet.svelte";

	export let dependencies: Dependency[];
	export let root: string;
	export let app: Awaited<ReturnType<typeof client>>;
	export let space_id: string | null;
	export let root_node: ComponentMeta;
	const js_docs =
		"https://www.gradio.app/guides/getting-started-with-the-js-client";
	const py_docs =
		"https://www.gradio.app/guides/getting-started-with-the-python-client";
	const spaces_docs_suffix = "#connecting-to-a-hugging-face-space";

	let api_count = dependencies.filter(
		(dependency) => dependency.show_api
	).length;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	export let api_calls: Payload[] = [];
	let current_language: "python" | "javascript" = "python";

	const langs = [
		["python", python],
		["javascript", javascript]
	] as const;

	let is_running = false;

	function find_recursive(
		node: ComponentMeta,
		id: number
	): ComponentMeta | null {
		if (node.id === id) {
			return node;
		}
		if (node.children) {
			for (let child of node.children) {
				let result = find_recursive(child, id);
				if (result) {
					return result;
				}
			}
		}
		return null;
	}

	let dependency_inputs = dependencies.map((dependency) =>
		dependency.inputs.map((_id) => {
			let default_data = find_recursive(root_node, _id)?.props?.default;
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

	get_info().then((data) => {
		info = data;
	});

	get_js_info().then((js_api_info) => {
		js_info = js_api_info;
	});

	async function run(index: number): Promise<void> {
		is_running = true;
		let dependency = dependencies[index];
		let attempted_component_index = 0;
		try {
			var inputs = dependency_inputs[index].map((input_val: any, i: number) => {
				attempted_component_index = i;
				let component = find_recursive(root_node, dependency.inputs[i])!;
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
					let component = find_recursive(root_node, dependency.outputs[i])!;

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

	const dispatch = createEventDispatcher();

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
	{#if api_count}
		<div class="banner-wrap">
			<ApiBanner on:close root={space_id || root} {api_count} />
		</div>

		<div class="docs-wrap">
			<div class="client-doc">
				<p>
					Use the <code class="library">gradio_client</code>
					<a href={py_docs} target="_blank">Python library</a> or the
					<code class="library">@gradio/client</code>
					<a href={js_docs} target="_blank">Javascript package</a> to query the app
					via API.
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
				{#if api_calls.length}
					<div>
						<p
							style="font-size: var(--text-lg); font-weight:bold; margin: 10px 0px;"
						>
							🪄 Recorded API Calls ({api_calls.length})
						</p>
						<p>
							Here is the code snippet to replay the most recently recorded API
							calls using the {current_language}
							client.
						</p>

						<RecordingSnippet
							{current_language}
							{api_calls}
							{dependencies}
							root={space_id || root}
							endpoints_info={info.named_endpoints}
						/>
						<p>
							Note: the above list may include extra API calls that affect the
							UI, but are not necessary for the clients.
						</p>
					</div>
					<p
						style="font-size: var(--text-lg); font-weight:bold; margin: 30px 0px 10px;"
					>
						API Documentation
					</p>
				{:else}
					<p class="padded">
						1. Install the client if you don't already have it installed.
					</p>

					<InstallSnippet {current_language} />

					<p class="padded">
						2. Find the API endpoint below corresponding to your desired
						function in the app. Copy the code snippet, replacing the
						placeholder values with your own input data.
						{#if space_id}If this is a private Space, you may need to pass your
							Hugging Face token as well (<a
								href={(current_language == "python" ? py_docs : js_docs) +
									spaces_docs_suffix}
								class="underline"
								target="_blank">read more</a
							>).{/if} Or
						<Button
							size="sm"
							variant="primary"
							on:click={() => dispatch("close", { api_recorder_visible: true })}
						>
							🪄 Use the API Recorder
						</Button>
						to automatically generate your API requests.

						<!-- <span
							id="api-recorder"
							on:click={() => dispatch("close", { api_recorder_visible: true })}
							>🪄 API Recorder</span
						> to automatically generate your API requests! -->
					</p>
				{/if}

				{#each dependencies as dependency, dependency_index}
					{#if dependency.show_api}
						<div class="endpoint-container">
							<CodeSnippet
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
								root={space_id || root}
							/>

							<ParametersSnippet
								endpoint_returns={info.named_endpoints[
									"/" + dependency.api_name
								].parameters}
								js_returns={js_info.named_endpoints["/" + dependency.api_name]
									.parameters}
								{is_running}
								{current_language}
							/>

							<ResponseSnippet
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
		padding: 0px var(--size-1);
		color: var(--color-accent);
		font-size: var(--text-md);
		text-decoration: none;
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
		border: 1px solid var(--body-text-color);
		border-radius: var(--radius-xl);
		padding: var(--size-3);
		padding-top: 0;
	}

	a {
		text-decoration: underline;
	}

	p.padded {
		padding: 15px 0px;
		font-size: var(--text-lg);
	}

	#api-recorder {
		border: 1px solid var(--color-accent);
		background-color: var(--color-accent-soft);
		padding: 0px var(--size-2);
		border-radius: var(--size-1);
		cursor: pointer;
	}
</style>
