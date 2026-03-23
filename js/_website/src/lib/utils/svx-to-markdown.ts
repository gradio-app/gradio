import { compile } from "mdsvex";

let docs: { [key: string]: any } | null = null;

async function getDocs(): Promise<{ [key: string]: any }> {
	if (docs === null) {
		const docs_json = await import("$lib/templates/docs.json");
		docs = docs_json.default?.docs || docs_json.docs;
	}
	return docs;
}

async function get_object(name: string): Promise<any> {
	const docsData = await getDocs();
	let obj: any;

	if (name === "events" || name === "events_matrix") {
		obj = docsData["gradio"][name];
		return obj;
	}

	for (const library in docsData) {
		for (const key in docsData[library]) {
			if (key === name && key !== "chatinterface") {
				obj = docsData[library][key];
				break;
			} else {
				for (const o in docsData[library][key]) {
					if (o === name) {
						obj = docsData[library][key][o];
						break;
					}
				}
			}
		}
	}
	return obj;
}

async function parseScriptObjects(
	svxContent: string
): Promise<{ [varName: string]: any }> {
	const objects: { [varName: string]: any } = {};

	const scriptMatch = svxContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	if (!scriptMatch) return objects;

	const scriptContent = scriptMatch[1];

	// Find all get_object() calls and extract variable names and component names
	// we need to do this because some svx files have multiple get_object() calls
	const getObjectRegex = /let\s+(\w+)\s*=\s*get_object\(["']([^"']+)["']\)/g;
	let match;

	while ((match = getObjectRegex.exec(scriptContent)) !== null) {
		const varName = match[1];
		const componentName = match[2];

		const obj = await get_object(componentName);
		if (obj) {
			objects[varName] = obj;
		}
	}

	return objects;
}

function extractAttrVariable(
	htmlValue: string,
	attrName: string
): string | null {
	const regex = new RegExp(`${attrName}=\\{(\\w+)\\.`);
	const match = htmlValue.match(regex);
	return match ? match[1] : null;
}

function decode_html_entities(text: string | null): string {
	if (text == null) return "";

	const entities: { [key: string]: string } = {
		"&quot;": '"',
		"&apos;": "'",
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&nbsp;": " ",
		"&iexcl;": "¡",
		"&#x27;": "'",
		"&#39;": "'"
	};

	const decimal_regex = /&#(\d+);/g;
	const hex_regex = /&#x([0-9A-Fa-f]+);/g;

	const named_regex = new RegExp(Object.keys(entities).join("|"), "g");

	return text
		.replace(decimal_regex, (_, code) =>
			String.fromCharCode(parseInt(code, 10))
		)
		.replace(hex_regex, (_, code) => String.fromCharCode(parseInt(code, 16)))
		.replace(named_regex, (match) => entities[match]);
}

function strip_html_tags(text: string): string {
	return text.replace(/<[^>]*>/g, "").trim();
}

function evaluateExpression(
	text: string,
	obj: any,
	objects: { [varName: string]: any } = {}
): string {
	let result = text.replace(/\{(\w+)\.([^}]+)\}/g, (_, varName, path) => {
		const targetObj = objects[varName] || (varName === "obj" ? obj : null);
		if (!targetObj) return "";

		const value = getNestedValue(targetObj, path);

		if (typeof value === "string") {
			return decode_html_entities(strip_html_tags(value));
		}
		return String(value ?? "");
	});

	result = result.replace(
		/\{@html\s+style_formatted_text\((\w+)\.([\w\[\]\.]+)\)\}/g,
		(_, varName, path) => {
			const targetObj = objects[varName] || (varName === "obj" ? obj : null);
			if (!targetObj) return "";

			const value = getNestedValue(targetObj, path);
			if (typeof value === "string") {
				return decode_html_entities(strip_html_tags(value));
			}
			return String(value ?? "");
		}
	);

	result = result.replace(/\{@html\s+[^}]+\}/g, "");

	return result;
}

function getNestedValue(obj: any, path: string): any {
	const parts = path.split(/\.|\[|\]/).filter(Boolean);

	let value = obj;
	for (const part of parts) {
		if (value == null) return null;
		value = value[part];
	}
	return value;
}

