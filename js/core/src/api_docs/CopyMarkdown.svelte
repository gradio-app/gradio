<script lang="ts">
	import IconCopy from "./img/IconCopy.svelte";
	import IconCheck from "./img/IconCheck.svelte";
	import IconArrowUpRight from "./IconArrowUpRight.svelte";
	import IconCaret from "./IconCaret.svelte";
	import IconHuggingChat from "./IconHuggingChat.svelte";

	import { tick } from "svelte";

	import { represent_value } from "./utils";
	import type { Dependency } from "../types";

	export let current_language: "python" | "javascript" | "bash" | "mcp";
	export let space_id: string | null;
	export let root: string;
	export let api_count: number;
	export let tools: any[];
	export let py_docs: string;
	export let js_docs: string;
	export let bash_docs: string;
	export let mcp_docs: string;
	export let spaces_docs_suffix: string;
	export let mcp_server_active: boolean;
	export let mcp_server_url: string;
	export let mcp_server_url_streamable: string;
	export let config_snippets: Record<string, string>;
	export let markdown_code_snippets: Record<string, Record<string, string>>;
	export let dependencies: Dependency[];
	export let info: any;
	export let js_info: any;

	let markdown_content: Record<string, string> = {
		python: "",
		javascript: "",
		bash: "",
		mcp: ""
	};
	/* eslint-disable complexity */
	$: markdown_content.python = `
# Python API documentation for ${space_id || root}
API Endpoints: ${api_count}

1. Install the Python client [docs](${py_docs}) if you don't already have it installed. 

\`\`\`bash
pip install gradio_client
\`\`\`

2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data. ${space_id ? "If this is a private Space, you may need to pass your Hugging Face token as well. [Read more](" + py_docs + spaces_docs_suffix + ")." : ""}

${dependencies
	.filter(
		(d) =>
			d.api_visibility === "public" && info.named_endpoints["/" + d.api_name]
	)
	.map(
		(d) =>
			`### API Name: /${d.api_name}
${info?.named_endpoints["/" + d.api_name]?.description ? "Description: " + info?.named_endpoints["/" + d.api_name]?.description : ""}

\`\`\`python
${markdown_code_snippets[d.api_name as keyof typeof markdown_code_snippets]?.python}
\`\`\`

Accepts ${info?.named_endpoints["/" + d.api_name]?.parameters?.length} parameter${info?.named_endpoints["/" + d.api_name]?.parameters?.length != 1 ? "s" : ""}:

${info?.named_endpoints["/" + d.api_name]?.parameters
	?.map((p: any) => {
		const required = !p.parameter_has_default;
		const defaultValue = !required
			? `Default: ${represent_value(p.parameter_default, p.python_type.type, "py")}`
			: "Required";
		const type = `${p.python_type.type}${p.parameter_has_default && p.parameter_default === null ? " | None" : ""}`;
		return `${p.parameter_name || `[${js_info.named_endpoints["/" + d.api_name]?.parameters.findIndex((p: any) => p.parameter_name === p.parameter_name)}]`}:\n- Type: ${type}\n- ${defaultValue}\n- The input value that is provided in the ${p.label} ${p.component} component. ${p.python_type.description}`;
	})
	.join("\n\n")}

Returns ${info?.named_endpoints["/" + d.api_name]?.returns?.length > 1 ? `tuple of ${info?.named_endpoints["/" + d.api_name]?.returns?.length} elements` : "1 element"}:

${info?.named_endpoints["/" + d.api_name]?.returns
	?.map((r: any, i: number) => {
		const type = r.python_type.type;
		return `${info?.named_endpoints["/" + d.api_name]?.returns?.length > 1 ? `[${i}]: ` : ""}- Type: ${type}\n- The output value that appears in the "${r.label}" ${r.component} component.`;
	})
	.join("\n\n")}
`
	)
	.join("\n\n\n")}
`;
	$: markdown_content.javascript = `
