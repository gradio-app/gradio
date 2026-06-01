/**
 * Port types. The first nine are user-facing and have entries in
 * `PORT_REGISTRY` (workflow-modalities.ts). `file` and `any` are
 * inference-only fallbacks emitted by schema introspection when a more
 * specific type can't be determined — they are never offered as
 * reference / subject templates and should not appear in pickers.
 */
export type PortType =
	| "image"
	| "text"
	| "audio"
	| "video"
	| "number"
	| "boolean"
	| "file"
	| "json"
	| "gallery"
	| "model3d"
	| "any";

export interface Port {
	id: string;
	label: string;
	type: PortType;
	required?: boolean;
	default_value?: unknown;
}

export interface FileValue {
	name: string;
	url: string;
	mime: string;
}

export type NodeDataValue = string | number | boolean | FileValue | null;
export type NodeData = Record<string, NodeDataValue>;
export type NodeStatus = "idle" | "running" | "done" | "error";

export interface WFNode {
	id: string;
	kind: "input" | "transform" | "output" | "component";
	label: string;
	source: "local" | "space" | "model" | "dataset" | "fn";
	space_id?: string;
	model_id?: string;
	dataset_id?: string;
	dataset_config?: string;
	dataset_split?: string;
	pipeline_tag?: string;
	provider?: string;
	endpoint?: string;
	fn?: string;
	inputs: Port[];
	outputs: Port[];
	x: number;
	y: number;
	width: number;
	height: number;
	data: NodeData;
}

export interface WFEdge {
	id: string;
	from_node_id: string;
	from_port_id: string;
	to_node_id: string;
	to_port_id: string;
	type: PortType;
}

/**
 * Legacy v1 workflow shape. Stays here only to make the migration code
 * (workflow-migration.ts) type-checkable; the live store is v2.
 */
export interface WorkflowV1 {
	version?: "1";
	name?: string;
	nodes?: WFNode[];
	edges?: WFEdge[];
}

// ─── v2 schema ──────────────────────────────────────────────────────────────
//
// The graph is split into three role-collections at the JSON level:
//   references — inputs you bring in (uploaded files, prompts, literals)
//   operators  — transformations (spaces / models / datasets / Python fns)
//   subjects   — the things being created (typed output tiles)
//
// All three share BaseNode. The role tag drives visual presentation
// (studio view) and authoring intent; the data structure stays uniform
// enough that the executor and canvas can treat them as peer nodes.

export type NodeRole = "reference" | "operator" | "subject";

export type OperatorKind = "space" | "model" | "dataset" | "fn";

export type Runtime = "client" | "server" | "job";

export interface BaseNode {
	id: string;
	label: string;
	inputs: Port[];
	outputs: Port[];
	data: NodeData;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ReferenceNode extends BaseNode {
	role: "reference";
	asset_type: PortType;
	/** Inline literal value, or in a later iteration an `hf://...` URI. */
	value?: NodeDataValue;
}

export interface OperatorNode extends BaseNode {
	role: "operator";
	kind: OperatorKind;
	/** Canonical hub-native identifier when available (hf://...) or fn name. */
	source?: string;
	space_id?: string;
	model_id?: string;
	dataset_id?: string;
	dataset_config?: string;
	dataset_split?: string;
	endpoint?: string;
	pipeline_tag?: string;
	fn?: string;
	/** HF Inference provider override (e.g. "hf-inference", "together", "replicate"). Defaults to "auto" — let HF route. */
	provider?: string;
	/** Where this operator executes. Default inherited from workflow.runtime.default. */
	runtime?: Runtime;
}

export interface SubjectNode extends BaseNode {
	role: "subject";
	asset_type: PortType;
}

export type AnyNode = ReferenceNode | OperatorNode | SubjectNode;

export interface Workflow {
	schema_version: "2";
	/** Optional hub repo identifier, e.g. "username/my-workflow". */
	id?: string;
	name: string;
	description?: string;
	/** Lineage hook — set when a workflow was forked from another. */
	parent?: string;
	runtime?: {
		default: Runtime;
	};
	references: ReferenceNode[];
	operators: OperatorNode[];
	subjects: SubjectNode[];
	edges: WFEdge[];
	view?: {
		default?: "studio" | "canvas";
	};
}

export const PORT_COLOR: Record<PortType, string> = {
	image: "#4fd1a5",
	text: "#8b83e8",
	audio: "#f5a623",
	video: "#4d9cf5",
	number: "#e879a8",
	boolean: "#f59e0b",
	file: "#94a3b8",
	json: "#22d3ee",
	gallery: "#34d399",
	model3d: "#a78bfa",
	any: "#6b6e78"
};

export const PORT_COLOR_DIM: Record<PortType, string> = {
	image: "rgba(79, 209, 165, 0.15)",
	text: "rgba(139, 131, 232, 0.15)",
	audio: "rgba(245, 166, 35, 0.15)",
	video: "rgba(77, 156, 245, 0.15)",
	number: "rgba(232, 121, 168, 0.15)",
	boolean: "rgba(245, 158, 11, 0.15)",
	file: "rgba(148, 163, 184, 0.15)",
	json: "rgba(34, 211, 238, 0.15)",
	gallery: "rgba(52, 211, 153, 0.15)",
	model3d: "rgba(167, 139, 250, 0.15)",
	any: "rgba(107, 110, 120, 0.10)"
};

export const KIND_LABEL: Record<string, string> = {
	input: "IN",
	transform: "FN",
	output: "OUT",
	component: "IO"
};
