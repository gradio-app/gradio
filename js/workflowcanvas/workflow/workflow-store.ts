import { writable } from "svelte/store";
import type {
	AnyNode,
	NodeData,
	NodeDataValue,
	NodeRole,
	OperatorKind,
	OperatorNode,
	Port,
	PortType,
	ReferenceNode,
	SubjectNode,
	WFEdge,
	Workflow
} from "./workflow-types";
import { ports_compatible } from "./workflow-types";
import { allNodes, findNode, isV2, migrateToV2 } from "./workflow-migration";

function uuid(): string {
	return crypto.randomUUID();
}

const DEFAULT: Workflow = {
	schema_version: "2",
	name: "My workflow",
	runtime: { default: "client" },
	references: [
		{
			id: "ref_default",
			role: "reference",
			label: "Image",
			asset_type: "image",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			data: {},
			x: 80,
			y: 120,
			width: 200,
			height: 160
		}
	],
	operators: [],
	subjects: [],
	edges: [],
	view: { default: "canvas" }
};

// The canonical store of truth for the workflow body is the Python-side
// `workflow.json` (server function `save_workflow` writes; `initialValue`
// reads). The frontend store seeds with DEFAULT and is overwritten on mount
// by the file's contents — see `WorkflowCanvas.svelte` `$effect` reading
// `initialValue`. No localStorage persistence for the workflow body;
// `hf_token` and other auth bits persist separately in `hf-auth.svelte.ts`.
export const workflow = writable<Workflow>(DEFAULT);

// Re-export read helpers so callers import them from one place
export { allNodes, findNode, isV2, migrateToV2 };

/**
 * Strip session-bound media (blob: / data: URLs) from node data before
 * serialising the workflow. blob: URLs die with the page that minted
 * them, and data: URLs would bloat workflow.json with base64 payloads —
 * so we drop the field entirely and let the user re-upload on refresh.
 * Other data (text, numbers, server-served file paths) passes through.
 * Endpoint catalogs are also session metadata: the canvas hydrates them from
 * the backend, so persisting them would duplicate every supported task into
 * every operator node.
 */
function is_session_url(v: unknown): boolean {
	const url = (v as { url?: string } | null)?.url;
	return (
		typeof url === "string" &&
		(url.startsWith("blob:") || url.startsWith("data:"))
	);
}

export function revoke_blob_urls(
	data: Record<string, unknown> | undefined
): void {
	for (const v of Object.values(data ?? {})) {
		const url = (v as { url?: string } | null)?.url;
		if (typeof url === "string" && url.startsWith("blob:")) {
			URL.revokeObjectURL(url);
		}
	}
}

export function sanitize_for_save(wf: Workflow): Workflow {
	return mapAllRoles(wf, (n) => {
		const cleaned: NodeData = {};
		for (const [k, v] of Object.entries(n.data ?? {})) {
			if (!is_session_url(v)) cleaned[k] = v as NodeDataValue;
		}
		if (n.role === "operator") {
			const { endpoints: _endpoints, ...persisted } = n;
			return { ...persisted, data: cleaned };
		}
		return { ...n, data: cleaned };
	});
}

// ─── Actions ────────────────────────────────────────────────────────────────
const PORT_DEFAULTS: Partial<Record<PortType, NodeDataValue>> = {
	boolean: false,
	number: 0,
	text: ""
};

function addReference(
	template: Omit<ReferenceNode, "id" | "role" | "x" | "y" | "data">,
	x: number,
	y: number
): string {
	const id = uuid();
	const data: Record<string, NodeDataValue> = {};
	for (const port of [...template.inputs, ...template.outputs]) {
		if (port.default_value !== undefined) {
			data[port.id] = port.default_value as NodeDataValue;
		} else if (port.type in PORT_DEFAULTS) {
			data[port.id] ??= PORT_DEFAULTS[port.type]!;
		}
	}
	const node: ReferenceNode = {
		...template,
		role: "reference",
		id,
		x,
		y,
		data
	};
	workflow.update((wf) => ({ ...wf, references: [...wf.references, node] }));
	return id;
}

export function addOperator(
	template: Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
	x: number,
	y: number
): string {
	const id = uuid();
	const data: Record<string, NodeDataValue> = {};
	for (const port of template.inputs) {
		if (port.default_value !== undefined) {
			data[port.id] = port.default_value as NodeDataValue;
		}
	}
	const node: OperatorNode = { ...template, role: "operator", id, x, y, data };
	workflow.update((wf) => ({ ...wf, operators: [...wf.operators, node] }));
	return id;
}

