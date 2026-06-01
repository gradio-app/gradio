import { describe, test, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
	workflow,
	addNode,
	addOperator,
	replaceNodeSource,
	removeNode,
	sanitizeForSave
} from "./workflow-store";
import type { OperatorNode, ReferenceNode, Workflow } from "./workflow-types";

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

describe("sanitizeForSave", () => {
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
		expect(sanitizeForSave(w).references[0].data).toEqual({});
	});

	test("strips data: URLs from node data", () => {
		const w = wf([
			refNode("a", {
				in: { name: "img.png", url: "data:image/png;base64,iVBOR", mime: "image/png" }
			})
		]);
		expect(sanitizeForSave(w).references[0].data).toEqual({});
	});

	test("preserves server-served file URLs (http / file paths)", () => {
		const fileVal = { name: "out.png", url: "/file=/tmp/out.png", mime: "image/png" };
		const w = wf([refNode("a", { in: fileVal })]);
		expect(sanitizeForSave(w).references[0].data).toEqual({ in: fileVal });
	});

	test("preserves non-file primitive data (text, numbers, booleans)", () => {
		const w = wf([
			refNode("a", { in: "hello world" }),
			refNode("b", { in: 42 }),
			refNode("c", { in: true })
		]);
		const result = sanitizeForSave(w);
		expect(result.references[0].data).toEqual({ in: "hello world" });
		expect(result.references[1].data).toEqual({ in: 42 });
		expect(result.references[2].data).toEqual({ in: true });
	});

	test("does not mutate the input workflow", () => {
		const original = wf([
			refNode("a", { in: { name: "x", url: "blob:nope" } })
		]);
		const snapshot = JSON.stringify(original);
		sanitizeForSave(original);
		expect(JSON.stringify(original)).toBe(snapshot);
	});
});
