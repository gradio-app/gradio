import { describe, test, expect } from "vitest";
import { get_sort_status, sort_data } from "./sort_utils";

describe("sort_utils", () => {
	describe("get_sort_status", () => {
		const headers = ["A", "B", "C"];

		test("returns none when no sort is active", () => {
			expect(get_sort_status("A", undefined, undefined, headers)).toBe("none");
		});

		test("returns ascending when column is sorted ascending", () => {
			expect(get_sort_status("A", 0, "asc", headers)).toBe("asc");
		});

		test("returns descending when column is sorted descending", () => {
			expect(get_sort_status("B", 1, "des", headers)).toBe("des");
		});

		test("returns none for non-matching column", () => {
			expect(get_sort_status("A", 1, "asc", headers)).toBe("none");
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
			const indices = sort_data(data, 0, "asc");
			expect(indices).toEqual([1, 0, 2]); // A, B, C
		});

		test("sorts numbers ascending", () => {
			const indices = sort_data(data, 1, "asc");
			expect(indices).toEqual([1, 0, 2]); // 1, 2, 3
		});

		test("sorts strings descending", () => {
			const indices = sort_data(data, 0, "des");
			expect(indices).toEqual([2, 0, 1]); // C, B, A
		});

		test("returns original order when sort params are invalid", () => {
			const indices = sort_data(data, undefined, undefined);
			expect(indices).toEqual([0, 1, 2]);
		});

		test("handles empty data", () => {
			const indices = sort_data([], 0, "asc");
			expect(indices).toEqual([]);
		});

		test("handles invalid column index", () => {
			const indices = sort_data(data, 999, "asc");
			expect(indices).toEqual([0, 1, 2]);
		});
	});
});