# JavaScript API documentation for ${space_id || root}
API Endpoints: ${api_count}

1. Install the JavaScript client [docs](${js_docs}) if you don't already have it installed. 

\`\`\`bash
npm i -D @gradio/client
\`\`\`

2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data. ${space_id ? "If this is a private Space, you may need to pass your Hugging Face token as well. [Read more](" + js_docs + spaces_docs_suffix + ")." : ""}

${dependencies
	.filter(
		(d) =>
			d.api_visibility === "public" && info.named_endpoints["/" + d.api_name]
	)
	.map(
		(d) =>
			`### API Name: /${d.api_name}
${info?.named_endpoints["/" + d.api_name]?.description ? "Description: " + info?.named_endpoints["/" + d.api_name]?.description : ""}

\`\`\`javascript
${markdown_code_snippets[d.api_name as keyof typeof markdown_code_snippets]?.javascript}
\`\`\`

Accepts ${info?.named_endpoints["/" + d.api_name]?.parameters?.length} parameter${info?.named_endpoints["/" + d.api_name]?.parameters?.length != 1 ? "s" : ""}:

${info?.named_endpoints["/" + d.api_name]?.parameters
	?.map((p: any) => {
		const required = !p.parameter_has_default;
		const defaultValue = !required
			? `Default: ${represent_value(p.parameter_default, p.python_type.type, "py")}`
			: "Required";
		const type = `${js_info.named_endpoints["/" + d.api_name]?.parameters.find((_p: any) => _p.parameter_name === p.parameter_name)?.type || "any"}`;
		return `${p.parameter_name || `[${js_info.named_endpoints["/" + d.api_name]?.parameters.findIndex((_p: any) => _p.parameter_name === p.parameter_name)}]`}:\n- Type: ${type}\n- ${defaultValue}\n- The input value that is provided in the ${p.label} ${p.component} component. ${p.python_type.description}`;
	})
	.join("\n\n")}

Returns ${info?.named_endpoints["/" + d.api_name]?.returns?.length > 1 ? `list of ${info?.named_endpoints["/" + d.api_name]?.returns?.length} elements` : "1 element"}:

${info?.named_endpoints["/" + d.api_name]?.returns
	?.map((r: any, i: number) => {
		const type = js_info.named_endpoints["/" + d.api_name]?.returns[i]?.type;
		return `${info?.named_endpoints["/" + d.api_name]?.returns?.length > 1 ? `[${i}]: ` : ""}- Type: ${type}\n- The output value that appears in the "${r.label}" ${r.component} component.`;
	})
	.join("\n\n")}`
	)
	.join("\n\n\n")}
`;
	$: markdown_content.bash = `
# Bash API documentation for ${space_id || root}
API Endpoints: ${api_count}

1. Confirm that you have cURL installed on your system.

\`\`\`bash
curl --version
\`\`\`

2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data.

Making a prediction and getting a result requires 2 requests: a POST and a GET request. The POST request returns an EVENT_ID, which is used in the second GET request to fetch the results. In these snippets, we've used awk and read to parse the results, combining these two requests into one command for ease of use. See [curl docs](${bash_docs}).

${dependencies
	.filter(
		(d) =>
			d.api_visibility === "public" && info.named_endpoints["/" + d.api_name]
	)
	.map(
		(d) =>
			`### API Name: /${d.api_name}
${info?.named_endpoints["/" + d.api_name]?.description ? "Description: " + info?.named_endpoints["/" + d.api_name]?.description : ""}

