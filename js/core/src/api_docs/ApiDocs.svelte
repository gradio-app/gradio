<script lang="ts">
	/* eslint-disable */
	import { onMount, createEventDispatcher } from "svelte";
	import type { ComponentMeta, Dependency } from "../types";
	import NoApi from "./NoApi.svelte";
	import type { Client } from "@gradio/client";
	import type { Payload } from "../types";

	import ApiBanner from "./ApiBanner.svelte";
	import { BaseButton as Button } from "@gradio/button";
	import ParametersSnippet from "./ParametersSnippet.svelte";
	import InstallSnippet from "./InstallSnippet.svelte";
	import CodeSnippet from "./CodeSnippet.svelte";
	import RecordingSnippet from "./RecordingSnippet.svelte";
	import CopyButton from "./CopyButton.svelte";
	import { Block } from "@gradio/atoms";

	import python from "./img/python.svg";
	import javascript from "./img/javascript.svg";
	import bash from "./img/bash.svg";
	import ResponseSnippet from "./ResponseSnippet.svelte";
	import mcp from "./img/mcp.svg";
	import MCPSnippet from "./MCPSnippet.svelte";
	import CopyMarkdown from "./CopyMarkdown.svelte";

	export let dependencies: Dependency[];
	export let root: string;
	export let app: Awaited<ReturnType<typeof Client.connect>>;
	export let space_id: string | null;
	export let root_node: ComponentMeta;
	export let username: string | null;

	const js_docs =
		"https://www.gradio.app/guides/getting-started-with-the-js-client";
	const py_docs =
		"https://www.gradio.app/guides/getting-started-with-the-python-client";
	const bash_docs =
		"https://www.gradio.app/guides/querying-gradio-apps-with-curl";
	const spaces_docs_suffix = "#connecting-to-a-hugging-face-space";
	const mcp_docs =
		"https://www.gradio.app/guides/building-mcp-server-with-gradio";

	let api_count = dependencies.filter(
		(dependency) => dependency.api_visibility === "public"
	).length;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	export let api_calls: Payload[] = [];
	let current_language: "python" | "javascript" | "bash" | "mcp" = "python";

	function set_query_param(key: string, value: string) {
		const url = new URL(window.location.href);
		url.searchParams.set(key, value);
		history.replaceState(null, "", url.toString());
	}

	function get_query_param(key: string): string | null {
		const url = new URL(window.location.href);
		return url.searchParams.get(key);
	}

	function is_valid_language(lang: string | null): boolean {
		return ["python", "javascript", "bash", "mcp"].includes(lang ?? "");
	}

	const langs = [
		["python", "Python", python],
		["javascript", "JavaScript", javascript],
		["bash", "cURL", bash],
		["mcp", "MCP", mcp]
	] as const;

	let is_running = false;
	let mcp_server_active = false;

	async function get_info(): Promise<{
		named_endpoints: any;
		unnamed_endpoints: any;
	}> {
		let response = await fetch(
			root.replace(/\/$/, "") + app.api_prefix + "/info"
		);
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
	let analytics: Record<string, any>;

	get_info().then((data) => {
		info = data;
	});

	get_js_info().then((js_api_info) => {
		js_info = js_api_info;
	});

	async function get_summary(): Promise<{
		functions: any;
	}> {
		let response = await fetch(root.replace(/\/$/, "") + "/monitoring/summary");
		let data = await response.json();
		return data;
	}

	get_summary().then((summary) => {
		analytics = summary.functions;
	});

	const dispatch = createEventDispatcher();

	$: selected_tools_array = Array.from(selected_tools);
	$: selected_tools_without_prefix =
		selected_tools_array.map(remove_tool_prefix);
	$: mcp_server_url_streamable =
		selected_tools_array.length > 0 &&
		selected_tools_array.length < tools.length
			? `${root}gradio_api/mcp/?tools=${selected_tools_without_prefix.join(",")}`
			: `${root}gradio_api/mcp/`;

	interface ToolParameter {
		title?: string;
		type: string;
		description: string;
		format?: string;
		default?: any;
	}

	interface Tool {
		name: string;
		description: string;
		parameters: Record<string, ToolParameter>;
		expanded?: boolean;
		meta: {
			mcp_type: "tool" | "resource" | "prompt";
			file_data_present: boolean;
			endpoint_name: string;
		};
	}

	let tools: Tool[] = [];
	let headers: string[] = [];
	let mcp_json_stdio: any;
	let file_data_present = false;
	let selected_tools: Set<string> = new Set();
	let tool_prefix = space_id ? space_id.split("/").pop() + "_" : "";

	function remove_tool_prefix(toolName: string): string {
		if (tool_prefix && toolName.startsWith(tool_prefix)) {
			return toolName.slice(tool_prefix.length);
		}
		return toolName;
	}

	const upload_file_mcp_server = {
		command: "uvx",
		args: [
			"--from",
			"gradio[mcp]",
			"gradio",
			"upload-mcp",
			root,
			"<UPLOAD_DIRECTORY>"
		]
	};

	async function fetch_mcp_tools() {
		try {
			let schema_url = `${root}gradio_api/mcp/schema`;
			const response = await fetch(schema_url);
			const schema = await response.json();
			file_data_present = schema
				.map((tool: any) => tool.meta?.file_data_present)
				.some((present: boolean) => present);

			tools = schema.map((tool: any) => ({
				name: tool.name,
				description: tool.description || "",
				parameters: tool.inputSchema?.properties || {},
				meta: tool.meta,
				expanded: false,
				endpoint_name: tool.endpoint_name
			}));
			selected_tools = new Set(tools.map((tool) => tool.name));
			headers = schema.map((tool: any) => tool.meta?.headers || []).flat();
			if (headers.length > 0) {
				mcp_json_stdio = {
					mcpServers: {
						gradio: {
							command: "npx",
							args: [
								"mcp-remote",
								mcp_server_url_streamable,
								"--transport",
								"streamable-http",
								...headers
									.map((header) => [
										"--header",
										`${header}: <YOUR_HEADER_VALUE>`
									])
									.flat()
							]
						}
					}
				};
			} else {
				mcp_json_stdio = {
					mcpServers: {
						gradio: {
							command: "npx",
							args: [
								"mcp-remote",
								mcp_server_url_streamable,
								"--transport",
								"streamable-http"
							]
						}
					}
				};
				if (file_data_present) {
					mcp_json_stdio.mcpServers.upload_files_to_gradio =
						upload_file_mcp_server;
				}
			}
		} catch (error) {
			console.error("Failed to fetch MCP tools:", error);
			tools = [];
		}
	}

	let markdown_code_snippets: Record<string, Record<string, string>> = {};

	$: markdown_code_snippets;

	let config_snippets: Record<string, string> = {};

	$: config_snippets;

	onMount(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}

		const lang_param = get_query_param("lang");
		if (is_valid_language(lang_param)) {
			current_language = lang_param as "python" | "javascript" | "bash" | "mcp";
		}

		const mcp_schema_url = `${root}gradio_api/mcp/schema`;
		fetch(mcp_schema_url, { signal: signal })
			.then((response) => {
				mcp_server_active = response.ok;
				if (mcp_server_active) {
					fetch_mcp_tools();
					if (!is_valid_language(lang_param)) {
						current_language = "mcp";
					}
				} else {
					if (!is_valid_language(lang_param)) {
						current_language = "python";
					}
				}
				controller.abort();
			})
			.catch(() => {
				mcp_server_active = false;
			});

		return () => {
			document.body.style.overflow = "auto";
		};
	});
