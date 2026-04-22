import type {
	Workflow,
	WFNode,
	WFEdge,
	NodeDataValue,
	NodeStatus,
	FileValue
} from "./workflow-types";

function spaceBaseUrl(spaceId: string): string {
	if (spaceId.startsWith("http")) return spaceId;
	return `https://${spaceId.replace("/", "-").toLowerCase()}.hf.space`;
}

// Simple fetch-based Space API caller (avoids @gradio/client resolving to localhost)
async function callSpaceApi(
	spaceId: string,
	endpoint: string,
	data: unknown[]
): Promise<{ data: unknown[] }> {
	const base = spaceBaseUrl(spaceId);

	// First, upload any Blob/File args and wrap as FileData objects
	const processedData = await Promise.all(
		data.map(async (arg) => {
			if (arg instanceof Blob) {
				const formData = new FormData();
				formData.append("files", arg);
				const uploadRes = await fetch(`${base}/gradio_api/upload`, { method: "POST", body: formData });
				if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
				const files = await uploadRes.json();
				// Wrap as FileData object — the API expects {path: ...} not a bare string
				const filePath = files[0];
				return { path: filePath };
			}
			return arg;
		})
	);

	const res = await fetch(`${base}/gradio_api/call${endpoint}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ data: processedData })
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`Space API error ${res.status}: ${errText}`);
	}

	const { event_id } = await res.json();

	// Poll for results via SSE
	const statusRes = await fetch(`${base}/gradio_api/call${endpoint}/${event_id}`);
	if (!statusRes.ok) throw new Error(`Status check failed: ${statusRes.status}`);

	const text = await statusRes.text();
	// Parse SSE response — events come as "event: type\ndata: json\n\n"
	const events = text.split("\n\n").filter(Boolean);
	for (const event of events) {
		const lines = event.split("\n");
		let eventType = "";
		let eventData = "";
		for (const line of lines) {
			if (line.startsWith("event: ")) eventType = line.slice(7).trim();
			if (line.startsWith("data: ")) eventData = line.slice(6);
		}
		if (eventType === "error") {
			let errorMsg = "Space returned an error";
			if (eventData && eventData !== "null") {
				try {
					const errObj = JSON.parse(eventData);
					errorMsg = typeof errObj === "string" ? errObj : errObj?.message || errObj?.error || JSON.stringify(errObj);
				} catch {
					errorMsg = eventData;
				}
			} else {
				errorMsg = "Space error — may be ZeroGPU quota exceeded or Space is sleeping. Try again later.";
			}
			throw new Error(errorMsg);
		}
		if (eventType === "complete" && eventData) {
			try {
				const parsed = JSON.parse(eventData);
				if (Array.isArray(parsed)) return { data: parsed };
				if (parsed && parsed.data) return { data: parsed.data };
			} catch {
				throw new Error(`Failed to parse result: ${eventData}`);
			}
		}
	}
	throw new Error("No data received from Space");
}

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
	// FileValue — handle differently based on URL type
	if (value.url.startsWith("blob:") || value.url.startsWith("data:")) {
		// Local file — fetch into a Blob
		const response = await fetch(value.url);
		return await response.blob();
	}
	// Remote URL (from a previous Space output) — pass as FileData
	return { url: value.url };
}

function fromGradioOutput(result: unknown, portType: string): NodeDataValue {
	if (result === null || result === undefined) return null;
	// Unwrap arrays (e.g. ImageSlider returns [before, after] — take the last/processed one)
	if (Array.isArray(result)) {
		if (result.length === 0) return null;
		// Take the last element (usually the processed output)
		return fromGradioOutput(result[result.length - 1], portType);
	}
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

	// Group nodes into layers by dependency depth for parallel execution
	const sorted = topoSort(nodes, edges);
	const layers: WFNode[][] = [];

	// Build layers: a node goes in the earliest layer where all its deps are done
	for (const node of sorted) {
		const depDepth = edges
			.filter((e) => e.to_node_id === node.id)
			.map((e) => layers.findIndex((layer) => layer.some((n) => n.id === e.from_node_id)))
			.reduce((max, d) => Math.max(max, d), -1);
		const layerIdx = depDepth + 1;
		while (layers.length <= layerIdx) layers.push([]);
		layers[layerIdx].push(node);
	}

	async function executeNode(node: WFNode): Promise<void> {
		if (signal?.aborted) return;

		if (node.kind === "input") {
			onStatus(node.id, "done");
			return;
		}

		if (node.kind === "output") {
			const inputs = resolveInputs(node, edges, dataMap);
			const inputPort = node.inputs[0];
			if (inputPort) {
				const value = inputs[inputPort.id];
				dataMap[node.id] = { [inputPort.id]: value };
				onOutput(node.id, inputPort.id, value);
				const outputPort = node.outputs[0];
				if (outputPort) {
					dataMap[node.id][outputPort.id] = value;
				}
			}
			onStatus(node.id, "done");
			return;
		}

		if (node.kind === "transform" && node.space_id) {
			onStatus(node.id, "running");

			try {
				const inputs = resolveInputs(node, edges, dataMap);
				const payload: unknown[] = await Promise.all(
					node.inputs.map((port) => toGradioInput(inputs[port.id]))
				);

				const endpointName = node.endpoint ?? "/predict";
				console.log(`[Executor] Calling ${node.space_id} endpoint="${endpointName}" with ${payload.length} args via fetch`);

				if (signal?.aborted) {
					onStatus(node.id, "error", "Cancelled");
					return;
				}

				const result = await Promise.race([
					callSpaceApi(node.space_id, endpointName, payload),
					new Promise<never>((_, reject) =>
						setTimeout(() => reject(new Error("Request timed out — Space may be overloaded or quota exceeded")), 120000)
					)
				]);

				dataMap[node.id] = {};
				const outputData = Array.isArray(result.data) ? result.data : [result.data];
				node.outputs.forEach((port, i) => {
					const value = fromGradioOutput(outputData[i] ?? null, port.type);
					dataMap[node.id][port.id] = value;
					onOutput(node.id, port.id, value);
				});

				onStatus(node.id, "done");
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				onStatus(node.id, "error", msg);
				dataMap[node.id] = {};
				node.outputs.forEach((port) => {
					dataMap[node.id][port.id] = null;
				});
			}
		}
	}

	// Execute layers — nodes within a layer run in parallel
	for (const layer of layers) {
		if (signal?.aborted) break;
		await Promise.all(layer.map(executeNode));
	}
}
