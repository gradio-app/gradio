import { describe, test, expect } from "vitest";
import {
	is_cell_in_selection,
	is_cell_selected,
	get_range_selection,
	handle_selection,
	handle_delete_key,
	should_show_cell_menu,
	get_next_cell_coordinates,
	move_cursor,
	get_current_indices,
	select_column,
	select_row
} from "../shared/utils/selection_utils";
import type { CellCoordinate } from "../shared/types";

// helper: create a grid of CellData for move_cursor / get_next_cell_coordinates
function make_grid(rows: number, cols: number) {
	return Array.from({ length: rows }, (_, r) =>
		Array.from({ length: cols }, (_, c) => ({
			id: `cell-${r}-${c}`,
			value: `${r},${c}`
		}))
	);
}

// helper: create a minimal KeyboardEvent-like object
function make_key_event(
	key: string,
	opts: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean } = {}
) {
	return {
		key,
		metaKey: opts.metaKey ?? false,
		ctrlKey: opts.ctrlKey ?? false,
		shiftKey: opts.shiftKey ?? false
	} as KeyboardEvent;
}

describe("is_cell_in_selection", () => {
	test("returns true when cell is in selection", () => {
		expect(
			is_cell_in_selection(
				[1, 2],
				[
					[0, 0],
					[1, 2],
					[3, 4]
				]
			)
		).toBe(true);
	});

	test("returns false when cell is not in selection", () => {
		expect(
			is_cell_in_selection(
				[1, 2],
				[
					[0, 0],
					[3, 4]
				]
			)
		).toBe(false);
	});

	test("handles empty selection", () => {
		expect(is_cell_in_selection([0, 0], [])).toBe(false);
	});
});

describe("is_cell_selected", () => {
	test("returns empty string when cell not selected", () => {
		expect(is_cell_selected([0, 0], [[1, 1]])).toBe("");
	});

	test("returns 'cell-selected' for isolated cell", () => {
		expect(is_cell_selected([1, 1], [[1, 1]])).toBe("cell-selected");
	});

	test("adds 'no-top' when neighbor above is selected", () => {
		const result = is_cell_selected(
			[1, 0],
			[
				[0, 0],
				[1, 0]
			]
		);
		expect(result).toContain("cell-selected");
		expect(result).toContain("no-top");
	});

	test("adds 'no-bottom' when neighbor below is selected", () => {
		const result = is_cell_selected(
			[0, 0],
			[
				[0, 0],
				[1, 0]
			]
		);
		expect(result).toContain("cell-selected");
		expect(result).toContain("no-bottom");
	});

	test("adds 'no-left' when neighbor left is selected", () => {
		const result = is_cell_selected(
			[0, 1],
			[
				[0, 0],
				[0, 1]
			]
		);
		expect(result).toContain("cell-selected");
		expect(result).toContain("no-left");
	});

	test("adds 'no-right' when neighbor right is selected", () => {
		const result = is_cell_selected(
			[0, 0],
			[
				[0, 0],
				[0, 1]
			]
		);
		expect(result).toContain("cell-selected");
		expect(result).toContain("no-right");
	});

	test("combines multiple neighbor flags for block selection", () => {
		// 2x2 block: center-ish cell [1,1] in a block [[0,0],[0,1],[1,0],[1,1]]
		const selection: CellCoordinate[] = [
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1]
		];
		const result = is_cell_selected([1, 1], selection);
		expect(result).toContain("cell-selected");
		expect(result).toContain("no-top");
		expect(result).toContain("no-left");
		// no neighbor below or right
		expect(result).not.toContain("no-bottom");
		expect(result).not.toContain("no-right");
	});
});

describe("get_range_selection", () => {
	test("returns rectangular range with anchor first", () => {
		const result = get_range_selection([0, 0], [2, 2]);
		// anchor [0,0] should be first
		expect(result[0]).toEqual([0, 0]);
		// should contain all 9 cells in the 3x3 range
		expect(result).toHaveLength(9);
		expect(result).toContainEqual([1, 1]);
		expect(result).toContainEqual([2, 2]);
	});

	test("handles reversed direction (end before start)", () => {
		const result = get_range_selection([2, 2], [0, 0]);
		expect(result[0]).toEqual([2, 2]);
		expect(result).toHaveLength(9);
		expect(result).toContainEqual([0, 0]);
	});

	test("single cell range returns just the anchor", () => {
		const result = get_range_selection([1, 1], [1, 1]);
		expect(result).toEqual([[1, 1]]);
	});
});

describe("handle_selection", () => {
	test("plain click returns single cell", () => {
		const result = handle_selection([2, 3], [[0, 0]], {
			shiftKey: false,
			metaKey: false,
			ctrlKey: false
		});
		expect(result).toEqual([[2, 3]]);
	});

	test("shift+click returns range from last selected", () => {
		const result = handle_selection([2, 2], [[0, 0]], {
			shiftKey: true,
			metaKey: false,
			ctrlKey: false
		});
		// range from [0,0] to [2,2] = 9 cells
		expect(result).toHaveLength(9);
	});

	test("cmd/ctrl+click adds cell to selection", () => {
		const result = handle_selection([1, 1], [[0, 0]], {
			shiftKey: false,
			metaKey: true,
			ctrlKey: false
		});
		expect(result).toEqual([
			[0, 0],
			[1, 1]
		]);
	});

	test("cmd/ctrl+click removes already-selected cell", () => {
		const result = handle_selection(
			[0, 0],
			[
				[0, 0],
				[1, 1]
			],
			{
				shiftKey: false,
				metaKey: true,
				ctrlKey: false
			}
		);
		expect(result).toEqual([[1, 1]]);
	});
});

