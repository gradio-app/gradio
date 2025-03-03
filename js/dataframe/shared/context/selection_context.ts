import { getContext, setContext } from "svelte";
import { tick } from "svelte";
import type { DataFrameContext } from "./table_context";
import type { CellData } from "../selection_utils";
import type { DataframeValue } from "../utils";
import { handle_selection } from "../selection_utils";

const SELECTION_KEY = Symbol("selection");

export type SelectionContext = {
	df_actions: DataFrameContext["actions"];
	dispatch: {
		(e: "change", detail: DataframeValue): void;
		(e: "input", detail?: undefined): void;
		(e: "select", detail: any): void;
		(e: "search", detail: string | null): void;
	};
	data: CellData[][];
	els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	>;
	editable: boolean;
	show_row_numbers: boolean;
	get_data_at: (row: number, col: number) => string | number;
	clear_on_focus: boolean;
	selected_cells: [number, number][];
	parent_element: HTMLElement;
	actions: {
		handle_cell_click: (event: MouseEvent, row: number, col: number) => void;
		toggle_cell_menu: (event: MouseEvent, row: number, col: number) => void;
		toggle_cell_button: (row: number, col: number) => void;
		handle_select_column: (col: number) => void;
		handle_select_row: (row: number) => void;
	};
};

export function create_selection_context(
	context: Omit<SelectionContext, "actions">
): SelectionContext {
	const actions = {
		handle_cell_click: (event: MouseEvent, row: number, col: number) => {
			if (event.target instanceof HTMLAnchorElement) return;

			event.preventDefault();
			event.stopPropagation();

			if (context.show_row_numbers && col === -1) return;

			context.clear_on_focus = false;
			context.df_actions.set_active_cell_menu(null);
			context.df_actions.set_active_header_menu(null);
			context.df_actions.set_selected_header(false);
			context.df_actions.set_header_edit(false);

			const new_selected_cells = handle_selection(
				[row, col],
				context.selected_cells || [],
				event
			);

			context.df_actions.set_selected_cells(new_selected_cells);
			context.df_actions.set_selected(new_selected_cells[0]);

			if (context.editable) {
				if (new_selected_cells.length === 1) {
					context.df_actions.set_editing([row, col]);
					tick().then(() => {
						const input_el = context.els[context.data[row][col].id].input;
						if (input_el) {
							input_el.focus();
							input_el.selectionStart = input_el.selectionEnd =
								input_el.value.length;
						}
					});
				} else {
					context.df_actions.set_editing(false);
					context.parent_element.focus();
				}
			} else {
				context.parent_element.focus();
			}

			actions.toggle_cell_button(row, col);

			context.dispatch("select", {
				index: [row, col],
				value: context.get_data_at(row, col),
				row_value: context.data[row].map((d) => d.value)
			});
		},

		toggle_cell_menu: (event: MouseEvent, row: number, col: number) => {
			event.stopPropagation();
			const current_menu = context.df_actions.get_active_cell_menu();
			if (
				current_menu &&
				current_menu.row === row &&
				current_menu.col === col
			) {
				context.df_actions.set_active_cell_menu(null);
			} else {
				const cell = (event.target as HTMLElement).closest("td");
				if (cell) {
					const rect = cell.getBoundingClientRect();
					context.df_actions.set_active_cell_menu({
						row,
						col,
						x: rect.right,
						y: rect.bottom
					});
				}
			}
		},

		toggle_cell_button: (row: number, col: number) => {
			const current_button = context.df_actions.get_active_button();
			const new_button =
				current_button?.type === "cell" &&
				current_button.row === row &&
				current_button.col === col
					? null
					: { type: "cell" as const, row, col };
			context.df_actions.set_active_button(new_button);
		},

		handle_select_column: (col: number) => {
			const selected_cells = context.data.map(
				(_, row) => [row, col] as [number, number]
			);
			context.df_actions.set_selected_cells(selected_cells);
			context.df_actions.set_selected(selected_cells[0]);
			context.df_actions.set_editing(false);

			setTimeout(() => {
				context.parent_element.focus();
			}, 0);
		},

		handle_select_row: (row: number) => {
			const selected_cells = context.data[0].map(
				(_, col) => [row, col] as [number, number]
			);
			context.df_actions.set_selected_cells(selected_cells);
			context.df_actions.set_selected(selected_cells[0]);
			context.df_actions.set_editing(false);

			setTimeout(() => {
				context.parent_element.focus();
			}, 0);
		}
	};

	const selection_context = { ...context, actions };
	setContext(SELECTION_KEY, selection_context);
	return selection_context;
}

export function get_selection_context(): SelectionContext {
	return getContext<SelectionContext>(SELECTION_KEY);
}
