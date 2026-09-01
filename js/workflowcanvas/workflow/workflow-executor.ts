import type {
	Workflow,
	WFNode,
	WFEdge,
	NodeDataValue,
	NodeStatus,
	FileValue,
	Port
} from "./workflow-types";
import { toLegacyShape } from "./workflow-migration";
import { topoSort } from "./workflow-graph";
import type { ChatContentPart } from "./inference-stream";

type StatusCallback = (
	nodeId: string,
	status: NodeStatus,
	error?: string,
	errorType?: string
) => void;
type OutputCallback = (
	nodeId: string,
	portId: string,
	value: NodeDataValue
) => void;
type ServerCallFn = (
	spaceId: string,
	endpoint: string,
	argsJson: string
) => Promise<string>;
type ServerCallModelFn = (
	modelId: string,
	pipelineTag: string,
	argsJson: string,
	provider?: string
) => Promise<string>;
type ServerFetchDatasetFn = (
	datasetId: string,
	config: string,
	split: string,
	offset: string,
	length: string
) => Promise<string>;
type ServerCallPyFn = (fnName: string, argsJson: string) => Promise<string>;
/**
 * Browser-side streaming for text-generation tasks. Returns the final
 * accumulated string. `onChunk` fires per delta so the executor can call
 * `onOutput` incrementally and the UI updates live as tokens arrive.
 */
type StreamTextFn = (
	modelId: string,
	content: string | ChatContentPart[],
	provider: string | undefined,
	signal: AbortSignal | undefined,
	onChunk: (delta: string, accumulated: string) => void,
	params?: Record<string, string | number>
) => Promise<string>;

async function toDataUrl(url: string): Promise<string> {
	if (/^data:/.test(url)) return url;
	if (/^https?:\/\//.test(url)) {
		try {
			if (new URL(url).origin !== location.origin) return url;
		} catch {
			return url;
		}
	}
	const blob = await (await fetch(url)).blob();
	return await new Promise<string>((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(r.result as string);
		r.onerror = () => reject(r.error);
		r.readAsDataURL(blob);
	});
}

async function buildChatBody(
	ports: Port[],
	args: unknown[]
): Promise<{
	content: string | ChatContentPart[];
	params: Record<string, string | number>;
}> {
	const parts: ChatContentPart[] = [];
	const params: Record<string, string | number> = {};
	for (let i = 0; i < ports.length; i++) {
		const port = ports[i];
		const arg = args[i];
		if (arg == null || arg === "") continue;
		if (port.custom) {
			if (typeof arg === "string" || typeof arg === "number") {
				params[port.id] = arg;
			}
			continue;
		}
		if (port.type === "image") {
			const url = (arg as { url?: string })?.url;
			if (url) {
				parts.push({
					type: "image_url",
					image_url: { url: await toDataUrl(url) }
				});
			}
		} else if (typeof arg === "string" || typeof arg === "number") {
			parts.push({ type: "text", text: String(arg) });
		}
	}
	const content =
		parts.length === 0
			? ""
			: parts.length === 1 && parts[0].type === "text"
				? parts[0].text
				: parts;
	return { content, params };
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
			resolved[port.id] =
				dataMap[edge.from_node_id]?.[edge.from_port_id] ?? null;
		} else {
			resolved[port.id] =
				node.data?.[port.id] ?? (port.default_value as NodeDataValue) ?? null;
		}
	}
	return resolved;
}

async function toGradioArg(value: NodeDataValue): Promise<unknown> {
	if (value === null) return null;
	if (typeof value === "string") return value;
	if (typeof value === "number") return value;
	if (typeof value === "boolean") return value;
	if (Array.isArray(value)) return value;
	const fileVal = value as FileValue;
	// Blob URLs need to be uploaded to our Gradio server first
	if (fileVal.url.startsWith("blob:") || fileVal.url.startsWith("data:")) {
		try {
			const response = await fetch(fileVal.url);
			if (!response.ok)
				throw new Error(`Blob fetch failed: ${response.status}`);
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
			throw new Error(
				`Failed to upload file: ${err instanceof Error ? err.message : err}`
			);
		}
	}
	// Remote URLs can be passed directly
	return { url: fileVal.url };
}

