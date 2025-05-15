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
		(dependency) => dependency.show_api
	).length;

	if (root === "") {
		root = location.protocol + "//" + location.host + location.pathname;
	}
	if (!root.endsWith("/")) {
		root += "/";
	}

	export let api_calls: Payload[] = [];
	let current_language: "python" | "javascript" | "bash" | "mcp" = "python";

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

	get_info().then((data) => {
		info = data;
	});

	get_js_info().then((js_api_info) => {
		js_info = js_api_info;
	});

	const dispatch = createEventDispatcher();

	const mcp_server_url = `${root}gradio_api/mcp/sse`;

	interface ToolParameter {
		title?: string;
		type: string;
		description: string;
		format?: string;
	}

	interface Tool {
		name: string;
		description: string;
		parameters: Record<string, ToolParameter>;
		expanded?: boolean;
	}

	let tools: Tool[] = [];

	async function fetchMcpTools() {
		try {
			const response = await fetch(`${root}gradio_api/mcp/schema`);
			const schema = await response.json();

			tools = Object.entries(schema).map(([name, tool]: [string, any]) => ({
				name: `${name}`,
				description: tool.description || "",
				parameters: tool.properties || {},
				expanded: false
			}));
		} catch (error) {
			console.error("Failed to fetch MCP tools:", error);
			tools = [];
		}
	}

	onMount(() => {
		document.body.style.overflow = "hidden";
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}

		// Check MCP server status and fetch tools if active
		fetch(mcp_server_url)
			.then((response) => {
				mcp_server_active = response.ok;
				if (mcp_server_active) {
					fetchMcpTools();
				}
			})
			.catch(() => {
				mcp_server_active = false;
			});

		return () => {
			document.body.style.overflow = "auto";
		};
	});
</script>

