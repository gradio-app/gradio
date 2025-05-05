import { apply_diff } from "../utils/stream";
import { it, expect, describe } from "vitest";

describe("apply_diff", () => {
	it("delete_operation_works", () => {
		const data = [
			{ content: "Hi", role: "user" },
			{ content: "How can I assist you?", role: "assistant" }
		];
		const diff: any = [
			["delete", [0], null],
			["delete", [1], null]
		];
		const result = apply_diff(data, diff);
		expect(result).toEqual([]);
	});
});
