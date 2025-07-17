import type { CellCoordinate } from "../types";
import { get_range_selection } from "../selection_utils";

export type DragState = {
	is_dragging: boolean;
	drag_start: CellCoordinate | null;
	mouse_down_pos: { x: number; y: number } | null;
};

export type DragHandlers = {
	handle_mouse_down: (event: MouseEvent, row: number, col: number) => void;
	handle_mouse_move: (event: MouseEvent) => void;
	handle_mouse_up: (event: MouseEvent) => void;
};

export function create_drag_handlers(
	state: DragState,
	set_is_dragging: (value: boolean) => void,
	set_selected_cells: (cells: CellCoordinate[]) => void,
	set_selected: (cell: CellCoordinate | false) => void,
	handle_cell_click: (event: MouseEvent, row: number, col: number) => void,
	show_row_numbers: boolean,
	parent_element?: HTMLElement
): DragHandlers {
	const start_drag = (event: MouseEvent, row: number, col: number): void => {
		const target = event.target as HTMLElement;
		const is_checkbox_click =
			(target as HTMLInputElement).type === "checkbox" ||
			target.closest('input[type="checkbox"]') ||
			target.closest(".bool-cell");

		if (
			event.target instanceof HTMLAnchorElement ||
			(show_row_numbers && col === -1) ||
			is_checkbox_click
		)
			return;

		event.preventDefault();
		event.stopPropagation();

		state.mouse_down_pos = { x: event.clientX, y: event.clientY };
		state.drag_start = [row, col];

		if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
			set_selected_cells([[row, col]]);
			set_selected([row, col]);
			handle_cell_click(event, row, col);
		}
	};

	const update_selection = (event: MouseEvent): void => {
		const cell = (event.target as HTMLElement).closest("td");
		if (!cell) return;

		const row = parseInt(cell.getAttribute("data-row") || "0");
		const col = parseInt(cell.getAttribute("data-col") || "0");

		if (isNaN(row) || isNaN(col)) return;

		const selection_range = get_range_selection(state.drag_start!, [row, col]);
		set_selected_cells(selection_range);
		set_selected([row, col]);
	};

	const end_drag = (event: MouseEvent): void => {
		if (!state.is_dragging && state.drag_start) {
			handle_cell_click(event, state.drag_start[0], state.drag_start[1]);
		} else if (state.is_dragging && parent_element) {
			parent_element.focus();
		}

		state.is_dragging = false;
		set_is_dragging(false);
		state.drag_start = null;
		state.mouse_down_pos = null;
	};

	return {
		handle_mouse_down: start_drag,

		handle_mouse_move(event: MouseEvent): void {
			if (!state.drag_start || !state.mouse_down_pos) return;

			if (!(event.buttons & 1)) {
				end_drag(event);
				return;
			}

			const dx = Math.abs(event.clientX - state.mouse_down_pos.x);
			const dy = Math.abs(event.clientY - state.mouse_down_pos.y);

			if (!state.is_dragging && (dx > 3 || dy > 3)) {
				state.is_dragging = true;
				set_is_dragging(true);
			}

			if (state.is_dragging) {
				update_selection(event);
			}
		},

		handle_mouse_up: end_drag
	};
}
