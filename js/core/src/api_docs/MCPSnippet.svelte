<script lang="ts">
	import { Block } from "@gradio/atoms";
	import CopyButton from "./CopyButton.svelte";
	import { Tool, Prompt, Resource } from "@gradio/icons";

	export let mcp_server_active: boolean;
	export let mcp_server_url: string;
	export let mcp_server_url_streamable: string;
	export let tools: Tool[];
	export let all_tools: Tool[] = [];
	export let selected_tools: Set<string> = new Set();
	export let mcp_json_sse: any;
	export let mcp_json_stdio: any;
	export let file_data_present: boolean;
	export let mcp_docs: string;

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
		};
	}

	type Transport = "streamable_http" | "sse" | "stdio";
	let current_transport: Transport = "streamable_http";
	let include_file_upload = true;

	const transports = [
		["streamable_http", "Streamable HTTP"],
		["sse", "SSE"],
		["stdio", "STDIO"]
	] as const;

	const tool_type_icons: Record<Tool["meta"]["mcp_type"], typeof Tool> = {
		tool: Tool,
		resource: Resource,
		prompt: Prompt
	};

	$: display_url =
		current_transport === "sse" ? mcp_server_url : mcp_server_url_streamable;

	// Helper function to add/remove file upload tool from config
	function update_config_with_file_upload(
		base_config: any,
		include_upload: boolean
	): any {
		if (!base_config) return null;

		const config = JSON.parse(JSON.stringify(base_config));

		if (include_upload && file_data_present) {
			const upload_file_mcp_server = {
				command: "uvx",
				args: [
					"--from",
					"gradio[mcp]",
					"gradio",
					"upload-mcp",
					current_transport === "sse"
						? mcp_server_url
						: mcp_server_url_streamable,
					"<UPLOAD_DIRECTORY>"
				]
			};
			config.mcpServers.upload_files_to_gradio = upload_file_mcp_server;
		} else {
			delete config.mcpServers?.upload_files_to_gradio;
		}

		return config;
	}

	$: mcp_json_streamable_http = update_config_with_file_upload(
		mcp_json_sse
			? {
					...mcp_json_sse,
					mcpServers: {
						...mcp_json_sse.mcpServers,
						gradio: {
							...mcp_json_sse.mcpServers.gradio,
							url: mcp_server_url_streamable
						}
					}
				}
			: null,
		include_file_upload
	);

	$: mcp_json_sse_updated = update_config_with_file_upload(
		mcp_json_sse,
		include_file_upload
	);
	$: mcp_json_stdio_updated = update_config_with_file_upload(
		mcp_json_stdio,
		include_file_upload
	);
</script>

