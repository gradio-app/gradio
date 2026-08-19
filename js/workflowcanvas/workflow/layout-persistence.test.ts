import { describe, test, expect } from "vitest";
import {
	apply_layout,
	extract_layout,
	layout_is_unseen,
	layout_storage_key,
	load_layout,
	save_layout
} from "./layout-persistence";
import type { WorkflowLayout } from "./layout-persistence";
import type { OperatorNode, ReferenceNode, Workflow } from "./workflow-types";

function memory_storage(seed: Record<string, string> = {}): Storage {
	const map = new Map(Object.entries(seed));
	return {
		get length() {
			return map.size;
		},
		clear: () => map.clear(),
		getItem: (k: string) => map.get(k) ?? null,
		key: (i: number) => [...map.keys()][i] ?? null,
		removeItem: (k: string) => void map.delete(k),
		setItem: (k: string, v: string) => void map.set(k, v)
	};
}

function reference(
	id: string,
	geometry: Partial<ReferenceNode> = {}
): ReferenceNode {
	return {
		id,
		role: "reference",
		label: id,
		asset_type: "image",
		inputs: [],
		outputs: [{ id: "out", label: "Image", type: "image" }],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 100,
		...geometry
	};
}

function operator(
	id: string,
	geometry: Partial<OperatorNode> = {}
): OperatorNode {
	return {
		id,
		role: "operator",
		kind: "space",
		label: id,
		inputs: [],
		outputs: [],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 100,
		...geometry
	};
}

function wf(
	references: ReferenceNode[] = [],
	operators: OperatorNode[] = []
): Workflow {
	return {
		schema_version: "2",
		name: "My workflow",
		runtime: { default: "client" },
		references,
		operators,
		subjects: [],
		edges: [],
		view: { default: "canvas" }
	};
}

describe("load_layout / save_layout", () => {
	test("round-trips a layout through storage", () => {
		const storage = memory_storage();
		const layout: WorkflowLayout = {
			a: { x: 10, y: 20, width: 300, height: 140, manual_height: 140 }
		};
		save_layout("My workflow", layout, storage);
		expect(storage.getItem(layout_storage_key("My workflow"))).toBeTruthy();
		expect(load_layout("My workflow", storage)).toEqual(layout);
	});

	test("keys layouts per workflow name", () => {
		const storage = memory_storage();
		save_layout("a", { n: { x: 1, y: 2, width: 3, height: 4 } }, storage);
		expect(load_layout("b", storage)).toEqual({});
	});

	test("returns an empty layout for an unseen workflow", () => {
		expect(load_layout("nothing here", memory_storage())).toEqual({});
	});

	test("ignores malformed JSON", () => {
		const storage = memory_storage({
			[layout_storage_key("w")]: "{not json"
		});
		expect(load_layout("w", storage)).toEqual({});
	});

	test("drops entries with non-numeric geometry", () => {
		const storage = memory_storage({
			[layout_storage_key("w")]: JSON.stringify({
				good: { x: 1, y: 2, width: 3, height: 4 },
				bad: { x: "1", y: 2, width: 3, height: 4 },
				missing: { x: 1, y: 2 }
			})
		});
		expect(load_layout("w", storage)).toEqual({
			good: { x: 1, y: 2, width: 3, height: 4 }
		});
	});

	test("is inert without a storage backend", () => {
		expect(load_layout("w", undefined)).toEqual({});
		expect(() => save_layout("w", {}, undefined)).not.toThrow();
	});
});

describe("extract_layout", () => {
	test("captures geometry for every node role", () => {
		const w = wf(
			[reference("a", { x: 5, y: 6, width: 210, height: 120 })],
			[operator("b", { x: 300, y: 60, width: 240, height: 90 })]
		);
		expect(extract_layout(w)).toEqual({
			a: { x: 5, y: 6, width: 210, height: 120 },
			b: { x: 300, y: 60, width: 240, height: 90 }
		});
	});

	test("records a pinned height only when the card has one", () => {
		const w = wf([reference("a", { manual_height: 260 }), reference("b")]);
		const layout = extract_layout(w);
		expect(layout.a.manual_height).toBe(260);
		expect("manual_height" in layout.b).toBe(false);
	});
});

describe("layout_is_unseen", () => {
	test("true when no node has a stored entry", () => {
		expect(layout_is_unseen(wf([reference("a")]), {})).toBe(true);
	});

	test("false as soon as one node has been placed", () => {
		const layout = { a: { x: 1, y: 2, width: 3, height: 4 } };
		expect(layout_is_unseen(wf([reference("a"), reference("b")]), layout)).toBe(
			false
		);
	});

	test("true when the stored layout is for nodes that no longer exist", () => {
		const layout = { gone: { x: 1, y: 2, width: 3, height: 4 } };
		expect(layout_is_unseen(wf([reference("a")]), layout)).toBe(true);
	});
});

describe("apply_layout", () => {
	test("overrides the file's geometry with the viewer's own", () => {
		const w = wf([reference("a", { x: 999, y: 999, width: 200, height: 100 })]);
		const out = apply_layout(w, {
			a: { x: 40, y: 50, width: 320, height: 180 }
		});
		expect(out.references[0]).toMatchObject({
			x: 40,
			y: 50,
			width: 320,
			height: 180
		});
	});

	test("restores a pinned height", () => {
		const w = wf([reference("a")]);
		const out = apply_layout(w, {
			a: { x: 0, y: 0, width: 200, height: 300, manual_height: 300 }
		});
		expect(out.references[0].manual_height).toBe(300);
	});

	test("drops a pin this viewer never made, even if the file carries one", () => {
		const w = wf([reference("a", { manual_height: 400 })]);
		const out = apply_layout(w, {
			a: { x: 0, y: 0, width: 200, height: 100 }
		});
		expect(out.references[0].manual_height).toBeUndefined();
	});

	test("parks a node the viewer has never seen clear of the ones they placed", () => {
		const w = wf([reference("known"), reference("fresh")]);
		const out = apply_layout(w, {
			known: { x: 100, y: 200, width: 200, height: 100 }
		});
		const [known, fresh] = out.references;
		expect(known).toMatchObject({ x: 100, y: 200 });
		expect(fresh.x).toBeGreaterThan(known.x);
		expect(fresh.y).toBe(known.y);
	});

	test("staggers several unseen nodes instead of stacking them", () => {
		const w = wf([reference("a"), reference("b"), reference("c")]);
		const out = apply_layout(w, {});
		const spots = out.references.map((n) => `${n.x},${n.y}`);
		expect(new Set(spots).size).toBe(3);
	});

	test("leaves the graph itself untouched", () => {
		const w = wf([reference("a")], [operator("b")]);
		const out = apply_layout(w, {});
		expect(out.edges).toBe(w.edges);
		expect(out.operators[0].kind).toBe("space");
		expect(out.references[0].role).toBe("reference");
	});
});
