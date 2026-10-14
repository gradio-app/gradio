import { describe, test, expect, beforeEach } from "vitest";
import {
	apply_secrets,
	extract_secrets,
	load_secrets,
	save_secrets
} from "./secret-persistence";
import { sanitize_for_save } from "./workflow-store";
import type { ReferenceNode, Workflow } from "./workflow-types";

class MemoryStorage implements Storage {
	private store = new Map<string, string>();
	get length(): number {
		return this.store.size;
	}
	key(i: number): string | null {
		return Array.from(this.store.keys())[i] ?? null;
	}
	getItem(k: string): string | null {
		return this.store.has(k) ? this.store.get(k)! : null;
	}
	setItem(k: string, v: string): void {
		this.store.set(k, v);
	}
	removeItem(k: string): void {
		this.store.delete(k);
	}
	clear(): void {
		this.store.clear();
	}
}

let storage: MemoryStorage;

beforeEach(() => {
	storage = new MemoryStorage();
});

function reference(id: string, value: string, secret?: boolean): ReferenceNode {
	return {
		id,
		role: "reference",
		label: secret ? "API Key" : "Text",
		asset_type: "text",
		...(secret ? { type: "password" as const } : {}),
		inputs: [],
		outputs: [{ id: "out", label: "Text", type: "text" }],
		data: { out: value },
		x: 0,
		y: 0,
		width: 220,
		height: 130
	};
}

function workflowWith(...references: ReferenceNode[]): Workflow {
	return {
		schema_version: "2",
		name: "Test",
		runtime: { default: "client" },
		references,
		operators: [],
		subjects: [],
		edges: [],
		view: { default: "canvas" }
	};
}

describe("secrets never reach workflow.json", () => {
	test("a secret node's value is stripped, a plain one's is kept", () => {
		const wf = workflowWith(
			reference("key", "sk-live-123", true),
			reference("prompt", "a cat", false)
		);
		const saved = sanitize_for_save(wf);
		expect(saved.references[0].data).toEqual({});
		expect(saved.references[1].data).toEqual({ out: "a cat" });
		// structural, so the node still opens masked
		expect(saved.references[0].type).toBe("password");
	});
});

describe("per-viewer mirror", () => {
	test("round-trips a secret back into the graph", () => {
		const wf = workflowWith(reference("key", "sk-live-123", true));
		save_secrets("Test", extract_secrets(wf), storage);

		// what a reload sees: the file, with no value in it
		const fromFile = workflowWith(reference("key", "", true));
		const restored = apply_secrets(fromFile, load_secrets("Test", storage));
		expect(restored.references[0].data.out).toBe("sk-live-123");
	});

	test("a non-secret node is never mirrored or restored", () => {
		const wf = workflowWith(reference("prompt", "a cat", false));
		expect(extract_secrets(wf)).toEqual({});
		expect(apply_secrets(wf, { prompt: "leaked" }).references[0].data.out).toBe(
			"a cat"
		);
	});

	test("clearing the last key leaves nothing behind", () => {
		save_secrets("Test", { key: "sk-live-123" }, storage);
		save_secrets("Test", {}, storage);
		expect(storage.length).toBe(0);
		expect(load_secrets("Test", storage)).toEqual({});
	});
});
