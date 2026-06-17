/**
 * Pure graph utilities used by the canvas — extracted so they can be
 * unit-tested without standing up a Svelte component. Anything that
 * computes a value from the workflow / node lists / edges and doesn't
 * touch the DOM lives here.
 */

import type { NodeStatus, WFEdge, WFNode, Workflow } from "./workflow-types";

/**
 * Walk diagonally from (x, y) in 28px steps until an open spot is found
 * that doesn't visually overlap an existing node. Used by code paths
 * that drop a fresh node at a fixed fallback position (canvas center,
 * picker create, etc.) — without this, successive adds stack identically.
 */
export function findFreeSpot(
	nodes: { x: number; y: number }[],
	x: number,
	y: number
): { x: number; y: number } {
	let nx = x;
	let ny = y;
	while (nodes.some((n) => Math.abs(n.x - nx) < 8 && Math.abs(n.y - ny) < 8)) {
		nx += 28;
		ny += 28;
	}
	return { x: nx, y: ny };
}

/**
 * Topological sort: returns a sorted list of nodes such that every edge
 * goes from an earlier node to a later one. Standard Kahn's algorithm.
 */
export function topoSort(nodes: WFNode[], edges: WFEdge[]): WFNode[] {
	const deg = new Map(nodes.map((n) => [n.id, 0]));
	for (const e of edges)
		deg.set(e.to_node_id, (deg.get(e.to_node_id) ?? 0) + 1);
	const q = nodes.filter((n) => deg.get(n.id) === 0);
	const out: WFNode[] = [];
	while (q.length) {
		const n = q.shift()!;
		out.push(n);
		for (const e of edges.filter((e) => e.from_node_id === n.id)) {
			const d = (deg.get(e.to_node_id) ?? 1) - 1;
			deg.set(e.to_node_id, d);
			if (d === 0) q.push(nodes.find((nd) => nd.id === e.to_node_id)!);
		}
	}
	return out;
}

/**
 * Compute the effective input values for a node right now — mirrors the
 * executor's `resolveInputs` so the canvas can detect staleness without
 * re-running the graph. For each input port:
 *  - if wired, take the upstream node's stored data for that output port,
 *  - otherwise fall back to the node's own inline data or port default.
 */
export function resolveCurrentInputs(
	node: WFNode,
	allNodes: WFNode[],
	edges: WFEdge[]
): Record<string, unknown> {
	const resolved: Record<string, unknown> = {};
	for (const port of node.inputs) {
		const edge = edges.find(
			(e) => e.to_node_id === node.id && e.to_port_id === port.id
		);
		if (edge) {
			const upstream = allNodes.find((n) => n.id === edge.from_node_id);
			resolved[port.id] = upstream?.data?.[edge.from_port_id] ?? null;
		} else {
			resolved[port.id] = node.data?.[port.id] ?? port.default_value ?? null;
		}
	}
	return resolved;
}

/**
 * Compute the set of node IDs that are currently "stale": their last
 * successful run happened with inputs that no longer match the current
 * ones, OR an upstream node is stale (so re-running will change this
 * one's inputs). Walks in topological order so transitive staleness
 * propagates in a single pass.
 *
 * Pattern lifted from `gradio-app/daggr`'s edge-stale derivation.
 */
export function computeStaleNodes(
	nodes: WFNode[],
	edges: WFEdge[],
	nodeStatus: Record<string, NodeStatus>,
	inputSnapshots: Record<string, string>
): Set<string> {
	const stale = new Set<string>();
	const sorted = topoSort(nodes, edges);
	for (const node of sorted) {
		if (nodeStatus[node.id] !== "done") continue;
		const snapshot = inputSnapshots[node.id];
		if (
			snapshot &&
			JSON.stringify(resolveCurrentInputs(node, nodes, edges)) !== snapshot
		) {
			stale.add(node.id);
			continue;
		}
		for (const edge of edges) {
			if (edge.to_node_id === node.id && stale.has(edge.from_node_id)) {
				stale.add(node.id);
				break;
			}
		}
	}
	return stale;
}

/**
 * Build a sub-workflow containing `targetId`, all of its transitive upstream
 * dependencies, and all downstream nodes reachable from `targetId`. Used by
 * per-node "run this" so outputs propagate through the full connected chain.
 * Node IDs are stable, so callbacks from the executor still target the same
 * status / output maps in the caller.
 */
export function buildUpstreamSubgraph(
	workflow: Workflow,
	targetId: string
): Workflow {
	const include = new Set<string>([targetId]);
	const queue = [targetId];
	while (queue.length) {
		const cur = queue.shift()!;
		for (const e of workflow.edges) {
			if (e.to_node_id === cur && !include.has(e.from_node_id)) {
				include.add(e.from_node_id);
				queue.push(e.from_node_id);
			}
		}
	}
	for (const e of workflow.edges) {
		if (e.from_node_id === targetId) include.add(e.to_node_id);
	}
	return {
		...workflow,
		references: workflow.references.filter((n) => include.has(n.id)),
		operators: workflow.operators.filter((n) => include.has(n.id)),
		subjects: workflow.subjects.filter((n) => include.has(n.id)),
		edges: workflow.edges.filter(
			(e) => include.has(e.from_node_id) && include.has(e.to_node_id)
		)
	};
}
