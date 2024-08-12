import { describe, test, expect, vi } from "vitest";
import { spy } from "tinyspy";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { client_return } from "@gradio/client";
import { Dependency, TargetMap } from "./types";
import {
	process_frontend_fn,
	create_target_meta,
	determine_interactivity,
	process_server_fn,
	get_component
} from "./init";

describe("process_frontend_fn", () => {
	test("empty source code returns null", () => {
		const source = "";

		const fn = process_frontend_fn(source, false, 1, 1);
		expect(fn).toBe(null);
	});

	test("falsey source code returns null: false", () => {
		const source = false;

		const fn = process_frontend_fn(source, false, 1, 1);
		expect(fn).toBe(null);
	});

	test("falsey source code returns null: undefined", () => {
		const source = undefined;

		const fn = process_frontend_fn(source, false, 1, 1);
		expect(fn).toBe(null);
	});

	test("falsey source code returns null: null", () => {
		const source = null;

		const fn = process_frontend_fn(source, false, 1, 1);
		expect(fn).toBe(null);
	});

	test("source code returns a function", () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, false, 1, 1);
		expect(typeof fn).toBe("function");
	});

	test("arrays of values can be passed to the generated function", async () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, false, 1, 1);
		if (fn) {
			await expect(fn([1])).resolves.toEqual([1]);
		}
	});

	test("arrays of many values can be passed", async () => {
		const source = "(...args) => args";

		const fn = process_frontend_fn(source, false, 1, 1);
		if (fn) {
			await expect(fn([1, 2, 3, 4, 5, 6])).resolves.toEqual([1, 2, 3, 4, 5, 6]);
		}
	});

	test("The generated function returns a promise", () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, false, 1, 1);
		if (fn) {
			expect(fn([1])).toBeInstanceOf(Promise);
		}
	});

	test("The generated function is callable and returns the expected value", async () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, false, 1, 1);
		if (fn) {
			await expect(fn([1])).resolves.toEqual([1]);
		}
	});

	test("The return value of the function is wrapped in an array if there is no backend function and the input length is 1", async () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, false, 1, 1);
		if (fn) {
			await expect(fn([1])).resolves.toEqual([1]);
		}
	});

	test("The return value of the function is not wrapped in an array if there is no backend function and the input length is greater than 1", async () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, false, 2, 2);
		if (fn) {
			await expect(fn([1])).resolves.toEqual(1);
		}
	});

	test("The return value of the function is wrapped in an array if there is a backend function and the input length is 1", async () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, true, 1, 1);
		if (fn) {
			await expect(fn([1])).resolves.toEqual([1]);
		}
	});

	test("The return value of the function is not wrapped in an array if there is a backend function and the input length is greater than 1", async () => {
		const source = "(arg) => arg";

		const fn = process_frontend_fn(source, true, 2, 2);
		if (fn) {
			await expect(fn([1])).resolves.toEqual(1);
		}
	});
});

describe("create_target_meta", () => {
	test("creates a target map", () => {
		const targets: Dependency["targets"] = [
			[1, "change"],
			[2, "input"],
			[3, "load"]
		];
		const fn_index = 0;
		const target_map = {};

		const result = create_target_meta(targets, fn_index, target_map);
		expect(result).toEqual({
			1: { change: [0] },
			2: { input: [0] },
			3: { load: [0] }
		});
	});

	test("if the target already exists, it adds the new trigger to the list", () => {
		const targets: Dependency["targets"] = [
			[1, "change"],
			[1, "input"],
			[1, "load"]
		];
		const fn_index = 1;
		const target_map: TargetMap = {
			1: { change: [0] }
		};

		const result = create_target_meta(targets, fn_index, target_map);
		expect(result).toEqual({
			1: { change: [0, 1], input: [1], load: [1] }
		});
	});

	test("if the trigger already exists, it adds the new function to the list", () => {
		const targets: Dependency["targets"] = [
			[1, "change"],
			[2, "change"],
			[3, "change"]
		];
		const fn_index = 1;
		const target_map: TargetMap = {
			1: { change: [0] },
			2: { change: [0] },
			3: { change: [0] }
		};

		const result = create_target_meta(targets, fn_index, target_map);
		expect(result).toEqual({
			1: { change: [0, 1] },
			2: { change: [0, 1] },
			3: { change: [0, 1] }
		});
	});

	test("if the target and trigger already exist, it adds the new function to the list", () => {
		const targets: Dependency["targets"] = [[1, "change"]];
		const fn_index = 1;
		const target_map: TargetMap = {
			1: { change: [0] }
		};

		const result = create_target_meta(targets, fn_index, target_map);
		expect(result).toEqual({
			1: { change: [0, 1] }
		});
	});

	test("if the target, trigger and function id already exist, it does not add duplicates", () => {
		const targets: Dependency["targets"] = [[1, "change"]];
		const fn_index = 0;
		const target_map: TargetMap = {
			1: { change: [0] }
		};

		const result = create_target_meta(targets, fn_index, target_map);
		expect(result).toEqual({
			1: { change: [0] }
		});
	});
});