function evaluateCondition(condition: string, obj: any): boolean {
	if (condition.includes("obj.")) {
		const match = condition.match(/obj\.(\w+)/);
		if (match) {
			const prop = match[1];
			const value = obj[prop];

			if (Array.isArray(value)) {
				return value.length > 0;
			}
			return !!value;
		}
	}
	return true;
}

function parametersToMarkdownTable(parameters: any[]): string {
	if (!parameters || parameters.length === 0) return "";

	let table = "| Parameter | Type | Default | Description |\n";
	table += "|-----------|------|---------|-------------|\n";

	for (const param of parameters) {
		const name = param.name || "";

		const type = (param.annotation || "")
			.replaceAll("Sequence[", "list[")
			.replaceAll("AbstractSet[", "set[")
			.replaceAll("Mapping[", "dict[")
			.replace(/\|/g, "\\|");

		const defaultVal = (param.default || "").replace(/\|/g, "\\|");

		const doc = decode_html_entities(strip_html_tags(param.doc || "")).replace(
			/\|/g,
			"\\|"
		);

		table += `| \`${name}\` | \`${type}\` | \`${defaultVal}\` | ${doc} |\n`;
	}

	return table;
}

function demosToMarkdown(demos: any[]): string {
	if (!demos || demos.length === 0) return "";

	let md = "";
	for (const demo of demos) {
		const name = demo[0];
		const code = demo[1];

		md += `**${name}**\n\n`;

		md += `[See demo on Hugging Face Spaces](https://huggingface.co/spaces/gradio/${name})\n\n`;

		md += "```python\n";
		md += code;
		if (!code.endsWith("\n")) md += "\n";
		md += "```\n\n";
	}

	return md;
}

function shortcutsToMarkdownTable(shortcuts: any[]): string {
	if (!shortcuts || shortcuts.length === 0) return "";

	let table = "| Class | Interface String Shortcut | Initialization |\n";
	table += "|-------|--------------------------|----------------|\n";

	for (const shortcut of shortcuts) {
		const className = (shortcut[0] || "").replace(/\|/g, "\\|");
		const shortcutStr = (shortcut[1] || "").replace(/\|/g, "\\|");
		const initialization = (shortcut[2] || "").replace(/\|/g, "\\|");
		table += `| \`gradio.${className}\` | \`"${shortcutStr}"\` | ${initialization} |\n`;
	}

	return table;
}

function eventListenersToMarkdown(fns: any[]): string {
	if (!fns || fns.length === 0) return "";

	const parent = fns[0]?.parent?.replace("gradio.", "") || "";

	let md = `#### Description

Event listeners allow you to respond to user interactions with the UI components you've defined in a Gradio Blocks app. When a user interacts with an element, such as changing a slider value or uploading an image, a function is called.

#### Supported Event Listeners

The \`${parent}\` component supports the following event listeners:

`;

	for (const fn of fns) {
		const name = fn.name;
		const description = decode_html_entities(
			strip_html_tags(fn.description || "")
		);
		md += `- \`${parent}.${name}(fn, ...)\`: ${description}\n`;
	}

	md += "\n#### Event Parameters\n\n";
	if (fns[0]?.parameters) {
		md += parametersToMarkdownTable(fns[0].parameters);
	}

	return md;
}

function guidesToMarkdown(guides: any[]): string {
	if (!guides || guides.length === 0) return "";

	let md = "";
	for (const guide of guides) {
		md += `- [${guide.pretty_name}](https://www.gradio.app${guide.url})\n`;
	}

	return md;
}

interface MDASTNode {
	type: string; // "heading", "paragraph", "code", "html", "text", etc.
	children?: MDASTNode[]; // Child nodes (for container nodes like headings)
	value?: string; // Text content (for leaf nodes like text, code)
	depth?: number; // Heading depth (1-6 for h1-h6)
	lang?: string; // Code block language (e.g., "python")
	name?: string; // For svelteBlock nodes: "if", "each", etc.
	label?: string; // For linkReference nodes
	position?: any; // Source position info (not used by us)
}

// =============================================================================
// AST NODE PROCESSING
// =============================================================================

