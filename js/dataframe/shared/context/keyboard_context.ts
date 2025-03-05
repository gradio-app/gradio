import { getContext, setContext } from "svelte";
import type { DataFrameContext } from "./table_context";
import type { CellData } from "../selection_utils";
import type { DataframeValue } from "../utils";
import type { CellCoordinate } from "../types";

const KEYBOARD_KEY = Symbol("keyboard");

export type KeyboardContext = {
	selected_header: number | false;
	header_edit: number | false;
	editing: [number, number] | false;
	selected: [number, number] | false;
	selected_cells: [number, number][];
	editable: boolean;
	data: CellData[][];
	headers: { id: string; value: string }[];
	els: Record<
		string,
		{ cell: null | HTMLTableCellElement; input: null | HTMLInputElement }
	>;
	df_actions: DataFrameContext["actions"];
	dispatch: {
		(e: "change", detail: DataframeValue): void;
		(e: "input", detail?: undefined): void;
		(e: "select", detail: any): void;
		(e: "search", detail: string | null): void;
	};
	add_row: (index?: number) => Promise<void>;
	get_next_cell_coordinates: (
		current: CellCoordinate,
		data: CellData[][],
		shift_key: boolean
	) => false | CellCoordinate;
	get_range_selection: (
		start: CellCoordinate,
		end: CellCoordinate
	) => CellCoordinate[];
	move_cursor: (
		key: "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp",
		current_coords: CellCoordinate,
		data: CellData[][]
	) => false | CellCoordinate;
	copy_flash: boolean;
	set_copy_flash: (value: boolean) => void;
};

export function create_keyboard_context(
	context: KeyboardContext
): KeyboardContext {
	const instance_id = Symbol(
		`keyboard_${Math.random().toString(36).substring(2)}`
	);
	setContext(instance_id, context);
	setContext(KEYBOARD_KEY, { instance_id, context });
	return context;
}

export function get_keyboard_context(): KeyboardContext | undefined {
	const ctx = getContext<{ instance_id: symbol; context: KeyboardContext }>(
		KEYBOARD_KEY
	);
	return ctx ? ctx.context : getContext<KeyboardContext>(KEYBOARD_KEY);
}
