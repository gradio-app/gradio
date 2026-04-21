import { writable } from "svelte/store";
import type {
	Workflow,
	WFNode,
	WFEdge,
	NodeDataValue
} from "./workflow-types";

function uuid(): string {
	return crypto.randomUUID();
}

const DEFAULT: Workflow = {
	version: "1",
	name: "My workflow",
	nodes: [
		{
			id: "node_default",
			kind: "input",
			label: "Image",
			source: "local",
			inputs: [],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			x: 80,
			y: 120,
			width: 200,
			height: 160,
			data: {}
		}
	],
	edges: []
};

function loadFromStorage(): Workflow {
	if (typeof localStorage === "undefined") return DEFAULT;
	try {
		const raw = localStorage.getItem("gradio_workflow");
		if (raw) {
			const wf = JSON.parse(raw) as Workflow;
			wf.nodes = wf.nodes.map((n) => {
				// Migrate: output nodes now have a pass-through output port
				if (n.kind === "output" && (!n.outputs || n.outputs.length === 0) && n.inputs?.[0]) {
					n.outputs = [{ id: "out", label: n.inputs[0].label, type: n.inputs[0].type }];
				}
				return { ...n, data: n.data ?? {} };
			});
			return wf;
		}
	} catch {
		// ignore
	}
	return DEFAULT;
}

export const workflow = writable<Workflow>(loadFromStorage());

workflow.subscribe((wf) => {
	if (typeof localStorage !== "undefined") {
		const sanitized = {
			...wf,
			nodes: wf.nodes.map((n) => ({
				...n,
				data: Object.fromEntries(
					Object.entries(n.data ?? {}).map(([k, v]) => [
						k,
						typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? v : null
					])
				)
			}))
		};
		localStorage.setItem("gradio_workflow", JSON.stringify(sanitized, null, 2));
	}
});

export function addNode(
	template: Omit<WFNode, "id" | "x" | "y" | "data">,
	x: number,
	y: number
): string {
	const id = uuid();
	workflow.update((wf) => ({
		...wf,
		nodes: [...wf.nodes, { ...template, id, x, y, data: {} }]
	}));
	return id;
}

export function moveNode(id: string, x: number, y: number): void {
	workflow.update((wf) => ({
		...wf,
		nodes: wf.nodes.map((n) => (n.id === id ? { ...n, x, y } : n))
	}));
}

export function addEdge(e: Omit<WFEdge, "id">): void {
	workflow.update((wf) => ({
		...wf,
		edges: [...wf.edges, { ...e, id: uuid() }]
	}));
}

export function removeEdge(id: string): void {
	workflow.update((wf) => ({
		...wf,
		edges: wf.edges.filter((e) => e.id !== id)
	}));
}

export function removeNode(id: string): void {
	workflow.update((wf) => {
		const node = wf.nodes.find((n) => n.id === id);
		if (node) {
			Object.values(node.data ?? {}).forEach((v) => {
				if (v && typeof v === "object" && v.url?.startsWith("blob:")) {
					URL.revokeObjectURL(v.url);
				}
			});
		}
		return {
			...wf,
			nodes: wf.nodes.filter((n) => n.id !== id),
			edges: wf.edges.filter(
				(e) => e.from_node_id !== id && e.to_node_id !== id
			)
		};
	});
}

export function updateNodeData(
	nodeId: string,
	portId: string,
	value: NodeDataValue
): void {
	workflow.update((wf) => ({
		...wf,
		nodes: wf.nodes.map((n) =>
			n.id === nodeId ? { ...n, data: { ...n.data, [portId]: value } } : n
		)
	}));
}

export function resizeNode(
	nodeId: string,
	width: number,
	height: number
): void {
	workflow.update((wf) => ({
		...wf,
		nodes: wf.nodes.map((n) =>
			n.id === nodeId ? { ...n, width, height } : n
		)
	}));
}
