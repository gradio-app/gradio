import { describe, test, expect } from "vitest";
import {
	collapse_view,
	create_group,
	expand_selection,
	group_bbox,
	group_of,
	is_proxy_edge,
	prune_groups,
	rename_group,
	ungroup,
	PROXY_IN,
	PROXY_OUT
} from "./workflow-groups";
import type {
	ReferenceNode,
	WFEdge,
	WFGroup,
	WFNode,
	Workflow
} from "./workflow-types";

function node(id: string, overrides: Partial<WFNode> = {}): WFNode {
	return {
		id,
		kind: "transform",
		label: id,
		source: "local",
		inputs: [{ id: "in", label: "in", type: "text" }],
		outputs: [{ id: "out", label: "out", type: "text" }],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 100,
		...overrides
	};
}

function edge(
	id: string,
	from: string,
	to: string,
	overrides: Partial<WFEdge> = {}
): WFEdge {
	return {
		id,
		from_node_id: from,
		from_port_id: "out",
		to_node_id: to,
		to_port_id: "in",
		type: "text",
		...overrides
	};
}

function group(id: string, members: string[]): WFGroup {
	return { id, label: id, member_ids: members };
}

function ref(id: string): ReferenceNode {
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
		height: 100
	};
}

function wf(ids: string[], groups?: WFGroup[]): Workflow {
	return {
		schema_version: "2",
		name: "w",
		references: ids.map(ref),
		operators: [],
		subjects: [],
		edges: [],
		...(groups ? { groups } : {})
	};
}

describe("collapse_view", () => {
	const nodes = [
		node("a", { x: 0, y: 0 }),
		node("b", { x: 0, y: 200 }),
		node("c", { x: 400, y: 0 })
	];
	const groups = [group("g1", ["a", "b"])];

	test("passes everything through when nothing is collapsed", () => {
		const edges = [edge("e1", "a", "c")];
		const view = collapse_view(nodes, edges, groups, {});
		expect(view.nodes).toBe(nodes);
		expect(view.edges).toBe(edges);
		expect(view.boxes).toHaveLength(1);
		expect(view.boxes[0].collapsed).toBe(false);
	});

	test("hides members and reroutes a crossing edge onto the output stub", () => {
		const view = collapse_view(nodes, [edge("e1", "a", "c")], groups, {
			g1: true
		});
		expect(view.nodes.map((n) => n.id)).toEqual(["c"]);
		expect(view.edges).toHaveLength(1);
		expect(view.edges[0].from_node_id).toBe("g1");
		expect(view.edges[0].from_port_id).toBe(PROXY_OUT);
		expect(view.edges[0].to_node_id).toBe("c");
		expect(view.edges[0].to_port_id).toBe("in");
		expect(is_proxy_edge(view.edges[0])).toBe(true);
	});

	test("reroutes an inbound edge onto the input stub", () => {
		const view = collapse_view(nodes, [edge("e1", "c", "a")], groups, {
			g1: true
		});
		expect(view.edges[0].to_node_id).toBe("g1");
		expect(view.edges[0].to_port_id).toBe(PROXY_IN);
		expect(view.boxes[0].in_type).toBe("text");
	});

	test("drops an edge running between two members of the same group", () => {
		const view = collapse_view(nodes, [edge("e1", "a", "b")], groups, {
			g1: true
		});
		expect(view.edges).toEqual([]);
	});

	test("dedupes two members feeding the same external port", () => {
		const view = collapse_view(
			nodes,
			[edge("e1", "a", "c"), edge("e2", "b", "c")],
			groups,
			{ g1: true }
		);
		expect(view.edges).toHaveLength(1);
	});

	test("keeps distinct external targets apart", () => {
		const all = [...nodes, node("d", { x: 400, y: 300 })];
		const view = collapse_view(
			all,
			[edge("e1", "a", "c"), edge("e2", "b", "d")],
			groups,
			{ g1: true }
		);
		expect(view.edges).toHaveLength(2);
	});

	test("widens a stub to `any` when deduped edges disagree on type", () => {
		const view = collapse_view(
			nodes,
			[edge("e1", "a", "c"), edge("e2", "b", "c", { type: "image" })],
			groups,
			{ g1: true }
		);
		expect(view.edges).toHaveLength(1);
		expect(view.edges[0].type).toBe("any");
		expect(view.boxes[0].out_type).toBe("any");
	});

	test("keeps a stub's type when every crossing edge agrees", () => {
		const view = collapse_view(nodes, [edge("e1", "a", "c")], groups, {
			g1: true
		});
		expect(view.boxes[0].out_type).toBe("text");
		expect(view.boxes[0].in_type).toBe(null);
	});

	test("edge between two different collapsed groups hits both stubs", () => {
		const all = [...nodes, node("d", { x: 400, y: 300 })];
		const two = [group("g1", ["a", "b"]), group("g2", ["c", "d"])];
		const view = collapse_view(all, [edge("e1", "a", "c")], two, {
			g1: true,
			g2: true
		});
		expect(view.nodes).toEqual([]);
		expect(view.edges).toHaveLength(1);
		expect(view.edges[0].from_node_id).toBe("g1");
		expect(view.edges[0].to_node_id).toBe("g2");
	});

	test("tolerates a stale id left in the collapsed set by an undo", () => {
		const view = collapse_view(nodes, [], groups, { gone: true });
		expect(view.boxes).toHaveLength(1);
		expect(view.nodes).toBe(nodes);
	});

	test("skips a group whose members have all been deleted", () => {
		const view = collapse_view(nodes, [], [group("g9", ["x", "y"])], {
			g9: true
		});
		expect(view.boxes).toEqual([]);
		expect(view.nodes).toBe(nodes);
	});

	test("the file's collapsed flag is the default, the override wins", () => {
		const authored = [{ ...group("g1", ["a", "b"]), collapsed: true }];
		expect(collapse_view(nodes, [], authored, {}).boxes[0].collapsed).toBe(
			true
		);
		expect(
			collapse_view(nodes, [], authored, { g1: false }).boxes[0].collapsed
		).toBe(false);
	});

	test("proxy edge ids are stable across frames", () => {
		const edges = [edge("e1", "a", "c")];
		const a = collapse_view(nodes, edges, groups, { g1: true });
		const b = collapse_view(nodes, edges, groups, { g1: true });
		expect(a.edges[0].id).toBe(b.edges[0].id);
	});
});

