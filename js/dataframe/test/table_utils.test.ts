import { describe, test, expect } from "vitest";
import { make_cell_id, make_header_id } from "../shared/utils/table_utils";
import { process_data, make_headers } from "../shared/utils/data_processing";
import { cast_value_to_type } from "../shared/utils/utils";

function make_id(): string {
	return Math.random().toString(36).substring(2, 15);
}

describe("table_utils", () => {
	describe("id generation", () => {
		test("generates unique cell ids", () => {
			const id_set = new Set();
			for (let row = 0; row < 10; row++) {
				for (let col = 0; col < 10; col++) {
					id_set.add(make_cell_id(row, col));
				}
			}
			expect(id_set.size).toBe(100);
		});

		test("generates unique header ids", () => {
			const id_set = new Set();
			for (let i = 0; i < 10; i++) {
				id_set.add(make_header_id(i));
			}
			expect(id_set.size).toBe(10);
		});
	});

	describe("process_data", () => {
		const element_refs: Record<string, { cell: null; input: null }> = {};
		const data_binding: Record<string, { value: string | number; id: string }> =
			{};

		test("processes data with row numbers", () => {
			const test_result = process_data(
				[
					["1", "2"],
					["3", "4"],
				],
				element_refs,
				data_binding,
				make_id,
			);

			expect(test_result[0].map((item) => item.value)).toEqual(["1", "2"]);
			expect(test_result).toHaveLength(2);
		});

		test("processes data without row numbers", () => {
			const test_result = process_data(
				[
					["1", "2"],
					["3", "4"],
				],
				element_refs,
				data_binding,
				make_id,
			);

			expect(test_result.length).toBe(2);
			expect(test_result[0].length).toBe(2);
			expect(test_result[0][0].value).toBe("1");
			expect(test_result[0][1].value).toBe("2");
		});

		test("handles empty data", () => {
			const test_result = process_data([], element_refs, data_binding, make_id);

			expect(test_result.length).toBe(0);
		});
	});

	describe("make_headers", () => {
		test("creates headers with ids when headers are provided", () => {
			const els = {};
			const headers = ["Name", "Age", "City"];
			const col_count: [number, "fixed" | "dynamic"] = [3, "fixed"];

			const result = make_headers(headers, col_count, els, make_id);

			expect(result.length).toBe(3);
			expect(result[0].value).toBe("Name");
			expect(result[1].value).toBe("Age");
			expect(result[2].value).toBe("City");
			expect(result[0].id).toBeDefined();
			expect(result[1].id).toBeDefined();
			expect(result[2].id).toBeDefined();
			expect(Object.keys(els).length).toBe(3);
		});

		test("fills missing headers when col_count is fixed", () => {
			const els = {};
			const headers = ["Name", "Age"];
			const col_count: [number, "fixed" | "dynamic"] = [4, "fixed"];

			const result = make_headers(headers, col_count, els, make_id);

			expect(result.length).toBe(4);
			expect(result[0].value).toBe("Name");
			expect(result[1].value).toBe("Age");
			expect(result[2].value).toBe("2");
			expect(result[3].value).toBe("3");
			expect(Object.keys(els).length).toBe(4);
		});

		test("creates default headers when no headers are provided", () => {
			const els = {};
			const headers = [];
			const col_count: [number, "fixed" | "dynamic"] = [3, "fixed"];

			const result = make_headers(headers, col_count, els, make_id);

			expect(result.length).toBe(3);
			expect(result[0].value).toBe("0");
			expect(result[1].value).toBe("1");
			expect(result[2].value).toBe("2");
			expect(Object.keys(els).length).toBe(3);
		});

		test("handles null values in headers", () => {
			const els = {};
			const headers = ["Name", null, "City"] as any;
			const col_count: [number, "fixed" | "dynamic"] = [3, "fixed"];

			const result = make_headers(headers, col_count, els, make_id);

			expect(result.length).toBe(3);
			expect(result[0].value).toBe("Name");
			expect(result[1].value).toBe("");
			expect(result[2].value).toBe("City");
			expect(Object.keys(els).length).toBe(3);
		});
	});
});

describe("cast_value_to_type", () => {
	test("casts to number", () => {
		expect(cast_value_to_type("42", "number")).toBe(42);
		expect(cast_value_to_type(3.14, "number")).toBe(3.14);
		expect(cast_value_to_type("not a number", "number")).toBe("not a number");
	});
	test("casts to bool", () => {
		expect(cast_value_to_type("True", "bool")).toBe(true);
		expect(cast_value_to_type("False", "bool")).toBe(false);
		expect(cast_value_to_type(1, "bool")).toBe(true);
		expect(cast_value_to_type(0, "bool")).toBe(false);
		expect(cast_value_to_type("1", "bool")).toBe(true);
		expect(cast_value_to_type("0", "bool")).toBe(false);
		expect(cast_value_to_type("yes", "bool")).toBe("yes");
		expect(cast_value_to_type("no", "bool")).toBe("no");
		expect(cast_value_to_type("on", "bool")).toBe("on");
		expect(cast_value_to_type("off", "bool")).toBe("off");
		expect(cast_value_to_type("random", "bool")).toBe("random");
	});
	test("casts to date", () => {
		const result = cast_value_to_type("2023-01-01", "date");
		expect(result).toBe("2023-01-01T00:00:00.000Z");
		expect(typeof cast_value_to_type("not a date", "date")).toBe("string");
	});
	test("returns value as-is for str", () => {
		expect(cast_value_to_type("hello", "str")).toBe("hello");
		expect(cast_value_to_type(123, "str")).toBe(123);
	});
});