{#if mcp_server_active}
	<div class="transport-selection">
		<div class="snippets">
			<span class="transport-label">Transport:</span>
			{#each transports as [transport, display_name]}
				<button
					type="button"
					class="snippet {current_transport === transport
						? 'current-lang'
						: 'inactive-lang'}"
					on:click={() => (current_transport = transport)}
				>
					{display_name}
				</button>
			{/each}
		</div>
	</div>

	{#if current_transport !== "stdio"}
		<Block>
			<div class="mcp-url">
				<label for="mcp-server-url"
					><span class="status-indicator active">●</span>MCP Server URL ({current_transport ===
					"sse"
						? "SSE"
						: "Streamable HTTP"})</label
				>
				<div class="textbox">
					<input id="mcp-server-url" type="text" readonly value={display_url} />
					<CopyButton code={display_url} />
				</div>
			</div>
		</Block>
		<p>&nbsp;</p>
	{/if}

	<div class="tool-selection">
		<strong>
			{all_tools.length > 0 ? all_tools.length : tools.length} Available MCP Tools
			(<span style="display: inline-block; vertical-align: sub;"><Tool /></span
			>), Resources (<span style="display: inline-block; vertical-align: sub;"
				><Resource /></span
			>), and Prompts (<span style="display: inline-block; vertical-align: sub;"
				><Prompt /></span
			>)
		</strong>
		{#if all_tools.length > 0}
			<div class="tool-selection-controls">
				<button
					class="select-all-btn"
					on:click={() => {
						selected_tools = new Set(all_tools.map((t) => t.name));
					}}
				>
					Select All
				</button>
				<button
					class="select-none-btn"
					on:click={() => {
						selected_tools = new Set();
					}}
				>
					Select None
				</button>
			</div>
		{/if}
	</div>
	<div class="mcp-tools">
		{#each all_tools.length > 0 ? all_tools : tools as tool}
			<div class="tool-item">
				<div class="tool-header-wrapper">
					{#if all_tools.length > 0}
						<input
							type="checkbox"
							class="tool-checkbox"
							checked={selected_tools.has(tool.name) ||
								current_transport !== "streamable_http"}
							disabled={current_transport !== "streamable_http"}
							style={current_transport !== "streamable_http"
								? "opacity: 0.5; cursor: not-allowed;"
								: ""}
							on:change={(e) => {
								if (e.currentTarget.checked) {
									selected_tools.add(tool.name);
								} else {
									selected_tools.delete(tool.name);
								}
								selected_tools = selected_tools;
							}}
						/>
					{/if}
					<button
						class="tool-header"
						on:click={() => (tool.expanded = !tool.expanded)}
					>
						<span style="display: inline-block">
							<span
								style="display: inline-block; padding-right: 6px; vertical-align: sub"
							>
								{#if tool_type_icons[tool.meta.mcp_type]}
									{@const Icon = tool_type_icons[tool.meta.mcp_type]}
									<Icon />
								{/if}
							</span>
							<span class="tool-name">{tool.name}</span>
							&nbsp;
							<span class="tool-description">
								{tool.description
									? tool.description
									: "⚠︎ No description provided in function docstring"}
							</span>
						</span>
						<span class="tool-arrow">{tool.expanded ? "▼" : "▶"}</span>
					</button>
				</div>
				{#if tool.expanded}
					<div class="tool-content">
						{#if Object.keys(tool.parameters).length > 0}
							<div class="tool-parameters">
								{#each Object.entries(tool.parameters) as [name, param]}
									<div class="parameter">
										<code>{name}</code>
										<span class="parameter-type">
											({param.type}{param.default !== undefined
												? `, default: ${JSON.stringify(param.default)}`
												: ""})
										</span>
										<p class="parameter-description">
											{param.description
												? param.description
												: "⚠︎ No description for this parameter in function docstring"}
										</p>
									</div>
								{/each}
							</div>
						{:else}
							<p>Takes no input parameters</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<p>&nbsp;</p>

	{#if current_transport === "streamable_http"}
		<strong>Streamable HTTP Transport</strong>: To add this MCP to clients that
		support Streamable HTTP, simply add the following configuration to your MCP
		config.
		<p>&nbsp;</p>
		<Block>
			<code>
				<div class="copy">
					<CopyButton
						code={JSON.stringify(mcp_json_streamable_http, null, 2)}
					/>
				</div>
				<div>
					<pre>{JSON.stringify(mcp_json_streamable_http, null, 2)}</pre>
				</div>
			</code>
		</Block>
	{:else if current_transport === "sse"}
		<strong>SSE Transport</strong>: The SSE transport has been deprecated by the
		MCP spec. We recommend using the Streamable HTTP transport instead. But to
		add this MCP to clients that only support server-sent events (SSE), simply
		add the following configuration to your MCP config.
		<p>&nbsp;</p>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={JSON.stringify(mcp_json_sse_updated, null, 2)} />
				</div>
				<div>
					<pre>{JSON.stringify(mcp_json_sse_updated, null, 2)}</pre>
				</div>
			</code>
		</Block>
	{:else if current_transport === "stdio"}
		<strong>STDIO Transport</strong>: For clients that only support stdio (e.g.
		Claude Desktop), first
		<a href="https://nodejs.org/en/download/" target="_blank">install Node.js</a
		>. Then, you can use the following command:
		<p>&nbsp;</p>
		<Block>
			<code>
				<div class="copy">
					<CopyButton code={JSON.stringify(mcp_json_stdio_updated, null, 2)} />
				</div>
				<div>
					<pre>{JSON.stringify(mcp_json_stdio_updated, null, 2)}</pre>
				</div>
			</code>
		</Block>
	{/if}
	{#if file_data_present}
		<div class="file-upload-section">
			<label class="checkbox-label">
				<input
					type="checkbox"
					bind:checked={include_file_upload}
					class="checkbox"
				/>
				Include Gradio file upload tool
			</label>
			<p class="file-upload-explanation">
				The <code>upload_files_to_gradio</code> tool uploads files from your
				local <code>UPLOAD_DIRECTORY</code> (or any of its subdirectories) to
				the Gradio app. This is needed because MCP servers require files to be
				provided as URLs. You can omit this tool if you prefer to upload files
				manually. This tool requires
				<a
					href="https://docs.astral.sh/uv/getting-started/installation/"
					target="_blank">uv</a
				> to be installed.
			</p>
		</div>
	{/if}

	<p>&nbsp;</p>
	<p>
		<a href={mcp_docs} target="_blank">
			Read more about MCP in the Gradio docs
		</a>
	</p>
{:else}
	This Gradio app can also serve as an MCP server, with an MCP tool
	corresponding to each API endpoint. To enable this, launch this Gradio app
	with <code>.launch(mcp_server=True)</code> or set the
	<code>GRADIO_MCP_SERVER</code>
	env variable to
	<code>"True"</code>.
{/if}

<style>
	.transport-selection {
		margin-bottom: var(--size-4);
	}

	.snippets {
		display: flex;
		align-items: center;
		margin-bottom: var(--size-4);
	}

	.snippets > * + * {
		margin-left: var(--size-2);
	}

	.transport-label {
		font-weight: 600;
		color: var(--body-text-color);
		margin-right: var(--size-2);
	}

	.file-upload-section {
		margin-top: var(--size-4);
		padding: var(--size-3);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		background: var(--background-fill-secondary);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		font-weight: 600;
		color: var(--body-text-color);
		cursor: pointer;
		margin-bottom: var(--size-2);
	}

	.checkbox {
		margin-right: var(--size-2);
		width: var(--size-4);
		height: var(--size-4);
		cursor: pointer;
		accent-color: var(--color-accent);
	}

	.checkbox:checked {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.file-upload-explanation {
		margin: 0;
		color: var(--body-text-color);
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

	code pre {
		overflow-x: auto;
		color: var(--body-text-color);
		font-family: var(--font-mono);
		tab-size: 2;
	}

	.copy {
		position: absolute;
		top: 0;
		right: 0;
		margin-top: 5px;
		margin-right: 5px;
		z-index: 10;
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

	.tool-selection {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--size-2);
	}

	.tool-selection-controls {
		display: flex;
		gap: var(--size-2);
	}

	.select-all-btn,
	.select-none-btn {
		padding: var(--size-1) var(--size-2);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		background: var(--background-fill-primary);
		color: var(--body-text-color);
		cursor: pointer;
		font-size: var(--text-sm);
	}

	.select-all-btn:hover,
	.select-none-btn:hover {
		background: var(--background-fill-secondary);
	}

	.tool-item {
		border-bottom: 1px solid var(--border-color-primary);
	}

	.tool-item:last-child {
		border-bottom: none;
	}

	.tool-header-wrapper {
		display: flex;
		align-items: center;
	}

	.tool-checkbox {
		margin-left: var(--size-3);
		margin-right: var(--size-2);
		width: var(--size-4);
		height: var(--size-4);
		cursor: pointer;
		accent-color: var(--color-accent);
	}

	.tool-checkbox:checked {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.tool-header {
		flex: 1;
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

	a {
		text-decoration: underline;
	}
</style>
