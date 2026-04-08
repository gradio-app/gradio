import { test, describe, beforeEach, afterEach, expect } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import { encrypt, decrypt } from "./crypto";

import BrowserState from "./Index.svelte";

const STORAGE_KEY = "gr-test-storage-key";
const SECRET = "test-secret-key";

const base_props = {
	storage_key: STORAGE_KEY,
	secret: SECRET,
	default_value: null,
	value: null
};

describe("BrowserState: mount — empty localStorage", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("renders without errors", async () => {
		await render(BrowserState, base_props);
	});

	test("get_data returns null default_value when localStorage is empty", async () => {
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: null,
			value: null
		});
		expect((await get_data()).value).toBeNull();
	});

	test("get_data returns string default_value when localStorage is empty", async () => {
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: "hello world",
			value: "hello world"
		});
		expect((await get_data()).value).toBe("hello world");
	});

	test("get_data returns number default_value when localStorage is empty", async () => {
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: 42,
			value: 42
		});
		expect((await get_data()).value).toBe(42);
	});

	test("get_data returns object default_value when localStorage is empty", async () => {
		const default_value = { username: "", password: "" };
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value,
			value: default_value
		});
		expect((await get_data()).value).toEqual({ username: "", password: "" });
	});

	test("get_data returns array default_value when localStorage is empty", async () => {
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: [1, 2, 3],
			value: [1, 2, 3]
		});
		expect((await get_data()).value).toEqual([1, 2, 3]);
	});

	test("no spurious change event on mount when localStorage is empty and value matches default_value", async () => {
		const { listen } = await render(BrowserState, {
			...base_props,
			default_value: null,
			value: null
		});
		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});
});

describe("BrowserState: mount — with stored value", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("loads and decrypts an object stored in localStorage on mount", async () => {
		const stored = { username: "alice", password: "hunter2" };
		localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(stored), SECRET));

		const { get_data } = await render(BrowserState, base_props);
		expect((await get_data()).value).toEqual(stored);
	});

	test("loads and decrypts a string value from localStorage on mount", async () => {
		localStorage.setItem(
			STORAGE_KEY,
			encrypt(JSON.stringify("stored-string"), SECRET)
		);

		const { get_data } = await render(BrowserState, base_props);
		expect((await get_data()).value).toBe("stored-string");
	});

	test("loads and decrypts a numeric value from localStorage on mount", async () => {
		localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(99), SECRET));

		const { get_data } = await render(BrowserState, base_props);
		expect((await get_data()).value).toBe(99);
	});

	test("dispatches change on mount when the loaded value differs from the initial value prop", async () => {
		const stored = { user: "alice" };
		localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(stored), SECRET));

		// initial value: null — stored value: { user: "alice" } — these differ → change fires
		const { listen } = await render(BrowserState, {
			...base_props,
			value: null
		});
		const change = listen("change", { retrospective: true });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("falls back to default_value when localStorage contains corrupted data", async () => {
		localStorage.setItem(STORAGE_KEY, "not:valid:encrypted:at:all");

		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: "fallback",
			value: "fallback"
		});
		expect((await get_data()).value).toBe("fallback");
	});

	test("falls back to default_value when stored data was encrypted with a different secret", async () => {
		const stored = { key: "value" };
		localStorage.setItem(
			STORAGE_KEY,
			encrypt(JSON.stringify(stored), "different-secret")
		);

		// Using the original SECRET — decryption produces garbled output → JSON.parse fails → fallback
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: "fallback",
			value: "fallback"
		});
		expect((await get_data()).value).toBe("fallback");
	});

	test("falls back to default_value when stored data decrypts to invalid JSON", async () => {
		localStorage.setItem(STORAGE_KEY, encrypt("not-valid-json-{{{", SECRET));

		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: "fallback",
			value: "fallback"
		});
		expect((await get_data()).value).toBe("fallback");
	});
});

