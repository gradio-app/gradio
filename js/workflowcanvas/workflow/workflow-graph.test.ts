import { describe, test, expect } from "vitest";
import {
	findFreeSpot,
	topoSort,
	resolveCurrentInputs,
	computeStaleNodes,
	buildUpstreamSubgraph
} from "./workflow-graph";
import type {
	NodeStatus,
	OperatorNode,
	ReferenceNode,
	SubjectNode,
	WFEdge,
	WFNode,
	Workflow
} from "./workflow-types";

function ref(
	id: string,
	overrides: Partial<ReferenceNode> = {}
): ReferenceNode {
	return {
		id,
		role: "reference",
		label: id,
		asset_type: "text",
		inputs: [{ id: "in", label: "in", type: "text" }],
		outputs: [{ id: "out", label: "out", type: "text" }],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 160,
		...overrides
	};
}

function op(
	id: string,
	overrides: Partial<OperatorNode> = {}
): OperatorNode {
	return {
		id,
		role: "operator",
		kind: "model",
		label: id,
		model_id: `user/${id}`,
		inputs: [{ id: "in", label: "in", type: "text" }],
		outputs: [{ id: "out", label: "out", type: "text" }],
		data: {},
		x: 0,
		y: 0,
		width: 280,
		height: 90,
		runtime: "client",
		...overrides
	};
}

function sub(id: string, overrides: Partial<SubjectNode> = {}): SubjectNode {
	return {
		id,
		role: "subject",
		label: id,
		asset_type: "text",
		inputs: [{ id: "in", label: "in", type: "text" }],
		outputs: [{ id: "out", label: "out", type: "text" }],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 160,
		...overrides
	};
}

function wf(overrides: Partial<Workflow> = {}): Workflow {
	return {
		schema_version: "2",
		name: "Test",
		runtime: { default: "client" },
		references: [],
		operators: [],
		subjects: [],
		edges: [],
		view: { default: "canvas" },
		...overrides
	};
}

function edge(from: string, to: string, port = "in"): WFEdge {
	return {
		id: `${from}-${to}`,
		from_node_id: from,
		from_port_id: "out",
		to_node_id: to,
		to_port_id: port,
		type: "text"
	};
}

// Cast helpers to the WFNode shape `resolveCurrentInputs` / `topoSort`
// expect, mirroring `toLegacyShape`'s output.
function asLegacy(n: ReferenceNode | OperatorNode | SubjectNode): WFNode {
	return {
		id: n.id,
		kind: n.role === "operator" ? "transform" : "component",
		label: n.label,
		source: n.role === "operator" ? "model" : "local",
		inputs: n.inputs,
		outputs: n.outputs,
		x: n.x,
		y: n.y,
		width: n.width,
		height: n.height,
		data: n.data
	};
}

describe("findFreeSpot", () => {
	test("returns the input position unchanged when no node is nearby", () => {
		expect(findFreeSpot([], 100, 100)).toEqual({ x: 100, y: 100 });
		expect(findFreeSpot([{ x: 500, y: 500 }], 100, 100)).toEqual({
			x: 100,
			y: 100
		});
	});

	test("cascades diagonally by 28px when the spot is taken", () => {
		expect(findFreeSpot([{ x: 100, y: 100 }], 100, 100)).toEqual({
			x: 128,
			y: 128
		});
	});

	test("keeps cascading until a free spot is found", () => {
		const occupied = [
			{ x: 100, y: 100 },
			{ x: 128, y: 128 },
			{ x: 156, y: 156 }
		];
		expect(findFreeSpot(occupied, 100, 100)).toEqual({ x: 184, y: 184 });
	});

	test("treats positions within 8px as overlapping", () => {
		expect(findFreeSpot([{ x: 104, y: 104 }], 100, 100)).toEqual({
			x: 128,
			y: 128
		});
	});
});