\`\`\`bash
${markdown_code_snippets[d.api_name as keyof typeof markdown_code_snippets]?.bash}
\`\`\`

Accepts ${info?.named_endpoints["/" + d.api_name]?.parameters?.length} parameter${info?.named_endpoints["/" + d.api_name]?.parameters?.length != 1 ? "s" : ""}:

${info?.named_endpoints["/" + d.api_name]?.parameters
	?.map((p: any) => {
		const defaultValue = "Required";
		const type = `${js_info.named_endpoints["/" + d.api_name]?.parameters.find((_p: any) => _p.parameter_name === p.parameter_name)?.type || "any"}`;
		return `${`[${js_info.named_endpoints["/" + d.api_name]?.parameters.findIndex((_p: any) => _p.parameter_name === p.parameter_name)}]`}:\n- Type: ${type}\n- ${defaultValue}\n- The input value that is provided in the ${p.label} ${p.component} component. ${p.python_type.description}`;
	})
	.join("\n\n")}

Returns ${info?.named_endpoints["/" + d.api_name]?.returns?.length > 1 ? `list of ${info?.named_endpoints["/" + d.api_name]?.returns?.length} elements` : "1 element"}:

${info?.named_endpoints["/" + d.api_name]?.returns
	?.map((r: any, i: number) => {
		const type = js_info.named_endpoints["/" + d.api_name]?.returns[i]?.type;
		return `${info?.named_endpoints["/" + d.api_name]?.returns?.length > 1 ? `[${i}]: ` : ""}- Type: ${type}\n- The output value that appears in the "${r.label}" ${r.component} component.`;
	})
	.join("\n\n")}
`
	)
	.join("\n\n\n")}
`;
	$: markdown_content.mcp = `
# MCP documentation for ${space_id || root}
MCP Tools: ${tools.length}

${
	!mcp_server_active
		? `This Gradio app can also serve as an MCP server, with an MCP tool corresponding to each API endpoint. 
To enable this, launch this Gradio app with \`.launch(mcp_server=True)\` or set the \`.launch(mcp_server=True)\`or set the \`GRADIO_MCP_SERVER\` env variable to \`"True"\`.`
		: `

This page documents three transports: Streamable HTTP, SSE, and STDIO.

### Streamable HTTP

MCP Server URL (Streamable HTTP): ${mcp_server_url_streamable}

${tools.length} available MCP tools, resources, and prompts: 

${tools
	.map(
		(tool) =>
			`### ${tool.name}
Type: ${tool.meta.mcp_type}
Description: ${tool.description ? tool.description : "No description provided in function docstring"}
Parameters: ${Object.keys(tool.parameters).length}
${Object.keys(tool.parameters)
	.map((parameter) => {
		return `- ${parameter} (${tool.parameters[parameter].type}): ${tool.parameters[parameter].description ? tool.parameters[parameter].description : "No description provided in function docstring"}`;
	})
	.join("\n")}
`
	)
	.join("\n\n")}

Stremable HTTP Transport: To add this MCP to clients that support Streamable HTTP, simply add the following configuration to your MCP config.

\`\`\`json
${config_snippets.streamable_http}
\`\`\`

The \`upload_files_to_gradio\` tool uploads files from your local \`UPLOAD_DIRECTORY\` (or any of its subdirectories) to the Gradio app. 
This is needed because MCP servers require files to be provided as URLs. You can omit this tool if you prefer to upload files manually. This tool requires [uv](https://docs.astral.sh/uv/getting-started/installation/) to be installed.

### SSE Transport

MCP Server URL (SSE): ${mcp_server_url}

${tools.length} available MCP tools, resources, and prompts: 

${tools
	.map(
		(tool) =>
			`### ${tool.name}
Type: ${tool.meta.mcp_type}
Description: ${tool.description ? tool.description : "No description provided in function docstring"}
Parameters: ${Object.keys(tool.parameters).length}
${Object.keys(tool.parameters)
	.map((parameter) => {
		return `- ${parameter} (${tool.parameters[parameter].type}): ${tool.parameters[parameter].description ? tool.parameters[parameter].description : "No description provided in function docstring"}`;
	})
	.join("\n")}
`
	)
	.join("\n\n")}


SSE Transport: The SSE transport has been deprecated by the MCP spec. We recommend using the Streamable HTTP transport instead. But to add this MCP to clients that only support server-sent events (SSE), simply add the following configuration to your MCP config.

\`\`\`json
${config_snippets.sse}
\`\`\`

The \`upload_files_to_gradio\` tool uploads files from your local \`UPLOAD_DIRECTORY\` (or any of its subdirectories) to the Gradio app. 
This is needed because MCP servers require files to be provided as URLs. You can omit this tool if you prefer to upload files manually. This tool requires [uv](https://docs.astral.sh/uv/getting-started/installation/) to be installed.

### STDIO Transport


${tools.length} available MCP tools, resources, and prompts: 

${tools
	.map(
		(tool) =>
			`### ${tool.name}
Type: ${tool.meta.mcp_type}
Description: ${tool.description ? tool.description : "No description provided in function docstring"}
Parameters: ${Object.keys(tool.parameters).length}
${Object.keys(tool.parameters)
	.map((parameter) => {
		return `- ${parameter} (${tool.parameters[parameter].type}): ${tool.parameters[parameter].description ? tool.parameters[parameter].description : "No description provided in function docstring"}`;
	})
	.join("\n")}
`
	)
	.join("\n\n")}

STDIO Transport: For clients that only support stdio (e.g. Claude Desktop), first [install Node.js](https://nodejs.org/en/download/). Then, you can use the following command:

\`\`\`json
${config_snippets.stdio}
\`\`\`

The \`upload_files_to_gradio\` tool uploads files from your local \`UPLOAD_DIRECTORY\` (or any of its subdirectories) to the Gradio app. 
This is needed because MCP servers require files to be provided as URLs. You can omit this tool if you prefer to upload files manually. This tool requires [uv](https://docs.astral.sh/uv/getting-started/installation/) to be installed.

Read more about the MCP in the [Gradio docs](${mcp_docs}).
`
}