describe("BrowserState: get_data / set_data", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("get_data returns the initial value when localStorage is empty", async () => {
		const { get_data } = await render(BrowserState, {
			...base_props,
			default_value: "initial",
			value: "initial"
		});
		expect((await get_data()).value).toBe("initial");
	});

	test("set_data then get_data round-trips a string", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		await set_data({ value: "hello world" });
		expect((await get_data()).value).toBe("hello world");
	});

	test("set_data then get_data round-trips an object", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		await set_data({ value: { name: "alice", age: 30 } });
		expect((await get_data()).value).toEqual({ name: "alice", age: 30 });
	});

	test("set_data then get_data round-trips an array", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		await set_data({ value: [1, "two", true] });
		expect((await get_data()).value).toEqual([1, "two", true]);
	});

	test("set_data then get_data round-trips a number", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		await set_data({ value: 42 });
		expect((await get_data()).value).toBe(42);
	});

	test("set_data then get_data round-trips boolean true", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		await set_data({ value: true });
		expect((await get_data()).value).toBe(true);
	});

	test("set_data then get_data round-trips null", async () => {
		const { get_data, set_data } = await render(BrowserState, {
			...base_props,
			default_value: "start",
			value: "start"
		});
		await set_data({ value: null });
		expect((await get_data()).value).toBeNull();
	});

	test("set_data then get_data round-trips a deeply nested object", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		const nested = { a: { b: { c: [1, 2, { d: "deep" }] } } };
		await set_data({ value: nested });
		expect((await get_data()).value).toEqual(nested);
	});

	test("multiple sequential set_data calls — last value wins", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		await set_data({ value: "first" });
		await set_data({ value: "second" });
		await set_data({ value: "third" });
		expect((await get_data()).value).toBe("third");
	});
});

describe("BrowserState: localStorage persistence", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("saves a value to localStorage after set_data", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: "persist me" });
		expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
	});

	test("stored value is encrypted — not plain JSON", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: "plain text" });
		const stored = localStorage.getItem(STORAGE_KEY)!;
		expect(stored).not.toBe(JSON.stringify("plain text"));
		expect(stored).not.toBe("plain text");
	});

	test("stored value can be decrypted back to the original using the correct secret", async () => {
		const original = { user: "alice", score: 99 };
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: original });
		const stored = localStorage.getItem(STORAGE_KEY)!;
		expect(JSON.parse(decrypt(stored, SECRET))).toEqual(original);
	});

	test("value persists across component instances (full round-trip)", async () => {
		const saved = { session: "active", user: "bob" };
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: saved });
		cleanup();

		// Second instance loads from the same key
		const { get_data } = await render(BrowserState, base_props);
		expect((await get_data()).value).toEqual(saved);
	});

	test("different storage_key values use separate localStorage slots", async () => {
		const { set_data: set1 } = await render(BrowserState, {
			...base_props,
			storage_key: "slot-A"
		});
		const { set_data: set2 } = await render(BrowserState, {
			...base_props,
			storage_key: "slot-B"
		});
		await set1({ value: "value-for-A" });
		await set2({ value: "value-for-B" });

		expect(localStorage.getItem("slot-A")).not.toBeNull();
		expect(localStorage.getItem("slot-B")).not.toBeNull();
		expect(localStorage.getItem("slot-A")).not.toBe(
			localStorage.getItem("slot-B")
		);
	});

	test("data written to one storage_key is not read when using a different key", async () => {
		const { set_data } = await render(BrowserState, {
			...base_props,
			storage_key: "key-one"
		});
		await set_data({ value: "stored-in-one" });
		cleanup();

		const { get_data } = await render(BrowserState, {
			...base_props,
			storage_key: "key-two",
			default_value: "fallback",
			value: "fallback"
		});
		expect((await get_data()).value).toBe("fallback");
	});

	test("null value is NOT saved to localStorage", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: null });
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});

	test("empty string is NOT saved to localStorage", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: "" });
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});

	test("number zero is NOT saved to localStorage", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: 0 });
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});

	test("false is NOT saved to localStorage", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: false });
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
	});

	test("empty object IS saved (objects are truthy)", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: {} });
		expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
	});

	test("empty array IS saved (arrays are truthy)", async () => {
		const { set_data } = await render(BrowserState, base_props);
		await set_data({ value: [] });
		expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
	});
});

