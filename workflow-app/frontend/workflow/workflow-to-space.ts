import { createRepo, uploadFiles, whoAmI } from "@huggingface/hub";
import type { Workflow, WFNode, WFEdge } from "./workflow-types";

function topoSort(nodes: WFNode[], edges: WFEdge[]): WFNode[] {
	const deg = new Map(nodes.map((n) => [n.id, 0]));
	for (const e of edges) {
		deg.set(e.to_node_id, (deg.get(e.to_node_id) ?? 0) + 1);
	}
	const q = nodes.filter((n) => deg.get(n.id) === 0);
	const out: WFNode[] = [];
	while (q.length) {
		const n = q.shift()!;
		out.push(n);
		for (const e of edges.filter((e) => e.from_node_id === n.id)) {
			const d = (deg.get(e.to_node_id) ?? 1) - 1;
			deg.set(e.to_node_id, d);
			if (d === 0) {
				q.push(nodes.find((nd) => nd.id === e.to_node_id)!);
			}
		}
	}
	return out;
}

function portTypeToGradio(type: string): string {
	switch (type) {
		case "image": return "gr.Image()";
		case "text": return "gr.Textbox()";
		case "audio": return "gr.Audio()";
		case "video": return "gr.Video()";
		case "number": return "gr.Number()";
		case "boolean": return "gr.Checkbox()";
		case "file": return 'gr.File()';
		case "json": return "gr.JSON()";
		case "model3d": return "gr.Model3D()";
		default: return "gr.Textbox()";
	}
}

function safeName(label: string): string {
	return label.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase().replace(/^_+|_+$/g, "") || "node";
}

export function generateAppPy(workflow: Workflow): string {
	const { nodes, edges } = workflow;

	// Only include nodes that are connected (have at least one edge)
	const connectedIds = new Set<string>();
	for (const e of edges) {
		connectedIds.add(e.from_node_id);
		connectedIds.add(e.to_node_id);
	}
	const connectedNodes = nodes.filter((n) => connectedIds.has(n.id));
	const sorted = topoSort(connectedNodes, edges);
	const lines: string[] = [];
	const varNames = new Map<string, string>();
	const usedNames = new Set<string>();

	// Assign unique variable names
	for (const node of sorted) {
		let name = safeName(node.label);
		if (usedNames.has(name)) {
			let i = 2;
			while (usedNames.has(`${name}_${i}`)) i++;
			name = `${name}_${i}`;
		}
		usedNames.add(name);
		varNames.set(node.id, name);
	}

	lines.push("import gradio as gr");
	lines.push("from gradio_client import Client, handle_file");
	lines.push("");

	// Connect to all Spaces
	const transforms = sorted.filter((n) => n.kind === "transform" && n.space_id);
	for (const node of transforms) {
		const v = varNames.get(node.id)!;
		lines.push(`${v}_client = Client("${node.space_id}")`);
	}
	if (transforms.length > 0) lines.push("");

	// Build the pipeline function
	const inputNodes = sorted.filter((n) => n.kind === "input");
	const outputNodes = sorted.filter((n) => n.kind === "output");
	const inputParams = inputNodes.map((n) => varNames.get(n.id)!);

	lines.push(`def pipeline(${inputParams.join(", ")}):`);

	// Process transform nodes
	for (const node of sorted) {
		if (node.kind !== "transform" || !node.space_id) continue;
		const v = varNames.get(node.id)!;

		// Resolve inputs
		const args: string[] = [];
		for (const port of node.inputs) {
			const edge = edges.find(
				(e) => e.to_node_id === node.id && e.to_port_id === port.id
			);
			if (edge) {
				const srcNode = nodes.find((n) => n.id === edge.from_node_id)!;
				args.push(varNames.get(srcNode.id)!);
			} else {
				// Inline config or default
				const val = node.data?.[port.id];
				if (val !== null && val !== undefined) {
					args.push(JSON.stringify(val));
				} else if (port.default_value !== undefined) {
					args.push(JSON.stringify(port.default_value));
				} else {
					args.push("None");
				}
			}
		}

		const endpoint = node.endpoint ?? "/predict";
		// Wrap file inputs with handle_file
		const wrappedArgs = args.map((arg, i) => {
			const port = node.inputs[i];
			if (port && ["image", "audio", "video", "file", "model3d"].includes(port.type)) {
				return `handle_file(${arg}) if ${arg} else None`;
			}
			return arg;
		});
		lines.push(`    ${v}_result = ${v}_client.predict(${wrappedArgs.join(", ")}, api_name="${endpoint}")`);
		lines.push(`    ${v} = ${v}_result`);
	}

	// Resolve outputs
	const returnVars: string[] = [];
	for (const node of outputNodes) {
		const edge = edges.find(
			(e) => e.to_node_id === node.id && e.to_port_id === node.inputs[0]?.id
		);
		if (edge) {
			const srcNode = nodes.find((n) => n.id === edge.from_node_id)!;
			returnVars.push(varNames.get(srcNode.id)!);
		} else {
			returnVars.push("None");
		}
	}
	lines.push(`    return ${returnVars.length > 0 ? returnVars.join(", ") : "None"}`);
	lines.push("");

	// Build the Gradio interface
	const inputs = inputNodes.map((n) => {
		const pt = n.outputs[0]?.type ?? "text";
		return `${portTypeToGradio(pt)}`;
	});
	const outputs = outputNodes.map((n) => {
		const pt = n.inputs[0]?.type ?? "text";
		return `${portTypeToGradio(pt)}`;
	});

	lines.push("demo = gr.Interface(");
	lines.push("    fn=pipeline,");
	lines.push(`    inputs=[${inputs.join(", ")}],`);
	lines.push(`    outputs=[${outputs.join(", ")}],`);
	lines.push(`    title="${workflow.name}",`);
	lines.push(')');
	lines.push("");
	lines.push('demo.launch()');

	return lines.join("\n");
}

