import { describe, test, expect } from "vitest";
import {
	make_cell_id,
	make_header_id,
	process_data,
	make_headers
} from "./table_utils";

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
			for (let col = 0; col < 10; col++) {
				id_set.add(make_header_id(col));
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
				[2, "fixed"],
				[2, "fixed"],
				["A", "B"],
				true,
				element_refs,
				data_binding
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
				[2, "fixed"],
				[2, "fixed"],
				["A", "B"],
				false,
				element_refs,
				data_binding
			);

			expect(test_result.length).toBe(2);
			expect(test_result[0].length).toBe(2);
			expect(test_result[0][0].value).toBe("1");
			expect(test_result[0][1].value).toBe("2");
		});

		test("handles empty data", () => {
			const test_result = process_data(
				[],
				[0, "dynamic"],
				[0, "dynamic"],
				[],
				false,
				element_refs,
				data_binding
			);

			expect(test_result.length).toBe(0);
		});
	});

	describe("make_headers", () => {
		const element_refs: Record<string, { cell: null; input: null }> = {};

		test("adds empty column for row numbers", () => {
			const test_result = make_headers(
				["A", "B"],
				true,
				[2, "fixed"],
				element_refs
			);

			expect(test_result.length).toBe(3);
			expect(test_result[0].value).toBe("");
			expect(test_result[1].value).toBe("A");
			expect(test_result[2].value).toBe("B");
		});

		test("handles empty headers with fixed columns", () => {
			const test_result = make_headers([], false, [3, "fixed"], element_refs);

			expect(test_result.length).toBe(3);
			expect(
				test_result.every((header) => typeof header.value === "string")
			).toBe(true);
		});
	});
});
