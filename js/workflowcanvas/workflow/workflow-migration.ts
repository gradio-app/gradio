/**
 * Schema v1 → v2 migration.
 *
 * v1 stored a flat `nodes` array tagged with `kind: "component" | "transform" | …`.
 * v2 splits that into three role-collections (references / operators / subjects)
 * so the data model expresses authoring intent, not just data flow. The graph
 * topology is preserved exactly — edges still reference node ids — but the role
 * tag drives studio-view rendering and lets future tooling reason about a
 * workflow without re-deriving roles from edge topology every time.
 *
 * The migration is purposely conservative: when in doubt, prefer the role that
 * keeps existing behavior (e.g. transforms always become operators, components
 * become references unless they have incoming edges, in which case they're
 * subjects).
 */

import type {
	AnyNode,
	OperatorKind,
	OperatorNode,
	PortType,
	ReferenceNode,
	SubjectNode,
	WFEdge,
	WFNode,
	Workflow,
	WorkflowV1
} from "./workflow-types";

export function isV2(wf: unknown): wf is Workflow {
	if (!wf || typeof wf !== "object") return false;
	const w = wf as Record<string, unknown>;
	return (
		w.schema_version === "2" &&
		Array.isArray(w.references) &&
		Array.isArray(w.operators) &&
		Array.isArray(w.subjects) &&
		Array.isArray(w.edges)
	);
}

function serializedNodes(raw: unknown): Record<string, unknown>[] {
	if (!raw || typeof raw !== "object") return [];
	const workflow = raw as Record<string, unknown>;
	const collections = Array.isArray(workflow.nodes)
		? [workflow.nodes]
		: [workflow.references, workflow.operators, workflow.subjects];
	return collections
		.filter(Array.isArray)
		.flat()
		.filter((node): node is Record<string, unknown> => {
			return !!node && typeof node === "object";
		});
}

export function hasMissingNodeGeometry(raw: unknown): boolean {
	return serializedNodes(raw).some((node) =>
		["x", "y", "width", "height"].some(
			(key) => typeof node[key] !== "number" || !Number.isFinite(node[key])
		)
	);
}

function normalizeNodeGeometry<T extends AnyNode>(node: T): T {
	return {
		...node,
		data: node.data ?? {},
		x: Number.isFinite(node.x) ? node.x : 0,
		y: Number.isFinite(node.y) ? node.y : 0,
		width: Number.isFinite(node.width) ? node.width : 200,
		height: Number.isFinite(node.height) ? node.height : 100
	};
}

export function migrateToV2(raw: unknown): Workflow {
	if (isV2(raw)) {
		return {
			...raw,
			references: raw.references.map(normalizeNodeGeometry),
			operators: raw.operators.map(normalizeNodeGeometry),
			subjects: raw.subjects.map(normalizeNodeGeometry)
		};
	}

	const legacy = (raw ?? {}) as WorkflowV1;
	const legacyNodes: WFNode[] = Array.isArray(legacy.nodes) ? legacy.nodes : [];
	const edges: WFEdge[] = Array.isArray(legacy.edges) ? legacy.edges : [];

	// Nodes with at least one incoming edge are "consumers" — when promoted from
	// a v1 component, those become subjects (output tiles); otherwise references.
	const hasIncoming = new Set<string>();
	for (const e of edges) hasIncoming.add(e.to_node_id);

	const references: ReferenceNode[] = [];
	const operators: OperatorNode[] = [];
	const subjects: SubjectNode[] = [];

	for (const n of legacyNodes) {
		const base = {
			id: n.id,
			label: n.label ?? "",
			inputs: n.inputs ?? [],
			outputs: n.outputs ?? [],
			data: n.data ?? {},
			x: n.x ?? 0,
			y: n.y ?? 0,
			width: n.width ?? 200,
			height: n.height ?? 100
		};

		if (n.kind === "transform") {
			const kind = inferOperatorKind(n);
			operators.push({
				...base,
				role: "operator",
				kind,
				source: deriveSourceUri(n, kind),
				space_id: n.space_id,
				model_id: n.model_id,
				dataset_id: n.dataset_id,
				dataset_config: n.dataset_config,
				dataset_split: n.dataset_split,
				endpoint: n.endpoint,
				pipeline_tag: n.pipeline_tag,
				provider: n.provider,
				fn: n.fn,
				runtime: "client"
			});
			continue;
		}

		// Everything else (component / input / output / unknown) maps to either
		// reference or subject based on edge topology.
		const assetType: PortType = (n.outputs?.[0]?.type ??
			n.inputs?.[0]?.type ??
			"any") as PortType;

		if (hasIncoming.has(n.id)) {
			subjects.push({ ...base, role: "subject", asset_type: assetType });
		} else {
			references.push({ ...base, role: "reference", asset_type: assetType });
		}
	}

	return {
		schema_version: "2",
		name: legacy.name ?? "My workflow",
		runtime: { default: "client" },
		references,
		operators,
		subjects,
		edges,
		view: { default: "canvas" }
	};
}