describe("determine_interactivity", () => {
	test("returns true if the prop is interactive = true", () => {
		const result = determine_interactivity(
			0,
			true,
			"hi",
			new Set([0]),
			new Set([2])
		);
		expect(result).toBe(true);
	});

	test("returns false if the prop is interactive = false", () => {
		const result = determine_interactivity(
			0,
			false,
			"hi",
			new Set([0]),
			new Set([2])
		);
		expect(result).toBe(false);
	});

	test("returns true if the component is an input", () => {
		const result = determine_interactivity(
			0,
			undefined,
			"hi",
			new Set([0]),
			new Set([2])
		);
		expect(result).toBe(true);
	});

	test("returns true if the component is not an input or output and the component has no default value: empty string", () => {
		const result = determine_interactivity(
			2,
			undefined,
			"",
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(true);
	});

	test("returns true if the component is not an input or output and the component has no default value: empty array", () => {
		const result = determine_interactivity(
			2,
			undefined,
			[],
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(true);
	});

	test("returns true if the component is not an input or output and the component has no default value: boolean", () => {
		const result = determine_interactivity(
			2,
			undefined,
			false,
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(true);
	});

	test("returns true if the component is not an input or output and the component has no default value: undefined", () => {
		const result = determine_interactivity(
			2,
			undefined,
			undefined,
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(true);
	});

	test("returns true if the component is not an input or output and the component has no default value: null", () => {
		const result = determine_interactivity(
			2,
			undefined,
			null,
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(true);
	});

	test("returns true if the component is not an input or output and the component has no default value: 0", () => {
		const result = determine_interactivity(
			2,
			undefined,
			0,
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(true);
	});

	test("returns false if the component is not an input or output and the component has a default value", () => {
		const result = determine_interactivity(
			2,
			undefined,
			"hello",
			new Set([0]),
			new Set([1])
		);
		expect(result).toBe(false);
	});
});

describe("process_server_fn", () => {
	test("returns an object", () => {
		const result = process_server_fn(1, ["fn1", "fn2"], {} as any);
		expect(result).toBeTypeOf("object");
	});

	test("returns an object with the correct keys", () => {
		const result = process_server_fn(1, ["fn1", "fn2"], {} as any);
		expect(Object.keys(result)).toEqual(["fn1", "fn2"]);
	});

	test("returns an object with the correct keys and values", () => {
		const app = {
			component_server: async (id: number, fn: string, args: any) => {
				return args;
			}
		} as client_return;

		const result = process_server_fn(1, ["fn1", "fn2"], app);
		expect(Object.keys(result)).toEqual(["fn1", "fn2"]);

		expect(result.fn1).toBeInstanceOf(Function);
		expect(result.fn2).toBeInstanceOf(Function);
	});

	test("returned server functions should resolve to a promise", async () => {
		const app = {
			component_server: async (id: number, fn: string, args: any) => {
				return args;
			}
		} as client_return;

		const result = process_server_fn(1, ["fn1", "fn2"], app);
		const response = result.fn1("hello");
		expect(response).toBeInstanceOf(Promise);
	});

	test("the functions call the clients component_server function with the correct arguments ", async () => {
		const mock = spy(async (id: number, fn: string, args: any) => {
			return args;
		});
		const app = {
			component_server: mock as any
		} as client_return;

		const result = process_server_fn(1, ["fn1", "fn2"], app as client_return);
		const response = await result.fn1("hello");
		expect(response).toBe("hello");
		expect(mock.calls).toEqual([[1, "fn1", "hello"]]);
	});

	test("if there are no server functions, it returns an empty object", () => {
		const result = process_server_fn(1, undefined, {} as any);
		expect(result).toEqual({});
	});
});

describe("get_component", () => {
	test("returns an object", () => {
		const result = get_component("test-component-one", "class_id", "root", []);
		expect(result.component).toBeTypeOf("object");
	});

	test("returns an object with the correct keys", () => {
		const result = get_component("test-component-one", "class_id", "root", []);
		expect(Object.keys(result)).toEqual([
			"component",
			"name",
			"example_components"
		]);
	});

	test("the component key is a promise", () => {
		const result = get_component("test-component-one", "class_id", "root", []);
		expect(result.component).toBeInstanceOf(Promise);
	});

	test("the resolved component key is an object", async () => {
		const result = get_component("test-component-one", "class_id", "root", []);
		const o = await result.component;

		expect(o).toBeTypeOf("object");
	});

	test("getting the same component twice should return the same promise", () => {
		const result = get_component("test-component-one", "class_id", "root", []);
		const result_two = get_component(
			"test-component-one",
			"class_id",
			"root",
			[]
		);

		expect(result.component).toBe(result_two.component);
	});

	test("if example components are not provided, the  example_components key is undefined", async () => {
		const result = get_component("dataset", "class_id", "root", []);
		expect(result.example_components).toBe(undefined);
	});

	test("if the type is not a dataset, the  example_components key is undefined", async () => {
		const result = get_component("test-component-one", "class_id", "root", []);
		expect(result.example_components).toBe(undefined);
	});

	test("when the type is a dataset, returns an object with the correct keys and values and example components", () => {
		const result = get_component(
			"dataset",
			"class_id",
			"root",
			[
				{
					type: "test-component-one",
					component_class_id: "example_class_id",
					id: 1,
					props: {
						value: "hi",
						interactive: false
					},
					has_modes: false,
					instance: {} as any,
					component: {} as any
				}
			],
			["test-component-one"]
		);
		expect(result.component).toBeTypeOf("object");
		expect(result.example_components).toBeInstanceOf(Map);
	});

	test("when example components are returned, returns an object with the correct keys and values and example components", () => {
		const result = get_component(
			"dataset",
			"class_id",
			"root",
			[
				{
					type: "test-component-one",
					component_class_id: "example_class_id",
					id: 1,
					props: {
						value: "hi",
						interactive: false
					},
					has_modes: false,
					instance: {} as any,
					component: {} as any
				}
			],
			["test-component-one"]
		);
		expect(result.example_components?.get("test-component-one")).toBeTypeOf(
			"object"
		);
		expect(result.example_components?.get("test-component-one")).toBeInstanceOf(
			Promise
		);
	});

	test("if the component is not found then it should request the component from the server", async () => {
		const api_url = "example.com";
		const id = "test-random";
		const variant = "component";
		const handlers = [
			http.get(`${api_url}/custom_component/${id}/${variant}/style.css`, () => {
				return new HttpResponse('console.log("boo")', {
					status: 200,
					headers: {
						"Content-Type": "text/css"
					}
				});
			})
		];

		// vi.mock calls are always hoisted out of the test function to the top of the file
		// so we need to use vi.hoisted to hoist the mock function above the vi.mock call
		const { mock } = vi.hoisted(() => {
			return { mock: vi.fn() };
		});

		vi.mock(
			`example.com/custom_component/test-random/component/index.js`,
			async () => {
				mock();
				return {
					default: {
						default: "HELLO"
					}
				};
			}
		);

		const server = setupServer(...handlers);
		server.listen();

		await get_component("test-random", id, api_url, []).component;

		expect(mock).toHaveBeenCalled();

		server.close();
	});
});
