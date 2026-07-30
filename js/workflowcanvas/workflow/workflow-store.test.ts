import { describe, test, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
	workflow,
	addOperator,
	addEdge,
	replaceNodeSource,
	removeNode,
	removeEdge,
	sanitize_for_save,
	switch_endpoint,
	reconcileComponentRoles
} from "./workflow-store";
import type {
	OperatorNode,
	PortType,
	ReferenceNode,
	SubjectNode,
	Workflow
} from "./workflow-types";

function resetWorkflow(): void {
	workflow.set({
		schema_version: "2",
		name: "Test",
		runtime: { default: "client" },
		references: [],
		operators: [],
		subjects: [],
		edges: [],
		view: { default: "canvas" }
	});
}

describe("addOperator — dataset shape", () => {
	beforeEach(resetWorkflow);

	test("persists dataset config + split + row_index input port", () => {
		const id = addOperator(
			{
				kind: "dataset",
				label: "ds",
				dataset_id: "user/ds",
				dataset_config: "default",
				dataset_split: "train",
				inputs: [
					{ id: "row_index", label: "Row", type: "number", default_value: 0 }
				],
				outputs: [{ id: "out_0", label: "v", type: "text" }],
				width: 240,
				height: 90,
				runtime: "client"
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
		const op = get(workflow).operators.find((o) => o.id === id);
		expect(op?.kind).toBe("dataset");
		expect(op?.dataset_id).toBe("user/ds");
		expect(op?.inputs.find((p) => p.id === "row_index")?.type).toBe("number");
	});
});

describe("replaceNodeSource — dataset transitions", () => {
	beforeEach(resetWorkflow);

	test("switching away from a dataset clears dataset fields", () => {
		const id = addOperator(
			{
				kind: "dataset",
				label: "ds",
				dataset_id: "user/ds",
				inputs: [],
				outputs: [],
				width: 240,
				height: 90,
				runtime: "client"
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
		replaceNodeSource(id, {
			label: "model",
			kind: "model",
			model_id: "user/m",
			inputs: [{ id: "in", label: "x", type: "text" }],
			outputs: [{ id: "out", label: "y", type: "text" }],
			width: 280
		});
		const op = get(workflow).operators.find((o) => o.id === id);
		expect(op?.dataset_id).toBeUndefined();
		expect(op?.kind).toBe("model");
	});
});

describe("removeNode", () => {
	beforeEach(resetWorkflow);

	function _makeOp(label: string): string {
		return addOperator(
			{
				kind: "dataset",
				label,
				dataset_id: `user/${label}`,
				inputs: [{ id: "in", label: "x", type: "text" }],
				outputs: [{ id: "out", label: "y", type: "text" }],
				width: 240,
				height: 90,
				runtime: "client"
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
	}

	test("removes an operator from the store", () => {
		const id = _makeOp("a");
		removeNode(id);
		expect(get(workflow).operators.find((o) => o.id === id)).toBeUndefined();
	});

	test("strips edges where removed node is the source", () => {
		const a = _makeOp("a");
		const b = _makeOp("b");
		addEdge({
			from_node_id: a,
			from_port_id: "out",
			to_node_id: b,
			to_port_id: "in",
			type: "text"
		});
		removeNode(a);
		expect(get(workflow).edges).toEqual([]);
	});

	test("strips edges where removed node is the target", () => {
		const a = _makeOp("a");
		const b = _makeOp("b");
		addEdge({
			from_node_id: a,
			from_port_id: "out",
			to_node_id: b,
			to_port_id: "in",
			type: "text"
		});
		removeNode(b);
		expect(get(workflow).edges).toEqual([]);
	});

	test("preserves edges between other nodes", () => {
		const a = _makeOp("a");
		const b = _makeOp("b");
		const c = _makeOp("c");
		addEdge({
			from_node_id: a,
			from_port_id: "out",
			to_node_id: b,
			to_port_id: "in",
			type: "text"
		});
		addEdge({
			from_node_id: b,
			from_port_id: "out",
			to_node_id: c,
			to_port_id: "in",
			type: "text"
		});
		removeNode(a);
		const edges = get(workflow).edges;
		expect(edges).toHaveLength(1);
		expect(edges[0].from_node_id).toBe(b);
		expect(edges[0].to_node_id).toBe(c);
	});

	test("no-op when id doesn't exist", () => {
		const a = _makeOp("a");
		removeNode("nonexistent");
		expect(get(workflow).operators.find((o) => o.id === a)).toBeDefined();
	});
});

describe("removeEdge", () => {
	beforeEach(resetWorkflow);

	function _makeOp(label: string): string {
		return addOperator(
			{
				kind: "fn",
				label,
				fn: label,
				inputs: [{ id: "in", label: "x", type: "text" }],
				outputs: [{ id: "out", label: "y", type: "text" }],
				width: 200,
				height: 80
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
	}

	test("removes only the targeted edge", () => {
		const a = _makeOp("a");
		const b = _makeOp("b");
		const c = _makeOp("c");
		addEdge({
			from_node_id: a,
			from_port_id: "out",
			to_node_id: b,
			to_port_id: "in",
			type: "text"
		});
		addEdge({
			from_node_id: b,
			from_port_id: "out",
			to_node_id: c,
			to_port_id: "in",
			type: "text"
		});
		const firstEdgeId = get(workflow).edges[0].id;
		removeEdge(firstEdgeId);
		const edges = get(workflow).edges;
		expect(edges).toHaveLength(1);
		expect(edges[0].from_node_id).toBe(b);
	});

	test("no-op when id doesn't exist", () => {
		const a = _makeOp("a");
		const b = _makeOp("b");
		addEdge({
			from_node_id: a,
			from_port_id: "out",
			to_node_id: b,
			to_port_id: "in",
			type: "text"
		});
		removeEdge("nonexistent");
		expect(get(workflow).edges).toHaveLength(1);
	});

	test("does not touch nodes", () => {
		const a = _makeOp("a");
		const b = _makeOp("b");
		addEdge({
			from_node_id: a,
			from_port_id: "out",
			to_node_id: b,
			to_port_id: "in",
			type: "text"
		});
		const edgeId = get(workflow).edges[0].id;
		removeEdge(edgeId);
		expect(get(workflow).operators).toHaveLength(2);
	});
});

describe("switch_endpoint", () => {
	beforeEach(resetWorkflow);

	function _spaceOp(): string {
		return addOperator(
			{
				kind: "space",
				label: "moondream2",
				space_id: "user/moondream2",
				endpoint: "/process_answer",
				endpoints: [
					{
						name: "/answer_question",
						inputs: [
							{ id: "in_0", label: "img", type: "image" },
							{ id: "in_1", label: "prompt", type: "text" }
						],
						outputs: [
							{
								id: "out_0",
								label: "Response",
								type: "text",
								output_index: 0
							}
						]
					},
					{
						name: "/process_answer",
						inputs: [
							{ id: "in_0", label: "img", type: "image" },
							{ id: "in_1", label: "answer", type: "text" }
						],
						outputs: [
							{
								id: "out_0",
								label: "Annotated",
								type: "image",
								output_index: 0
							}
						]
					}
				],
				inputs: [
					{ id: "in_0", label: "img", type: "image" },
					{ id: "in_1", label: "answer", type: "text" }
				],
				outputs: [
					{ id: "out_0", label: "Annotated", type: "image", output_index: 0 }
				],
				width: 280,
				height: 90
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
	}

	test("switches inputs and outputs to the new endpoint signature", () => {
		const id = _spaceOp();
		switch_endpoint(id, "/answer_question");
		const op = get(workflow).operators.find((o) => o.id === id);
		expect(op?.endpoint).toBe("/answer_question");
		expect(op?.outputs[0].type).toBe("text");
		expect(op?.outputs[0].label).toBe("Response");
	});

	test("no-op when switching to the current endpoint", () => {
		const id = _spaceOp();
		const before = get(workflow);
		switch_endpoint(id, "/process_answer");
		expect(get(workflow)).toBe(before);
	});

	test("no-op for unknown endpoint name", () => {
		const id = _spaceOp();
		const before = get(workflow);
		switch_endpoint(id, "/nonexistent");
		expect(get(workflow)).toBe(before);
	});

	test("drops edges to removed input ports", () => {
		const id = _spaceOp();
		const upstream = addOperator(
			{
				kind: "fn",
				label: "src",
				fn: "src",
				inputs: [],
				outputs: [{ id: "out", label: "y", type: "image" }],
				width: 200,
				height: 80
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
		addEdge({
			from_node_id: upstream,
			from_port_id: "out",
			to_node_id: id,
			to_port_id: "in_0",
			type: "image"
		});
		switch_endpoint(id, "/answer_question");
		expect(get(workflow).edges).toHaveLength(1);
	});

	test("drops edges that become type-incompatible after the switch", () => {
		const id = _spaceOp();
		const downstream = addOperator(
			{
				kind: "fn",
				label: "sink",
				fn: "sink",
				inputs: [{ id: "in", label: "x", type: "image" }],
				outputs: [],
				width: 200,
				height: 80
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
		addEdge({
			from_node_id: id,
			from_port_id: "out_0",
			to_node_id: downstream,
			to_port_id: "in",
			type: "image"
		});
		switch_endpoint(id, "/answer_question");
		expect(get(workflow).edges).toHaveLength(0);
	});

	test("preserves edges when the port type matches the new endpoint's port", () => {
		const id = _spaceOp();
		const upstream = addOperator(
			{
				kind: "fn",
				label: "src",
				fn: "src",
				inputs: [],
				outputs: [{ id: "out", label: "y", type: "text" }],
				width: 200,
				height: 80
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
		addEdge({
			from_node_id: upstream,
			from_port_id: "out",
			to_node_id: id,
			to_port_id: "in_1",
			type: "text"
		});
		switch_endpoint(id, "/answer_question");
		expect(get(workflow).edges).toHaveLength(1);
	});

	test("clears node.data so stale values don't bleed into new ports", () => {
		const id = _spaceOp();
		workflow.update((wf) => ({
			...wf,
			operators: wf.operators.map((o) =>
				o.id === id ? { ...o, data: { in_1: "stale value" } } : o
			)
		}));
		switch_endpoint(id, "/answer_question");
		const op = get(workflow).operators.find((o) => o.id === id);
		expect(op?.data).toEqual({});
	});
});

describe("reconcileComponentRoles", () => {
	function component(
		id: string,
		role: "reference" | "subject",
		type: PortType = "image",
		data: Record<string, unknown> = {}
	): ReferenceNode | SubjectNode {
		return {
			id,
			role,
			label: id,
			asset_type: type,
			inputs: [{ id: "in", label: "in", type }],
			outputs: [{ id: "out", label: "out", type }],
			data: data as ReferenceNode["data"],
			x: 0,
			y: 0,
			width: 220,
			height: 160
		} as ReferenceNode | SubjectNode;
	}

	function graph(
		refs: (ReferenceNode | SubjectNode)[],
		subs: (ReferenceNode | SubjectNode)[],
		edges: { to: string; from?: string }[] = []
	): Workflow {
		return {
			schema_version: "2",
			name: "Test",
			runtime: { default: "client" },
			references: refs as ReferenceNode[],
			operators: [],
			subjects: subs as SubjectNode[],
			edges: edges.map((e, i) => ({
				id: `e${i}`,
				from_node_id: e.from ?? "op",
				from_port_id: "out",
				to_node_id: e.to,
				to_port_id: "in",
				type: "image" as PortType
			})),
			view: { default: "canvas" }
		};
	}

	test("a driven reference becomes a subject", () => {
		const out = reconcileComponentRoles(
			graph([component("a", "reference")], [], [{ to: "a" }])
		);
		expect(out.references).toHaveLength(0);
		expect(out.subjects.map((n) => n.id)).toEqual(["a"]);
		expect(out.subjects[0].role).toBe("subject");
	});

	test("an undriven subject reverts to a reference", () => {
		const out = reconcileComponentRoles(graph([], [component("a", "subject")]));
		expect(out.subjects).toHaveLength(0);
		expect(out.references.map((n) => n.id)).toEqual(["a"]);
		expect(out.references[0].role).toBe("reference");
	});

	test("an undriven reference and a driven subject are left alone", () => {
		const out = reconcileComponentRoles(
			graph(
				[component("a", "reference")],
				[component("b", "subject")],
				[{ to: "b" }]
			)
		);
		expect(out.references.map((n) => n.id)).toEqual(["a"]);
		expect(out.subjects.map((n) => n.id)).toEqual(["b"]);
	});

	test("flipped nodes append, so existing output order is stable", () => {
		// `subject_groups` in workflow_api.py fixes the API's output-tuple order
		// from `subjects` order — a newly promoted node must not jump the queue.
		const out = reconcileComponentRoles(
			graph(
				[component("promoted", "reference")],
				[component("existing", "subject")],
				[{ to: "promoted" }, { to: "existing" }]
			)
		);
		expect(out.subjects.map((n) => n.id)).toEqual(["existing", "promoted"]);
	});

	test("is idempotent", () => {
		const once = reconcileComponentRoles(
			graph(
				[component("a", "reference"), component("b", "reference")],
				[component("c", "subject")],
				[{ to: "a" }]
			)
		);
		expect(reconcileComponentRoles(once)).toEqual(once);
	});

	test("a component with no input port can never be driven", () => {
		const bare = component("a", "reference");
		bare.inputs = [];
		const out = reconcileComponentRoles(graph([bare], [], [{ to: "a" }]));
		expect(out.references.map((n) => n.id)).toEqual(["a"]);
	});

	test("operators are never reassigned", () => {
		const wf = graph([], []);
		wf.operators = [
			{
				id: "op",
				role: "operator",
				kind: "fn",
				label: "op",
				fn: "op",
				inputs: [{ id: "in", label: "x", type: "text" }],
				outputs: [{ id: "out", label: "y", type: "text" }],
				data: {},
				x: 0,
				y: 0,
				width: 200,
				height: 80
			} as OperatorNode
		];
		wf.edges = [
			{
				id: "e",
				from_node_id: "other",
				from_port_id: "out",
				to_node_id: "op",
				to_port_id: "in",
				type: "text"
			}
		];
		const out = reconcileComponentRoles(wf);
		expect(out.operators).toEqual(wf.operators);
		expect(out.references).toHaveLength(0);
		expect(out.subjects).toHaveLength(0);
	});

	test("promotion clears the stale literal, demotion reseeds defaults", () => {
		const promoted = reconcileComponentRoles(
			graph(
				[component("a", "reference", "image", { out: { url: "/f/a.png" } })],
				[],
				[{ to: "a" }]
			)
		);
		expect(promoted.subjects[0].data).toEqual({});

		const demoted = reconcileComponentRoles(
			graph([], [component("b", "subject", "text", { in: "computed" })])
		);
		// `text` has a zero value in PORT_DEFAULTS, so both ports get seeded.
		expect(demoted.references[0].data).toEqual({ in: "", out: "" });
	});

	test("addEdge promotes, removeEdge demotes", () => {
		resetWorkflow();
		workflow.update((wf) => ({
			...wf,
			references: [component("a", "reference") as ReferenceNode]
		}));
		addEdge({
			from_node_id: "op",
			from_port_id: "out",
			to_node_id: "a",
			to_port_id: "in",
			type: "image"
		});
		expect(get(workflow).subjects.map((n) => n.id)).toEqual(["a"]);

		removeEdge(get(workflow).edges[0].id);
		expect(get(workflow).references.map((n) => n.id)).toEqual(["a"]);
		expect(get(workflow).subjects).toHaveLength(0);
	});

	test("removeNode demotes the components it was feeding", () => {
		resetWorkflow();
		const op = addOperator(
			{
				kind: "fn",
				label: "op",
				fn: "op",
				inputs: [],
				outputs: [{ id: "out", label: "y", type: "image" }],
				width: 200,
				height: 80
			} as unknown as Omit<OperatorNode, "id" | "role" | "x" | "y" | "data">,
			0,
			0
		);
		workflow.update((wf) => ({
			...wf,
			subjects: [component("sink", "subject") as SubjectNode]
		}));
		addEdge({
			from_node_id: op,
			from_port_id: "out",
			to_node_id: "sink",
			to_port_id: "in",
			type: "image"
		});
		expect(get(workflow).subjects.map((n) => n.id)).toEqual(["sink"]);

		removeNode(op);
		expect(get(workflow).subjects).toHaveLength(0);
		expect(get(workflow).references.map((n) => n.id)).toEqual(["sink"]);
	});
});

describe("sanitize_for_save", () => {
	function wf(refs: ReferenceNode[] = []): Workflow {
		return {
			schema_version: "2",
			name: "Test",
			runtime: { default: "client" },
			references: refs,
			operators: [],
			subjects: [],
			edges: [],
			view: { default: "canvas" }
		};
	}

	function refNode(id: string, data: Record<string, unknown>): ReferenceNode {
		return {
			id,
			role: "reference",
			label: id,
			asset_type: "image",
			inputs: [{ id: "in", label: "in", type: "image" }],
			outputs: [{ id: "out", label: "out", type: "image" }],
			data: data as ReferenceNode["data"],
			x: 0,
			y: 0,
			width: 220,
			height: 160
		};
	}

	test("strips blob: URLs from node data", () => {
		const w = wf([
			refNode("a", {
				in: { name: "img.png", url: "blob:http://x/abc", mime: "image/png" }
			})
		]);
		expect(sanitize_for_save(w).references[0].data).toEqual({});
	});

	test("strips data: URLs from node data", () => {
		const w = wf([
			refNode("a", {
				in: {
					name: "img.png",
					url: "data:image/png;base64,iVBOR",
					mime: "image/png"
				}
			})
		]);
		expect(sanitize_for_save(w).references[0].data).toEqual({});
	});

	test("preserves server-served file URLs (http / file paths)", () => {
		const fileVal = {
			name: "out.png",
			url: "/file=/tmp/out.png",
			mime: "image/png"
		};
		const w = wf([refNode("a", { in: fileVal })]);
		expect(sanitize_for_save(w).references[0].data).toEqual({ in: fileVal });
	});

	test("preserves non-file primitive data (text, numbers, booleans)", () => {
		const w = wf([
			refNode("a", { in: "hello world" }),
			refNode("b", { in: 42 }),
			refNode("c", { in: true })
		]);
		const result = sanitize_for_save(w);
		expect(result.references[0].data).toEqual({ in: "hello world" });
		expect(result.references[1].data).toEqual({ in: 42 });
		expect(result.references[2].data).toEqual({ in: true });
	});

	test("strips runtime endpoint catalogs from operators", () => {
		const w = wf();
		const endpoints = [
			{
				name: "text_to_image",
				inputs: [{ id: "prompt", label: "Prompt", type: "text" as const }],
				outputs: [{ id: "image", label: "Image", type: "image" as const }]
			}
		];
		w.operators = [
			{
				id: "model",
				role: "operator",
				kind: "model",
				label: "Model",
				model_id: "org/model",
				endpoint: "text_to_image",
				endpoints,
				inputs: endpoints[0].inputs,
				outputs: endpoints[0].outputs,
				data: {},
				x: 0,
				y: 0,
				width: 220,
				height: 90
			}
		];

		const result = sanitize_for_save(w);
		expect(result.operators[0]).not.toHaveProperty("endpoints");
		expect(result.operators[0]).toMatchObject({
			model_id: "org/model",
			endpoint: "text_to_image"
		});
		expect(w.operators[0].endpoints).toEqual(endpoints);
	});

	test("does not mutate the input workflow", () => {
		const original = wf([
			refNode("a", { in: { name: "x", url: "blob:nope" } })
		]);
		const snapshot = JSON.stringify(original);
		sanitize_for_save(original);
		expect(JSON.stringify(original)).toBe(snapshot);
	});
});