const MEDIA_PORT_TYPES = new Set([
	"image",
	"audio",
	"video",
	"file",
	"gallery",
	"model3d"
]);

function output_matches_port_type(item: unknown, portType: string): boolean {
	if (item === null || item === undefined) return false;
	if (MEDIA_PORT_TYPES.has(portType)) {
		if (typeof item === "string") {
			return /^(https?:|blob:|data:|\/)/.test(item);
		}
		return (
			typeof item === "object" &&
			("path" in (item as object) || "url" in (item as object))
		);
	}
	if (portType === "text" || portType === "html")
		return typeof item === "string";
	if (portType === "number") return typeof item === "number";
	if (portType === "boolean") return typeof item === "boolean";
	if (portType === "json")
		return typeof item === "object" || Array.isArray(item);
	return true;
}

function pick_response_item(
	port: { type: string; output_index?: number },
	port_index: number,
	output_data: unknown[],
	total_ports: number
): unknown {
	const primary =
		typeof port.output_index === "number"
			? output_data[port.output_index]
			: total_ports === 1 && output_data.length > 1
				? null
				: output_data[port_index];

	if (primary != null && output_matches_port_type(primary, port.type)) {
		return primary;
	}

	const shape_match = output_data.find((item) =>
		output_matches_port_type(item, port.type)
	);
	if (shape_match !== undefined) return shape_match;

	return primary ?? output_data[0] ?? null;
}

