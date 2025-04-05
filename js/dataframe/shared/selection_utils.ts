import type { CellCoordinate } from "./types";

export type CellData = { id: string; value: string | number };

export function is_cell_in_selection(
	coords: [number, number],
	selected_cells: [number, number][]
): boolean {
	const [row, col] = coords;
	return selected_cells.some(([r, c]) => r === row && c === col);
}

export function is_cell_selected(
	cell: CellCoordinate,
	selected_cells: CellCoordinate[]
): string {
	const [row, col] = cell;
	if (!selected_cells.some(([r, c]) => r === row && c === col)) return "";

	const up = selected_cells.some(([r, c]) => r === row - 1 && c === col);
	const down = selected_cells.some(([r, c]) => r === row + 1 && c === col);
	const left = selected_cells.some(([r, c]) => r === row && c === col - 1);
	const right = selected_cells.some(([r, c]) => r === row && c === col + 1);

	return `cell-selected${up ? " no-top" : ""}${down ? " no-bottom" : ""}${left ? " no-left" : ""}${right ? " no-right" : ""}`;
}

export function get_range_selection(
	start: CellCoordinate,
	end: CellCoordinate
): CellCoordinate[] {
	const [start_row, start_col] = start;
	const [end_row, end_col] = end;
	const min_row = Math.min(start_row, end_row);
	const max_row = Math.max(start_row, end_row);
	const min_col = Math.min(start_col, end_col);
	const max_col = Math.max(start_col, end_col);

	const cells: CellCoordinate[] = [];
	// Add the start cell as the "anchor" cell so that when
	// we press shift+arrow keys, the selection will always
	// include the anchor cell.
	cells.push(start);

	for (let i = min_row; i <= max_row; i++) {
		for (let j = min_col; j <= max_col; j++) {
			if (i === start_row && j === start_col) continue;
			cells.push([i, j]);
		}
	}
	return cells;
}

export function handle_selection(
	current: CellCoordinate,
	selected_cells: CellCoordinate[],
	event: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }
): CellCoordinate[] {
	if (event.shiftKey && selected_cells.length > 0) {
		return get_range_selection(
			selected_cells[selected_cells.length - 1],
			current
		);
	}

	if (event.metaKey || event.ctrlKey) {
		const is_cell_match = ([r, c]: CellCoordinate): boolean =>
			r === current[0] && c === current[1];
		const index = selected_cells.findIndex(is_cell_match);
		return index === -1
			? [...selected_cells, current]
			: selected_cells.filter((_, i) => i !== index);
	}

	return [current];
}

export function handle_delete_key(
	data: CellData[][],
	selected_cells: CellCoordinate[]
): CellData[][] {
	const new_data = data.map((row) => [...row]);
	selected_cells.forEach(([row, col]) => {
		if (new_data[row] && new_data[row][col]) {
			new_data[row][col] = { ...new_data[row][col], value: "" };
		}
	});
	return new_data;
}

export function should_show_cell_menu(
	cell: CellCoordinate,
	selected_cells: CellCoordinate[],
	editable: boolean
): boolean {
	const [row, col] = cell;
	return (
		editable &&
		selected_cells.length === 1 &&
		selected_cells[0][0] === row &&
		selected_cells[0][1] === col
	);
}

export function get_next_cell_coordinates(
	current: CellCoordinate,
	data: CellData[][],
	shift_key: boolean
): CellCoordinate | false {
	const [row, col] = current;
	const direction = shift_key ? -1 : 1;

	if (data[row]?.[col + direction]) {
		return [row, col + direction];
	}

	const next_row = row + (direction > 0 ? 1 : 0);
	const prev_row = row + (direction < 0 ? -1 : 0);

	if (direction > 0 && data[next_row]?.[0]) {
		return [next_row, 0];
	}

	if (direction < 0 && data[prev_row]?.[data[0].length - 1]) {
		return [prev_row, data[0].length - 1];
	}

	return false;
}

export function move_cursor(
	event: KeyboardEvent,
	current_coords: CellCoordinate,
	data: CellData[][]
): CellCoordinate | false {
	const key = event.key as "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp";
	const dir = {
		ArrowRight: [0, 1],
		ArrowLeft: [0, -1],
		ArrowDown: [1, 0],
		ArrowUp: [-1, 0]
	}[key];

	let i, j;
	if (event.metaKey || event.ctrlKey) {
		if (key === "ArrowRight") {
			i = current_coords[0];
			j = data[0].length - 1;
		} else if (key === "ArrowLeft") {
			i = current_coords[0];
			j = 0;
		} else if (key === "ArrowDown") {
			i = data.length - 1;
			j = current_coords[1];
		} else if (key === "ArrowUp") {
			i = 0;
			j = current_coords[1];
		} else {
			return false;
		}
	} else {
		i = current_coords[0] + dir[0];
		j = current_coords[1] + dir[1];
	}

	if (i < 0 && j <= 0) {
		return false;
	}

	const is_data = data[i]?.[j];
	if (is_data) {
		return [i, j];
	}
	return false;
}

export function get_current_indices(
	id: string,
	data: CellData[][]
): [number, number] {
	return data.reduce(
		(acc, arr, i) => {
			const j = arr.reduce(
				(_acc, _data, k) => (id === _data.id ? k : _acc),
				-1
			);
			return j === -1 ? acc : [i, j];
		},
		[-1, -1]
	);
}

export function handle_click_outside(
	event: Event,
	parent: HTMLElement
): boolean {
	const [trigger] = event.composedPath() as HTMLElement[];
	return !parent.contains(trigger);
}

export function select_column(data: any[][], col: number): CellCoordinate[] {
	return Array.from({ length: data.length }, (_, i) => [i, col]);
}

export function select_row(data: any[][], row: number): CellCoordinate[] {
	return Array.from({ length: data[0].length }, (_, i) => [row, i]);
}

export function calculate_selection_positions(
	selected: CellCoordinate,
	data: { id: string; value: string | number }[][],
	els: Record<string, { cell: HTMLTableCellElement | null }>,
	parent: HTMLElement,
	table: HTMLElement
): { col_pos: string; row_pos: string | undefined } {
	const [row, col] = selected;
	if (!data[row]?.[col]) {
		return { col_pos: "0px", row_pos: undefined };
	}

	const cell_id = data[row][col].id;
	const cell_el = els[cell_id]?.cell;

	if (!cell_el) {
		return { col_pos: "0px", row_pos: undefined };
	}

	const cell_rect = cell_el.getBoundingClientRect();
	const table_rect = table.getBoundingClientRect();
	const col_pos = `${cell_rect.left - table_rect.left + cell_rect.width / 2}px`;
	const row_pos = `${cell_rect.top - table_rect.top + cell_rect.height / 2}px`;

	return { col_pos, row_pos };
}
