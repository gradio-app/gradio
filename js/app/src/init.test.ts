import { describe, test, assert, expect } from "vitest";
import { process_frontend_fn } from "./init";

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
