import { getContext, setContext } from "svelte";
import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import { sort_table_data } from "../utils/table_utils";
import { dequal } from "dequal/lite";
import type { DataframeValue } from "../utils";

export const DATAFRAME_KEY = Symbol("dataframe");

export type SortDirection = "asc" | "desc";

export type DataFrameState = {
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
		max_chars: number | undefined;
	};
	current_search_query: string | null;
	sort_state: {
		sort_columns: { col: number; direction: SortDirection }[];
		row_order: number[];
	};
	ui_state: {
		active_cell_menu: { row: number; col: number; x: number; y: number } | null;
		active_header_menu: { col: number; x: number; y: number } | null;
		selected_cells: [number, number][];
		selected: [number, number] | false;
		editing: [number, number] | false;
		header_edit: number | false;
		selected_header: number | false;
		active_button: {
			type: "header" | "cell";
			row?: number;
			col: number;
		} | null;
	};
};

export interface DataFrameContext {
	state: Writable<DataFrameState>;
	actions: {
		handle_search: (search_query: string | null) => void;
		handle_sort: (col: number, direction: SortDirection) => void;
		get_sort_status: (
			name: string,
			headers: string[]
		) => "none" | "asc" | "desc";
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
		set_active_cell_menu: (
			menu: { row: number; col: number; x: number; y: number } | null
		) => void;
		set_active_header_menu: (
			menu: { col: number; x: number; y: number } | null
		) => void;
		set_selected_cells: (cells: [number, number][]) => void;
		set_selected: (selected: [number, number] | false) => void;
		set_editing: (editing: [number, number] | false) => void;
		clear_ui_state: () => void;
		set_header_edit: (header_index: number | false) => void;
		set_selected_header: (header_index: number | false) => void;
		handle_header_click: (col: number, editable: boolean) => void;
		end_header_edit: (key: string) => void;
		trigger_change: (
			data: any[][],
			headers: any[],
			previous_data: string[][],
			previous_headers: string[],
			value_is_output: boolean,
			dispatch: {
				(e: "change", detail: DataframeValue): void;
				(e: "input", detail?: undefined): void;
				(e: "select", detail: any): void;
				(e: "search", detail: string | null): void;
			}
		) => Promise<void>;
		get_selected_cells: () => [number, number][];
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
		reset_sort_state: () => void;
	};
}

