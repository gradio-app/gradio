import { describe, test, expect } from "vitest";
import {
	carry_live_values,
	create_history,
	history_signature
} from "./workflow-history";
import type {
	OperatorNode,
	ReferenceNode,
	SubjectNode,
	Workflow
} from "./workflow-types";

function reference(
	id: string,
	overrides: Partial<ReferenceNode> = {}
): ReferenceNode {
	return {
		id,
		role: "reference",
		label: id,
		asset_type: "text",
		inputs: [],
		outputs: [{ id: "out", label: "Text", type: "text" }],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 100,
		...overrides
	};
}

function operator(
	id: string,
	overrides: Partial<OperatorNode> = {}
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
		...overrides
	};
}

function subject(
	id: string,
	overrides: Partial<SubjectNode> = {}
): SubjectNode {
	return {
		id,
		role: "subject",
		label: id,
		asset_type: "text",
		inputs: [{ id: "in", label: "Text", type: "text" }],
		outputs: [],
		data: {},
		x: 0,
		y: 0,
		width: 200,
		height: 100,
		...overrides
	};
}

function wf(overrides: Partial<Workflow> = {}): Workflow {
	return {
		schema_version: "2",
		name: "My workflow",
		runtime: { default: "client" },
		references: [],
		operators: [],
		subjects: [],
		edges: [],
		view: { default: "canvas" },
		...overrides
	};
}

describe("history_signature", () => {
	test("changes when a node is added", () => {
		const before = wf({ references: [reference("a")] });
		const after = wf({ references: [reference("a"), reference("b")] });
		expect(history_signature(before)).not.toBe(history_signature(after));
	});

	test("changes when a node moves", () => {
		const before = wf({ references: [reference("a")] });
		const after = wf({ references: [reference("a", { x: 40, y: 90 })] });
		expect(history_signature(before)).not.toBe(history_signature(after));
	});

	test("changes when the viewer pins a height", () => {
		const before = wf({ references: [reference("a")] });
		const after = wf({ references: [reference("a", { manual_height: 300 })] });
		expect(history_signature(before)).not.toBe(history_signature(after));
	});

	test("ignores measured height, so a re-measure isn't an undo step", () => {
		const before = wf({ references: [reference("a", { height: 100 })] });
		const after = wf({ references: [reference("a", { height: 260 })] });
		expect(history_signature(before)).toBe(history_signature(after));
	});

	test("ignores node data, so a run isn't an undo step", () => {
		const before = wf({ subjects: [subject("s")] });
		const after = wf({ subjects: [subject("s", { data: { in: "result" } })] });
		expect(history_signature(before)).toBe(history_signature(after));
	});

	test("ignores hydrated endpoint catalogs", () => {
		const before = wf({ operators: [operator("o")] });
		const after = wf({
			operators: [
				operator("o", {
					endpoints: [{ name: "/run", inputs: [], outputs: [] }]
				})
			]
		});
		expect(history_signature(before)).toBe(history_signature(after));
	});

	test("changes when the chosen endpoint changes", () => {
		const before = wf({ operators: [operator("o", { endpoint: "/a" })] });
		const after = wf({ operators: [operator("o", { endpoint: "/b" })] });
		expect(history_signature(before)).not.toBe(history_signature(after));
	});
});

describe("carry_live_values", () => {
	test("keeps the current run's outputs on a restored snapshot", () => {
		const snapshot = wf({ subjects: [subject("s")] });
		const current = wf({
			subjects: [subject("s", { data: { in: "fresh result" } })]
		});
		const merged = carry_live_values(snapshot, current);
		expect(merged.subjects[0].data).toEqual({ in: "fresh result" });
	});

	test("takes the snapshot's data for a node it is bringing back", () => {
		const snapshot = wf({
			references: [reference("a", { data: { out: "hi" } })]
		});
		const merged = carry_live_values(snapshot, wf());
		expect(merged.references[0].data).toEqual({ out: "hi" });
	});

	test("keeps hydrated endpoints alive across a restore", () => {
		const endpoints = [{ name: "/run", inputs: [], outputs: [] }];
		const snapshot = wf({ operators: [operator("o")] });
		const current = wf({ operators: [operator("o", { endpoints })] });
		expect(carry_live_values(snapshot, current).operators[0].endpoints).toEqual(
			endpoints
		);
	});

	test("does not carry data across a role flip", () => {
		const snapshot = wf({
			references: [reference("n", { data: { out: "" } })]
		});
		const current = wf({
			subjects: [subject("n", { data: { in: "computed" } })]
		});
		expect(carry_live_values(snapshot, current).references[0].data).toEqual({
			out: ""
		});
	});

	test("restores the snapshot's geometry", () => {
		const snapshot = wf({ references: [reference("a", { x: 10, y: 20 })] });
		const current = wf({ references: [reference("a", { x: 800, y: 900 })] });
		expect(carry_live_values(snapshot, current).references[0]).toMatchObject({
			x: 10,
			y: 20
		});
	});
});

