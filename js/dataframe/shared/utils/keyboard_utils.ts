import { dequal } from "dequal/lite";
import { handle_delete_key } from "../selection_utils";
import type { DataFrameContext } from "../context/dataframe_context";
import { tick } from "svelte";
import { get } from "svelte/store";
import { copy_table_data } from "./table_utils";

async function save_cell_value(
	input_value: string,
	ctx: DataFrameContext,
	row: number,
	col: number
): Promise<void> {
	if (!ctx.data || !ctx.data[row] || !ctx.data[row][col]) return;

	const old_value = ctx.data[row][col].value;
	ctx.data[row][col].value = input_value;

	if (old_value !== input_value && ctx.dispatch) {
		ctx.dispatch("change", {
			data: ctx.data.map((row) => row.map((cell) => cell.value)),
			headers: ctx.headers?.map((h) => h.value) || [],
			metadata: null
		});
	}

	ctx.actions.set_selected([row, col]);
}

export async function handle_cell_blur(
	event: FocusEvent,
	ctx: DataFrameContext,
	coords: [number, number]
): Promise<void> {
	if (!ctx.data || !ctx.headers || !ctx.els) return;

	const input_el = event.target as HTMLInputElement;
	if (!input_el || input_el.value === undefined) return;

	await save_cell_value(
		input_el.type === "checkbox" ? String(input_el.checked) : input_el.value,
		ctx,
		coords[0],
		coords[1]
	);
}

function handle_header_navigation(
	event: KeyboardEvent,
	ctx: DataFrameContext
): boolean {
	const state = get(ctx.state);
	const selected_header = state.ui_state.selected_header;
	const header_edit = state.ui_state.header_edit;
	const headers = ctx.headers || [];

	if (selected_header === false || header_edit !== false) return false;

	switch (event.key) {
		case "ArrowDown":
			ctx.actions.set_selected_header(false);
			ctx.actions.set_selected([0, selected_header as number]);
			ctx.actions.set_selected_cells([[0, selected_header as number]]);
			return true;
		case "ArrowLeft":
			ctx.actions.set_selected_header(
				selected_header > 0 ? selected_header - 1 : selected_header
			);
			return true;
		case "ArrowRight":
			ctx.actions.set_selected_header(
				selected_header < headers.length - 1
					? selected_header + 1
					: selected_header
			);
			return true;
		case "Escape":
			event.preventDefault();
			ctx.actions.set_selected_header(false);
			return true;
		case "Enter":
			event.preventDefault();
			if (state.config.editable) {
				ctx.actions.set_header_edit(selected_header);
			}
			return true;
	}
	return false;
}

// eslint-disable-next-line complexity
function handle_delete_operation(
	event: KeyboardEvent,
	ctx: DataFrameContext
): boolean {
	if (!ctx.data || !ctx.headers || !ctx.els || !ctx.dispatch) return false;

	const state = get(ctx.state);
	if (!state.config.editable) return false;
	if (event.key !== "Delete" && event.key !== "Backspace") return false;

	const editing = state.ui_state.editing;
	const selected_cells = state.ui_state.selected_cells;

	const static_columns = state.config.static_columns || [];
	if (selected_cells.some(([_, col]) => static_columns.includes(col))) {
		return false;
	}

	if (editing) {
		const [row, col] = editing;
		const input_el = ctx.els[ctx.data[row][col].id]?.input;
		if (input_el && input_el.selectionStart !== input_el.selectionEnd) {
			return false;
		}
		if (
			event.key === "Delete" &&
			input_el?.selectionStart !== input_el?.value.length
		) {
			return false;
		}
		if (event.key === "Backspace" && input_el?.selectionStart !== 0) {
			return false;
		}
	}

	event.preventDefault();
	if (selected_cells.length > 0) {
		const new_data = handle_delete_key(ctx.data, selected_cells);
		ctx.dispatch("change", {
			data: new_data.map((row) => row.map((cell) => cell.value)),
			headers: ctx.headers.map((h) => h.value),
			metadata: null
		});
	}
	return true;
}