export function create_actions(
	state: Writable<DataFrameState>
): DataFrameContext["actions"] {
	const add_row = (
		data: any[][],
		make_id: () => string,
		index?: number
	): any[][] => {
		if (!data || data.length === 0) {
			return [[{ value: "", id: make_id() }]];
		}

		const new_row = Array(data[0].length)
			.fill(null)
			.map(() => ({
				value: "",
				id: make_id()
			}));

		const new_data = [...data];
		if (typeof index === "number" && index >= 0 && index <= data.length) {
			new_data.splice(index, 0, new_row);
		} else {
			new_data.push(new_row);
		}

		return new_data;
	};

	const add_col = (
		data: any[][],
		headers: string[],
		make_id: () => string,
		index?: number
	): { data: any[][]; headers: string[] } => {
		if (!data || data.length === 0) {
			return {
				data: [[{ value: "", id: make_id() }]],
				headers: ["Header 1"]
			};
		}

		const new_headers = [...headers];
		const new_data = data.map((row) => [...row]);

		if (
			typeof index === "number" &&
			index >= 0 &&
			index <= (data[0]?.length || 0)
		) {
			new_headers.splice(index, 0, `Header ${headers.length + 1}`);
			new_data.forEach((row) => {
				const id = make_id();
				row.splice(index, 0, { value: "", id });
			});
		} else {
			new_headers.push(`Header ${headers.length + 1}`);
			new_data.forEach((row) => {
				const id = make_id();
				row.push({ value: "", id });
			});
		}

		return { data: new_data, headers: new_headers };
	};

	const reset_sort_state = (): void => {
		state.update((s) => ({
			...s,
			sort_state: {
				sort_columns: [],
				row_order: []
			}
		}));
	};

	return {
		handle_search: (search_query: string | null) => {
			state.update((s) => ({ ...s, current_search_query: search_query }));
		},
		handle_sort: (col: number, direction: SortDirection) => {
			state.update((s) => {
				const sort_columns = [...s.sort_state.sort_columns];
				const existing_index = sort_columns.findIndex(
					(item) => item.col === col
				);

				if (existing_index !== -1) {
					const existing_item = sort_columns[existing_index];

					if (existing_item.direction === direction) {
						// Remove this column from sort if clicking the same direction again
						sort_columns.splice(existing_index, 1);
					} else {
						// Update direction if clicking the opposite direction
						sort_columns[existing_index] = { col, direction };
					}
				} else {
					// Add new sort column (limit to 3 columns)
					if (sort_columns.length >= 3) {
						sort_columns.shift();
					}
					sort_columns.push({ col, direction });
				}

				return {
					...s,
					sort_state: {
						...s.sort_state,
						sort_columns
					}
				};
			});
		},
		get_sort_status: (
			name: string,
			headers: string[]
		): "none" | "asc" | "desc" => {
			const current_state = get(state);
			const sort_item = current_state.sort_state.sort_columns.find(
				(item) => headers[item.col] === name
			);

			if (!sort_item) return "none";
			return sort_item.direction;
		},
		sort_data: (
			data: any[][],
			display_value: string[][] | null,
			styling: string[][] | null
		) => {
			const current_state = get(state);
			if (current_state.sort_state.sort_columns.length > 0) {
				sort_table_data(
					data,
					display_value,
					styling,
					current_state.sort_state.sort_columns
				);
			}
		},
		update_row_order: (data: any[][]) => {
			state.update((s) => {
				const current_sort_state = { ...s.sort_state };
				if (current_sort_state.sort_columns.length > 0 && data[0]) {
					const indices = [...Array(data.length)].map((_, i) => i);
					indices.sort((a, b) => {
						const row_a = data[a];
						const row_b = data[b];

						// Compare each sort column in order until a difference is found
						for (const {
							col: sort_index,
							direction
						} of current_sort_state.sort_columns) {
							if (
								!row_a ||
								!row_b ||
								sort_index < 0 ||
								sort_index >= row_a.length ||
								sort_index >= row_b.length
							) {
								continue;
							}

							const val_a = row_a[sort_index].value;
							const val_b = row_b[sort_index].value;
							const comp = val_a < val_b ? -1 : val_a > val_b ? 1 : 0;

							// If values are different, return the comparison result
							if (comp !== 0) {
								return direction === "asc" ? comp : -comp;
							}
							// If values are equal, continue to the next sort column
						}

						// If all sort columns have equal values, maintain original order
						return 0;
					});
					current_sort_state.row_order = indices;
				} else {
					current_sort_state.row_order = [...Array(data.length)].map(
						(_, i) => i
					);
				}
				return { ...s, sort_state: current_sort_state };
			});
		},
		filter_data: (data: any[][]) => {
			const current_state = get(state);

			if (!current_state.current_search_query) {
				return data;
			}

			const search_query = current_state.current_search_query.toLowerCase();

			const filtered = data.filter((row) => {
				return row.some((cell) => {
					if (!cell) {
						return false;
					}

					const cell_value = cell.value;

					if (cell_value === null || cell_value === undefined) {
						return false;
					}

					const string_value = String(cell_value).toLowerCase();
					return string_value.includes(search_query);
				});
			});

			return filtered;
		},
		add_row,
		add_col,
		add_row_at: (
			data: any[][],
			index: number,
			position: "above" | "below",
			make_id: () => string
		) => {
			const row_index = position === "above" ? index : index + 1;
			return add_row(data, make_id, row_index);
		},
		add_col_at: (
			data: any[][],
			headers: string[],
			index: number,
			position: "left" | "right",
			make_id: () => string
		) => {
			const col_index = position === "left" ? index : index + 1;
			return add_col(data, headers, make_id, col_index);
		},
		delete_row: (data: any[][], index: number) => {
			if (data.length <= 1) {
				return data;
			}

			const new_data = [...data];
			new_data.splice(index, 1);

			return new_data;
		},
		delete_col: (
			data: any[][],
			headers: string[],
			index: number
		): { data: any[][]; headers: string[] } => {
			if (headers.length <= 1) {
				return { data, headers };
			}

			const new_headers = [...headers];
			new_headers.splice(index, 1);

			const new_data = data.map((row) => {
				const new_row = [...row];
				new_row.splice(index, 1);
				return new_row;
			});

			return { data: new_data, headers: new_headers };
		},
		delete_row_at: (data: any[][], index: number) => {
			if (data.length <= 1) return data;
			data.splice(index, 1);
			return data;
		},
		delete_col_at: (data: any[][], headers: string[], index: number) => {
			if (headers.length <= 1) {
				return { data, headers };
			}

			const new_headers = [...headers];
			new_headers.splice(index, 1);

			const new_data = data.map((row) => {
				const new_row = [...row];
				new_row.splice(index, 1);
				return new_row;
			});

			return { data: new_data, headers: new_headers };
		},
		set_active_cell_menu: (menu) => {
			state.update((s) => ({
				...s,
				ui_state: { ...s.ui_state, active_cell_menu: menu }
			}));
		},
		set_active_header_menu: (menu) => {
			state.update((s) => ({
				...s,
				ui_state: { ...s.ui_state, active_header_menu: menu }
			}));
		},
		set_selected_cells: (cells) => {
			state.update((s) => ({
				...s,
				ui_state: { ...s.ui_state, selected_cells: cells }
			}));
		},
		set_selected: (selected) => {
			state.update((s) => ({
				...s,
				ui_state: { ...s.ui_state, selected: selected }
			}));
		},
		set_editing: (editing) => {
			state.update((s) => ({
				...s,
				ui_state: { ...s.ui_state, editing: editing }
			}));
		},
		clear_ui_state: () => {
			state.update((s) => ({
				...s,
				ui_state: {
					active_cell_menu: null,
					active_header_menu: null,
					selected_cells: [],
					selected: false,
					editing: false,
					header_edit: false,
					selected_header: false,
					active_button: null
				}
			}));
		},
		set_header_edit: (header_index: number | false) => {
			state.update((s) => ({
				...s,
				ui_state: {
					...s.ui_state,
					selected_cells: [],
					selected_header: header_index,
					header_edit: header_index
				}
			}));
		},
		set_selected_header: (header_index: number | false) => {
			state.update((s) => ({
				...s,
				ui_state: {
					...s.ui_state,
					selected_header: header_index,
					selected: false,
					selected_cells: []
				}
			}));
		},
		handle_header_click: (col: number, editable: boolean) => {
			state.update((s) => ({
				...s,
				ui_state: {
					...s.ui_state,
					active_cell_menu: null,
					active_header_menu: null,
					selected: false,
					selected_cells: [],
					selected_header: col,
					header_edit: editable ? col : false
				}
			}));
		},
		end_header_edit: (key: string) => {
			if (key === "Escape" || key === "Enter" || key === "Tab") {
				state.update((s) => ({
					...s,
					ui_state: {
						...s.ui_state,
						selected: false,
						header_edit: false
					}
				}));
			}
		},
		trigger_change: async (
			data: any[][],
			headers: any[],
			previous_data: string[][],
			previous_headers: string[],
			value_is_output: boolean,
			dispatch: {
				(e: "change", detail: DataframeValue): void;
				(e: "input", detail?: undefined): void;
				(e: "select", detail: any): void;
				(e: "search", detail: string | null): void;
			}
		): Promise<void> => {
			const current_state = get(state);
			if (current_state.current_search_query) return;

			const current_headers = headers.map((h) => h.value);
			const current_data = data.map((row) =>
				row.map((cell) => String(cell.value))
			);

			if (
				!dequal(current_data, previous_data) ||
				!dequal(current_headers, previous_headers)
			) {
				// Only reset sort state if headers changed or if there are no active sorts
				// This prevents resetting sort state when sorting is what caused the data change
				if (
					!dequal(current_headers, previous_headers) ||
					current_state.sort_state.sort_columns.length === 0
				) {
					reset_sort_state();
				}

				dispatch("change", {
					data: data.map((row) => row.map((cell) => cell.value)),
					headers: headers.map((h) => h.value),
					metadata: null
				});
				if (!value_is_output) {
					dispatch("input");
				}
			}
		},
		get_selected_cells: () => {
			const current_state = get(state);
			return current_state.ui_state.selected_cells;
		},
		get_active_cell_menu: () => {
			const current_state = get(state);
			return current_state.ui_state.active_cell_menu;
		},
		get_active_button: () => {
			const current_state = get(state);
			return current_state.ui_state.active_button;
		},
		set_active_button: (button) => {
			state.update((s) => ({
				...s,
				ui_state: { ...s.ui_state, active_button: button }
			}));
		},
		reset_sort_state
	};
}

export function create_dataframe_context(config: {
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
	max_chars: number | undefined;
}): DataFrameContext {
	const instance_id = Symbol(
		`dataframe_${Math.random().toString(36).substring(2)}`
	);
	const state = writable<DataFrameState>({
		config,
		current_search_query: null,
		sort_state: {
			sort_columns: [],
			row_order: []
		},
		ui_state: {
			active_cell_menu: null,
			active_header_menu: null,
			selected_cells: [],
			selected: false,
			editing: false,
			header_edit: false,
			selected_header: false,
			active_button: null
		}
	});

	const actions = create_actions(state);
	const context: DataFrameContext = { state, actions };
	setContext(instance_id, context);
	setContext(DATAFRAME_KEY, { instance_id, context });
	return context;
}

export function get_dataframe_context(): DataFrameContext {
	const ctx = getContext<{ instance_id: symbol; context: DataFrameContext }>(
		DATAFRAME_KEY
	);
	return ctx ? ctx.context : getContext<DataFrameContext>(DATAFRAME_KEY);
}