describe("create_history", () => {
	test("has nothing to undo before anything changes", () => {
		const history = create_history();
		const base = wf({ references: [reference("a")] });
		history.reset(base);
		expect(history.can_undo()).toBe(false);
		expect(history.undo(base)).toBeNull();
	});

	test("undo returns the state before the recorded change", () => {
		const history = create_history();
		const base = wf({ references: [reference("a")] });
		history.reset(base);
		const moved = wf({ references: [reference("a", { x: 120 })] });
		history.record(moved);
		expect(history.can_undo()).toBe(true);
		expect(history.undo(moved)?.references[0].x).toBe(0);
	});

	test("redo replays what undo took back", () => {
		const history = create_history();
		const base = wf({ references: [reference("a")] });
		history.reset(base);
		const moved = wf({ references: [reference("a", { x: 120 })] });
		history.record(moved);
		const undone = history.undo(moved)!;
		expect(history.can_redo()).toBe(true);
		expect(history.redo(undone)?.references[0].x).toBe(120);
	});

	test("recording a change discards the redo stack", () => {
		const history = create_history();
		history.reset(wf());
		const one = wf({ references: [reference("a")] });
		history.record(one);
		const undone = history.undo(one)!;
		expect(history.can_redo()).toBe(true);
		history.record(wf({ references: [reference("b")] }));
		expect(history.can_redo()).toBe(false);
	});

	test("a write that changes no signature opens no entry", () => {
		const history = create_history();
		const base = wf({ subjects: [subject("s")] });
		history.reset(base);
		history.record(wf({ subjects: [subject("s", { data: { in: "out" } })] }));
		expect(history.can_undo()).toBe(false);
	});

	test("undo after a run keeps the run's output", () => {
		const history = create_history();
		const base = wf({ subjects: [subject("s")] });
		history.reset(base);
		// The workflow runs (data only — no new entry), then a card is dragged.
		const ran = wf({ subjects: [subject("s", { data: { in: "result" } })] });
		history.record(ran);
		const dragged = wf({
			subjects: [subject("s", { x: 300, data: { in: "result" } })]
		});
		history.record(dragged);

		const undone = history.undo(dragged)!;
		expect(undone.subjects[0].x).toBe(0);
		expect(undone.subjects[0].data).toEqual({ in: "result" });
	});

	test("walks back through several entries in order", () => {
		const history = create_history();
		history.reset(wf({ references: [reference("a", { x: 0 })] }));
		const at10 = wf({ references: [reference("a", { x: 10 })] });
		const at20 = wf({ references: [reference("a", { x: 20 })] });
		history.record(at10);
		history.record(at20);
		const first = history.undo(at20)!;
		expect(first.references[0].x).toBe(10);
		expect(history.undo(first)!.references[0].x).toBe(0);
		expect(history.can_undo()).toBe(false);
	});

	test("drops the oldest entry past the limit", () => {
		const history = create_history(2);
		history.reset(wf({ references: [reference("a", { x: 0 })] }));
		for (const x of [1, 2, 3]) {
			history.record(wf({ references: [reference("a", { x })] })); // 3 entries
		}
		let current = wf({ references: [reference("a", { x: 3 })] });
		const seen: number[] = [];
		let step = history.undo(current);
		while (step) {
			seen.push(step.references[0].x);
			current = step;
			step = history.undo(current);
		}
		expect(seen).toEqual([2, 1]);
	});

	test("reset clears both stacks", () => {
		const history = create_history();
		history.reset(wf());
		history.record(wf({ references: [reference("a")] }));
		history.reset(wf({ references: [reference("a")] }));
		expect(history.can_undo()).toBe(false);
		expect(history.can_redo()).toBe(false);
	});
});