function fromGradioOutput(result: unknown, portType: string): NodeDataValue {
	if (result === null || result === undefined) return null;
	if (
		typeof result === "object" &&
		!Array.isArray(result) &&
		(result as Record<string, unknown>).__type__ === "update" &&
		"value" in (result as Record<string, unknown>)
	) {
		return fromGradioOutput(
			(result as Record<string, unknown>).value,
			portType
		);
	}
	if (Array.isArray(result)) {
		if (result.length === 0) return null;
		return fromGradioOutput(result[result.length - 1], portType);
	}
	if (typeof result === "number") return result;
	if (typeof result === "boolean") return result;
	if (typeof result === "string") {
		if (
			portType !== "text" &&
			portType !== "html" &&
			(result.startsWith("http://") ||
				result.startsWith("https://") ||
				result.startsWith("blob:") ||
				result.startsWith("data:"))
		) {
			return {
				name: "output",
				url: result,
				mime:
					portType === "image"
						? "image/png"
						: portType === "audio"
							? "audio/wav"
							: "video/mp4"
			} satisfies FileValue;
		}
		return result;
	}
	if (
		typeof result === "object" &&
		"url" in (result as Record<string, unknown>)
	) {
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
	serverCallSpace?: ServerCallFn,
	serverCallModel?: ServerCallModelFn,
	serverFetchDataset?: ServerFetchDatasetFn,
	serverCallFn?: ServerCallPyFn,
	stream_text_generation?: StreamTextFn
): Promise<void> {
	const { nodes, edges } = toLegacyShape(workflow);
	const dataMap: Record<string, Record<string, NodeDataValue>> = {};
	const failed_nodes = new Map<string, string>();

	function mark_node_failed(node: WFNode, err: unknown): void {
		const msg = err instanceof Error ? err.message : String(err);
		const errorType = (err as { errorType?: string })?.errorType;
		onStatus(node.id, "error", msg, errorType);
		failed_nodes.set(node.id, node.label);
		dataMap[node.id] = {};
		for (const port of node.outputs) dataMap[node.id][port.id] = null;
	}

	function missing_input_message(node: WFNode, port: Port): string {
		const edge = edges.find(
			(e) => e.to_node_id === node.id && e.to_port_id === port.id
		);
		if (edge) {
			const upstream = nodes.find((n) => n.id === edge.from_node_id);
			if (upstream && failed_nodes.has(upstream.id)) {
				return `"${port.label}" is missing — upstream node "${upstream.label}" failed`;
			}
		}
		return `"${port.label}" is missing — an upstream node may have failed`;
	}

	// Seed input nodes (including component nodes with no incoming edges)
	for (const node of nodes.filter((n) => {
		if (n.kind === "input") return true;
		if (n.kind === "component") {
			return !edges.some((e) => e.to_node_id === n.id);
		}
		return false;
	})) {
		dataMap[node.id] = { ...(node.data ?? {}) };
	}

	// Build layers for parallel execution
	const sorted = topoSort(nodes, edges);
	const layers: WFNode[][] = [];
	for (const node of sorted) {
		const depDepth = edges
			.filter((e) => e.to_node_id === node.id)
			.map((e) =>
				layers.findIndex((layer) => layer.some((n) => n.id === e.from_node_id))
			)
			.reduce((max, d) => Math.max(max, d), -1);
		const layerIdx = depDepth + 1;
		while (layers.length <= layerIdx) layers.push([]);
		layers[layerIdx].push(node);
	}

	async function executeNode(node: WFNode): Promise<void> {
		if (signal?.aborted) return;

		// Component nodes with no incoming edges act as inputs
		const isComponentInput =
			node.kind === "component" && !edges.some((e) => e.to_node_id === node.id);

		// Dataset operators take a single scalar "row_index" input. When wired,
		// upstream supplies the offset; when unwired the inline default (set at
		// picker time, edited on the node body) is used.
		if (node.source === "dataset" && node.dataset_id) {
			onStatus(node.id, "running");
			try {
				if (!serverFetchDataset)
					throw new Error("Dataset fetch function not available");
				const inputs = resolveInputs(node, edges, dataMap);
				const raw = inputs["row_index"] ?? 0;
				const n = typeof raw === "number" ? raw : Number(raw);
				const offset = Math.max(0, Math.trunc(Number.isFinite(n) ? n : 0));
				const resultJson = await serverFetchDataset(
					node.dataset_id,
					node.dataset_config ?? "default",
					node.dataset_split ?? "train",
					String(offset),
					"1"
				);
				const result = JSON.parse(resultJson);
				if (result.error) throw new Error(result.error);

				const row = result.rows?.[0] ?? {};
				dataMap[node.id] = {};
				for (const port of node.outputs) {
					const value = row[port.label] ?? null;
					// Convert image/audio objects to file values
					if (value && typeof value === "object" && "src" in value) {
						const fileVal = {
							name: port.label,
							url: value.src,
							mime: "application/octet-stream"
						};
						dataMap[node.id][port.id] = fileVal as NodeDataValue;
						onOutput(node.id, port.id, fileVal as NodeDataValue);
					} else {
						dataMap[node.id][port.id] = value as NodeDataValue;
						onOutput(node.id, port.id, value as NodeDataValue);
					}
				}
				onStatus(node.id, "done");
			} catch (err) {
				mark_node_failed(node, err);
			}
			return;
		}

		if (node.kind === "input" || isComponentInput) {
			onStatus(node.id, "done");
			return;
		}

		// Component nodes with incoming edges act as outputs
		const isComponentOutput =
			node.kind === "component" && edges.some((e) => e.to_node_id === node.id);
		if (node.kind === "output" || isComponentOutput) {
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

		// Python function nodes (FnNode) call back to the Python server
		if (node.source === "fn" && node.fn) {
			onStatus(node.id, "running");
			try {
				if (!serverCallFn)
					throw new Error("Python function call not available");
				const inputs = resolveInputs(node, edges, dataMap);
				for (const port of node.inputs) {
					if (port.required && inputs[port.id] === null) {
						throw new Error(missing_input_message(node, port));
					}
				}
				const args = await Promise.all(
					node.inputs.map((port) =>
						MEDIA_PORT_TYPES.has(port.type)
							? toGradioArg(inputs[port.id])
							: inputs[port.id]
					)
				);
				const resultJson = await serverCallFn(node.fn, JSON.stringify(args));
				const resultData = JSON.parse(resultJson);
				if (
					resultData &&
					typeof resultData === "object" &&
					"error" in resultData
				) {
					throw new Error(resultData.error);
				}
				dataMap[node.id] = {};
				const outputData = Array.isArray(resultData)
					? resultData
					: [resultData];
				node.outputs.forEach((port, i) => {
					const value = fromGradioOutput(outputData[i] ?? null, port.type);
					dataMap[node.id][port.id] = value;
					onOutput(node.id, port.id, value);
				});
				onStatus(node.id, "done");
			} catch (err) {
				mark_node_failed(node, err);
			}
			return;
		}

		if (node.kind === "transform" && (node.space_id || node.model_id)) {
			onStatus(node.id, "running");

			try {
				const inputs = resolveInputs(node, edges, dataMap);
				for (const port of node.inputs) {
					if (port.required && inputs[port.id] === null) {
						throw new Error(missing_input_message(node, port));
					}
				}
				const args = await Promise.all(
					node.inputs.map((port) => toGradioArg(inputs[port.id]))
				);

				let resultJson: string;

				if (node.source === "model" && node.model_id) {
					if (!serverCallModel) {
						throw new Error("Model call function not available");
					}
					// Custom-port values need names — pack as a keyed dict so
					// the backend's dict-args branch can pass them as kwargs.
					const hasCustomPorts = node.inputs.some((p) => p.custom);
					const modelArgs = hasCustomPorts
						? (Object.fromEntries(
								node.inputs.map((port, i) => [port.id, args[i]])
							) as unknown)
						: args;
					const tag = node.pipeline_tag ?? "text-generation";
					const streamable =
						(tag === "text-generation" ||
							tag === "text2text-generation" ||
							tag === "conversational" ||
							tag === "image-text-to-text") &&
						!!stream_text_generation;
					if (streamable) {
						const { content, params } = await buildChatBody(
							node.inputs,
							args
						);
						const outputPort = node.outputs[0];
						const downstream = outputPort
							? edges.filter(
									(e) =>
										e.from_node_id === node.id &&
										e.from_port_id === outputPort.id
								)
							: [];
						const final = await stream_text_generation!(
							node.model_id,
							content,
							node.provider,
							signal,
							(_delta, accumulated) => {
								if (!outputPort) return;
								onOutput(node.id, outputPort.id, accumulated);
								for (const e of downstream) {
									onOutput(e.to_node_id, e.to_port_id, accumulated);
								}
							},
							params
						);
						resultJson = JSON.stringify([final]);
					} else {
						resultJson = await Promise.race([
							serverCallModel(
								node.model_id,
								tag,
								JSON.stringify(modelArgs),
								node.provider
							),
							new Promise<never>((_, reject) =>
								setTimeout(
									() =>
										reject(
											new Error("Request timed out — model may be loading")
										),
									300000
								)
							)
						]);
					}
				} else {
					const endpointName = node.endpoint ?? "/predict";
					if (!serverCallSpace) {
						throw new Error("Server call function not available");
					}
					resultJson = await Promise.race([
						serverCallSpace(node.space_id!, endpointName, JSON.stringify(args)),
						new Promise<never>((_, reject) =>
							setTimeout(
								() =>
									reject(
										new Error("Request timed out — Space may be overloaded")
									),
								300000
							)
						)
					]);
				}

				const resultData = JSON.parse(resultJson);

				// Check for structured error from Python
				if (
					resultData &&
					typeof resultData === "object" &&
					"error" in resultData
				) {
					const suggestion = resultData.suggestion;
					const errorType = resultData.error_type;
					const title = resultData.title;
					const rawMsg = title
						? `${title}: ${resultData.error}`
						: resultData.error;
					const msg = suggestion || rawMsg;
					const err = new Error(msg);
					(err as any).errorType = errorType;
					throw err;
				}

				dataMap[node.id] = {};
				const outputData = Array.isArray(resultData)
					? resultData
					: [resultData];
				node.outputs.forEach((port, i) => {
					const raw = pick_response_item(
						port,
						i,
						outputData,
						node.outputs.length
					);
					const value = fromGradioOutput(raw, port.type);
					dataMap[node.id][port.id] = value;
					onOutput(node.id, port.id, value);
				});

				onStatus(node.id, "done");
			} catch (err) {
				mark_node_failed(node, err);
			}
		}
	}

	// Execute layers in parallel
	for (const layer of layers) {
		if (signal?.aborted) break;
		await Promise.all(layer.map(executeNode));
	}
}
