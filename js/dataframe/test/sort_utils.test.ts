import { describe, test, expect } from "vitest";
import {
	get_sort_status,
	sort_data,
	type SortDirection
} from "../shared/utils/sort_utils";

describe("sort_utils", () => {
	describe("get_sort_status", () => {
		const headers = ["A", "B", "C"];

		test("returns none when no sort is active", () => {
			expect(get_sort_status("A", [], headers)).toBe("none");
		});

		test("returns ascending when column is sorted ascending", () => {
			expect(
				get_sort_status(
					"A",
					[{ col: 0, direction: "asc" as SortDirection }],
					headers
				)
			).toBe("asc");
		});

		test("returns descending when column is sorted descending", () => {
			expect(
				get_sort_status(
					"B",
					[{ col: 1, direction: "desc" as SortDirection }],
					headers
				)
			).toBe("desc");
		});

		test("returns none for non-matching column", () => {
			expect(
				get_sort_status(
					"A",
					[{ col: 1, direction: "asc" as SortDirection }],
					headers
				)
			).toBe("none");
		});

		test("handles multiple sort columns", () => {
			const sort_columns = [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "desc" as SortDirection }
			];
			expect(get_sort_status("A", sort_columns, headers)).toBe("asc");
			expect(get_sort_status("B", sort_columns, headers)).toBe("desc");
			expect(get_sort_status("C", sort_columns, headers)).toBe("none");
		});

		test("handles invalid column indices", () => {
			expect(
				get_sort_status(
					"A",
					[{ col: -1, direction: "asc" as SortDirection }],
					headers
				)
			).toBe("none");

			expect(
				get_sort_status(
					"A",
					[{ col: 999, direction: "asc" as SortDirection }],
					headers
				)
			).toBe("none");
		});

		test("handles empty headers", () => {
			expect(
				get_sort_status(
					"A",
					[{ col: 0, direction: "asc" as SortDirection }],
					[]
				)
			).toBe("none");
		});

		test("prioritizes first matching column in sort_columns", () => {
			const sort_columns = [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 0, direction: "desc" as SortDirection }
			];

			expect(get_sort_status("A", sort_columns, headers)).toBe("asc");
		});
	});

	describe("sort_data", () => {
		const data = [
			[
				{ id: "1", value: "B" },
				{ id: "2", value: 2 }
			],
			[
				{ id: "3", value: "A" },
				{ id: "4", value: 1 }
			],
			[
				{ id: "5", value: "C" },
				{ id: "6", value: 3 }
			]
		];

		test("sorts strings ascending", () => {
			const indices = sort_data(data, [
				{ col: 0, direction: "asc" as SortDirection }
			]);
			expect(indices).toEqual([1, 0, 2]); // A, B, C
		});

		test("sorts numbers ascending", () => {
			const indices = sort_data(data, [
				{ col: 1, direction: "asc" as SortDirection }
			]);
			expect(indices).toEqual([1, 0, 2]);
		});

		test("sorts strings descending", () => {
			const indices = sort_data(data, [
				{ col: 0, direction: "desc" as SortDirection }
			]);
			expect(indices).toEqual([2, 0, 1]);
		});

		test("returns original order when sort params are empty", () => {
			const indices = sort_data(data, []);
			expect(indices).toEqual([0, 1, 2]);
		});

		test("handles empty data", () => {
			const indices = sort_data(
				[],
				[{ col: 0, direction: "asc" as SortDirection }]
			);
			expect(indices).toEqual([]);
		});

		test("handles invalid column index", () => {
			const indices = sort_data(data, [
				{ col: 999, direction: "asc" as SortDirection }
			]);
			expect(indices).toEqual([0, 1, 2]);
		});

		test("sorts by multiple columns", () => {
			const test_data = [
				[
					{ id: "1", value: "A" },
					{ id: "2", value: 2 }
				],
				[
					{ id: "3", value: "A" },
					{ id: "4", value: 1 }
				],
				[
					{ id: "5", value: "B" },
					{ id: "6", value: 3 }
				]
			];

			const indices = sort_data(test_data, [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([1, 0, 2]);
		});

		test("respects sort direction for each column", () => {
			const test_data = [
				[
					{ id: "1", value: "A" },
					{ id: "2", value: 2 }
				],
				[
					{ id: "3", value: "A" },
					{ id: "4", value: 1 }
				],
				[
					{ id: "5", value: "B" },
					{ id: "6", value: 3 }
				]
			];

			const indices = sort_data(test_data, [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "desc" as SortDirection }
			]);

			expect(indices).toEqual([0, 1, 2]);
		});

		test("handles mixed data types in sort columns", () => {
			const mixed_data = [
				[
					{ id: "1", value: "A" },
					{ id: "2", value: 2 }
				],
				[
					{ id: "3", value: "A" },
					{ id: "4", value: 1 }
				],
				[
					{ id: "5", value: "B" },
					{ id: "6", value: 2 }
				]
			];

			const indices = sort_data(mixed_data, [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([1, 0, 2]);
		});

		test("handles more than two sort columns", () => {
			const complex_data = [
				[
					{ id: "1", value: "A" },
					{ id: "2", value: 1 },
					{ id: "3", value: "X" }
				],
				[
					{ id: "4", value: "A" },
					{ id: "5", value: 1 },
					{ id: "6", value: "Y" }
				],
				[
					{ id: "7", value: "B" },
					{ id: "8", value: 2 },
					{ id: "9", value: "Z" }
				]
			];

			const indices = sort_data(complex_data, [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "asc" as SortDirection },
				{ col: 2, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([0, 1, 2]);
		});

		test("ignores invalid sort columns", () => {
			const indices = sort_data(data, [
				{ col: -1, direction: "asc" as SortDirection },
				{ col: 0, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([1, 0, 2]);
		});

		test("maintains original order when all values are equal", () => {
			const equal_data = [
				[
					{ id: "1", value: "A" },
					{ id: "2", value: 1 }
				],
				[
					{ id: "3", value: "A" },
					{ id: "4", value: 1 }
				],
				[
					{ id: "5", value: "A" },
					{ id: "6", value: 1 }
				]
			];

			const indices = sort_data(equal_data, [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([0, 1, 2]);
		});

		test("handles undefined values in data rows", () => {
			const data_with_undefined = [
				[
					{ id: "1", value: "A" },
					{ id: "2", value: "" }
				],
				[
					{ id: "3", value: "B" },
					{ id: "4", value: 2 }
				]
			];

			const indices = sort_data(data_with_undefined, [
				{ col: 0, direction: "asc" as SortDirection },
				{ col: 1, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([0, 1]);
		});

		test("handles missing values in data", () => {
			const data_with_missing = [
				[
					{ id: "1", value: "" },
					{ id: "2", value: 1 }
				],
				[
					{ id: "3", value: "A" },
					{ id: "4", value: 2 }
				]
			];

			const indices = sort_data(data_with_missing, [
				{ col: 0, direction: "asc" as SortDirection }
			]);

			expect(indices).toEqual([0, 1]);
		});
	});
});
