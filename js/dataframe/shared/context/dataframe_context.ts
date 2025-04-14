import { getContext, setContext } from "svelte";
import { dequal } from "dequal";
import { writable, get } from "svelte/store";
import { sort_table_data } from "../utils/table_utils";
import { tick } from "svelte";
import {
	handle_selection,
	get_next_cell_coordinates,
	get_range_selection,
	move_cursor
} from "../selection_utils";

export const DATAFRAME_KEY = Symbol("dataframe");

export type SortDirection = "asc" | "desc";
export type CellCoordinate = [number, number];

interface DataFrameState {
	config: {
		show_fullscreen_button: boolean;
		show_copy_button: boolean;
		show_search: "none" | "search" | "filter";
		show_row_numbers: boolean;
		editable: boolean;
		pinned_columns: number;
		show_label: boolean;
		line_breaks: boolean;
		wrap: boolean;
		max_height: number;
		column_widths: string[];
		max_chars?: number;
	};
	current_search_query: string | null;
	sort_state: {
		sort_columns: { col: number; direction: SortDirection }[];
		row_order: number[];
	};
	ui_state: {
		active_cell_menu: { row: number; col: number; x: number; y: number } | null;
		active_header_menu: { col: number; x: number; y: number } | null;
		selected_cells: CellCoordinate[];
		selected: CellCoordinate | false;
		editing: CellCoordinate | false;
		header_edit: number | false;
		selected_header: number | false;
		active_button: {
			type: "header" | "cell";
			row?: number;
			col: number;
		} | null;
		copy_flash: boolean;
	};
}

interface DataFrameActions {
	handle_search: (query: string | null) => void;
	handle_sort: (col: number, direction: SortDirection) => void;
	get_sort_status: (name: string, headers: string[]) => "none" | "asc" | "desc";
	sort_data: (
		data: any[][],
		display_value: string[][] | null,
		styling: string[][] | null
	) => void;
	update_row_order: (data: any[][]) => void;
	filter_data: (data: any[][]) => any[][];
	add_row: (data: any[][], make_id: () => string, index?: number) => any[][];
	add_col: (
		data: any[][],
		headers: string[],
		make_id: () => string,
		index?: number
	) => { data: any[][]; headers: string[] };
	add_row_at: (
		data: any[][],
		index: number,
		position: "above" | "below",
		make_id: () => string
	) => any[][];
	add_col_at: (
		data: any[][],
		headers: string[],
		index: number,
		position: "left" | "right",
		make_id: () => string
	) => { data: any[][]; headers: string[] };
	delete_row: (data: any[][], index: number) => any[][];
	delete_col: (
		data: any[][],
		headers: string[],
		index: number
	) => { data: any[][]; headers: string[] };
	delete_row_at: (data: any[][], index: number) => any[][];
	delete_col_at: (
		data: any[][],
		headers: string[],
		index: number
	) => { data: any[][]; headers: string[] };
	trigger_change: (
		data: any[][],
		headers: any[],
		previous_data: string[][],
		previous_headers: string[],
		value_is_output: boolean,
		dispatch: (e: "change" | "input", detail?: any) => void
	) => Promise<void>;
	reset_sort_state: () => void;
	set_active_cell_menu: (
		menu: { row: number; col: number; x: number; y: number } | null
	) => void;
	set_active_header_menu: (
		menu: { col: number; x: number; y: number } | null
	) => void;
	set_selected_cells: (cells: CellCoordinate[]) => void;
	set_selected: (selected: CellCoordinate | false) => void;
	set_editing: (editing: CellCoordinate | false) => void;
	clear_ui_state: () => void;
	set_header_edit: (header_index: number | false) => void;
	set_selected_header: (header_index: number | false) => void;
	handle_header_click: (col: number, editable: boolean) => void;
	end_header_edit: (key: string) => void;
	get_selected_cells: () => CellCoordinate[];
	get_active_cell_menu: () => {
		row: number;
		col: number;
		x: number;
		y: number;
	} | null;
	get_active_button: () => {
		type: "header" | "cell";
		row?: number;
		col: number;
	} | null;
	set_active_button: (
		button: { type: "header" | "cell"; row?: number; col: number } | null
	) => void;
	set_copy_flash: (value: boolean) => void;
	handle_cell_click: (event: MouseEvent, row: number, col: number) => void;
	toggle_cell_menu: (event: MouseEvent, row: number, col: number) => void;
	toggle_cell_button: (row: number, col: number) => void;
	handle_select_column: (col: number) => void;
	handle_select_row: (row: number) => void;
	get_next_cell_coordinates: typeof get_next_cell_coordinates;
	get_range_selection: typeof get_range_selection;
	move_cursor: typeof move_cursor;
}