function addSubject(
	template: Omit<SubjectNode, "id" | "role" | "x" | "y" | "data">,
	x: number,
	y: number
): string {
	const id = uuid();
	const node: SubjectNode = {
		...template,
		role: "subject",
		id,
		x,
		y,
		data: {}
	};
	workflow.update((wf) => ({ ...wf, subjects: [...wf.subjects, node] }));
	return id;
}

/**
 * Single entry point for adding a node. Accepts both v2-shaped templates and
 * legacy v1-shaped ones (which still come from `node-library.ts` and the
 * picker) and normalizes missing role-specific fields. Picks the matching
 * array based on `role`.
 */
export function addNode(
	role: NodeRole,
	template: any,
	x: number,
	y: number
): string {
	const baseFields = {
		label: template.label ?? "",
		inputs: template.inputs ?? [],
		outputs: template.outputs ?? [],
		width: template.width ?? 200,
		height: template.height ?? 100
	};

	if (role === "reference") {
		const asset_type: PortType =
			template.asset_type ??
			template.outputs?.[0]?.type ??
			template.inputs?.[0]?.type ??
			"any";
		return addReference({ ...baseFields, asset_type }, x, y);
	}

	if (role === "operator") {
		// v1 templates carry `kind: "transform"` + `source: "space" | "model" | ...`
		// v2 templates carry `kind: OperatorKind` directly. Normalize.
		const opKind: OperatorKind =
			template.source === "space" ||
			template.source === "model" ||
			template.source === "dataset" ||
			template.source === "fn"
				? template.source
				: template.kind === "space" ||
					  template.kind === "model" ||
					  template.kind === "dataset" ||
					  template.kind === "fn"
					? template.kind
					: template.space_id
						? "space"
						: template.model_id
							? "model"
							: template.dataset_id
								? "dataset"
								: "fn";
		return addOperator(
			{
				...baseFields,
				kind: opKind,
				source:
					template.source &&
					typeof template.source === "string" &&
					template.source.startsWith("hf://")
						? template.source
						: undefined,
				space_id: template.space_id,
				model_id: template.model_id,
				dataset_id: template.dataset_id,
				dataset_config: template.dataset_config,
				dataset_split: template.dataset_split,
				endpoint: template.endpoint,
				endpoints: template.endpoints,
				pipeline_tag: template.pipeline_tag,
				provider: template.provider,
				fn: template.fn,
				runtime: template.runtime
			},
			x,
			y
		);
	}

	// subject
	const asset_type: PortType =
		template.asset_type ??
		template.inputs?.[0]?.type ??
		template.outputs?.[0]?.type ??
		"any";
	return addSubject({ ...baseFields, asset_type }, x, y);
}

function mapAllRoles(wf: Workflow, fn: (node: AnyNode) => AnyNode): Workflow {
	return {
		...wf,
		references: wf.references.map((n) => fn(n) as ReferenceNode),
		operators: wf.operators.map((n) => fn(n) as OperatorNode),
		subjects: wf.subjects.map((n) => fn(n) as SubjectNode)
	};
}

export function moveNode(id: string, x: number, y: number): void {
	workflow.update((wf) =>
		mapAllRoles(wf, (n) => (n.id === id ? { ...n, x, y } : n))
	);
}

export function resizeNode(id: string, width: number, height: number): void {
	workflow.update((wf) =>
		mapAllRoles(wf, (n) => (n.id === id ? { ...n, width, height } : n))
	);
}

export function updateNodeData(
	nodeId: string,
	portId: string,
	value: NodeDataValue
): void {
	workflow.update((wf) =>
		mapAllRoles(wf, (n) =>
			n.id === nodeId ? { ...n, data: { ...n.data, [portId]: value } } : n
		)
	);
}