describe("handle_delete_key", () => {
	test("clears values of selected cells", () => {
		const data = [
			[
				{ id: "0-0", value: "a" },
				{ id: "0-1", value: "b" }
			],
			[
				{ id: "1-0", value: "c" },
				{ id: "1-1", value: "d" }
			]
		];
		const result = handle_delete_key(data, [
			[0, 0],
			[1, 1]
		]);
		expect(result[0][0].value).toBe("");
		expect(result[1][1].value).toBe("");
	});

	test("leaves unselected cells unchanged", () => {
		const data = [
			[
				{ id: "0-0", value: "a" },
				{ id: "0-1", value: "b" }
			]
		];
		const result = handle_delete_key(data, [[0, 0]]);
		expect(result[0][1].value).toBe("b");
	});

	test("handles out-of-bounds gracefully", () => {
		const data = [
			[
				{ id: "0-0", value: "a" },
				{ id: "0-1", value: "b" }
			]
		];
		// should not throw
		const result = handle_delete_key(data, [[5, 5]]);
		expect(result[0][0].value).toBe("a");
		expect(result[0][1].value).toBe("b");
	});
});

describe("should_show_cell_menu", () => {
	test("true when editable, single cell selected, and coords match", () => {
		expect(should_show_cell_menu([1, 2], [[1, 2]], true)).toBe(true);
	});

	test("false when not editable", () => {
		expect(should_show_cell_menu([1, 2], [[1, 2]], false)).toBe(false);
	});

	test("false when multiple cells selected", () => {
		expect(
			should_show_cell_menu(
				[1, 2],
				[
					[1, 2],
					[1, 3]
				],
				true
			)
		).toBe(false);
	});

	test("false when coords don't match", () => {
		expect(should_show_cell_menu([0, 0], [[1, 2]], true)).toBe(false);
	});
});

describe("get_next_cell_coordinates", () => {
	const grid = make_grid(3, 3);

	test("moves right to next column", () => {
		expect(get_next_cell_coordinates([0, 0], grid, false)).toEqual([0, 1]);
	});

	test("wraps to next row at end of row", () => {
		expect(get_next_cell_coordinates([0, 2], grid, false)).toEqual([1, 0]);
	});

	test("shift moves left to previous column", () => {
		expect(get_next_cell_coordinates([0, 1], grid, true)).toEqual([0, 0]);
	});

	test("shift wraps to previous row at start of row", () => {
		expect(get_next_cell_coordinates([1, 0], grid, true)).toEqual([0, 2]);
	});

	test("returns false at grid boundary", () => {
		// forward past last cell
		expect(get_next_cell_coordinates([2, 2], grid, false)).toBe(false);
		// backward past first cell
		expect(get_next_cell_coordinates([0, 0], grid, true)).toBe(false);
	});
});

describe("move_cursor", () => {
	const grid = make_grid(4, 4);

	test("ArrowRight moves one column right", () => {
		expect(move_cursor(make_key_event("ArrowRight"), [1, 1], grid)).toEqual([
			1, 2
		]);
	});

	test("ArrowLeft moves one column left", () => {
		expect(move_cursor(make_key_event("ArrowLeft"), [1, 1], grid)).toEqual([
			1, 0
		]);
	});

	test("ArrowDown moves one row down", () => {
		expect(move_cursor(make_key_event("ArrowDown"), [1, 1], grid)).toEqual([
			2, 1
		]);
	});

	test("ArrowUp moves one row up", () => {
		expect(move_cursor(make_key_event("ArrowUp"), [1, 1], grid)).toEqual([
			0, 1
		]);
	});

	test("Cmd+ArrowRight jumps to last column", () => {
		expect(
			move_cursor(make_key_event("ArrowRight", { metaKey: true }), [1, 0], grid)
		).toEqual([1, 3]);
	});

	test("Cmd+ArrowLeft jumps to first column", () => {
		expect(
			move_cursor(make_key_event("ArrowLeft", { metaKey: true }), [1, 3], grid)
		).toEqual([1, 0]);
	});

	test("Cmd+ArrowDown jumps to last row", () => {
		expect(
			move_cursor(make_key_event("ArrowDown", { metaKey: true }), [0, 1], grid)
		).toEqual([3, 1]);
	});

	test("Cmd+ArrowUp jumps to first row", () => {
		expect(
			move_cursor(make_key_event("ArrowUp", { metaKey: true }), [3, 1], grid)
		).toEqual([0, 1]);
	});

	test("returns false at grid boundary", () => {
		expect(move_cursor(make_key_event("ArrowUp"), [0, 0], grid)).toBe(false);
		expect(move_cursor(make_key_event("ArrowLeft"), [0, 0], grid)).toBe(false);
		expect(move_cursor(make_key_event("ArrowDown"), [3, 3], grid)).toBe(false);
		expect(move_cursor(make_key_event("ArrowRight"), [3, 3], grid)).toBe(false);
	});
});

describe("get_current_indices", () => {
	const grid = make_grid(3, 3);

	test("finds cell by ID", () => {
		expect(get_current_indices("cell-1-2", grid)).toEqual([1, 2]);
	});

	test("returns [-1, -1] when ID not found", () => {
		expect(get_current_indices("nonexistent", grid)).toEqual([-1, -1]);
	});
});

describe("select_column", () => {
	test("selects all rows for given column", () => {
		const data = [
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9]
		];
		expect(select_column(data, 1)).toEqual([
			[0, 1],
			[1, 1],
			[2, 1]
		]);
	});
});

describe("select_row", () => {
	test("selects all columns for given row", () => {
		const data = [
			[1, 2, 3],
			[4, 5, 6]
		];
		expect(select_row(data, 0)).toEqual([
			[0, 0],
			[0, 1],
			[0, 2]
		]);
	});
});