function inferOperatorKind(n: WFNode): OperatorKind {
	if (n.space_id || n.source === "space") return "space";
	if (n.model_id || n.source === "model") return "model";
	if (n.dataset_id || n.source === "dataset") return "dataset";
	return "fn";
}

function deriveSourceUri(n: WFNode, kind: OperatorKind): string | undefined {
	if (kind === "space" && n.space_id) return `hf://spaces/${n.space_id}`;
	if (kind === "model" && n.model_id) return `hf://${n.model_id}`;
	if (kind === "dataset" && n.dataset_id)
		return `hf://datasets/${n.dataset_id}`;
	if (kind === "fn") return n.fn ?? undefined;
	return undefined;
}

// ─── Read helpers — keep store consumers from caring about which array a node lives in ─

export function allNodes(wf: Workflow): AnyNode[] {
	return [...wf.references, ...wf.operators, ...wf.subjects];
}

export function findNode(wf: Workflow, id: string): AnyNode | undefined {
	return (
		wf.references.find((n) => n.id === id) ??
		wf.operators.find((n) => n.id === id) ??
		wf.subjects.find((n) => n.id === id)
	);
}

// ─── v2 → v1 adapter ────────────────────────────────────────────────────────
//
// The executor still reasons about v1 fields (`kind`, `source`, etc.). Rather
// than rewriting it in the same pass, we expose a one-way projection that
// reconstructs a v1-shaped node from a v2 node. Cheap, pure, deterministic.

/**
 * Project a v2 workflow into the legacy v1 shape that executor + any other
 * still-v1 consumers expect. The migration sets the source identifiers and
 * derives `kind` from role + edge topology so the v1 contract holds exactly.
 */
export function toLegacyShape(wf: Workflow): {
	version: "1";
	name: string;
	nodes: WFNode[];
	edges: WFEdge[];
} {
	const hasIncoming = new Set<string>();
	for (const e of wf.edges) hasIncoming.add(e.to_node_id);

	const nodes: WFNode[] = [];
	for (const n of wf.references) {
		nodes.push({
			id: n.id,
			kind: "component",
			label: n.label,
			source: "local",
			inputs: n.inputs,
			outputs: n.outputs,
			x: n.x,
			y: n.y,
			width: n.width,
			height: n.height,
			data: n.data
		});
	}
	for (const n of wf.operators) {
		nodes.push({
			id: n.id,
			kind: "transform",
			label: n.label,
			source: n.kind,
			space_id: n.space_id,
			model_id: n.model_id,
			dataset_id: n.dataset_id,
			dataset_config: n.dataset_config,
			dataset_split: n.dataset_split,
			endpoint: n.endpoint,
			endpoints: n.endpoints,
			pipeline_tag: n.pipeline_tag,
			provider: n.provider,
			fn: n.fn,
			inputs: n.inputs,
			outputs: n.outputs,
			x: n.x,
			y: n.y,
			width: n.width,
			height: n.height,
			data: n.data
		});
	}
	for (const n of wf.subjects) {
		nodes.push({
			id: n.id,
			kind: "component",
			label: n.label,
			source: "local",
			inputs: n.inputs,
			outputs: n.outputs,
			x: n.x,
			y: n.y,
			width: n.width,
			height: n.height,
			data: n.data
		});
	}
	return { version: "1", name: wf.name, nodes, edges: wf.edges };
}