describe("topoSort", () => {
	test("orders independent nodes in input order", () => {
		const a = asLegacy(ref("a"));
		const b = asLegacy(ref("b"));
		expect(topoSort([a, b], []).map((n) => n.id)).toEqual(["a", "b"]);
	});

	test("places upstream nodes before downstream ones", () => {
		const a = asLegacy(ref("a"));
		const b = asLegacy(op("b"));
		const c = asLegacy(sub("c"));
		const sorted = topoSort([c, b, a], [edge("a", "b"), edge("b", "c")]);
		expect(sorted.map((n) => n.id)).toEqual(["a", "b", "c"]);
	});

	test("handles diamond dependencies", () => {
		const a = asLegacy(ref("a"));
		const b = asLegacy(op("b"));
		const c = asLegacy(op("c"));
		const d = asLegacy(sub("d"));
		const sorted = topoSort(
			[d, c, b, a],
			[edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")]
		);
		const order = sorted.map((n) => n.id);
		expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
		expect(order.indexOf("a")).toBeLessThan(order.indexOf("c"));
		expect(order.indexOf("b")).toBeLessThan(order.indexOf("d"));
		expect(order.indexOf("c")).toBeLessThan(order.indexOf("d"));
	});
});

describe("resolveCurrentInputs", () => {
	test("falls back to inline data when no edge is wired", () => {
		const node = asLegacy(ref("a", { data: { in: "hello" } }));
		expect(resolveCurrentInputs(node, [node], [])).toEqual({ in: "hello" });
	});

	test("uses port default_value if no edge and no inline data", () => {
		const node = asLegacy(
			ref("a", {
				inputs: [
					{ id: "in", label: "in", type: "text", default_value: "fallback" }
				]
			})
		);
		expect(resolveCurrentInputs(node, [node], [])).toEqual({ in: "fallback" });
	});

	test("returns null when neither edge, data, nor default is present", () => {
		const node = asLegacy(ref("a"));
		expect(resolveCurrentInputs(node, [node], [])).toEqual({ in: null });
	});

	test("reads from upstream node's data when wired", () => {
		const up = asLegacy(ref("up", { data: { out: "from-upstream" } }));
		const down = asLegacy(op("down"));
		expect(
			resolveCurrentInputs(down, [up, down], [edge("up", "down")])
		).toEqual({ in: "from-upstream" });
	});

	test("preferring edge over inline data on the downstream node", () => {
		const up = asLegacy(ref("up", { data: { out: "wired" } }));
		const down = asLegacy(op("down", { data: { in: "inline" } }));
		expect(
			resolveCurrentInputs(down, [up, down], [edge("up", "down")])
		).toEqual({ in: "wired" });
	});
});

describe("computeStaleNodes", () => {
	test("never marks not-yet-run nodes as stale", () => {
		const a = asLegacy(ref("a"));
		const status: Record<string, NodeStatus> = {};
		expect(computeStaleNodes([a], [], status, {})).toEqual(new Set());
	});

	test("marks a done node stale when its inputs differ from its snapshot", () => {
		const a = asLegacy(ref("a", { data: { in: "now" } }));
		const status = { a: "done" as NodeStatus };
		const snapshots = { a: JSON.stringify({ in: "then" }) };
		expect(computeStaleNodes([a], [], status, snapshots).has("a")).toBe(true);
	});

	test("does not mark a done node stale when inputs match", () => {
		const a = asLegacy(ref("a", { data: { in: "same" } }));
		const status = { a: "done" as NodeStatus };
		const snapshots = { a: JSON.stringify({ in: "same" }) };
		expect(computeStaleNodes([a], [], status, snapshots).has("a")).toBe(false);
	});

	test("propagates staleness transitively downstream", () => {
		const up = asLegacy(ref("up", { data: { in: "now" } }));
		const down = asLegacy(op("down", { data: { in: "matches" } }));
		const edges = [edge("up", "down")];
		const status = {
			up: "done" as NodeStatus,
			down: "done" as NodeStatus
		};
		const snapshots = {
			up: JSON.stringify({ in: "then" }),
			down: JSON.stringify({ in: "matches" })
		};
		const stale = computeStaleNodes([up, down], edges, status, snapshots);
		expect(stale.has("up")).toBe(true);
		expect(stale.has("down")).toBe(true);
	});

	test("skips snapshot-less nodes (never run successfully)", () => {
		const a = asLegacy(ref("a", { data: { in: "now" } }));
		const status = { a: "done" as NodeStatus };
		expect(computeStaleNodes([a], [], status, {}).has("a")).toBe(false);
	});
});

describe("buildUpstreamSubgraph", () => {
	test("includes only the target when it has no upstream", () => {
		const a = ref("a");
		const result = buildUpstreamSubgraph(wf({ references: [a] }), "a");
		expect(result.references).toHaveLength(1);
		expect(result.operators).toHaveLength(0);
		expect(result.subjects).toHaveLength(0);
	});

	test("walks transitively up the edge chain", () => {
		const a = ref("a");
		const b = op("b");
		const c = op("c");
		const d = sub("d");
		const e = sub("e");
		const result = buildUpstreamSubgraph(
			wf({
				references: [a],
				operators: [b, c],
				subjects: [d, e],
				edges: [
					edge("a", "b"),
					edge("b", "c"),
					edge("c", "d"),
					edge("a", "e")
				]
			}),
			"d"
		);
		// d → c → b → a should all be included; e is unrelated.
		const ids = [
			...result.references.map((n) => n.id),
			...result.operators.map((n) => n.id),
			...result.subjects.map((n) => n.id)
		].sort();
		expect(ids).toEqual(["a", "b", "c", "d"]);
	});

	test("drops edges that touch nodes outside the subgraph", () => {
		const a = ref("a");
		const b = op("b");
		const c = sub("c"); // unrelated
		const result = buildUpstreamSubgraph(
			wf({
				references: [a],
				operators: [b],
				subjects: [c],
				edges: [edge("a", "b"), edge("a", "c")]
			}),
			"b"
		);
		expect(result.edges.map((e) => e.id)).toEqual(["a-b"]);
	});

	test("preserves workflow-level metadata", () => {
		const a = ref("a");
		const source = wf({
			name: "Original",
			references: [a]
		});
		const result = buildUpstreamSubgraph(source, "a");
		expect(result.schema_version).toBe("2");
		expect(result.name).toBe("Original");
	});
});
