import { describe, test, expect } from "vitest";
import { make_cell_id, make_header_id } from "./table_utils";
import { process_data, make_headers } from "./data_processing";

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
					["3", "4"]
				],
				element_refs,
				data_binding,
				make_id
			);

			expect(test_result[0].map((item) => item.value)).toEqual(["1", "2"]);
			expect(test_result).toHaveLength(2);
		});

		test("processes data without row numbers", () => {
			const test_result = process_data(
				[
					["1", "2"],
					["3", "4"]
				],
				element_refs,
				data_binding,
				make_id
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