{#if info}
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
			<div class="client-doc">
				<p style="font-size: var(--text-lg);">
					Choose one of the following ways to interact with the API.
				</p>
			</div>
			<div class="endpoint">
				<div class="snippets">
					{#each langs as [language, display_name, img]}
						<li
							class="snippet
						{current_language === language ? 'current-lang' : 'inactive-lang'}"
							on:click={() => (current_language = language)}
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
						{:else if current_language == "mcp"}
							{#if mcp_server_active}
								<Block>
									<div class="mcp-url">
										<label
											><span class="status-indicator active">●</span>MCP Server
											URL</label
										>
										<div class="textbox">
											<input type="text" readonly value={mcp_server_url} />
											<CopyButton code={mcp_server_url} />
										</div>
									</div>
								</Block>
								<p>&nbsp;</p>
								<strong>Available MCP Tools</strong>
								<div class="mcp-tools">
									{#each tools as tool}
										<div class="tool-item">
											<button
												class="tool-header"
												on:click={() => (tool.expanded = !tool.expanded)}
											>
												<span
													><span class="tool-name">{tool.name}</span> &nbsp;
													<span class="tool-description"
														>{tool.description
															? tool.description
															: "⚠︎ No description provided in function docstring"}</span
													></span
												>
												<span class="tool-arrow"
													>{tool.expanded ? "▼" : "▶"}</span
												>
											</button>
											{#if tool.expanded}
												<div class="tool-content">
													{#if Object.keys(tool.parameters).length > 0}
														<div class="tool-parameters">
															{#if Object.keys(tool.parameters).length > 0}
																{#each Object.entries(tool.parameters) as [name, param]}
																	<div class="parameter">
																		<code>{name}</code>
																		<span class="parameter-type"
																			>({param.type})</span
																		>
																		<p class="parameter-description">
																			{param.description
																				? param.description
																				: "⚠︎ No description for this parameter in function docstring"}
																		</p>
																	</div>
																{/each}
															{:else}
																<p>No parameters</p>
															{/if}
														</div>
													{/if}
												</div>
											{/if}
										</div>
									{/each}
								</div>
								<p>&nbsp;</p>

								<strong>Integration</strong>: To add this MCP to clients that
								support SSE (e.g. Cursor, Windsurf, Cline), simply add the
								following configuration to your MCP config:
								<p>&nbsp;</p>
								<Block>
									<code>
										<div class="copy">
											<CopyButton
												code={JSON.stringify(
													{
														mcpServers: {
															gradio: {
																url: mcp_server_url
															}
														}
													},
													null,
													2
												)}
											/>
										</div>
										<div>
											<pre>{JSON.stringify(
													{
														mcpServers: {
															gradio: {
																url: mcp_server_url
															}
														}
													},
													null,
													2
												)}</pre>
										</div>
									</code>
								</Block>
								<p>&nbsp;</p>
								<em>Experimental stdio support</em>: For clients that only
								support stdio, first
								<a href="https://nodejs.org/en/download/" target="_blank"
									>install Node.js</a
								>. Then, you can use the following command:
								<p>&nbsp;</p>
								<Block>
									<code>
										<div class="copy">
											<CopyButton
												code={JSON.stringify(
													{
														mcpServers: {
															gradio: {
																command: "npx",
																args: [
																	"mcp-remote",
																	mcp_server_url,
																	"--transport",
																	"sse-only"
																]
															}
														}
													},
													null,
													2
												)}
											/>
										</div>
										<div>
											<pre>{JSON.stringify(
													{
														mcpServers: {
															gradio: {
																command: "npx",
																args: [
																	"mcp-remote",
																	mcp_server_url,
																	"--transport",
																	"sse-only"
																]
															}
														}
													},
													null,
													2
												)}</pre>
										</div>
									</code>
								</Block>
								<p>&nbsp;</p>
								<p>
									<a href={mcp_docs} target="_blank">
										Read more about MCP in the Gradio docs
									</a>
								</p>
							{:else}
								This Gradio app can also serve as an MCP server, with an MCP
								tool corresponding to each API endpoint. To enable this, launch
								this Gradio app with <code>.launch(mcp_server=True)</code> or
								set the <code>GRADIO_MCP_SERVER</code> env variable to
								<code>"True"</code>.
							{/if}
						{:else}
							1. Confirm that you have cURL installed on your system.
						{/if}
					</p>

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

				{#if current_language !== "mcp"}
					{#each dependencies as dependency, dependency_index}
						{#if dependency.show_api && info.named_endpoints["/" + dependency.api_name]}
							<div class="endpoint-container">
								<CodeSnippet
									named={true}
									endpoint_parameters={info.named_endpoints[
										"/" + dependency.api_name
									].parameters}
									{dependency}
									{dependency_index}
									{current_language}
									{root}
									{space_id}
									{username}
									api_prefix={app.api_prefix}
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
				{/if}
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

	.mcp-url {
		padding: var(--size-2);
		position: relative;
	}

	.mcp-url label {
		display: block;
		margin-bottom: var(--size-2);
		font-weight: 600;
		color: var(--body-text-color);
	}

	.mcp-url .textbox {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--size-2);
		background: var(--background-fill-primary);
	}

	.mcp-url input {
		flex: 1;
		border: none;
		background: none;
		color: var(--body-text-color);
		font-family: var(--font-mono);
		font-size: var(--text-md);
		width: 100%;
	}

	.mcp-url input:focus {
		outline: none;
	}

	.status-indicator {
		display: inline-block;
		margin-right: var(--size-1-5);
		position: relative;
		top: -1px;
		font-size: 0.8em;
	}

	.status-indicator.active {
		color: #4caf50;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			opacity: 1;
		}
	}

	.mcp-tools {
		margin-top: var(--size-4);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.tool-item {
		border-bottom: 1px solid var(--border-color-primary);
	}

	.tool-item:last-child {
		border-bottom: none;
	}

	.tool-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--size-3);
		background: var(--background-fill-primary);
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.tool-header:hover {
		background: var(--background-fill-secondary);
	}

	.tool-name {
		font-family: var(--font-mono);
		font-weight: 600;
	}

	.tool-arrow {
		color: var(--body-text-color-subdued);
	}

	.tool-content {
		padding: var(--size-3);
		background: var(--background-fill-secondary);
	}

	.tool-description {
		margin-bottom: var(--size-3);
		color: var(--body-text-color);
	}
	.parameter {
		margin-bottom: var(--size-2);
		padding: var(--size-2);
		background: var(--background-fill-primary);
		border-radius: var(--radius-sm);
	}

	.parameter code {
		font-weight: 600;
		color: var(--color-accent);
	}

	.parameter-type {
		color: var(--body-text-color-subdued);
		margin-left: var(--size-1);
	}

	.parameter-description {
		margin-top: var(--size-1);
		color: var(--body-text-color);
	}
</style>