function handle_arrow_keys(
	event: KeyboardEvent,
	ctx: DataFrameContext,
	i: number,
	j: number
): boolean {
	const state = get(ctx.state);
	const editing = state.ui_state.editing;
	const selected_cells = state.ui_state.selected_cells;

	if (editing) return false;
	if (!ctx.data) return false;

	event.preventDefault();

	const next_coords = ctx.actions.move_cursor(event, [i, j], ctx.data);
	if (next_coords) {
		if (event.shiftKey) {
			ctx.actions.set_selected_cells(
				ctx.actions.get_range_selection(
					selected_cells.length > 0 ? selected_cells[0] : [i, j],
					next_coords
				)
			);
			ctx.actions.set_editing(false);
		} else {
			ctx.actions.set_selected_cells([next_coords]);
			ctx.actions.set_editing(false);
		}
		ctx.actions.set_selected(next_coords);
	} else if (next_coords === false && event.key === "ArrowUp" && i === 0) {
		ctx.actions.set_selected_header(j);
		ctx.actions.set_selected(false);
		ctx.actions.set_selected_cells([]);
		ctx.actions.set_editing(false);
	}
	return true;
}

async function handle_enter_key(
	event: KeyboardEvent,
	ctx: DataFrameContext,
	i: number,
	j: number
): Promise<boolean> {
	if (!ctx.data || !ctx.els) return false;

	const state = get(ctx.state);
	if (!state.config.editable) return false;

	const editing = state.ui_state.editing;
	if (editing && event.shiftKey) return false;

	event.preventDefault();

	if (editing && dequal(editing, [i, j])) {
		const cell_id = ctx.data[i][j].id;
		const input_el = ctx.els[cell_id]?.input;
		if (input_el) {
			await save_cell_value(input_el.value, ctx, i, j);
		}
		ctx.actions.set_editing(false);
		await tick();
		ctx.parent_element?.focus();
	} else {
		ctx.actions.set_editing([i, j]);
	}

	return true;
}

function handle_tab_key(
	event: KeyboardEvent,
	ctx: DataFrameContext,
	i: number,
	j: number
): boolean {
	if (!ctx.data) return false;

	event.preventDefault();
	ctx.actions.set_editing(false);
	const next_cell = ctx.actions.get_next_cell_coordinates(
		[i, j],
		ctx.data,
		event.shiftKey
	);
	if (next_cell) {
		ctx.actions.set_selected_cells([next_cell]);
		ctx.actions.set_selected(next_cell);
		if (get(ctx.state).config.editable) {
			ctx.actions.set_editing(next_cell);
		}
	}
	return true;
}

function handle_default_key(
	event: KeyboardEvent,
	ctx: DataFrameContext,
	i: number,
	j: number
): boolean {
	const state = get(ctx.state);
	if (!state.config.editable) return false;

	const editing = state.ui_state.editing;

	if (
		(!editing || (editing && dequal(editing, [i, j]))) &&
		event.key.length === 1
	) {
		ctx.actions.set_editing([i, j]);
		return true;
	}
	return false;
}

async function handle_cell_navigation(
	event: KeyboardEvent,
	ctx: DataFrameContext
): Promise<boolean> {
	if (!ctx.data) return false;

	const state = get(ctx.state);
	const selected = state.ui_state.selected;
	const selected_cells = state.ui_state.selected_cells;

	if (!selected) return false;
	if (event.key === "c" && (event.metaKey || event.ctrlKey)) {
		event.preventDefault();
		if (selected_cells.length > 0) {
			await copy_table_data(ctx.data, selected_cells);
		}
		ctx.actions.set_copy_flash(true);
		return true;
	}

	const [i, j] = selected;

	switch (event.key) {
		case "ArrowRight":
		case "ArrowLeft":
		case "ArrowDown":
		case "ArrowUp":
			return handle_arrow_keys(event, ctx, i, j);
		case "Escape":
			if (!state.config.editable) return false;
			event.preventDefault();
			ctx.actions.set_editing(false);
			tick().then(() => {
				if (ctx.parent_element) {
					ctx.parent_element.focus();
				}
			});

			return true;
		case "Enter":
			return await handle_enter_key(event, ctx, i, j);
		case "Tab":
			return handle_tab_key(event, ctx, i, j);
		case "Delete":
		case "Backspace":
			return handle_delete_operation(event, ctx);
		default:
			return handle_default_key(event, ctx, i, j);
	}
}

export async function handle_keydown(
	event: KeyboardEvent,
	context: DataFrameContext
): Promise<void> {
	if (handle_header_navigation(event, context)) return;
	if (handle_delete_operation(event, context)) return;
	await handle_cell_navigation(event, context);
}
