import { dequal } from "dequal/lite";
import { handle_delete_key } from "../selection_utils";
import type { KeyboardContext } from "../context/keyboard_context";
import { tick } from "svelte";
import { copy_table_data } from "./table_utils";

function handle_header_navigation(
	event: KeyboardEvent,
	ctx: KeyboardContext
): boolean {
	if (ctx.selected_header === false || ctx.header_edit !== false) return false;
	switch (event.key) {
		case "ArrowDown":
			ctx.df_actions.set_selected_header(false);
			ctx.df_actions.set_selected([0, ctx.selected_header]);
			ctx.df_actions.set_selected_cells([[0, ctx.selected_header]]);
			return true;
		case "ArrowLeft":
			ctx.df_actions.set_selected_header(
				ctx.selected_header > 0 ? ctx.selected_header - 1 : ctx.selected_header
			);
			return true;
		case "ArrowRight":
			ctx.df_actions.set_selected_header(
				ctx.selected_header < ctx.headers.length - 1
					? ctx.selected_header + 1
					: ctx.selected_header
			);
			return true;
		case "Escape":
			event.preventDefault();
			ctx.df_actions.set_selected_header(false);
			return true;
		case "Enter":
			event.preventDefault();
			if (ctx.editable) {
				ctx.df_actions.set_header_edit(ctx.selected_header);
			}
			return true;
	}
	return false;
}

function handle_delete_operation(
	event: KeyboardEvent,
	ctx: KeyboardContext
): boolean {
	if (!ctx.editable) return false;
	if (event.key !== "Delete" && event.key !== "Backspace") return false;

	if (ctx.editing) {
		const [row, col] = ctx.editing;
		const input_el = ctx.els[ctx.data[row][col].id].input;
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
	if (ctx.selected_cells.length > 0) {
		const new_data = handle_delete_key(ctx.data, ctx.selected_cells);
		ctx.dispatch("change", {
			data: new_data.map((row) => row.map((cell) => cell.value)),
			headers: ctx.headers.map((h) => h.value),
			metadata: null
		});
		ctx.dispatch("input");
	}
	return true;
}

function handle_arrow_keys(
	event: KeyboardEvent,
	ctx: KeyboardContext,
	i: number,
	j: number
): boolean {
	if (ctx.editing) return false;
	event.preventDefault();

	const next_coords = ctx.move_cursor(event, [i, j], ctx.data);
	if (next_coords) {
		if (event.shiftKey) {
			ctx.df_actions.set_selected_cells(
				ctx.get_range_selection(
					ctx.selected_cells.length > 0 ? ctx.selected_cells[0] : [i, j],
					next_coords
				)
			);
			ctx.df_actions.set_editing(false);
		} else {
			ctx.df_actions.set_selected_cells([next_coords]);
			ctx.df_actions.set_editing(false);
		}
		ctx.df_actions.set_selected(next_coords);
	} else if (next_coords === false && event.key === "ArrowUp" && i === 0) {
		ctx.df_actions.set_selected_header(j);
		ctx.df_actions.set_selected(false);
		ctx.df_actions.set_selected_cells([]);
		ctx.df_actions.set_editing(false);
	}
	return true;
}

async function handle_enter_key(
	event: KeyboardEvent,
	ctx: KeyboardContext,
	i: number,
	j: number
): Promise<boolean> {
	event.preventDefault();
	if (!ctx.editable) return false;

	if (event.shiftKey) {
		await ctx.add_row(i);
		await tick();
		ctx.df_actions.set_selected([i + 1, j]);
	} else {
		if (dequal(ctx.editing, [i, j])) {
			const cell_id = ctx.data[i][j].id;
			const input_el = ctx.els[cell_id].input;
			if (input_el) {
				const old_value = ctx.data[i][j].value;
				ctx.data[i][j].value = input_el.value;
				if (old_value !== input_el.value) {
					ctx.dispatch("input");
				}
			}
			ctx.df_actions.set_editing(false);
			await tick();
			ctx.df_actions.set_selected([i, j]);
		} else {
			ctx.df_actions.set_editing([i, j]);
		}
	}
	return true;
}

function handle_tab_key(
	event: KeyboardEvent,
	ctx: KeyboardContext,
	i: number,
	j: number
): boolean {
	event.preventDefault();
	ctx.df_actions.set_editing(false);
	const next_cell = ctx.get_next_cell_coordinates(
		[i, j],
		ctx.data,
		event.shiftKey
	);
	if (next_cell) {
		ctx.df_actions.set_selected_cells([next_cell]);
		ctx.df_actions.set_selected(next_cell);
		if (ctx.editable) {
			ctx.df_actions.set_editing(next_cell);
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
	if (
		(!ctx.editing || (ctx.editing && dequal(ctx.editing, [i, j]))) &&
		event.key.length === 1
	) {
		ctx.df_actions.set_editing([i, j]);
		return true;
	}
	return false;
}

async function handle_cell_navigation(
	event: KeyboardEvent,
	ctx: KeyboardContext
): Promise<boolean> {
	if (!ctx.selected) return false;
	if (event.key === "c" && (event.metaKey || event.ctrlKey)) {
		event.preventDefault();
		if (ctx.selected_cells.length > 0) {
			await copy_table_data(ctx.data, ctx.selected_cells);
		}
		ctx.set_copy_flash(true);

		return true;
	}

	const [i, j] = ctx.selected;

	switch (event.key) {
		case "ArrowRight":
		case "ArrowLeft":
		case "ArrowDown":
		case "ArrowUp":
			return handle_arrow_keys(event, ctx, i, j);
		case "Escape":
			if (!ctx.editable) return false;
			event.preventDefault();
			ctx.df_actions.set_editing(false);
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
