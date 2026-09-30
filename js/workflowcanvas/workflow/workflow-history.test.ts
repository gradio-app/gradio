import { describe, test, expect } from "vitest";
import { create_history } from "./workflow-history";
import type { ReferenceNode, Workflow } from "./workflow-types";

function textNode(id: string, value: unknown): ReferenceNode {
	return {
		id,
		role: "reference",
		kind: "component",
		component: "textbox",
		label: "Prompt",
		x: 0,
		y: 0,
		width: 240,
		inputs: [],
		outputs: [{ id: "out_0", label: "v", type: "text" }],
		data: { out_0: value }
	} as unknown as ReferenceNode;
}

function wf(references: ReferenceNode[]): Workflow {
	return {
		schema_version: "2",
		name: "Test",
		runtime: { default: "client" },
		references,
		operators: [],
		subjects: [],
		edges: [],
		view: { default: "canvas" }
	} as unknown as Workflow;
}

describe("undo of a delete", () => {
	test("brings the node back with the value that was in it", () => {
		const history = create_history();
		const typed = wf([textNode("n1", "a cat wearing a hat")]);
		history.reset(wf([textNode("n1", "")]));
		history.refresh(typed);
		const deleted = wf([]);
		history.record(deleted);

		const restored = history.undo(deleted);
		expect(restored?.references[0].data.out_0).toBe("a cat wearing a hat");
	});

	test("keeps the value through redo of the delete and a second undo", () => {
		const history = create_history();
		history.reset(wf([textNode("n1", "hello")]));
		const deleted = wf([]);
		history.record(deleted);

		const undone = history.undo(deleted);
		expect(undone?.references).toHaveLength(1);
		const redone = history.redo(undone as Workflow);
		expect(redone?.references).toHaveLength(0);
		const again = history.undo(redone as Workflow);
		expect(again?.references[0].data.out_0).toBe("hello");
	});

	test("drops session-bound media, which the delete already revoked", () => {
		const history = create_history();
		history.reset(
			wf([
				textNode("n1", { name: "cat.png", url: "blob:abc", mime: "image/png" })
			])
		);
		const deleted = wf([]);
		history.record(deleted);

		const restored = history.undo(deleted);
		expect(restored?.references[0].data.out_0).toBeUndefined();
	});
});