describe("group_bbox", () => {
	test("encloses members with padding and header room", () => {
		const nodes = [
			node("a", { x: 100, y: 100, width: 200, height: 100 }),
			node("b", { x: 400, y: 300, width: 200, height: 100 })
		];
		const box = group_bbox(group("g1", ["a", "b"]), nodes)!;
		expect(box.x).toBe(76);
		expect(box.y).toBe(56);
		expect(box.width).toBe(548);
		expect(box.height).toBe(368);
	});

	test("is null when no member exists", () => {
		expect(group_bbox(group("g1", ["x"]), [node("a")])).toBe(null);
	});
});

describe("expand_selection", () => {
	test("swaps a group id for its members and leaves node ids alone", () => {
		const out = expand_selection([group("g1", ["a", "b"])], ["g1", "c"]);
		expect([...out].sort()).toEqual(["a", "b", "c"]);
	});
});

describe("prune_groups", () => {
	test("dissolves a group left with one member", () => {
		const w = prune_groups(wf(["a"], [group("g1", ["a", "b"])]));
		expect(w.groups).toEqual([]);
	});

	test("keeps a group that still has two members", () => {
		const w = prune_groups(wf(["a", "b"], [group("g1", ["a", "b", "c"])]));
		expect(w.groups![0].member_ids).toEqual(["a", "b"]);
	});

	test("returns the same object when nothing changed", () => {
		const input = wf(["a", "b"], [group("g1", ["a", "b"])]);
		expect(prune_groups(input)).toBe(input);
	});

	test("is a no-op on a workflow with no groups", () => {
		const input = wf(["a"]);
		expect(prune_groups(input)).toBe(input);
	});
});

describe("create_group / ungroup / rename_group", () => {
	test("refuses a group of fewer than two nodes", () => {
		const input = wf(["a", "b"]);
		expect(create_group(input, ["a"], "g1")).toBe(input);
	});

	test("moves a node out of its previous group rather than nesting", () => {
		const start = create_group(wf(["a", "b", "c", "d"]), ["a", "b"], "g1");
		const next = create_group(start, ["b", "c"], "g2");
		expect(next.groups).toHaveLength(1);
		expect(next.groups![0].id).toBe("g2");
	});

	test("keeps the old group when it still has two members", () => {
		const start = create_group(wf(["a", "b", "c", "d"]), ["a", "b", "c"], "g1");
		const next = create_group(start, ["c", "d"], "g2");
		expect(next.groups!.map((g) => g.id)).toEqual(["g1", "g2"]);
		expect(next.groups![0].member_ids).toEqual(["a", "b"]);
	});

	test("dedupes member ids", () => {
		const w = create_group(wf(["a", "b"]), ["a", "a", "b"], "g1");
		expect(w.groups![0].member_ids).toEqual(["a", "b"]);
	});

	test("ungroup removes just that group", () => {
		const w = create_group(wf(["a", "b"]), ["a", "b"], "g1");
		expect(ungroup(w, "g1").groups).toEqual([]);
	});

	test("rename_group sets the label", () => {
		const w = rename_group(
			create_group(wf(["a", "b"]), ["a", "b"], "g1"),
			"g1",
			"Preprocessing"
		);
		expect(w.groups![0].label).toBe("Preprocessing");
	});
});

describe("group_of", () => {
	test("finds the owning group, or nothing", () => {
		const groups = [group("g1", ["a", "b"])];
		expect(group_of(groups, "a")?.id).toBe("g1");
		expect(group_of(groups, "z")).toBe(undefined);
	});
});
