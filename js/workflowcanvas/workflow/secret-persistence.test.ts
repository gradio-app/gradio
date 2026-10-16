import { test, expect } from "vitest";
import {
	apply_secrets,
	extract_secrets,
	load_secrets,
	save_secrets
} from "./secret-persistence";
import { sanitize_for_save } from "./workflow-store";
import type { Workflow } from "./workflow-types";

const graph = (key: string, inline: string, keyDefault?: string) =>
	({
		name: "Test",
		references: [
			{
				id: "key",
				type: "password",
				inputs: [],
				outputs: [{ id: "out" }],
				data: { out: key }
			}
		],
		operators: [
			{
				id: "op",
				inputs: [{ id: "in_api_key", default_value: keyDefault }],
				outputs: [],
				data: { in_api_key: inline }
			}
		],
		subjects: [],
		edges: []
	}) as unknown as Workflow;

test("secrets never reach workflow.json", () => {
	const saved = JSON.parse(
		JSON.stringify(sanitize_for_save(graph("sk-1", "sk-2", "sk-3")))
	);
	expect(saved.references[0].data).toEqual({});
	expect(saved.operators[0].data).toEqual({});
	expect(saved.operators[0].inputs[0].default_value).toBeUndefined();
});

test("secrets round-trip through the viewer's storage", () => {
	const m = new Map<string, string>();
	const storage = {
		getItem: (k: string) => m.get(k) ?? null,
		setItem: (k: string, v: string) => void m.set(k, v)
	} as unknown as Storage;
	save_secrets("Test", extract_secrets(graph("sk-1", "sk-2")), storage);

	const restored = apply_secrets(graph("", ""), load_secrets("Test", storage));
	expect(restored.references[0].data.out).toBe("sk-1");
	expect(restored.operators[0].data.in_api_key).toBe("sk-2");
});