`;
	/* eslint-enable complexity */

	let current_language_label =
		current_language === "python"
			? "Python"
			: current_language === "javascript"
				? "JavaScript"
				: current_language === "bash"
					? "Bash"
					: "MCP";

	$: current_language;
	$: current_language_label =
		current_language === "python"
			? "Python"
			: current_language === "javascript"
				? "JavaScript"
				: current_language === "bash"
					? "Bash"
					: "MCP";

	let label = `Copy ${current_language_label} Docs as Markdown for LLMs`;
	$: label = `Copy ${current_language_label} Docs as Markdown for LLMs`;

	let copied = false;
	$: copied;

	let open = false;
	let triggerEl: HTMLDivElement | null = null;
	let menuEl: HTMLDivElement | null = null;
	let menuStyle = "";

	const isClient = typeof window !== "undefined";

	function openMenu(): void {
		open = true;
		if (isClient && triggerEl) {
			void tick().then(() => {
				if (!triggerEl) return;
				const rect = triggerEl.getBoundingClientRect();
				const gutter = 6;
				const minWidth = Math.max(rect.width + 80, 220);
				const right = Math.max(window.innerWidth - rect.right, gutter);
				menuStyle = `top:${rect.bottom + gutter}px;right:${right}px;min-width:${minWidth}px;`;
			});
		}
	}

	function closeMenu(): void {
		open = false;
	}

	function toggleMenu(): void {
		open ? closeMenu() : openMenu();
	}

	function buildUrl(): string {
		const encodedPromptText = encodeURIComponent(
			`--------------------------------
${markdown_content[current_language]}
--------------------------------