/**
 * Get the raw text content from an AST node WITHOUT evaluating expressions.
 *
 * This is used to reconstruct fragmented text before evaluation.
 *
 * WHY IS THIS NEEDED?
 * When the markdown parser sees something like:
 *   {@html style_formatted_text(obj.postprocess.parameter_doc[0].doc)}
 *
 * It incorrectly parses the [0] as a markdown link reference, creating:
 *   - text node: "{@html style_formatted_text(obj.postprocess.parameter_doc"
 *   - linkReference node: "[0]"
 *   - text node: ".doc)}"
 *
 * We need to reconstruct the original text before we can evaluate it.
 *
 * @param node - An MDAST node
 * @returns The raw text content, preserving markdown formatting markers
 */
function getRawText(node: MDASTNode): string {
	// Text nodes: return the text value directly
	if (node.type === "text" && node.value) {
		return node.value;
	}

	// Strong (bold) nodes: wrap children in **
	if (node.type === "strong" && node.children) {
		return `**${node.children.map(getRawText).join("")}**`;
	}

	// Emphasis (italic) nodes: wrap children in *
	if (node.type === "emphasis" && node.children) {
		return `*${node.children.map(getRawText).join("")}*`;
	}

	// Inline code nodes: wrap in backticks
	if (node.type === "inlineCode" && node.value) {
		return `\`${node.value}\``;
	}

	// Link reference nodes: these are often mis-parsed array access like [0]
	// Return the bracketed content so we can reconstruct expressions
	if (node.type === "linkReference") {
		return `[${node.children?.map(getRawText).join("") || node.label || ""}]`;
	}

	// For any other node with children, recursively get text from children
	if (node.children) {
		return node.children.map(getRawText).join("");
	}

	return "";
}

/**
 * Convert an array of child nodes to markdown text.
 *
 * This first reconstructs the full raw text (handling fragmented expressions),
 * then evaluates any Svelte expressions in that text.
 *
 * @param children - Array of MDAST child nodes
 * @param obj - The main component's documentation object (fallback)
 * @param objects - Map of all variable names to their documentation objects
 * @returns Evaluated markdown text
 */
function childrenToMarkdown(
	children: MDASTNode[],
	obj: any,
	objects: { [varName: string]: any } = {}
): string {
	// STEP 1: Get raw text from all children, concatenated together
	// This reconstructs fragmented expressions
	const rawText = children.map(getRawText).join("");

	// STEP 2: Evaluate any Svelte expressions in the combined text
	// Pass the objects map so expressions like {waveform_obj.description} work
	const evaluated = evaluateExpression(rawText, obj, objects);

	return evaluated;
}

/**
 * Convert a single AST node to markdown, evaluating expressions.
 *
 * This is used for inline content within paragraphs.
 *
 * @param node - An MDAST node
 * @param obj - The main component's documentation object (fallback)
 * @param objects - Map of all variable names to their documentation objects
 * @returns Markdown text
 */
function textNodeToMarkdown(
	node: MDASTNode,
	obj: any,
	objects: { [varName: string]: any } = {}
): string {
	// Text nodes: evaluate expressions in the text
	if (node.type === "text" && node.value) {
		return evaluateExpression(node.value, obj, objects);
	}

	// Strong (bold) nodes: process children and wrap in **
	if (node.type === "strong" && node.children) {
		const content = childrenToMarkdown(node.children, obj, objects);
		return `**${content}**`;
	}

	// Emphasis (italic) nodes: process children and wrap in *
	if (node.type === "emphasis" && node.children) {
		const content = childrenToMarkdown(node.children, obj, objects);
		return `*${content}*`;
	}

	// Inline code: just wrap in backticks (no expression evaluation in code)
	if (node.type === "inlineCode" && node.value) {
		return `\`${node.value}\``;
	}

	// Link references: return bracketed content for reconstruction
	if (node.type === "linkReference") {
		return `[${node.children?.map((c) => textNodeToMarkdown(c, obj, objects)).join("") || ""}]`;
	}

	return "";
}

/**
 * Convert a heading AST node to markdown.
 *
 * Handles special cases where headings are used for styling rather than structure:
 * - h2 (##) is used in SVX for description text, not actual headings
 * - h5 (#####) is used for "Your function should accept..." helper text
 *
 * @param node - A heading MDAST node
 * @param obj - The main component's documentation object (fallback)
 * @param objects - Map of all variable names to their documentation objects
 * @returns Markdown text (heading or plain text depending on depth)
 */
