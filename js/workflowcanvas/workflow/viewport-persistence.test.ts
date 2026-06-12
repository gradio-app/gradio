import { describe, test, expect, beforeEach } from "vitest";
import {
	load_viewport,
	save_viewport,
	viewport_storage_key
} from "./viewport-persistence";

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

describe("viewport_storage_key", () => {
	test("namespaces by workflow name", () => {
		expect(viewport_storage_key("My Workflow")).toBe(
			"gradio_workflow_viewport:My Workflow"
		);
	});

	test("two workflows get separate keys", () => {
		expect(viewport_storage_key("a")).not.toBe(viewport_storage_key("b"));
	});
});

describe("load_viewport", () => {
	test("returns default when key is missing", () => {
		expect(load_viewport("blank", storage)).toEqual({
			x: 0,
			y: 0,
			zoom: 1
		});
	});

	test("returns stored value when present", () => {
		storage.setItem(
			viewport_storage_key("w"),
			JSON.stringify({ x: 100, y: -50, zoom: 1.5 })
		);
		expect(load_viewport("w", storage)).toEqual({
			x: 100,
			y: -50,
			zoom: 1.5
		});
	});

	test("returns default when stored value is invalid JSON", () => {
		storage.setItem(viewport_storage_key("w"), "not json {{");
		expect(load_viewport("w", storage)).toEqual({ x: 0, y: 0, zoom: 1 });
	});

	test("returns default when stored value has wrong shape", () => {
		storage.setItem(
			viewport_storage_key("w"),
			JSON.stringify({ x: "string", y: 0, zoom: 1 })
		);
		expect(load_viewport("w", storage)).toEqual({ x: 0, y: 0, zoom: 1 });
	});

	test("returns default when stored value is missing fields", () => {
		storage.setItem(
			viewport_storage_key("w"),
			JSON.stringify({ x: 1, y: 2 }) // no zoom
		);
		expect(load_viewport("w", storage)).toEqual({ x: 0, y: 0, zoom: 1 });
	});

	test("returns default when storage is undefined", () => {
		expect(load_viewport("w", undefined)).toEqual({ x: 0, y: 0, zoom: 1 });
	});

	test("returns a fresh object (callers can mutate without leaking back)", () => {
		const a = load_viewport("w", storage);
		const b = load_viewport("w", storage);
		expect(a).not.toBe(b);
	});
});

describe("save_viewport", () => {
	test("writes the viewport to storage under the namespaced key", () => {
		save_viewport("w", { x: 5, y: 6, zoom: 2 }, storage);
		expect(storage.getItem(viewport_storage_key("w"))).toBe(
			JSON.stringify({ x: 5, y: 6, zoom: 2 })
		);
	});

	test("overwrites existing entry", () => {
		save_viewport("w", { x: 1, y: 1, zoom: 1 }, storage);
		save_viewport("w", { x: 99, y: 99, zoom: 3 }, storage);
		expect(load_viewport("w", storage)).toEqual({ x: 99, y: 99, zoom: 3 });
	});

	test("no-op when storage is undefined", () => {
		expect(() =>
			save_viewport("w", { x: 1, y: 1, zoom: 1 }, undefined)
		).not.toThrow();
	});

	test("round-trips through load_viewport", () => {
		const viewport = { x: 42, y: -42, zoom: 0.75 };
		save_viewport("round-trip", viewport, storage);
		expect(load_viewport("round-trip", storage)).toEqual(viewport);
	});
});