export interface DataFrameContext {
	state: ReturnType<typeof writable<DataFrameState>>;
	actions: DataFrameActions;
	data?: any[][];
	headers?: { id: string; value: string }[];
	els?: Record<
		string,
		{ cell: HTMLTableCellElement | null; input: HTMLInputElement | null }
	>;
	parent_element?: HTMLElement;
	get_data_at?: (row: number, col: number) => string | number;
	get_column?: (col: number) => (string | number)[];
	get_row?: (row: number) => (string | number)[];
	dispatch?: (e: "change" | "select" | "search", detail?: any) => void;
}

function create_actions(
	state: ReturnType<typeof writable<DataFrameState>>,
	context: DataFrameContext
): DataFrameActions {
	const update_state = (
		updater: (s: DataFrameState) => Partial<DataFrameState>
	): void => state.update((s) => ({ ...s, ...updater(s) }));

	const add_row = (
		data: any[][],
		make_id: () => string,
		index?: number
	): any[][] => {
		const new_row = data[0]?.length
			? Array(data[0].length)
					.fill(null)
					.map(() => ({ value: "", id: make_id() }))
			: [{ value: "", id: make_id() }];
		const new_data = [...data];
		index !== undefined
			? new_data.splice(index, 0, new_row)
			: new_data.push(new_row);
		return new_data;
	};

	const add_col = (
		data: any[][],
		headers: string[],
		make_id: () => string,
		index?: number
	): { data: any[][]; headers: string[] } => {
		const new_headers = context.headers
			? [...headers.map((h) => context.headers![headers.indexOf(h)].value)]
			: [...headers, `Header ${headers.length + 1}`];
		const new_data = data.map((row) => [...row, { value: "", id: make_id() }]);
		if (index !== undefined) {
			new_headers.splice(index, 0, new_headers.pop()!);
			new_data.forEach((row) => row.splice(index, 0, row.pop()!));
		}
		return { data: new_data, headers: new_headers };
	};

	return {
		handle_search: (query) =>
			update_state((s) => ({ current_search_query: query })),
		handle_sort: (col, direction) =>
			update_state((s) => {
				const sort_cols = s.sort_state.sort_columns.filter(
					(c) => c.col !== col
				);
				if (
					!s.sort_state.sort_columns.some(
						(c) => c.col === col && c.direction === direction
					)
				) {
					sort_cols.push({ col, direction });
				}
				return {
					sort_state: { ...s.sort_state, sort_columns: sort_cols.slice(-3) }
				};
			}),
		get_sort_status: (name, headers) => {
			const s = get(state);
			const sort_item = s.sort_state.sort_columns.find(
				(item) => headers[item.col] === name
			);
			return sort_item ? sort_item.direction : "none";
		},
		sort_data: (data, display_value, styling) => {
			const {
				sort_state: { sort_columns }
			} = get(state);
			if (sort_columns.length)
				sort_table_data(data, display_value, styling, sort_columns);
		},
		update_row_order: (data) =>
			update_state((s) => ({
				sort_state: {
					...s.sort_state,
					row_order:
						s.sort_state.sort_columns.length && data[0]
							? [...Array(data.length)]
									.map((_, i) => i)
									.sort((a, b) => {
										for (const { col, direction } of s.sort_state
											.sort_columns) {
											const comp =
												(data[a]?.[col]?.value ?? "") <
												(data[b]?.[col]?.value ?? "")
													? -1
													: 1;
											if (comp) return direction === "asc" ? comp : -comp;
										}
										return 0;
									})
							: [...Array(data.length)].map((_, i) => i)
				}
			})),
		filter_data: (data) => {
			const query = get(state).current_search_query?.toLowerCase();
			return query
				? data.filter((row) =>
						row.some((cell) =>
							String(cell?.value).toLowerCase().includes(query)
						)
					)
				: data;
		},
		add_row,
		add_col,
		add_row_at: (data, index, position, make_id) =>
			add_row(data, make_id, position === "above" ? index : index + 1),
		add_col_at: (data, headers, index, position, make_id) =>
			add_col(data, headers, make_id, position === "left" ? index : index + 1),
		delete_row: (data, index) =>
			data.length > 1 ? data.filter((_, i) => i !== index) : data,
		delete_col: (data, headers, index) =>
			headers.length > 1
				? {
						data: data.map((row) => row.filter((_, i) => i !== index)),
						headers: headers.filter((_, i) => i !== index)
					}
				: { data, headers },
		delete_row_at: (data, index) =>
			data.length > 1
				? [...data.slice(0, index), ...data.slice(index + 1)]
				: data,
		delete_col_at: (data, headers, index) =>
			headers.length > 1
				? {
						data: data.map((row) => [
							...row.slice(0, index),
							...row.slice(index + 1)
						]),
						headers: [...headers.slice(0, index), ...headers.slice(index + 1)]
					}
				: { data, headers },
		trigger_change: async (
			data,
			headers,
			previous_data,
			previous_headers,
			value_is_output,
			dispatch
		) => {
			const s = get(state);
			if (s.current_search_query) return;

			const current_headers = headers.map((h) => h.value);
			const current_data = data.map((row) =>
				row.map((cell) => String(cell.value))
			);

			if (
				!dequal(current_data, previous_data) ||
				!dequal(current_headers, previous_headers)
			) {
				if (!dequal(current_headers, previous_headers)) {
					update_state((s) => ({
						sort_state: { sort_columns: [], row_order: [] }
					}));
				}
				dispatch("change", {
					data: data.map((row) => row.map((cell) => cell.value)),
					headers: current_headers,
					metadata: null
				});
				if (!value_is_output) dispatch("input");
			}
		},
		reset_sort_state: () =>
			update_state((s) => ({
				sort_state: { sort_columns: [], row_order: [] }
			})),
		set_active_cell_menu: (menu) =>
			update_state((s) => ({
				ui_state: { ...s.ui_state, active_cell_menu: menu }
			})),
		set_active_header_menu: (menu) =>
			update_state((s) => ({
				ui_state: { ...s.ui_state, active_header_menu: menu }
			})),
		set_selected_cells: (cells) =>
			update_state((s) => ({
				ui_state: { ...s.ui_state, selected_cells: cells }
			})),
		set_selected: (selected) =>
			update_state((s) => ({ ui_state: { ...s.ui_state, selected } })),
		set_editing: (editing) =>
			update_state((s) => ({ ui_state: { ...s.ui_state, editing } })),
		clear_ui_state: () =>
			update_state((s) => ({
				ui_state: {
					active_cell_menu: null,
					active_header_menu: null,
					selected_cells: [],
					selected: false,
					editing: false,
					header_edit: false,
					selected_header: false,
					active_button: null,
					copy_flash: false
				}
			})),
		set_header_edit: (header_index) =>
			update_state((s) => ({
				ui_state: {
					...s.ui_state,
					selected_cells: [],
					selected_header: header_index,
					header_edit: header_index
				}
			})),
		set_selected_header: (header_index) =>
			update_state((s) => ({
				ui_state: {
					...s.ui_state,
					selected_header: header_index,
					selected: false,
					selected_cells: []
				}
			})),
		handle_header_click: (col, editable) =>
			update_state((s) => ({
				ui_state: {
					...s.ui_state,
					active_cell_menu: null,
					active_header_menu: null,
					selected: false,
					selected_cells: [],
					selected_header: col,
					header_edit: editable ? col : false
				}
			})),
		end_header_edit: (key) => {
			if (["Escape", "Enter", "Tab"].includes(key)) {
				update_state((s) => ({
					ui_state: { ...s.ui_state, selected: false, header_edit: false }
				}));
			}
		},
		get_selected_cells: () => get(state).ui_state.selected_cells,
		get_active_cell_menu: () => get(state).ui_state.active_cell_menu,
		get_active_button: () => get(state).ui_state.active_button,
		set_active_button: (button) =>
			update_state((s) => ({
				ui_state: { ...s.ui_state, active_button: button }
			})),
		set_copy_flash: (value) =>
			update_state((s) => ({ ui_state: { ...s.ui_state, copy_flash: value } })),
		handle_cell_click: (event, row, col) => {
			event.preventDefault();
			event.stopPropagation();

			const s = get(state);
			if (s.config.show_row_numbers && col === -1) return;

			let actual_row = row;
			if (s.current_search_query && context.data) {
				const filtered_indices: number[] = [];
				context.data.forEach((dataRow, idx) => {
					if (
						dataRow.some((cell) =>
							String(cell?.value)
								.toLowerCase()
								.includes(s.current_search_query?.toLowerCase() || "")
						)
					) {
						filtered_indices.push(idx);
					}
				});
				actual_row = filtered_indices[row] ?? row;
			}

			const cells = handle_selection(
				[actual_row, col],
				s.ui_state.selected_cells,
				event
			);
			update_state((s) => ({
				ui_state: {
					...s.ui_state,
					active_cell_menu: null,
					active_header_menu: null,
					selected_header: false,
					header_edit: false,
					selected_cells: cells,
					selected: cells[0]
				}
			}));

			if (s.config.editable && cells.length === 1) {
				update_state((s) => ({
					ui_state: { ...s.ui_state, editing: [actual_row, col] }
				}));
				tick().then(() =>
					context.els![context.data![actual_row][col].id]?.input?.focus()
				);
			} else {
				// ensure parent has focus for keyboard navigation
				tick().then(() => {
					if (context.parent_element) {
						context.parent_element.focus();
					}
				});
			}

			context.dispatch?.("select", {
				index: [actual_row, col],
				col_value: context.get_column!(col),
				row_value: context.get_row!(actual_row),
				value: context.get_data_at!(actual_row, col)
			});
		},
		toggle_cell_menu: (event, row, col) => {
			event.stopPropagation();
			const current_menu = get(state).ui_state.active_cell_menu;
			if (current_menu?.row === row && current_menu.col === col) {
				update_state((s) => ({
					ui_state: { ...s.ui_state, active_cell_menu: null }
				}));
			} else {
				const cell = (event.target as HTMLElement).closest("td");
				if (cell) {
					const rect = cell.getBoundingClientRect();
					update_state((s) => ({
						ui_state: {
							...s.ui_state,
							active_cell_menu: { row, col, x: rect.right, y: rect.bottom }
						}
					}));
				}
			}
		},
		toggle_cell_button: (row, col) => {
			const current_button = get(state).ui_state.active_button;
			const new_button =
				current_button?.type === "cell" &&
				current_button.row === row &&
				current_button.col === col
					? null
					: { type: "cell" as const, row, col };
			update_state((s) => ({
				ui_state: { ...s.ui_state, active_button: new_button }
			}));
		},
		handle_select_column: (col) => {
			if (!context.data) return;
			const cells = context.data.map((_, row) => [row, col] as CellCoordinate);
			update_state((s) => ({
				ui_state: {
					...s.ui_state,
					selected_cells: cells,
					selected: cells[0],
					editing: false
				}
			}));
			setTimeout(() => context.parent_element?.focus(), 0);
		},
		handle_select_row: (row) => {
			if (!context.data || !context.data[0]) return;
			const cells = context.data[0].map(
				(_, col) => [row, col] as CellCoordinate
			);
			update_state((s) => ({
				ui_state: {
					...s.ui_state,
					selected_cells: cells,
					selected: cells[0],
					editing: false
				}
			}));
			setTimeout(() => context.parent_element?.focus(), 0);
		},
		get_next_cell_coordinates,
		get_range_selection,
		move_cursor
	};
}

export function create_dataframe_context(
	config: DataFrameState["config"]
): DataFrameContext {
	const state = writable<DataFrameState>({
		config,
		current_search_query: null,
		sort_state: { sort_columns: [], row_order: [] },
		ui_state: {
			active_cell_menu: null,
			active_header_menu: null,
			selected_cells: [],
			selected: false,
			editing: false,
			header_edit: false,
			selected_header: false,
			active_button: null,
			copy_flash: false
		}
	});

	const context: DataFrameContext = { state, actions: null as any };
	context.actions = create_actions(state, context);

	const instance_id = Symbol(
		`dataframe_${Math.random().toString(36).substring(2)}`
	);
	setContext(instance_id, context);
	setContext(DATAFRAME_KEY, { instance_id, context });

	return context;
}

export function get_dataframe_context(): DataFrameContext {
	const ctx = getContext<{ instance_id: symbol; context: DataFrameContext }>(
		DATAFRAME_KEY
	);
	return ctx?.context ?? getContext<DataFrameContext>(DATAFRAME_KEY);
}