Read the documentation above so I can ask questions about it.`
		);
		return `https://huggingface.co/chat/?prompt=${encodedPromptText}`;
	}

	function openHuggingChat(): void {
		if (isClient) {
			window.open(buildUrl(), "_blank", "noopener,noreferrer");
		}
		closeMenu();
	}

	function handleWindowPointer(event: MouseEvent): void {
		if (!open || !isClient) return;
		const targetNode = event.target as Node;
		if (menuEl?.contains(targetNode) || triggerEl?.contains(targetNode)) {
			return;
		}
		closeMenu();
	}

	function handleWindowKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && open) {
			closeMenu();
		}
	}

	function handleWindowResize(): void {
		if (open) closeMenu();
	}

	function handleWindowScroll(): void {
		if (open) closeMenu();
	}

	async function copyMarkdown(
		current_language: "python" | "javascript" | "bash" | "mcp"
	): Promise<void> {
		try {
			if (!markdown_content[current_language]) {
				console.warn("Nothing to copy");
				return;
			}

			const hasNavigatorClipboard =
				typeof navigator !== "undefined" &&
				!!navigator.clipboard &&
				typeof navigator.clipboard.writeText === "function";

			if (hasNavigatorClipboard) {
				await navigator.clipboard.writeText(markdown_content[current_language]);
			} else {
				console.warn("Clipboard API unavailable");
				return;
			}

			copied = true;
			setTimeout(() => {
				copied = false;
			}, 1500);
		} catch (error) {
			console.error("Failed to write to clipboard", error);
		}
	}
</script>

<svelte:window
	on:mousedown={handleWindowPointer}
	on:keydown={handleWindowKeydown}
	on:resize={handleWindowResize}
	on:scroll={handleWindowScroll}
/>