</script>

{#if info && analytics}
	{#if api_count}
		<div class="banner-wrap">
			<ApiBanner
				on:close
				root={space_id || root}
				{api_count}
				{current_language}
			/>
		</div>

		<div class="docs-wrap">
			<div
				class="client-doc"
				style="display: flex; align-items: center; justify-content: space-between;"
			>
				<p style="font-size: var(--text-lg);">
					Choose one of the following ways to interact with the API.
				</p>
				<CopyMarkdown
					{current_language}
					{space_id}
					{root}
					{api_count}
					{tools}
					{py_docs}
					{js_docs}
					{bash_docs}
					{mcp_docs}
					{spaces_docs_suffix}
					{mcp_server_active}
					{mcp_server_url_streamable}
					{config_snippets}
					{markdown_code_snippets}
					{dependencies}
					{info}
					{js_info}
				/>
			</div>
			<div class="endpoint">
				<div class="snippets">
					{#each langs as [language, display_name, img]}
						<li
							class="snippet
						{current_language === language ? 'current-lang' : 'inactive-lang'}"
							on:click={() => {
								current_language = language;
								set_query_param("lang", language);
							}}
						>
							<img src={img} alt="" />
							{display_name}
						</li>
					{/each}
				</div>
				{#if api_calls.length}
					<div>
						<p
							id="num-recorded-api-calls"
							style="font-size: var(--text-lg); font-weight:bold; margin: 10px 0px;"
						>
							🪄 Recorded API Calls <span class="api-count"
								>[{api_calls.length}]</span
							>
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
							{root}
							api_prefix={app.api_prefix}
							short_root={space_id || root}
							{username}
						/>
						<p>
							Note: Some API calls only affect the UI, so when using the
							clients, the desired result may be achieved with only a subset of
							the recorded calls.
						</p>
					</div>
					<p
						style="font-size: var(--text-lg); font-weight:bold; margin: 30px 0px 10px;"
					>
						API Documentation
					</p>
				{:else}
					<p class="padded">
						{#if current_language == "python" || current_language == "javascript"}
							1. Install the
							<span style="text-transform:capitalize">{current_language}</span>
							client (<a
								href={current_language == "python" ? py_docs : js_docs}
								target="_blank">docs</a
							>) if you don't already have it installed.
						{:else if current_language == "bash"}
							1. Confirm that you have cURL installed on your system.
						{/if}
					</p>

					<div class:hidden={current_language !== "mcp"}>
						<MCPSnippet
							{mcp_server_active}
							{mcp_server_url_streamable}
							tools={tools.filter((tool) => selected_tools.has(tool.name))}
							all_tools={tools}
							bind:selected_tools
							{mcp_json_stdio}
							{file_data_present}
							{mcp_docs}
							{analytics}
							bind:config_snippets
						/>
					</div>

					{#if current_language !== "mcp"}
						<InstallSnippet {current_language} />

						<p class="padded">
							2. Find the API endpoint below corresponding to your desired
							function in the app. Copy the code snippet, replacing the
							placeholder values with your own input data.
							{#if space_id}If this is a private Space, you may need to pass
								your Hugging Face token as well (<a
									href={current_language == "python"
										? py_docs + spaces_docs_suffix
										: current_language == "javascript"
											? js_docs + spaces_docs_suffix
											: bash_docs}
									class="underline"
									target="_blank">read more</a
								>).{/if}

							Or use the
							<Button
								size="sm"
								variant="secondary"
								on:click={() =>
									dispatch("close", { api_recorder_visible: true })}
							>
								<div class="loading-dot"></div>
								<p class="self-baseline">API Recorder</p>
							</Button>
							to automatically generate your API requests.
							{#if current_language == "bash"}<br />&nbsp;<br />Making a
								prediction and getting a result requires
								<strong>2 requests</strong>: a
								<code>POST</code>
								and a <code>GET</code> request. The <code>POST</code> request
								returns an <code>EVENT_ID</code>, which is used in the second
								<code>GET</code> request to fetch the results. In these
								snippets, we've used <code>awk</code> and <code>read</code> to
								parse the results, combining these two requests into one command
								for ease of use. {#if username !== null}
									Note: connecting to an authenticated app requires an
									additional request.{/if} See
								<a href={bash_docs} target="_blank">curl docs</a>.
							{/if}

							<!-- <span
							id="api-recorder"
							on:click={() => dispatch("close", { api_recorder_visible: true })}
							>🪄 API Recorder</span
						> to automatically generate your API requests! -->
						</p>
					{/if}
				{/if}

				<div class:hidden={current_language === "mcp"}>
					{#each dependencies as dependency}
						{#if dependency.api_visibility === "public" && info.named_endpoints["/" + dependency.api_name]}
							<div class="endpoint-container">
								<CodeSnippet
									endpoint_parameters={info.named_endpoints[
										"/" + dependency.api_name
									].parameters}
									{dependency}
									{current_language}
									{root}
									{space_id}
									{username}
									api_prefix={app.api_prefix}
									api_description={info.named_endpoints[
										"/" + dependency.api_name
									].description}
									{analytics}
									bind:markdown_code_snippets
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
		font-size: var(--text-lg);
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
		width: var(--size-4);
		height: var(--size-4);
	}

	.header {
		margin-top: var(--size-6);
		font-size: var(--text-xl);
	}

	.endpoint-container {
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
		border: 1px solid var(--block-border-color);
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

	code {
		font-size: var(--text-md);
	}
	.loading-dot {
		position: relative;
		left: -9999px;
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background-color: #fd7b00;
		color: #fd7b00;
		box-shadow: 9999px 0 0 -1px;
		margin-right: 0.25rem;
	}
	:global(.docs-wrap .sm.secondary) {
		padding-top: 1px;
		padding-bottom: 1px;
	}
	.self-baseline {
		align-self: baseline;
	}
	.api-count {
		font-weight: bold;
		color: #fd7b00;
		align-self: baseline;
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	code pre {
		overflow-x: auto;
		color: var(--body-text-color);
		font-family: var(--font-mono);
		tab-size: 2;
	}

	.token.string {
		display: contents;
		color: var(--color-accent-base);
	}

	.copy {
		position: absolute;
		top: 0;
		right: 0;
		margin-top: 5px;
		margin-right: 5px;
		z-index: 10;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
		margin-top: var(--size-3);
		margin-bottom: var(--size-3);
	}

	.desc {
		color: var(--body-text-color-subdued);
	}

	.api-name {
		color: var(--color-accent);
	}

	.hidden {
		display: none;
	}
</style>
