import { dequal } from "dequal/lite";
import { tick } from "svelte";
import type { DataframeStore } from "../state/DataframeStore.svelte";
import type { CellCoordinate, CellValue } from "../types";
import {
	get_next_cell_coordinates,
	get_range_selection,
	handle_delete_key,
	move_cursor
} from "../utils/selection_utils";
import { copy_table_data } from "./table_utils";

type TableCell = { id: string; value: CellValue; display_value?: string };
type TableCellMatrix = TableCell[][];

export interface KeyboardContext {
	data?: TableCellMatrix;
	headers?: { value: string }[];
	els?: Record<
		string,
		{ cell: HTMLTableCellElement | null; input: HTMLTextAreaElement | null }
	>;
	parent_element?: HTMLElement | null;
	dispatch?: (event: "change" | "input", detail?: any) => void;
	store: DataframeStore;
	editable: boolean;
	static_columns: (string | number)[];
}

async function save_cell_value(
	input_value: string,
	ctx: KeyboardContext,
	row: number,
	col: number
): Promise<void> {
	if (!ctx.data || !ctx.data[row] || !ctx.data[row][col]) return;

	const cell = ctx.data[row][col];
	const old_value = cell.value;
	cell.value = input_value;
	if (cell.display_value !== undefined) {
		cell.display_value = input_value;
	}

	if (old_value !== input_value && ctx.dispatch) {
		ctx.dispatch("change", {
			data: ctx.data.map((row) => row.map((c) => c.value)),
			headers: ctx.headers?.map((h) => h.value) ?? [],
			metadata: null
		});
	}

	ctx.store.setSelected([row, col]);
}

export async function handle_cell_blur(
	event: FocusEvent,
	ctx: KeyboardContext,
	coords: CellCoordinate
): Promise<void> {
	if (!ctx.data || !ctx.headers || !ctx.els) return;

	const input_el = event.target as HTMLInputElement;
	if (!input_el || input_el.value === undefined) return;

	await save_cell_value(input_el.value, ctx, coords[0], coords[1]);
}

function handle_header_navigation(
	event: KeyboardEvent,
	ctx: KeyboardContext
): boolean {
	const selected_header = ctx.store.selection.selectedHeader;
	const header_edit = ctx.store.selection.headerEdit;
	const headers = ctx.headers ?? [];

	if (selected_header === false || header_edit !== false) return false;

	switch (event.key) {
		case "ArrowDown":
			ctx.store.setSelectedHeader(false);
			ctx.store.setSelected([0, selected_header]);
			ctx.store.setSelectedCells([[0, selected_header]]);
			return true;
		case "ArrowLeft":
			ctx.store.setSelectedHeader(
				selected_header > 0 ? selected_header - 1 : selected_header
			);
			return true;
		case "ArrowRight":
			ctx.store.setSelectedHeader(
				selected_header < headers.length - 1
					? selected_header + 1
					: selected_header
			);
			return true;
		case "Escape":
			event.preventDefault();
			ctx.store.setSelectedHeader(false);
			return true;
		case "Enter":
			event.preventDefault();
			if (ctx.editable) {
				ctx.store.setHeaderEdit(selected_header);
			}
			return true;
	}
	return false;
}

function handle_delete_operation(
	event: KeyboardEvent,
	ctx: KeyboardContext
): boolean {
	if (!ctx.data || !ctx.headers || !ctx.els || !ctx.dispatch) return false;
	if (!ctx.editable) return false;
	if (event.key !== "Delete" && event.key !== "Backspace") return false;

	const editing = ctx.store.selection.editing;
	const selected_cells = ctx.store.selection.cells;
	const static_columns = ctx.static_columns ?? [];

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
	ctx: KeyboardContext,
	i: number,
	j: number
): boolean {
	const editing = ctx.store.selection.editing;
	const selected_cells = ctx.store.selection.cells;
	const data = ctx.data;

	if (editing) return false;
	if (!data) return false;

	event.preventDefault();

	const next_coords = move_cursor(event, [i, j], data);
	if (next_coords) {
		if (event.shiftKey) {
			const anchor = selected_cells.length > 0 ? selected_cells[0] : [i, j];
			ctx.store.setSelectedCells(get_range_selection(anchor, next_coords));
			ctx.store.setEditing(false);
		} else {
			ctx.store.setSelectedCells([next_coords]);
			ctx.store.setEditing(false);
		}
		ctx.store.setSelected(next_coords);
	} else if (next_coords === false && event.key === "ArrowUp" && i === 0) {
		ctx.store.setSelectedHeader(j);
		ctx.store.setSelected(false);
		ctx.store.setSelectedCells([]);
		ctx.store.setEditing(false);
	}
	return true;
}

async function handle_enter_key(
	event: KeyboardEvent,
	ctx: KeyboardContext,
	i: number,
	j: number
): Promise<boolean> {
	const data = ctx.data;
	if (!data || !ctx.els) return false;
	if (!ctx.editable) return false;

	const editing = ctx.store.selection.editing;
	if (editing && event.shiftKey) return false;

	event.preventDefault();

	if (editing && dequal(editing, [i, j])) {
		const cell_id = data[i][j].id;
		const input_el = ctx.els[cell_id]?.input;
		if (input_el) {
			await save_cell_value(input_el.value, ctx, i, j);
		}
		ctx.store.setEditing(false);
		await tick();
		ctx.parent_element?.focus();
	} else {
		ctx.store.setEditing([i, j]);
	}

	return true;
}

function handle_tab_key(
	event: KeyboardEvent,
	ctx: KeyboardContext,
	i: number,
	j: number
): boolean {
	const data = ctx.data;
	if (!data) return false;

	event.preventDefault();
	ctx.store.setEditing(false);
	const next_cell = get_next_cell_coordinates([i, j], data, event.shiftKey);
	if (next_cell) {
		ctx.store.setSelectedCells([next_cell]);
		ctx.store.setSelected(next_cell);
		if (ctx.editable) {
			ctx.store.setEditing(next_cell);
		}
	}
	return true;
}

function handle_default_key(
	event: KeyboardEvent,
	ctx: KeyboardContext,
	i: number,
	j: number
): boolean {
	if (!ctx.editable) return false;
	const editing = ctx.store.selection.editing;

	if (event.key.length === 1 && (!editing || !dequal(editing, [i, j]))) {
		ctx.store.setEditing([i, j]);
		return true;
	}
	return false;
}

async function handle_cell_navigation(
	event: KeyboardEvent,
	ctx: KeyboardContext
): Promise<boolean> {
	const data = ctx.data;
	if (!data) return false;

	const selected = ctx.store.selection.selected;
	const selected_cells = ctx.store.selection.cells;

	if (!selected) return false;
	if (event.key === "c" && (event.metaKey || event.ctrlKey)) {
		event.preventDefault();
		if (selected_cells.length > 0) {
			await copy_table_data(data, selected_cells);
		}
		ctx.store.setCopyFlash(true);
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
			if (!ctx.editable) return false;
			event.preventDefault();
			ctx.store.setEditing(false);
			tick().then(() => ctx.parent_element?.focus());
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
	context: KeyboardContext
): Promise<void> {
	if (handle_header_navigation(event, context)) return;
	if (handle_delete_operation(event, context)) return;
	await handle_cell_navigation(event, context);
}
