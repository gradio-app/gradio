import type {
	Workflow,
	WFNode,
	WFEdge,
	NodeDataValue,
	NodeStatus,
	FileValue
} from "./workflow-types";

type StatusCallback = (nodeId: string, status: NodeStatus, error?: string, errorType?: string) => void;
type OutputCallback = (nodeId: string, portId: string, value: NodeDataValue) => void;
type ServerCallFn = (spaceId: string, endpoint: string, argsJson: string) => Promise<string>;

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
	dataMap: Record<string, Record<string, NodeDataValue>>
): Record<string, NodeDataValue> {
	const resolved: Record<string, NodeDataValue> = {};
	for (const port of node.inputs) {
		const edge = edges.find(
			(e) => e.to_node_id === node.id && e.to_port_id === port.id
		);
		if (edge) {
			resolved[port.id] = dataMap[edge.from_node_id]?.[edge.from_port_id] ?? null;
		} else {
			resolved[port.id] = node.data?.[port.id]
				?? (port.default_value as NodeDataValue)
				?? null;
		}
	}
	return resolved;
}

async function toGradioArg(value: NodeDataValue): Promise<unknown> {
	if (value === null) return null;
	if (typeof value === "string") return value;
	if (typeof value === "number") return value;
	if (typeof value === "boolean") return value;
	const fileVal = value as FileValue;
	// Blob URLs need to be uploaded to our Gradio server first
	if (fileVal.url.startsWith("blob:") || fileVal.url.startsWith("data:")) {
		try {
			const response = await fetch(fileVal.url);
			if (!response.ok) throw new Error(`Blob fetch failed: ${response.status}`);
			const blob = await response.blob();
			const formData = new FormData();
			formData.append("files", blob, fileVal.name || "file");
			// Try /gradio_api/upload first, then /upload
			for (const path of ["/gradio_api/upload", "/upload"]) {
				const uploadRes = await fetch(path, { method: "POST", body: formData });
				if (uploadRes.ok) {
					const files = await uploadRes.json();
					return { path: files[0], url: files[0] };
				}
			}
			throw new Error("Upload failed");
		} catch (err) {
			console.error("[Executor] File upload error:", err);
			throw new Error(`Failed to upload file: ${err instanceof Error ? err.message : err}`);
		}
	}
	// Remote URLs can be passed directly
	return { url: fileVal.url };
}

function fromGradioOutput(result: unknown, portType: string): NodeDataValue {
	if (result === null || result === undefined) return null;
	// Unwrap arrays (e.g. ImageSlider returns [before, after])
	if (Array.isArray(result)) {
		if (result.length === 0) return null;
		return fromGradioOutput(result[result.length - 1], portType);
	}
	if (typeof result === "number") return result;
	if (typeof result === "boolean") return result;
	if (typeof result === "string") {
		if (
			portType !== "text" &&
			(result.startsWith("http://") || result.startsWith("https://") || result.startsWith("blob:") || result.startsWith("data:"))
		) {
			return { name: "output", url: result, mime: portType === "image" ? "image/png" : portType === "audio" ? "audio/wav" : "video/mp4" } satisfies FileValue;
		}
		return result;
	}
	if (typeof result === "object" && "url" in (result as Record<string, unknown>)) {
		const obj = result as Record<string, unknown>;
		return {
			name: (obj.orig_name as string) ?? "output",
			url: obj.url as string,
			mime: (obj.mime_type as string) ?? "application/octet-stream"
		} satisfies FileValue;
	}
	return String(result);
}

export async function executeWorkflow(
	workflow: Workflow,
	onStatus: StatusCallback,
	onOutput: OutputCallback,
	signal?: AbortSignal,
	serverCallSpace?: ServerCallFn
): Promise<void> {
	const { nodes, edges } = workflow;
	const dataMap: Record<string, Record<string, NodeDataValue>> = {};

	// Seed input nodes
	for (const node of nodes.filter((n) => n.kind === "input")) {
		dataMap[node.id] = { ...(node.data ?? {}) };
	}

	// Build layers for parallel execution
	const sorted = topoSort(nodes, edges);
	const layers: WFNode[][] = [];
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
				const args = await Promise.all(node.inputs.map((port) => toGradioArg(inputs[port.id])));
				const endpointName = node.endpoint ?? "/predict";

				console.log(`[Executor] Calling ${node.space_id} endpoint="${endpointName}" inputs:`, JSON.stringify(inputs), `args:`, JSON.stringify(args), `node.data:`, JSON.stringify(node.data));

				if (!serverCallSpace) {
					throw new Error("Server call function not available");
				}

				const resultJson = await Promise.race([
					serverCallSpace(node.space_id, endpointName, JSON.stringify(args)),
					new Promise<never>((_, reject) =>
						setTimeout(() => reject(new Error("Request timed out — Space may be overloaded")), 300000)
					)
				]);

				const resultData = JSON.parse(resultJson);

				// Check for structured error from Python
				if (resultData && typeof resultData === "object" && "error" in resultData) {
					const title = resultData.title;
					const suggestion = resultData.suggestion;
					const errorType = resultData.error_type;
					let msg = title ? `${title}: ${resultData.error}` : resultData.error;
					if (suggestion) msg += ` — ${suggestion}`;
					const err = new Error(msg);
					(err as any).errorType = errorType;
					throw err;
				}

				dataMap[node.id] = {};
				const outputData = Array.isArray(resultData) ? resultData : [resultData];
				node.outputs.forEach((port, i) => {
					const value = fromGradioOutput(outputData[i] ?? null, port.type);
					dataMap[node.id][port.id] = value;
					onOutput(node.id, port.id, value);
				});

				onStatus(node.id, "done");
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				const errorType = (err as any)?.errorType;
				onStatus(node.id, "error", msg, errorType);
				dataMap[node.id] = {};
				node.outputs.forEach((port) => {
					dataMap[node.id][port.id] = null;
				});
			}
		}
	}

	// Execute layers in parallel
	for (const layer of layers) {
		if (signal?.aborted) break;
		await Promise.all(layer.map(executeNode));
	}
}
