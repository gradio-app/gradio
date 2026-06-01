import { describe, test, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
	workflow,
	addNode,
	addOperator,
	replaceNodeSource,
	removeNode
} from "./workflow-store";
import type { OperatorNode } from "./workflow-types";

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

	test("removes an operator and any edges touching it", () => {
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
		removeNode(id);
		expect(get(workflow).operators.find((o) => o.id === id)).toBeUndefined();
	});
});
