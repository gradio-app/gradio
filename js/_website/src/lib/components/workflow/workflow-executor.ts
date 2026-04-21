import { Client } from "@gradio/client";
import type {
	Workflow,
	WFNode,
	WFEdge,
	NodeDataValue,
	NodeStatus,
	FileValue
} from "./workflow-types";

type StatusCallback = (nodeId: string, status: NodeStatus, error?: string) => void;
type OutputCallback = (nodeId: string, portId: string, value: NodeDataValue) => void;

// Data flowing through the DAG, keyed by nodeId then portId
type DataMap = Record<string, Record<string, NodeDataValue>>;

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

function resolveInputs(
	node: WFNode,
	edges: WFEdge[],
	dataMap: DataMap
): Record<string, NodeDataValue> {
	const resolved: Record<string, NodeDataValue> = {};
	for (const port of node.inputs) {
		const edge = edges.find(
			(e) => e.to_node_id === node.id && e.to_port_id === port.id
		);
		if (edge) {
			resolved[port.id] = dataMap[edge.from_node_id]?.[edge.from_port_id] ?? null;
		} else {
			// Check node.data for directly configured values, then port default, otherwise null
			resolved[port.id] = node.data?.[port.id]
				?? (port.default_value as NodeDataValue)
				?? null;
		}
	}
	return resolved;
}

async function toGradioInput(value: NodeDataValue): Promise<unknown> {
	if (value === null) return null;
	if (typeof value === "string") return value;
	if (typeof value === "number") return value;
	if (typeof value === "boolean") return value;
	// FileValue — fetch the blob URL back into an actual Blob for the client
	const response = await fetch(value.url);
	return await response.blob();
}

function fromGradioOutput(result: unknown, portType: string): NodeDataValue {
	if (result === null || result === undefined) return null;
	if (typeof result === "number") return result;
	if (typeof result === "boolean") return result;
	if (typeof result === "string") {
		// Could be a URL to a file or plain text
		if (
			portType !== "text" &&
			(result.startsWith("http://") ||
				result.startsWith("https://") ||
				result.startsWith("blob:") ||
				result.startsWith("data:"))
		) {
			return {
				name: "output",
				url: result,
				mime: portType === "image" ? "image/png" : portType === "audio" ? "audio/wav" : "video/mp4"
			} satisfies FileValue;
		}
		return result;
	}
	// Gradio often returns objects with a `url` field
	if (typeof result === "object" && "url" in (result as Record<string, unknown>)) {
		const obj = result as Record<string, unknown>;
		return {
			name: (obj.orig_name as string) ?? (obj.path as string) ?? "output",
			url: obj.url as string,
			mime: (obj.mime_type as string) ?? "application/octet-stream"
		} satisfies FileValue;
	}
	// Fallback: stringify
	return String(result);
}

export async function executeWorkflow(
	workflow: Workflow,
	onStatus: StatusCallback,
	onOutput: OutputCallback,
	signal?: AbortSignal
): Promise<void> {
	const { nodes, edges } = workflow;
	const dataMap: DataMap = {};

	// Seed data from input nodes
	for (const node of nodes.filter((n) => n.kind === "input")) {
		dataMap[node.id] = { ...(node.data ?? {}) };
	}

	const sorted = topoSort(nodes, edges);

	for (const node of sorted) {
		if (signal?.aborted) break;

		if (node.kind === "input") {
			// Already seeded
			onStatus(node.id, "done");
			continue;
		}

		if (node.kind === "output") {
			// Resolve input from edges and write to output, and pass through to output port
			const inputs = resolveInputs(node, edges, dataMap);
			const inputPort = node.inputs[0];
			if (inputPort) {
				const value = inputs[inputPort.id];
				dataMap[node.id] = { [inputPort.id]: value };
				onOutput(node.id, inputPort.id, value);
				// Pass through to output port so this node can chain
				const outputPort = node.outputs[0];
				if (outputPort) {
					dataMap[node.id][outputPort.id] = value;
				}
			}
			onStatus(node.id, "done");
			continue;
		}

		// Transform node — call the Space API
		if (node.kind === "transform" && node.space_id) {
			onStatus(node.id, "running");

			try {
				const inputs = resolveInputs(node, edges, dataMap);
				const app = await Promise.race([
					Client.connect(node.space_id, {
						events: ["data", "status"]
					}),
					new Promise<never>((_, reject) =>
						setTimeout(() => reject(new Error("Timed out connecting to Space")), 15000)
					)
				]);

				// Build payload array from input ports
				const payload: unknown[] = await Promise.all(
					node.inputs.map((port) => toGradioInput(inputs[port.id]))
				);

				// Use stored endpoint, or discover it
				let endpointName = node.endpoint ?? "/predict";
				if (!node.endpoint) {
					try {
						const api = await app.view_api();
						const endpoints = Object.keys(api.named_endpoints ?? {});
						if (endpoints.length > 0 && !endpoints.includes("/predict")) {
							endpointName = endpoints[0];
						}
					} catch {
						// If view_api fails, try /predict anyway
					}
				}

				if (signal?.aborted) {
					onStatus(node.id, "error", "Cancelled");
					break;
				}

				const result = await app.predict(endpointName, payload);

				// Map outputs
				dataMap[node.id] = {};
				const outputData = Array.isArray(result.data) ? result.data : [result.data];
				node.outputs.forEach((port, i) => {
					const value = fromGradioOutput(
						outputData[i] ?? null,
						port.type
					);
					dataMap[node.id][port.id] = value;
					onOutput(node.id, port.id, value);
				});

				onStatus(node.id, "done");
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				onStatus(node.id, "error", msg);
				// Store null outputs so downstream nodes can still attempt
				dataMap[node.id] = {};
				node.outputs.forEach((port) => {
					dataMap[node.id][port.id] = null;
				});
			}
		}
	}
}