<div class="container-wrapper">
	<div bind:this={triggerEl} class="trigger-wrapper">
		<button
			on:click={() => copyMarkdown(current_language)}
			class="copy-button"
			aria-live="polite"
		>
			<span class="icon-wrapper">
				{#if copied}
					<IconCheck />
				{:else}
					<IconCopy />
				{/if}
			</span>
			<span
				>{copied ? `Copied ${current_language_label} Docs!` : "Copy Page"}</span
			>
		</button>
		<button
			on:click={toggleMenu}
			class="menu-toggle-button"
			aria-haspopup="menu"
			aria-expanded={open}
			aria-label={open ? "Close copy menu" : "Open copy menu"}
		>
			<IconCaret
				classNames={`caret-icon ${open ? "rotate-180" : "rotate-0"}`}
			/>
		</button>
	</div>

	{#if open}
		<div
			class="backdrop-overlay"
			aria-hidden="true"
			style="background: transparent;"
			on:click={closeMenu}
		></div>
		<div
			bind:this={menuEl}
			role="menu"
			class="menu-dropdown"
			style={menuStyle}
			aria-label="Copy menu"
		>
			<button
				role="menuitem"
				on:click={() => {
					copyMarkdown(current_language);
					closeMenu();
				}}
				class="base-menu-item"
			>
				<div class="menu-icon-container">
					<IconCopy classNames="menu-icon" />
				</div>
				<div class="menu-text-container">
					<div class="menu-text-primary">Copy Page</div>
					<div class="menu-text-secondary">
						{label}
					</div>
				</div>
			</button>

			<button
				role="menuitem"
				on:click={() => {
					openHuggingChat();
					closeMenu();
				}}
				class="base-menu-item"
			>
				<div class="menu-icon-container">
					<IconHuggingChat classNames="menu-icon" />
				</div>
				<div class="menu-text-container">
					<div class="menu-text-primary">
						Open in HuggingChat
						<IconArrowUpRight classNames="menu-icon-arrow" />
					</div>
					<div class="menu-text-secondary">
						Ask Questions About The {current_language_label} Docs
					</div>
				</div>
			</button>
		</div>
	{/if}
</div>

<style>
	.container-wrapper {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		min-width: 100px;
		justify-content: flex-end;
		margin-left: auto;
	}

	@media (max-width: 640px) {
		.container-wrapper {
			min-width: 50px;
		}
	}

	.trigger-wrapper {
		display: inline-flex;
		border-radius: 0.375rem;
	}

	@media (max-width: 640px) {
		.trigger-wrapper {
			border-radius: 0.125rem;
		}
	}

	.icon-wrapper {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		padding: 0.125rem;
	}

	@media (max-width: 640px) {
		.icon-wrapper {
			padding: 0;
		}
	}

	.menu-toggle-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		font-size: 0.875rem;
		color: rgb(107, 114, 128);
		border-radius: 0;
		border-top-right-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
		border: 1px solid rgb(229, 231, 235);
		border-left: none;
		background-color: white;
		transition: all 0.2s ease-in-out;
	}

	.menu-toggle-button:disabled {
		pointer-events: none;
	}

	.menu-toggle-button:hover {
		color: rgb(55, 65, 81);
		box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
	}

	@media (max-width: 640px) {
		.menu-toggle-button {
			width: 1.25rem;
			height: 1.25rem;
			border-top-right-radius: 0.125rem;
			border-bottom-right-radius: 0.125rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.menu-toggle-button {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);
		}

		.menu-toggle-button:hover {
			color: white;
			background-color: rgb(31, 41, 55);
		}
	}

	.backdrop-overlay {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 40;
	}

	.menu-dropdown {
		position: fixed;
		z-index: 50;
		backdrop-filter: blur(24px);
		border-radius: 0.75rem;
		max-height: 420px;
		overflow-y: auto;
		padding: 0.25rem;
		border: 1px solid rgb(229, 231, 235);
		display: flex;
		flex-direction: column;
		background-color: white;
		color: rgb(31, 41, 55);
	}

	@media (prefers-color-scheme: dark) {
		.menu-dropdown {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);
		}
	}

	.menu-icon-container {
		border: 1px solid rgb(229, 231, 235);
		border-radius: 0.5rem;
		padding: 0.375rem;
	}

	@media (prefers-color-scheme: dark) {
		.menu-icon-container {
			border-color: rgb(38, 38, 38);
		}
	}

	.menu-text-container {
		display: flex;
		flex-direction: column;
		padding-left: 0.25rem;
		padding-right: 0.25rem;
	}

	.menu-text-primary {
		font-size: 11px;
		font-weight: 500;
		color: rgb(31, 41, 55);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	@media (prefers-color-scheme: dark) {
		.menu-text-primary {
			color: rgb(209, 213, 219);
		}
	}

	.menu-text-secondary {
		font-size: 0.75rem;
		color: rgb(75, 85, 99);
	}

	@media (prefers-color-scheme: dark) {
		.menu-text-secondary {
			color: rgb(156, 163, 175);
		}
	}

	.copy-button {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 24px;
		padding-left: 8px;
		padding-right: 6px;
		font-size: 11px;
		font-weight: 500;
		color: rgb(31, 41, 55);
		border: 1px solid rgb(229, 231, 235);
		border-radius: 6px;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		background-color: white;

		@media (max-width: 640px) {
			gap: 2px;
			height: 20px;
			padding-left: 6px;
			padding-right: 6px;
			font-size: 9px;
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
		}

		&:hover {
			box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
		}

		@media (prefers-color-scheme: dark) {
			border-color: rgb(38, 38, 38);
			background-color: rgb(10, 10, 10);
			color: rgb(229, 231, 235);

			&:hover {
				background-color: rgb(38, 38, 38);
			}
		}
	}

	.base-menu-item {
		cursor: pointer;
		font-size: 11px;
		position: relative;
		width: 100%;
		user-select: none;
		outline: none;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding-left: 0.375rem;
		padding-right: 0.375rem;
		padding-top: 0.375rem;
		padding-bottom: 0.375rem;
		border-radius: 0.75rem;
		text-align: left;
		transition: all 0.2s ease-in-out;
		border-color: #e5e7eb;
		background-color: #ffffff;
	}

	.base-menu-item:hover {
		box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.base-menu-item {
			border-color: #1f2937;
			background-color: #0f1117;
			color: #e5e7eb;
		}

		.base-menu-item:hover {
			background-color: #1f2937;
		}
	}
</style>