export function removeNode(id: string): void {
	workflow.update((wf) => {
		const node = findNode(wf, id);
		if (node) revoke_blob_urls(node.data);
		return {
			...wf,
			references: wf.references.filter((n) => n.id !== id),
			operators: wf.operators.filter((n) => n.id !== id),
			subjects: wf.subjects.filter((n) => n.id !== id),
			edges: wf.edges.filter(
				(e) => e.from_node_id !== id && e.to_node_id !== id
			)
		};
	});
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

export function hydrate_endpoints(
	nodeId: string,
	endpoints: { name: string; inputs: Port[]; outputs: Port[] }[]
): void {
	workflow.update((wf) => ({
		...wf,
		operators: wf.operators.map((n) =>
			n.id === nodeId ? { ...n, endpoints } : n
		)
	}));
}

export function init_model_node_ports(
	schemas: { name: string; inputs: Port[]; outputs: Port[] }[],
	pipelineTagMap: Record<string, string> = {}
): void {
	workflow.update((wf) => ({
		...wf,
		operators: wf.operators.map((n) => {
			if (n.kind !== "model") return n;
			const endpointName = n.endpoint ?? pipelineTagMap[n.pipeline_tag ?? ""];
			if (!endpointName) return n;
			const sig = schemas.find((s) => s.name === endpointName);
			if (!sig) return { ...n, endpoints: schemas };
			return {
				...n,
				endpoint: endpointName,
				endpoints: schemas,
				inputs: sig.inputs,
				outputs: sig.outputs
			};
		})
	}));
}

export function switch_endpoint(nodeId: string, endpointName: string): void {
	workflow.update((wf) => {
		const node = wf.operators.find((n) => n.id === nodeId);
		if (!node || !node.endpoints) return wf;
		const sig = node.endpoints.find((e) => e.name === endpointName);
		if (!sig || sig.name === node.endpoint) return wf;

		const input_by_id = new Map(sig.inputs.map((p) => [p.id, p]));
		const output_by_id = new Map(sig.outputs.map((p) => [p.id, p]));

		return {
			...wf,
			operators: wf.operators.map((n) =>
				n.id === nodeId
					? {
							...n,
							endpoint: sig.name,
							inputs: sig.inputs,
							outputs: sig.outputs,
							data: {}
						}
					: n
			),
			edges: wf.edges.filter((e) => {
				if (e.from_node_id === nodeId) {
					const new_port = output_by_id.get(e.from_port_id);
					if (!new_port) return false;
					if (!ports_compatible(new_port.type, e.type)) return false;
				}
				if (e.to_node_id === nodeId) {
					const new_port = input_by_id.get(e.to_port_id);
					if (!new_port) return false;
					if (!ports_compatible(new_port.type, e.type)) return false;
				}
				return true;
			})
		};
	});
}

/**
 * Replace an operator's source identity (Space → different Space, Space → Model,
 * etc.). Clears all source-specific fields before applying the new template so
 * stale ids can't linger.
 */
export function replaceNodeSource(
	nodeId: string,
	template: {
		label?: string;
		kind?: OperatorKind;
		source?: string;
		space_id?: string;
		model_id?: string;
		dataset_id?: string;
		dataset_config?: string;
		dataset_split?: string;
		endpoint?: string;
		pipeline_tag?: string;
		inputs: Port[];
		outputs: Port[];
		width?: number;
	}
): void {
	workflow.update((wf) => ({
		...wf,
		operators: wf.operators.map((n) => {
			if (n.id !== nodeId) return n;
			const stripped = { ...n } as OperatorNode;
			delete stripped.space_id;
			delete stripped.model_id;
			delete stripped.dataset_id;
			delete stripped.dataset_config;
			delete stripped.dataset_split;
			delete stripped.endpoint;
			delete stripped.pipeline_tag;
			delete stripped.source;
			return {
				...stripped,
				...(template.kind && { kind: template.kind }),
				...(template.source !== undefined && { source: template.source }),
				...(template.space_id !== undefined && { space_id: template.space_id }),
				...(template.model_id !== undefined && { model_id: template.model_id }),
				...(template.dataset_id !== undefined && {
					dataset_id: template.dataset_id
				}),
				...(template.dataset_config !== undefined && {
					dataset_config: template.dataset_config
				}),
				...(template.dataset_split !== undefined && {
					dataset_split: template.dataset_split
				}),
				...(template.endpoint !== undefined && { endpoint: template.endpoint }),
				...(template.pipeline_tag !== undefined && {
					pipeline_tag: template.pipeline_tag
				}),
				inputs: template.inputs,
				outputs: template.outputs,
				label: template.label ?? n.label,
				width: template.width ?? n.width,
				data: {}
			};
		})
	}));
}
