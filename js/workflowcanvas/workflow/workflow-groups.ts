/**
 * Visual node groups.
 *
 * A group is a labelled box drawn around a set of nodes. It is presentation
 * only: the executor, the API endpoint derivation and `subject_groups` never
 * see it, and collapsing one changes nothing about what the workflow computes.
 * Membership is by id and nothing else — dragging a node out of the box does
 * not remove it from the group, which is the bit spatial-containment designs
 * (ComfyUI) get wrong.
 *
 * Everything here is pure so it can be tested without a canvas. Two invariants
 * the canvas leans on:
 *
 *  - `collapse_view` *filters* nodes rather than mapping them, so an unchanged
 *    node keeps its object identity and the keyed `{#each}` doesn't re-render
 *    every card each frame. Edges that cross no boundary are passed through for
 *    the same reason.
 *  - it iterates `groups`, never `collapsed`, so a stale id left in the
 *    collapsed set by an undo is harmless.
 */

import type {
	PortType,
	WFEdge,
	WFGroup,
	WFNode,
	Workflow
} from "./workflow-types";

export type { WFGroup };

/** Padding between the members' bounding box and the group outline. */
const PAD = 24;
/** Height of the draggable header strip above the box. */
export const GROUP_HEADER = 20;
/**
 * Nominal height of a collapsed card. The real card is content-sized; this is
 * only so `zoomToFit` has a number to work with before anything is measured.
 */
const COLLAPSED_HEIGHT = 76;

/** Port ids of the stubs a collapsed group presents in place of its members. */
export const PROXY_IN = "__in";
export const PROXY_OUT = "__out";

export interface GroupBox {
	id: string;
	label: string;
	member_ids: string[];
	/** Member labels in graph order, so a collapsed card can say what it holds. */
	member_labels: string[];
	collapsed: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	/** Type of the edges entering / leaving, or `any` when they disagree. */
	in_type: PortType | null;
	out_type: PortType | null;
}

export interface CollapseView {
	nodes: WFNode[];
	edges: WFEdge[];
	boxes: GroupBox[];
}

export function group_of(
	groups: WFGroup[],
	node_id: string
): WFGroup | undefined {
	return groups.find((g) => g.member_ids.includes(node_id));
}

/** Members' bounding box, padded, with room for the header strip on top. */
export function group_bbox(
	group: WFGroup,
	nodes: WFNode[]
): { x: number; y: number; width: number; height: number } | null {
	const members = nodes.filter((n) => group.member_ids.includes(n.id));
	if (!members.length) return null;
	const x = Math.min(...members.map((n) => n.x));
	const y = Math.min(...members.map((n) => n.y));
	const right = Math.max(...members.map((n) => n.x + n.width));
	const bottom = Math.max(...members.map((n) => n.y + n.height));
	return {
		x: x - PAD,
		y: y - PAD - GROUP_HEADER,
		width: right - x + PAD * 2,
		height: bottom - y + PAD * 2 + GROUP_HEADER
	};
}

/**
 * Replace any group id in `ids` with that group's members. A collapsed group
 * can end up in `selectedNodeIds` (marquee, click), and every consumer past
 * that point — drag, duplicate, delete, grouping — deals in real nodes.
 */
export function expand_selection(
	groups: WFGroup[],
	ids: Iterable<string>
): Set<string> {
	const out = new Set<string>();
	for (const id of ids) {
		const group = groups.find((g) => g.id === id);
		if (group) for (const m of group.member_ids) out.add(m);
		else out.add(id);
	}
	return out;
}

/**
 * Drop member ids that no longer exist and dissolve groups left with fewer than
 * two members. Called from `removeNode` so both delete entry points (the
 * keyboard handler and the card's own X button) are covered by one guard.
 */
export function prune_groups(wf: Workflow): Workflow {
	if (!wf.groups?.length) return wf;
	const live = new Set([
		...wf.references.map((n) => n.id),
		...wf.operators.map((n) => n.id),
		...wf.subjects.map((n) => n.id)
	]);
	const groups = wf.groups
		.map((g) => ({
			...g,
			member_ids: g.member_ids.filter((id) => live.has(id))
		}))
		.filter((g) => g.member_ids.length >= 2);
	if (
		groups.length === wf.groups.length &&
		groups.every(
			(g, i) => g.member_ids.length === wf.groups![i].member_ids.length
		)
	) {
		return wf;
	}
	return { ...wf, groups };
}