describe("Events: change", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("fires when value changes via set_data", async () => {
		const { listen, set_data } = await render(BrowserState, base_props);
		const change = listen("change");
		await set_data({ value: "new value" });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("fires with no data payload (change event type is never)", async () => {
		const { listen, set_data } = await render(BrowserState, base_props);
		const change = listen("change");
		await set_data({ value: "hello" });
		expect(change).toHaveBeenCalledWith(undefined);
	});

	test("does not fire on mount when localStorage is empty and value matches default_value", async () => {
		const { listen } = await render(BrowserState, {
			...base_props,
			default_value: null,
			value: null
		});
		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("fires when value is loaded from localStorage on mount (loaded value differs from initial prop)", async () => {
		localStorage.setItem(
			STORAGE_KEY,
			encrypt(JSON.stringify("stored"), SECRET)
		);
		// value: null initially — stored value is "stored" — they differ → change fires on mount
		const { listen } = await render(BrowserState, {
			...base_props,
			value: null
		});
		const change = listen("change", { retrospective: true });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("fires once for each distinct value change", async () => {
		const { listen, set_data } = await render(BrowserState, base_props);
		const change = listen("change");
		await set_data({ value: "first" });
		await set_data({ value: "second" });
		await set_data({ value: "third" });
		expect(change).toHaveBeenCalledTimes(3);
	});

	test("does not fire redundantly when set_data is called with the same string twice", async () => {
		const { listen, set_data } = await render(BrowserState, base_props);
		const change = listen("change");
		await set_data({ value: "hello" });
		await set_data({ value: "hello" }); // same primitive — Svelte won't re-trigger the effect
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("fires for null value — falsy values still dispatch change even though they are not saved", async () => {
		const { listen, set_data } = await render(BrowserState, {
			...base_props,
			default_value: "start",
			value: "start"
		});
		const change = listen("change");
		await set_data({ value: null });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("fires when a new object reference is set even if its content is identical (reference equality)", async () => {
		// The component uses !== (reference equality) to detect changes.
		// Two distinct object references with the same shape are considered different.
		// This test documents the current behaviour — if deep equality (dequal) is added,
		// this test would need to be updated to expect 1 call instead of 2.
		const { listen, set_data } = await render(BrowserState, base_props);
		const change = listen("change");
		await set_data({ value: { key: "val" } }); // Object A
		await set_data({ value: { key: "val" } }); // Object B — different reference, same content
		expect(change).toHaveBeenCalledTimes(2);
	});
});

describe("Props: secret", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("data encrypted with secret A cannot be read by a component using secret B", async () => {
		const { set_data } = await render(BrowserState, {
			...base_props,
			secret: "secret-A"
		});
		await set_data({ value: { sensitive: "data" } });
		cleanup();

		// Second instance uses a different secret — decryption fails → fallback
		const { get_data } = await render(BrowserState, {
			...base_props,
			secret: "secret-B",
			default_value: "fallback",
			value: "fallback"
		});
		expect((await get_data()).value).toBe("fallback");
	});
});

describe("Edge cases", () => {
	beforeEach(() => localStorage.clear());
	afterEach(() => cleanup());

	test("handles special characters and unicode in stored values", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		const unicode = { greeting: "héllo wörld 🎉", japanese: "日本語" };
		await set_data({ value: unicode });
		expect((await get_data()).value).toEqual(unicode);
	});

	test("handles large data payloads without truncation", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		const large = { data: "x".repeat(5_000) };
		await set_data({ value: large });
		expect((await get_data()).value).toEqual(large);
	});

	test("handles deeply nested objects", async () => {
		const { get_data, set_data } = await render(BrowserState, base_props);
		const nested = { a: { b: { c: { d: { e: [1, 2, { f: "deep" }] } } } } };
		await set_data({ value: nested });
		expect((await get_data()).value).toEqual(nested);
	});
});

test.todo(
	"VISUAL: BrowserState renders no visible UI — Playwright visual regression screenshot should confirm no DOM leakage in the rendered page"
);
