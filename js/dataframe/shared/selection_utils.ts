export type CellCoordinate = [number, number];
export type CellData = { id: string; value: string | number };
export type EditingState = false | CellCoordinate;

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
	for (let i = min_row; i <= max_row; i++) {
		for (let j = min_col; j <= max_col; j++) {
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
		const index = selected_cells.findIndex(
			([r, c]) => r === current[0] && c === current[1]
		);
		if (index === -1) {
			return [...selected_cells, current];
		}
		return selected_cells.filter((_, i) => i !== index);
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

export function handle_editing_state(
	current: CellCoordinate,
	editing: EditingState,
	selected_cells: CellCoordinate[],
	editable: boolean
): EditingState {
	const [row, col] = current;
	if (!editable) return false;

	if (editing && editing[0] === row && editing[1] === col) return editing;

	if (
		selected_cells.length === 1 &&
		selected_cells[0][0] === row &&
		selected_cells[0][1] === col
	) {
		return [row, col];
	}

	return false;
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