export function create_group(
	wf: Workflow,
	member_ids: string[],
	id: string,
	label?: string
): Workflow {
	const members = [...new Set(member_ids)];
	if (members.length < 2) return wf;
	const existing = wf.groups ?? [];
	// A node belongs to at most one group, so grouping a node that already has
	// one moves it rather than nesting.
	const groups = existing
		.map((g) => ({
			...g,
			member_ids: g.member_ids.filter((m) => !members.includes(m))
		}))
		.filter((g) => g.member_ids.length >= 2);
	return {
		...wf,
		groups: [
			...groups,
			{
				id,
				label: label ?? `Group ${existing.length + 1}`,
				member_ids: members
			}
		]
	};
}

export function ungroup(wf: Workflow, group_id: string): Workflow {
	if (!wf.groups?.length) return wf;
	return { ...wf, groups: wf.groups.filter((g) => g.id !== group_id) };
}

export function rename_group(
	wf: Workflow,
	group_id: string,
	label: string
): Workflow {
	if (!wf.groups?.length) return wf;
	return {
		...wf,
		groups: wf.groups.map((g) => (g.id === group_id ? { ...g, label } : g))
	};
}

/** Whether a group reads as collapsed: the viewer's override, else the file. */
export function is_collapsed(
	group: WFGroup,
	overrides: Record<string, boolean>
): boolean {
	return overrides[group.id] ?? group.collapsed ?? false;
}

/**
 * What the canvas should actually draw. Hides the members of every collapsed
 * group, reroutes each boundary-crossing edge onto the group's proxy stub, and
 * drops edges that ran between two members of the same collapsed group.
 *
 * Several real edges can remap onto the same pair of endpoints (two members
 * feeding one external port); those collapse into a single drawn path whose id
 * is derived from the endpoints, so it stays stable across frames.
 */
export function collapse_view(
	nodes: WFNode[],
	edges: WFEdge[],
	groups: WFGroup[],
	overrides: Record<string, boolean>
): CollapseView {
	const boxes: GroupBox[] = [];
	/** node id -> the collapsed group hiding it */
	const hidden = new Map<string, WFGroup>();

	for (const group of groups) {
		const box = group_bbox(group, nodes);
		if (!box) continue;
		const collapsed = is_collapsed(group, overrides);
		if (collapsed) {
			for (const id of group.member_ids) hidden.set(id, group);
		}
		const members = nodes.filter((n) => group.member_ids.includes(n.id));
		boxes.push({
			id: group.id,
			label: group.label,
			member_ids: group.member_ids,
			member_labels: members.map((n) => n.label),
			collapsed,
			x: box.x,
			y: box.y,
			width: collapsed ? Math.max(...members.map((n) => n.width)) : box.width,
			height: collapsed ? COLLAPSED_HEIGHT : box.height,
			in_type: null,
			out_type: null
		});
	}

	if (!hidden.size) return { nodes, edges, boxes };

	const by_id = new Map(boxes.map((b) => [b.id, b]));
	const visible_edges: WFEdge[] = [];
	const seen = new Map<string, WFEdge>();

	for (const edge of edges) {
		const from_group = hidden.get(edge.from_node_id);
		const to_group = hidden.get(edge.to_node_id);
		if (!from_group && !to_group) {
			visible_edges.push(edge);
			continue;
		}
		// Wholly inside one collapsed group — nothing to draw.
		if (from_group && to_group && from_group.id === to_group.id) continue;

		const from_node = from_group ? from_group.id : edge.from_node_id;
		const from_port = from_group ? PROXY_OUT : edge.from_port_id;
		const to_node = to_group ? to_group.id : edge.to_node_id;
		const to_port = to_group ? PROXY_IN : edge.to_port_id;
		const id = `g:${from_node}:${from_port}->${to_node}:${to_port}`;

		// Record the type on whichever stub this edge touches, widening to `any`
		// as soon as two edges on the same stub disagree.
		if (from_group) {
			const box = by_id.get(from_group.id)!;
			box.out_type =
				box.out_type === null || box.out_type === edge.type ? edge.type : "any";
		}
		if (to_group) {
			const box = by_id.get(to_group.id)!;
			box.in_type =
				box.in_type === null || box.in_type === edge.type ? edge.type : "any";
		}

		const existing = seen.get(id);
		if (existing) {
			if (existing.type !== edge.type) existing.type = "any";
			continue;
		}
		const proxy: WFEdge = {
			id,
			from_node_id: from_node,
			from_port_id: from_port,
			to_node_id: to_node,
			to_port_id: to_port,
			type: edge.type
		};
		seen.set(id, proxy);
		visible_edges.push(proxy);
	}

	return {
		nodes: nodes.filter((n) => !hidden.has(n.id)),
		edges: visible_edges,
		boxes
	};
}

/** True for an edge `collapse_view` synthesised — it stands in for real ones. */
export function is_proxy_edge(edge: WFEdge): boolean {
	return edge.id.startsWith("g:");
}