function headingToMarkdown(
	node: MDASTNode,
	obj: any,
	objects: { [varName: string]: any } = {}
): string {
	const depth = node.depth || 1;

	// Process children, handling fragmented expressions
	// Pass objects map so expressions like {waveform_obj.name} work
	const content = node.children
		? childrenToMarkdown(node.children, obj, objects)
		: "";

	// Skip empty headings (can happen after expression evaluation)
	if (!content.trim()) return "";

	// h2 (##) in SVX is used for styled description text, not actual headings
	// Convert to regular paragraph text
	if (depth === 2) {
		return `${content}\n\n`;
	}

	// h5 (#####) is used for helper text like "Your function should accept..."
	// Convert to italic text
	if (depth === 5) {
		return `*${content}*\n\n`;
	}

	// For other heading levels (h1, h3, h4, h6), output as normal markdown headings
	const prefix = "#".repeat(depth);
	return `${prefix} ${content}\n\n`;
}

/**
 * Process an HTML AST node and convert to markdown.
 *
 * In SVX files, "html" nodes contain:
 * - Script tags (which we skip)
 * - HTML comments (which we skip)
 * - Svelte components like <ParamTable>, <DemosSection> (which we convert)
 * - Other HTML elements
 *
 * @param node - An HTML MDAST node
 * @param obj - The main component's documentation object (fallback)
 * @param objects - Map of all variable names to their documentation objects
 * @returns Markdown text (or empty string to skip)
 */
function htmlNodeToMarkdown(
	node: MDASTNode,
	obj: any,
	objects: { [varName: string]: any }
): string {
	const value = node.value || "";

	// Skip <script> tags - they contain JavaScript imports, not content
	if (value.startsWith("<script")) return "";

	// Skip HTML comments like <!--- Title -->
	if (value.startsWith("<!-")) return "";

	// Convert <br> to newline
	if (value.trim() === "<br>" || value.trim() === "<br/>") return "\n";

	// SVELTE COMPONENT HANDLING:
	// Each component is replaced with its markdown equivalent using data from the
	// appropriate object (determined by the component's attribute, e.g., parameters={waveform_obj.parameters})

	// <ParamTable> → markdown table of parameters
	// Extract which object's parameters to use (e.g., "obj", "waveform_obj", "validator_obj")
	if (value.includes("<ParamTable")) {
		const varName = extractAttrVariable(value, "parameters");
		// Look up the correct object, fall back to main obj if not found
		const targetObj = varName && objects[varName] ? objects[varName] : obj;
		return parametersToMarkdownTable(targetObj.parameters);
	}

	// <DemosSection> → code blocks with HuggingFace links
	if (value.includes("<DemosSection")) {
		const varName = extractAttrVariable(value, "demos");
		const targetObj = varName && objects[varName] ? objects[varName] : obj;
		return demosToMarkdown(targetObj.demos);
	}

	// <ShortcutTable> → markdown table of shortcuts
	if (value.includes("<ShortcutTable")) {
		const varName = extractAttrVariable(value, "shortcuts");
		const targetObj = varName && objects[varName] ? objects[varName] : obj;
		return shortcutsToMarkdownTable(targetObj.string_shortcuts);
	}

	// <FunctionsSection> → event listener documentation
	if (value.includes("<FunctionsSection")) {
		const varName = extractAttrVariable(value, "fns");
		const targetObj = varName && objects[varName] ? objects[varName] : obj;
		return eventListenersToMarkdown(targetObj.fns);
	}

	// <GuidesSection> → list of related guide links
	if (value.includes("<GuidesSection")) {
		const varName = extractAttrVariable(value, "guides");
		const targetObj = varName && objects[varName] ? objects[varName] : obj;
		return guidesToMarkdown(targetObj.guides);
	}

	// Handle {/if} closing tags that get bundled with component content
	// These are already handled by the conditional logic, so skip them
	if (value.includes("{/if}")) {
		return "";
	}

	return "";
}

