import { writable } from "svelte/store";
import type {
	AnyNode,
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
 */
export function sanitizeForSave(wf: Workflow): Workflow {
	const stripBlobs = <T extends { data?: Record<string, unknown> }>(n: T): T => {
		if (!n.data) return n;
		const cleaned: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(n.data)) {
			const url = (v as { url?: string } | null)?.url;
			if (
				typeof url === "string" &&
				(url.startsWith("blob:") || url.startsWith("data:"))
			) {
				continue;
			}
			cleaned[k] = v;
		}
		return { ...n, data: cleaned };
	};
	return {
		...wf,
		references: wf.references.map(stripBlobs),
		operators: wf.operators.map(stripBlobs),
		subjects: wf.subjects.map(stripBlobs)
	};
}

// ─── Actions ────────────────────────────────────────────────────────────────

export function addReference(
	template: Omit<ReferenceNode, "id" | "role" | "x" | "y" | "data">,
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
	const node: ReferenceNode = { ...template, role: "reference", id, x, y, data };
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

export function addSubject(
	template: Omit<SubjectNode, "id" | "role" | "x" | "y" | "data">,
	x: number,
	y: number
): string {
	const id = uuid();
	const node: SubjectNode = { ...template, role: "subject", id, x, y, data: {} };
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
				source: template.source && typeof template.source === "string" &&
					template.source.startsWith("hf://")
					? template.source
					: undefined,
				space_id: template.space_id,
				model_id: template.model_id,
				dataset_id: template.dataset_id,
				dataset_config: template.dataset_config,
				dataset_split: template.dataset_split,
				endpoint: template.endpoint,
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

function mapAllRoles(
	wf: Workflow,
	fn: (node: AnyNode) => AnyNode
): Workflow {
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
		if (node) {
			Object.values(node.data ?? {}).forEach((v) => {
				if (v && typeof v === "object" && (v as { url?: string }).url?.startsWith?.("blob:")) {
					URL.revokeObjectURL((v as { url: string }).url);
				}
			});
		}
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
	workflow.update((wf) => ({ ...wf, edges: [...wf.edges, { ...e, id: uuid() }] }));
}

export function removeEdge(id: string): void {
	workflow.update((wf) => ({ ...wf, edges: wf.edges.filter((e) => e.id !== id) }));
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

/**
 * Promote a reference into a subject (it now receives data from somewhere) or
 * demote a subject back into a reference. Used when edges are added/removed and
 * topology changes a component's role. Kept as an explicit action rather than
 * derived so the studio view can render the change instantly.
 */
export function switchNodeRole(nodeId: string, to: "reference" | "subject"): void {
	workflow.update((wf) => {
		const fromRefs = wf.references.find((n) => n.id === nodeId);
		const fromSubs = wf.subjects.find((n) => n.id === nodeId);
		if (to === "subject" && fromRefs) {
			const promoted: SubjectNode = {
				...fromRefs,
				role: "subject",
				asset_type: fromRefs.asset_type
			};
			return {
				...wf,
				references: wf.references.filter((n) => n.id !== nodeId),
				subjects: [...wf.subjects, promoted]
			};
		}
		if (to === "reference" && fromSubs) {
			const demoted: ReferenceNode = {
				...fromSubs,
				role: "reference",
				asset_type: fromSubs.asset_type
			};
			return {
				...wf,
				subjects: wf.subjects.filter((n) => n.id !== nodeId),
				references: [...wf.references, demoted]
			};
		}
		return wf;
	});
}
