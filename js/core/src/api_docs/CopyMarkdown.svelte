<script lang="ts">
	import IconCopy from "./img/IconCopy.svelte";
	import { represent_value } from "./utils";
	import type { Dependency } from "../types";

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

	let markdown_content = "";

	/* eslint-disable complexity */
	$: markdown_content = `
# API documentation for ${space_id || root}
API Endpoints: ${api_count}
MCP Tools: ${tools.length}

Choose one of the following ways to interact with the API:
- Python
- JavaScript
- cURL
- MCP

## Python Documentation: 

1. Install the Python client [docs](${py_docs}) if you don't already have it installed. 

\`\`\`bash
pip install gradio_client
\`\`\`

2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data. ${space_id ? "If this is a private Space, you may need to pass your Hugging Face token as well. [Read more](" + py_docs + spaces_docs_suffix + ")." : ""}

${dependencies
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

## JavaScript Documentation: 

1. Install the JavaScript client [docs](${js_docs}) if you don't already have it installed. 

\`\`\`bash
npm i -D @gradio/client
\`\`\`

2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data. ${space_id ? "If this is a private Space, you may need to pass your Hugging Face token as well. [Read more](" + js_docs + spaces_docs_suffix + ")." : ""}

${dependencies
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

## Bash Documentation: 

1. Confirm that you have cURL installed on your system.

\`\`\`bash
curl --version
\`\`\`

2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data.

Making a prediction and getting a result requires 2 requests: a POST and a GET request. The POST request returns an EVENT_ID, which is used in the second GET request to fetch the results. In these snippets, we've used awk and read to parse the results, combining these two requests into one command for ease of use. See [curl docs](${bash_docs}).

${dependencies
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

## MCP Documentation: 
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

	let label = "Copy page as Markdown for LLMs";
	let copied = false;

	async function copyMarkdown(): Promise<void> {
		try {
			if (!markdown_content) {
				console.warn("Nothing to copy");
				return;
			}

			const hasNavigatorClipboard =
				typeof navigator !== "undefined" &&
				!!navigator.clipboard &&
				typeof navigator.clipboard.writeText === "function";

			if (hasNavigatorClipboard) {
				await navigator.clipboard.writeText(markdown_content);
			} else {
				console.warn("Clipboard API unavailable");
				return;
			}

			copied = true;
			setTimeout(() => {
				copied = false;
			}, 1000);
		} catch (error) {
			console.error("Failed to write to clipboard", error);
		}
	}
</script>

<button on:click={copyMarkdown} class="copy-button" aria-live="polite">
	<span
		class="inline-flex items-center justify-center rounded-md p-0.5 max-sm:p-0"
	>
		<IconCopy classNames="w-3 h-3 max-sm:w-2.5 max-sm:h-2.5" />
	</span>
	<span>{copied ? "Copied!" : label}</span>
</button>

<style>
	.copy-button {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 24px;
		padding-left: 8px;
		padding-right: 8px;
		margin-right: 20px;
		font-size: 11px;
		font-weight: 500;
		color: rgb(31, 41, 55);
		border: 1px solid rgb(229, 231, 235);
		border-radius: 6px;
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
</style>