/**
 * Process a Svelte block node ({#if}, {#each}, etc.)
 *
 * Currently only handles {#if} blocks. When a condition is false,
 * we skip all nodes until the matching {/if}.
 *
 * @param node - A svelteBlock MDAST node
 * @param obj - The component's documentation object
 * @param allNodes - All nodes in the document (to find matching {/if})
 * @param currentIndex - Current position in allNodes array
 * @returns Object with markdown content and skipUntil index
 */
function svelteBlockToMarkdown(
	node: MDASTNode,
	obj: any,
	allNodes: MDASTNode[],
	currentIndex: number
): { markdown: string; skipUntil: number } {
	const value = node.value || "";

	// Handle {#if ...} conditional blocks
	if (node.name === "if") {
		// Extract the condition from {#if condition}
		const condition = value.replace("{#if ", "").replace("}", "").trim();

		// Evaluate the condition using our component's data
		const isTrue = evaluateCondition(condition, obj);

		// If condition is FALSE, skip all content until {/if}
		if (!isTrue) {
			// Track nesting depth to handle nested {#if} blocks
			let depth = 1;
			let skipTo = currentIndex;

			// Scan forward looking for the matching {/if}
			for (let i = currentIndex + 1; i < allNodes.length; i++) {
				const n = allNodes[i];

				// Nested {#if} increases depth
				if (n.type === "svelteBlock" && n.name === "if") {
					depth++;
				}

				// {/if} decreases depth
				if (
					(n.type === "html" && n.value?.includes("{/if}")) ||
					(n.type === "svelteBlock" && n.value?.includes("{/if}"))
				) {
					depth--;
					// When depth reaches 0, we found our matching {/if}
					if (depth === 0) {
						skipTo = i;
						break;
					}
				}
			}

			// Return empty markdown and the index to skip to
			return { markdown: "", skipUntil: skipTo };
		}
	}

	// For true conditions or non-if blocks, continue normally
	return { markdown: "", skipUntil: -1 };
}

// =============================================================================
// MAIN CONVERSION FUNCTION
// =============================================================================

/**
 * Convert SVX content to Markdown using AST parsing.
 *
 * This is the main entry point for converting documentation.
 *
 * HOW IT WORKS:
 * 1. Look up the component's data from docs.json
 * 2. Use mdsvex to parse the SVX into an AST
 * 3. Walk through each node in the AST
 * 4. Convert each node to its markdown equivalent
 * 5. Return the combined markdown string
 *
 * @param svxContent - The raw SVX file content
 * @param componentName - The component name (e.g., "textbox")
 * @returns Promise resolving to markdown string
 */
export async function svxToMarkdown(
	svxContent: string,
	componentName: string
): Promise<string> {
	const obj = await get_object(componentName);
	if (!obj) {
		return `# ${componentName}\n\nDocumentation not found.`;
	}

	const objects = await parseScriptObjects(svxContent);

	let capturedTree: MDASTNode | null = null;

	function captureAST() {
		return (tree: MDASTNode) => {
			capturedTree = JSON.parse(JSON.stringify(tree));
			return tree;
		};
	}

	await compile(svxContent, {
		remarkPlugins: [captureAST]
	});

	if (!capturedTree || !capturedTree.children) {
		return `# ${obj.name}\n\nError parsing documentation.`;
	}

	let markdown = "";
	const nodes = capturedTree.children;

	let skipUntil = -1;

	for (let i = 0; i < nodes.length; i++) {
		if (i <= skipUntil) continue;

		const node = nodes[i];

		switch (node.type) {
			case "heading":
				markdown += headingToMarkdown(node, obj, objects);
				break;

			case "code":
				if (node.lang && node.value) {
					markdown += `\`\`\`${node.lang}\n${node.value}\n\`\`\`\n\n`;
				}
				break;

			case "html":
				markdown += htmlNodeToMarkdown(node, obj, objects);
				break;

			case "svelteBlock":
				const result = svelteBlockToMarkdown(node, obj, nodes, i);
				markdown += result.markdown;
				if (result.skipUntil > -1) {
					skipUntil = result.skipUntil;
				}
				break;

			case "paragraph":
				if (node.children) {
					const content = node.children
						.map((c) => textNodeToMarkdown(c, obj, objects))
						.join("");
					if (content.trim()) {
						markdown += content + "\n\n";
					}
				}
				break;
		}
	}

	return markdown.trim() + "\n";
}

export { get_object };
