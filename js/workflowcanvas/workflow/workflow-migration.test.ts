import { describe, test, expect } from "vitest";
import {
	isV2,
	hasMissingNodeGeometry,
	migrateToV2,
	toLegacyShape,
	allNodes,
	findNode
} from "./workflow-migration";
import type {
	OperatorNode,
	ReferenceNode,
	SubjectNode,
	WFEdge,
	Workflow,
	WorkflowV1
} from "./workflow-types";

function makeV2(overrides: Partial<Workflow> = {}): Workflow {
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

function datasetOperator(
	id: string,
	overrides: Partial<OperatorNode> = {}
): OperatorNode {
	return {
		id,
		role: "operator",
		kind: "dataset",
		label: "Dataset",
		dataset_id: "user/dataset",
		dataset_config: "default",
		dataset_split: "train",
		inputs: [],
		outputs: [{ id: "out_0", label: "Data", type: "json" }],
		data: {},
		x: 0,
		y: 0,
		width: 240,
		height: 90,
		runtime: "client",
		...overrides
	};
}

describe("isV2", () => {
	test("accepts a properly-shaped v2 workflow", () => {
		expect(isV2(makeV2())).toBe(true);
	});

	test("rejects v1-shaped workflows", () => {
		const v1: WorkflowV1 = { version: "1", name: "old", nodes: [], edges: [] };
		expect(isV2(v1)).toBe(false);
	});

	test("rejects null / non-objects", () => {
		expect(isV2(null)).toBe(false);
		expect(isV2(undefined)).toBe(false);
		expect(isV2(42)).toBe(false);
		expect(isV2("hello")).toBe(false);
	});

	test("rejects v2 missing required arrays", () => {
		expect(isV2({ schema_version: "2", references: [], operators: [] })).toBe(
			false
		);
	});
});

describe("migrateToV2 — v1 → v2 promotion", () => {
	test("an empty v1 produces an empty v2", () => {
		const result = migrateToV2({});
		expect(result.schema_version).toBe("2");
		expect(result.references).toEqual([]);
		expect(result.operators).toEqual([]);
		expect(result.subjects).toEqual([]);
		expect(result.edges).toEqual([]);
	});

	test("v1 transforms become operators with inferred kind", () => {
		const v1: WorkflowV1 = {
			nodes: [
				{
					id: "n1",
					kind: "transform",
					label: "T2I",
					source: "model",
					model_id: "user/sd",
					inputs: [],
					outputs: [],
					x: 0,
					y: 0,
					width: 200,
					height: 100,
					data: {}
				}
			],
			edges: []
		};
		const wf = migrateToV2(v1);
		expect(wf.operators).toHaveLength(1);
		expect(wf.operators[0].kind).toBe("model");
		expect(wf.operators[0].model_id).toBe("user/sd");
	});

	test("v1 components without incoming edges become references", () => {
		const v1: WorkflowV1 = {
			nodes: [
				{
					id: "n1",
					kind: "component",
					label: "Image",
					source: "local",
					inputs: [{ id: "in", label: "i", type: "image" }],
					outputs: [{ id: "out", label: "o", type: "image" }],
					x: 0,
					y: 0,
					width: 200,
					height: 160,
					data: {}
				}
			],
			edges: []
		};
		const wf = migrateToV2(v1);
		expect(wf.references).toHaveLength(1);
		expect(wf.subjects).toHaveLength(0);
		expect(wf.references[0].asset_type).toBe("image");
	});

	test("v1 components with incoming edges become subjects", () => {
		const v1: WorkflowV1 = {
			nodes: [
				{
					id: "n1",
					kind: "component",
					label: "Image",
					source: "local",
					inputs: [{ id: "in", label: "i", type: "image" }],
					outputs: [{ id: "out", label: "o", type: "image" }],
					x: 0,
					y: 0,
					width: 200,
					height: 160,
					data: {}
				}
			],
			edges: [
				{
					id: "e1",
					from_node_id: "x",
					from_port_id: "out",
					to_node_id: "n1",
					to_port_id: "in",
					type: "image"
				}
			]
		};
		const wf = migrateToV2(v1);
		expect(wf.subjects).toHaveLength(1);
		expect(wf.references).toHaveLength(0);
	});

	test("already-v2 input is returned (cleanups applied)", () => {
		const wf = makeV2({
			operators: [datasetOperator("d1")]
		});
		const result = migrateToV2(wf);
		expect(hasMissingNodeGeometry(wf)).toBe(false);
		expect(result.schema_version).toBe("2");
		expect(result.operators).toHaveLength(1);
	});

	test("fills missing v2 geometry so the frontend can auto-arrange it", () => {
		const operator = datasetOperator("d1") as unknown as Record<
			string,
			unknown
		>;
		delete operator.x;
		delete operator.width;
		delete operator.data;
		const raw = makeV2({
			operators: [operator as unknown as OperatorNode]
		});

		expect(hasMissingNodeGeometry(raw)).toBe(true);
		const result = migrateToV2(raw);
		expect(result.operators[0]).toMatchObject({
			x: 0,
			y: 0,
			width: 200,
			height: 90,
			data: {}
		});
	});
});

describe("toLegacyShape", () => {
	test("projects references to component nodes", () => {
		const ref: ReferenceNode = {
			id: "r1",
			role: "reference",
			label: "Text",
			asset_type: "text",
			inputs: [{ id: "in", label: "t", type: "text" }],
			outputs: [{ id: "out", label: "t", type: "text" }],
			data: {},
			x: 0,
			y: 0,
			width: 200,
			height: 160
		};
		const legacy = toLegacyShape(makeV2({ references: [ref] }));
		expect(legacy.nodes[0].kind).toBe("component");
		expect(legacy.nodes[0].source).toBe("local");
	});

	test("projects operators with kind → source mapping", () => {
		const op: OperatorNode = {
			id: "d1",
			role: "operator",
			kind: "dataset",
			label: "ds",
			inputs: [],
			outputs: [{ id: "out_0", label: "Data", type: "json" }],
			data: {},
			x: 0,
			y: 0,
			width: 240,
			height: 90,
			runtime: "client"
		};
		const legacy = toLegacyShape(makeV2({ operators: [op] }));
		expect(legacy.nodes[0].kind).toBe("transform");
		expect(legacy.nodes[0].source).toBe("dataset");
	});

	test("projects subjects to component nodes", () => {
		const sub: SubjectNode = {
			id: "s1",
			role: "subject",
			label: "Image",
			asset_type: "image",
			inputs: [{ id: "in", label: "i", type: "image" }],
			outputs: [{ id: "out", label: "o", type: "image" }],
			data: {},
			x: 0,
			y: 0,
			width: 200,
			height: 160
		};
		const legacy = toLegacyShape(makeV2({ subjects: [sub] }));
		expect(legacy.nodes[0].kind).toBe("component");
	});

	test("preserves edges verbatim", () => {
		const edges: WFEdge[] = [
			{
				id: "e1",
				from_node_id: "a",
				from_port_id: "p1",
				to_node_id: "b",
				to_port_id: "p2",
				type: "text"
			}
		];
		const legacy = toLegacyShape(makeV2({ edges }));
		expect(legacy.edges).toEqual(edges);
	});
});

describe("allNodes / findNode", () => {
	test("allNodes concatenates references, operators, subjects", () => {
		const wf = makeV2({
			references: [
				{
					id: "r1",
					role: "reference",
					label: "x",
					asset_type: "text",
					inputs: [],
					outputs: [],
					data: {},
					x: 0,
					y: 0,
					width: 200,
					height: 100
				} as ReferenceNode
			],
			operators: [datasetOperator("o1")],
			subjects: [
				{
					id: "s1",
					role: "subject",
					label: "x",
					asset_type: "text",
					inputs: [],
					outputs: [],
					data: {},
					x: 0,
					y: 0,
					width: 200,
					height: 100
				} as SubjectNode
			]
		});
		const ids = allNodes(wf).map((n) => n.id);
		expect(ids).toEqual(["r1", "o1", "s1"]);
	});

	test("findNode locates a node by id across roles", () => {
		const wf = makeV2({ operators: [datasetOperator("o42")] });
		expect(findNode(wf, "o42")?.id).toBe("o42");
		expect(findNode(wf, "missing")).toBeUndefined();
	});
});