export function generateReadme(workflow: Workflow, spaceId: string): string {
	return `---
title: ${workflow.name}
emoji: ⚡
colorFrom: yellow
colorTo: purple
sdk: gradio
sdk_version: 5.33.0
app_file: app.py
pinned: false
tags:
  - gradio-workflow
---

# ${workflow.name}

Built with [Gradio Workflow Builder](https://gradio.app/workflow).

${workflow.nodes.filter((n) => n.kind === "transform").map((n) => `- **${n.label}** — [${n.space_id}](https://huggingface.co/spaces/${n.space_id})`).join("\n")}
`;
}

export function generateRequirements(): string {
	return "gradio>=5.33.0\n";
}

export async function publishToHub(
	workflow: Workflow,
	token: string,
	onStatus: (msg: string) => void
): Promise<string> {
	onStatus("Checking identity...");
	const user = await whoAmI({ accessToken: token });
	const username = user.name;
	const repoName = workflow.name.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
	const spaceId = `${username}/${repoName}`;

	onStatus("Creating Space...");
	try {
		await createRepo({
			repo: { type: "space", name: spaceId },
			accessToken: token,
			spaceSdk: "gradio"
		});
	} catch (e: any) {
		// Repo might already exist — continue
		if (!e.message?.includes("already")) throw e;
	}

	onStatus("Generating files...");
	const appPy = generateAppPy(workflow);
	const readme = generateReadme(workflow, spaceId);
	const workflowJson = JSON.stringify(workflow, null, 2);

	onStatus("Uploading...");
	await uploadFiles({
		repo: { type: "space", name: spaceId },
		accessToken: token,
		files: [
			{ path: "app.py", content: new Blob([appPy], { type: "text/plain" }) },
			{ path: "README.md", content: new Blob([readme], { type: "text/plain" }) },
			{ path: "workflow.json", content: new Blob([workflowJson], { type: "application/json" }) }
		],
		commitTitle: "Deploy from Gradio Workflow Builder"
	});

	onStatus("Done!");
	return `https://huggingface.co/spaces/${spaceId}`;
}
