import { afterEach, describe, expect, test } from "vitest";
import { execute_custom_js } from "./custom_js";

declare global {
	var custom_js_result: string | undefined;
}

afterEach(() => {
	delete globalThis.custom_js_result;
});

describe("execute_custom_js", () => {
	test("invokes a function expression", async () => {
		await execute_custom_js(
			"() => { globalThis.custom_js_result = 'function'; }"
		);

		expect(globalThis.custom_js_result).toBe("function");
	});

	test("awaits an async function expression", async () => {
		await execute_custom_js(
			"async () => { await Promise.resolve(); globalThis.custom_js_result = 'async'; }"
		);

		expect(globalThis.custom_js_result).toBe("async");
	});

	test("executes raw JavaScript", async () => {
		await execute_custom_js(
			"const result = 'raw'; globalThis.custom_js_result = result;"
		);

		expect(globalThis.custom_js_result).toBe("raw");
	});
});
