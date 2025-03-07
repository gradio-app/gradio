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
});
