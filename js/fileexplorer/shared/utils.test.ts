import { describe, test, expect, beforeAll } from "vitest";
import { make_fs_store, type SerialisedNode } from "./utils";
import { get } from "svelte/store";
import exp from "constants";
import { e } from "vitest/dist/types-3c7dbfa5";

describe("fs_store", () => {
	let store: ReturnType<typeof make_fs_store>,
		n0: SerialisedNode,
		n1: SerialisedNode,
		n2: SerialisedNode,
		n3: SerialisedNode,
		n4: SerialisedNode,
		n5: SerialisedNode;
	beforeAll(() => {
		n4 = {
			type: "file",
			path: "d.txt",
			parent: null,
			children: []
		};
		n5 = {
			type: "file",
			path: "e.txt",
			parent: null,
			children: []
		};

		n3 = {
			type: "folder",
			path: "c",
			parent: null,
			children: [n4, n5]
		};

		n2 = {
			type: "folder",
			path: "b",
			parent: null,
			children: [n3]
		};

		n1 = {
			type: "folder",
			path: "a",
			parent: null,
			children: [n2]
		};

		n0 = {
			type: "file",
			path: "my-file.txt",
			parent: null,
			children: []
		};

		store = make_fs_store();
	});

	test("initialise store with correct references", () => {
		store.create_fs_graph([n1, n0]);

		const items = get(store);

		expect(items?.[0].last).toEqual(items?.[1]);
		expect(items?.[1].last).toEqual(items?.[1]);
		expect(items?.[1].previous).toEqual(items?.[0]);
		expect(items?.[0].previous).toEqual(null);
		expect(items?.[0].parent).toEqual(null);
		expect(items?.[0].children?.[0].parent).toEqual(items?.[0]);
	});

	test("set_checked_from_paths", () => {
		const checked_paths = [
			["a", "b", "c", "d.txt"],
			["a", "b", "c", "e.txt"]
		];
		const new_checked_paths = store.set_checked_from_paths(checked_paths);

		const items = get(store);

		expect(new_checked_paths).toEqual(checked_paths);
		expect(items?.[0].checked).toEqual(true);
	});

	test("set_checked_from_paths should be deterministic", () => {
		const checked_paths = [
			["a", "b", "c", "d.txt"],
			["a", "b", "c", "e.txt"]
		];
		const new_checked_paths = store.set_checked_from_paths(checked_paths);

		const items = get(store);

		expect(new_checked_paths).toEqual(checked_paths);
		expect(items?.[0].checked).toEqual(true);
	});

	test("set_checked should check the appropriate index", () => {
		const checked_indices = [0, 0, 0, 0];
		store.set_checked(checked_indices, false, [], "multiple");

		const items = get(store);

		expect(
			items?.[0].children?.[0].children?.[0].children?.[0].checked
		).toEqual(false);
	});

	test("if all children are set to false then all parents should also be false", () => {
		const checked_indices = [0, 0, 0, 1];
		store.set_checked(checked_indices, false, [], "multiple");

		const items = get(store);

		expect(
			items?.[0].children?.[0].children?.[0].children?.[0].checked
		).toEqual(false);
		expect(
			items?.[0].children?.[0].children?.[0].children?.[1].checked
		).toEqual(false);
		expect(items?.[0].children?.[0].children?.[0].checked).toEqual(false);
		expect(items?.[0].children?.[0].checked).toEqual(false);
		expect(items?.[0].checked).toEqual(false);
	});

	test("if only one child is set to true then parent should be false", () => {
		const checked_indices = [0, 0, 0, 1];
		store.set_checked(checked_indices, true, [], "multiple");

		const items = get(store);

		expect(
			items?.[0].children?.[0].children?.[0].children?.[0].checked
		).toEqual(false);
		expect(
			items?.[0].children?.[0].children?.[0].children?.[1].checked
		).toEqual(true);
		expect(items?.[0].children?.[0].children?.[0].checked).toEqual(false);
		expect(items?.[0].children?.[0].checked).toEqual(false);
		expect(items?.[0].checked).toEqual(false);
	});

	test("if all children are set to true then parents should be true", () => {
		const checked_indices = [0, 0, 0, 0];
		store.set_checked(checked_indices, true, [], "multiple");

		const items = get(store);

		expect(
			items?.[0].children?.[0].children?.[0].children?.[0].checked
		).toEqual(true);
		expect(
			items?.[0].children?.[0].children?.[0].children?.[1].checked
		).toEqual(true);
		expect(items?.[0].children?.[0].children?.[0].checked).toEqual(true);
		expect(items?.[0].children?.[0].checked).toEqual(true);
		expect(items?.[0].checked).toEqual(true);
	});

	test("calling set_checked multiple times should not impact other nodes", () => {
		store.set_checked([1], true, [], "multiple");
		expect(get(store)?.[1].checked).toEqual(true);

		store.set_checked([0], true, [], "multiple");
		expect(get(store)?.[1].checked).toEqual(true);

		store.set_checked([0], false, [], "multiple");
		expect(get(store)?.[1].checked).toEqual(true);

		store.set_checked([0], true, [], "multiple");
		expect(get(store)?.[1].checked).toEqual(true);

		store.set_checked([0], false, [], "multiple");
		expect(get(store)?.[1].checked).toEqual(true);

		const items = get(store);

		// expect(
		// 	items?.[0].children?.[0].children?.[0].children?.[0].checked
		// ).toEqual(true);
		// expect(
		// 	items?.[0].children?.[0].children?.[0].children?.[1].checked
		// ).toEqual(true);
		// expect(items?.[0].children?.[0].children?.[0].checked).toEqual(true);
		// expect(items?.[0].children?.[0].checked).toEqual(true);
		// expect(items?.[0].checked).toEqual(true);
	});
});
